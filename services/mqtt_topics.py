# services/mqtt_topics.py

def command_topic(machine_id):
    return f"machines/{machine_id}/command"


def status_topic(machine_id):
    return f"machines/{machine_id}/status"


def heartbeat_topic(machine_id):
    return f"machines/{machine_id}/heartbeat"


def error_topic(machine_id):
    return f"machines/{machine_id}/error"


def all_status_topics():
    return "machines/+/status"


def all_heartbeat_topics():
    return "machines/+/heartbeat"