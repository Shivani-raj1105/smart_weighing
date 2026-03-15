import time

activity_log = []


def log_event(machine_id, event, details=None):
    entry = {
        "timestamp": time.time(),
        "machine_id": machine_id,
        "event": event,
        "details": details
    }

    activity_log.append(entry)

    print(f"[LOG] {machine_id} -> {event} | {details}")


def get_logs():
    return activity_log