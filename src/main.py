import argparse
import json
import os
from datetime import datetime
from enum import Enum
from dotenv import load_dotenv
from loguru import logger
import asyncio

from src.core.browser import Browser
from src.core.vision import VisionAnalyzer
from src.models.workflow import Workflow, WorkflowNode
from src.strategies.explorer import GPTGuidedExplorer
from src.utils.config import Config
from src.utils.logging import setup_logging


class PydanticJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for Pydantic models and enums"""
    def default(self, obj):
        if hasattr(obj, 'model_dump'):
            return obj.model_dump()
        if isinstance(obj, Enum):
            return obj.value
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def format_node_data(node_data: WorkflowNode) -> str:
    """Format node data for display"""
    interaction = node_data.interaction
    return (
        f"Type: {interaction.type.value}, "
        f"URL: {interaction.url}, "
        f"Time: {interaction.timestamp}"
        + (f", Selector: {interaction.selector}" if interaction.selector else "")
        + (f"\nAnalysis: {node_data.gpt_analysis}" if node_data.gpt_analysis else "")
    )


def print_workflow_graph(workflow_data: dict):
    """Print the workflow graph in a readable format"""
    print("\n=== Workflow Graph ===\n")
    
    # Create a mapping of node IDs to their data
    nodes = {node["id"]: node for node in workflow_data["nodes"]}
    
    # Create an adjacency list representation
    adjacency = {}
    for link in workflow_data["links"]:
        source = link["source"]
        target = link["target"]
        if source not in adjacency:
            adjacency[source] = []
        adjacency[source].append(target)
    
    # Print nodes and their connections
    for node_id, node in nodes.items():
        print(f"\nNode: {node_id}")
        print("Data:")
        print(format_node_data(node["data"]))
        
        if node_id in adjacency:
            print("Connected to:")
            for target in adjacency[node_id]:
                print(f"  -> {target}")
        print("-" * 50)
    
    # Create graph_data directory if it doesn't exist
    os.makedirs("graph_data", exist_ok=True)
    
    # Save the graph data to a file in the graph_data directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join("graph_data", f"workflow_graph_{timestamp}.json")
    with open(filename, "w") as f:
        json.dump(workflow_data, f, indent=2, cls=PydanticJSONEncoder)
    print(f"\nGraph data saved to: {filename}")


async def main():
    parser = argparse.ArgumentParser(description="Intelligent web explorer using GPT-4V")
    parser.add_argument("url", help="Starting URL to explore")
    parser.add_argument("objective", help="Exploration objective")
    parser.add_argument("--config", default=".env", help="Path to config file")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"],
                      help="Set the console logging level")
    args = parser.parse_args()
    
    # Load configuration
    load_dotenv()
    
    config = Config.from_env(args.config)
    if args.headless:
        config.headless = True
    
    # Setup logging with specified level
    setup_logging(console_level=args.log_level)
    logger.info("Starting exploration")
    
    try:
        # Initialize components
        browser = Browser(
            screenshots_dir=config.screenshots_dir,
            headless=config.headless
        )
        vision_analyzer = VisionAnalyzer(api_key=config.openai_api_key)
        workflow = Workflow()
        
        # Create and run explorer
        explorer = GPTGuidedExplorer(
            browser=browser,
            vision_analyzer=vision_analyzer,
            workflow=workflow,
            max_steps=config.max_steps,
            screenshot_dir=config.screenshots_dir
        )
        
        # Start exploration
        final_workflow = await explorer.explore(args.url, args.objective)
        
        # Export and display results
        workflow_data = final_workflow.export_graph()
        logger.info(
            f"Exploration completed. Visited {len(workflow_data['nodes'])} nodes "
            f"with {len(workflow_data['links'])} interactions"
        )
        
        # Print the workflow graph
        print_workflow_graph(workflow_data)
        
    except Exception as e:
        logger.exception(f"Exploration failed: {str(e)}")
        raise
    
    finally:
        browser.close()


if __name__ == "__main__":
    asyncio.run(main()) 