import datetime


def format_time(dt):
    """
    Args:
        dt (datetime.datetime): a timestamp

    Returns:
        (str): a string representation of the timestamp
    """
    return dt.strftime("%Y-%m-%d %H:%M")


def parse_time(dt_str):
    """
    Args:
        dt_str (str): a string representation of a timestamp

    Returns:
        (datetime.datetime): the timestamp
    """
    dt = datetime.datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    return dt
