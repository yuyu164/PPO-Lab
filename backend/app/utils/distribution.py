import numpy as np
from app.utils.numeric import round4


def generate_normal_curve(
    mean: float,
    std: float,
    x_range: tuple[float, float] = (-4.0, 4.0),
    num_points: int = 200,
) -> list[dict]:
    # 来源：算法B3
    x_values = np.linspace(x_range[0], x_range[1], num_points)
    y_values = (1 / (std * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x_values - mean) / std) ** 2)
    return [{"x": round4(float(x)), "y": round4(float(y))} for x, y in zip(x_values, y_values)]


def calculate_overlap_area(
    mean1: float, std1: float,
    mean2: float, std2: float,
    x_range: tuple[float, float] = (-4.0, 4.0),
    num_points: int = 1000,
) -> float:
    x_values = np.linspace(x_range[0], x_range[1], num_points)
    y1 = (1 / (std1 * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x_values - mean1) / std1) ** 2)
    y2 = (1 / (std2 * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x_values - mean2) / std2) ** 2)
    overlap = np.minimum(y1, y2)
    dx = (x_range[1] - x_range[0]) / (num_points - 1)
    return round4(float(np.trapz(overlap, dx=dx)))
