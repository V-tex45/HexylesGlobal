from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import os

app = Flask(__name__)
CORS(app)

# Mock database
projects = [
    {
        "id": 1,
        "name": "Migori Office Complex",
        "status": "Foundation Work",
        "progress": 35,
        "image": "https://your-site.com/static/projects/migori.jpg",
        "updates": [
            {
                "date": "2023-06-10",
                "description": "Excavation completed",
                "photos": ["photo1.jpg", "photo2.jpg"]
            }
        ]
    }
]

@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(projects)

@app.route('/api/changes', methods=['POST'])
def add_change():
    new_change = {
        "id": len(projects[0]['changes']) + 1,
        "date": datetime.datetime.now().isoformat(),
        "description": request.json.get('description'),
        "status": "Pending Review"
    }
    projects[0]['changes'].append(new_change)
    return jsonify(new_change), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)