from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

DATA_FILE = "data.json"
COVERS_FOLDER = "covers"

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/data")
def get_data():
    return jsonify(load_data())

# ➕ añadir manga
@app.route("/add", methods=["POST"])
def add_manga():
    data = load_data()

    title = request.form.get("title")
    image = request.files.get("image")

    if not title or not image:
        return {"error": "Nombre e imagen obligatorios"}, 400

    max_id = max([m["id"] for m in data], default=0)
    new_id = max_id + 1

    image_path = os.path.join(COVERS_FOLDER, f"{new_id}.webp")
    image.save(image_path)

    manga = {
        "id": new_id,
        "title": title,
        "cover": f"covers/{new_id}.webp",
        "description": "Sin descripción aún",
        "followed": False
    }

    data.append(manga)
    save_data(data)

    return {"ok": True}

# ⭐ GUARDAR FOLLOW
@app.route("/toggle_follow", methods=["POST"])
def toggle_follow():
    data = load_data()
    req = request.json

    for m in data:
        if m["id"] == req["id"]:
            m["followed"] = req["followed"]

    save_data(data)
    return {"ok": True}

# 📝 descripción
@app.route("/update_description", methods=["POST"])
def update_description():
    data = load_data()
    req = request.json

    for m in data:
        if m["id"] == req["id"]:
            m["description"] = req["description"]

    save_data(data)
    return {"ok": True}

# ⭐ mantener solo seguidos
@app.route("/keep_followed", methods=["POST"])
def keep_followed():
    data = load_data()

    new_data = [m for m in data if m.get("followed")]
    save_data(new_data)

    return {"ok": True}

if __name__ == "__main__":
    print("🔥 Servidor iniciado")
    app.run(debug=True)
