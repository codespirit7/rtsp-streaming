import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask import request, jsonify
from flask_pymongo import pymongo
import subprocess
import asyncio
from threading import Thread, Lock
import flask
from bson import json_util
from bson import ObjectId


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

CONNECTION_STRING = "mongodb+srv://"

client = pymongo.MongoClient(CONNECTION_STRING)
db = client.get_database('test')

ffmpeg_process = None

ffmpeg_lock = Lock()

async def run_ffmpeg_command_async(command):
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await process.communicate()

def run_ffmpeg_command_threaded(command):
    global ffmpeg_process
    with ffmpeg_lock:
        try:
            if ffmpeg_process and ffmpeg_process.poll() is None:
                ffmpeg_process.terminate()

                ffmpeg_process.wait(timeout=5)
                
                if ffmpeg_process.poll() is None:
                    ffmpeg_process.kill()
                    ffmpeg_process.wait()

            # Delete all files in the streamOutput directory
            output_dir = './streamOutput/'
            for file_name in os.listdir(output_dir):
                file_path = os.path.join(output_dir, file_name)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")

            ffmpeg_process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            ffmpeg_process.communicate()
        except subprocess.CalledProcessError as e:
            print(f"Error running ffmpeg command: {e}")
        finally:
            ffmpeg_process = None

@app.route('/stream/start', methods=['POST'])
def stream_url():
    data = request.json

    
    url = data.get('url')

    
    output_dir = './streamOutput/'
    for file_name in os.listdir(output_dir):
        file_path = os.path.join(output_dir, file_name)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

    
    thread = Thread(target=run_ffmpeg_command_threaded, args=(f"ffmpeg -i {url} -c:v libx264 -c:a aac -strict experimental -f hls {output_dir}output.m3u8",))
    thread.start()

    return jsonify({'message': 'Overlay creation started successfully'})


@app.route('/stream/<path:filename>')
def serve_ts_file(filename):
    return send_from_directory('streamOutput/', filename)

@app.route("/stream/settings", methods = ["POST"])
def save_settings():
    try:
        data = request.get_json();
        db.db.collection.insert_one(data)
        return flask.jsonify(message="success")
    except Exception as e:
        print(f"Error inserting data into 'overlays' collection: {e}")
        return flask.jsonify(message="error")


@app.route("/stream/allsettings", methods=["POST"])
def get_overlays_by_url():
    try:
        data = request.get_json()
        url = data.get('url')

        result = db.db.collection.find({'url': url})

        result_list = list(result)
        for doc in result_list:
          doc['_id'] = str(doc['_id'])

        return jsonify(result_list)


    except Exception as e:
        print(f"Error retrieving overlays by URL: {e}")
        return jsonify(message="error")


@app.route("/stream/<string:overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    try:
        data = request.get_json()
        db.db.collection.update_one({"_id": ObjectId(overlay_id)}, {"$set": data})
        return jsonify(message="Update success")
    except Exception as e:
        print(f"Error updating overlay: {e}")
        return jsonify(message="Error updating overlay")


@app.route("/stream/<string:overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    try:
        result = db.db.collection.delete_one({"_id": ObjectId(overlay_id)})
        if result.deleted_count > 0:
            return jsonify(message="Delete success")
        else:
            return jsonify(message="Overlay not found"), 404
    except Exception as e:
        print(f"Error deleting overlay: {e}")
        return jsonify(message="Error deleting overlay")

if __name__ == '__main__':
    app.run(debug=True)
