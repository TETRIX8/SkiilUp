import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Import and run the Flask app from src/main.py
from src.main import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
