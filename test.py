from services.mqtt_service import start_mqtt_service, start_machine
import time

start_mqtt_service()

time.sleep(2)

start_machine("WM101", 10)

while True:
    time.sleep(1)