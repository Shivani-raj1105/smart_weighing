import json
import threading
import paho.mqtt.client as mqtt
from services.machine_registry import update_state, update_heartbeat

BROKER = "localhost"
PORT = 1883

from services.mqtt_topics import command_topic, status_topic, all_status_topics

client = mqtt.Client()


def handle_device_status(machine_id, status):
    """
    Process device status updates
    """
    update_heartbeat(machine_id)

    state = status.get("state")

    if state:
        update_state(machine_id, state)

    print(f"[STATUS] Machine {machine_id}: {status}")


def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")

    client.subscribe(all_status_topics())


def on_message(client, userdata, msg):
    try:
        topic_parts = msg.topic.split("/")
        machine_id = topic_parts[1]

        payload = json.loads(msg.payload.decode())

        handle_device_status(machine_id, payload)

    except Exception as e:
        print("MQTT message error:", e)


def connect_mqtt():
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(BROKER, PORT)

    thread = threading.Thread(target=client.loop_forever)
    thread.daemon = True
    thread.start()

    print("MQTT service started")


import uuid

def activate_machine(machine_id, duration):

    topic = command_topic(machine_id)

    payload = {
        "command_id": str(uuid.uuid4()),
        "command": "start",
        "duration": duration
    }

    client.publish(topic, json.dumps(payload))

# ===============================
# Public API for Backend Services
# ===============================

def start_mqtt_service():
    """
    Starts the MQTT connection.
    This should be called when the API server boots.
    """
    connect_mqtt()


def start_machine(machine_id, duration):
    """
    Public function used by other backend modules
    to activate a machine.
    """
    activate_machine(machine_id, duration)