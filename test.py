from services.mqtt_service import start_mqtt_service
from services.device_manager import start_machine_safe
from services.machine_registry import update_heartbeat
import time

start_mqtt_service()

time.sleep(2)

# simulate device heartbeat
update_heartbeat("WM101")

result = start_machine_safe("WM101", 10)

print(result)

while True:
    time.sleep(1)