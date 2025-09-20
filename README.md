# Navi: Intelligent Web Explorer

Navi is a Python-based web exploration tool that combines Selenium's web automation capabilities with GPT-4V's visual understanding to intelligently navigate and analyze websites. It creates reusable navigation workflows by recording interactions and their relationships in a graph structure.

## Features

- GPT-4V powered visual analysis of web pages
- Automated interaction with web elements
- Graph-based workflow recording
- Reusable navigation patterns
- Detailed logging and monitoring
- Configurable exploration strategies

## Requirements

- Python 3.9+
- Chrome/Chromium browser
- OpenAI API key with GPT-4V access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/navi.git
cd navi
```

2. Create a virtual environment and install dependencies using `uv`:
```bash
uv venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
uv pip install -r requirements.txt
```

3. Create a `.env` file with your configuration:
```env
OPENAI_API_KEY=your_api_key_here
SCREENSHOTS_DIR=screenshots
MAX_STEPS=50
HEADLESS=false
```

## Usage

Run the explorer with a starting URL and exploration objective:

```bash
uv run -m src.main https://example.com "Find and collect all blog post titles"
```

Optional arguments:
- `--config`: Path to config file (default: `.env`)
- `--headless`: Run in headless mode

## Project Structure

```
project/
├── pyproject.toml          # Project dependencies and metadata
├── README.md              # Documentation
├── src/
│   ├── core/
│   │   ├── browser.py     # Selenium wrapper and screenshot management
│   │   ├── vision.py      # GPT-4V integration
│   │   └── graph.py       # Workflow graph management
│   ├── strategies/
│   │   └── explorer.py    # Website exploration strategies
│   ├── models/
│   │   ├── interaction.py # Data models for interactions
│   │   └── workflow.py    # Workflow representation
│   └── utils/
│       ├── config.py      # Configuration management
│       └── logging.py     # Logging setup
└── tests/                 # Test suite
```

## How It Works

1. The explorer starts at a given URL with a specific objective
2. For each page:
   - Takes a screenshot
   - Sends the screenshot to GPT-4V for analysis
   - Records the current state and possible interactions
   - Executes recommended actions based on the objective
   - Updates the workflow graph
3. The process continues until:
   - The objective is achieved
   - Maximum steps are reached
   - No more valid interactions are found

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
