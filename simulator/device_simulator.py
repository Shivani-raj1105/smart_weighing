import json
import time
import threading
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

machine_id = "WM101"

COMMAND_TOPIC = f"machines/{machine_id}/command"
STATUS_TOPIC = f"machines/{machine_id}/status"
HEARTBEAT_TOPIC = f"machines/{machine_id}/heartbeat"


def on_connect(client, userdata, flags, rc):
    print("Simulator connected to MQTT")

    client.subscribe(COMMAND_TOPIC)
    print("Listening on:", COMMAND_TOPIC)


def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())

    duration = payload.get("duration", 10)

    print(f"[SIMULATOR] Command received: {payload}")

    print("Machine ON")
    time.sleep(duration)
    print("Machine OFF")

    status = {
        "state": "completed"
    }

    client.publish(STATUS_TOPIC, json.dumps(status))
    print("[SIMULATOR] Status sent")


def send_heartbeat():
    while True:
        heartbeat = {
            "alive": True
        }

        client.publish(HEARTBEAT_TOPIC, json.dumps(heartbeat))
        print("[SIMULATOR] Heartbeat sent")

        time.sleep(5)


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT)

# start heartbeat thread
heartbeat_thread = threading.Thread(target=send_heartbeat)
heartbeat_thread.daemon = True
heartbeat_thread.start()

client.loop_forever()