import time

# In-memory registry (later this can become a database)
machines = {}


def register_machine(machine_id):
    """
    Add machine to registry if it does not exist
    """
    if machine_id not in machines:
        machines[machine_id] = {
            "last_seen": None,
            "state": "unknown"
        }


def update_heartbeat(machine_id):
    """
    Update the last time we heard from a machine
    """
    register_machine(machine_id)

    machines[machine_id]["last_seen"] = time.time()
    machines[machine_id]["state"] = "online"


def update_state(machine_id, state):
    """
    Update machine operational state
    """
    register_machine(machine_id)

    machines[machine_id]["state"] = state


def is_machine_online(machine_id):
    """
    Determine if machine is online based on last heartbeat
    """
    register_machine(machine_id)

    last_seen = machines[machine_id]["last_seen"]

    if last_seen is None:
        return False

    return (time.time() - last_seen) < 60


def get_machine(machine_id):
    """
    Return machine information
    """
    return machines.get(machine_id)


def list_machines():
    """
    Return all registered machines
    """
    return machines
def mark_offline_machines():

    now = time.time()

    for machine_id, data in machines.items():

        last_seen = data["last_seen"]

        if last_seen and (now - last_seen) > 60:
            machines[machine_id]["state"] = "offline"