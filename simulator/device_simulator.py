import json
import time
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

machine_id = "WM101"

COMMAND_TOPIC = f"machines/{machine_id}/command"
STATUS_TOPIC = f"machines/{machine_id}/status"


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


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT)

client.loop_forever()