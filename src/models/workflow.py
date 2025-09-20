from typing import Dict, List, Optional
import networkx as nx
from pydantic import BaseModel
from datetime import datetime

from src.models.interaction import Interaction


class WorkflowNode(BaseModel):
    """Represents a node in the workflow graph"""
    interaction: Interaction
    gpt_analysis: Optional[str] = None
    next_actions: List[str] = []
    
    class Config:
        arbitrary_types_allowed = True


class Workflow:
    """Represents the entire workflow as a directed graph"""
    def __init__(self):
        self.graph = nx.DiGraph()
        self.current_node: Optional[str] = None
        
    def add_interaction(self, interaction: Interaction, gpt_analysis: Optional[str] = None) -> str:
        """Add a new interaction to the workflow"""
        node = WorkflowNode(
            interaction=interaction,
            gpt_analysis=gpt_analysis
        )
        self.graph.add_node(interaction.id, data=node)
        
        if self.current_node:
            self.graph.add_edge(self.current_node, interaction.id)
        
        self.current_node = interaction.id
        return interaction.id
    
    def add_edge(self, from_id: str, to_id: str):
        """Add an edge between two interactions"""
        self.graph.add_edge(from_id, to_id)
    
    def get_node(self, node_id: str) -> Optional[WorkflowNode]:
        """Get a node by its ID"""
        if node_id in self.graph.nodes:
            return self.graph.nodes[node_id]["data"]
        return None
    
    def get_path_to(self, target_id: str) -> List[str]:
        """Get the shortest path from the current node to a target node"""
        if not self.current_node or target_id not in self.graph.nodes:
            return []
        try:
            return nx.shortest_path(self.graph, self.current_node, target_id)
        except nx.NetworkXNoPath:
            return []
    
    def export_graph(self) -> Dict:
        """Export the workflow graph to a serializable format"""
        nodes = []
        for node_id in self.graph.nodes():
            workflow_node: WorkflowNode = self.graph.nodes[node_id]["data"]
            nodes.append({
                "id": node_id,
                "data": workflow_node
            })
        
        links = []
        for edge in self.graph.edges():
            links.append({
                "source": edge[0],
                "target": edge[1]
            })
        
        return {
            "nodes": nodes,
            "links": links
        } 