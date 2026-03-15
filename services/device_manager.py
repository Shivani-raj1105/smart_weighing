from services.machine_registry import is_machine_online
from services.mqtt_service import start_machine


def start_machine_safe(machine_id, duration):
    """
    Starts a machine after checking availability.
    """

    if not is_machine_online(machine_id):
        return {
            "success": False,
            "message": "Machine is offline"
        }

    start_machine(machine_id, duration)

    return {
        "success": True,
        "message": f"Machine {machine_id} started for {duration}s"
    }