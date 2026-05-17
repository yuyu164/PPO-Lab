import math


def round4(value: float) -> float:
    return round(value, 4)


def check_overflow(value: float) -> bool:
    return math.isnan(value) or math.isinf(value)
