from app.algorithm.kl_divergence import calculate_kl_gaussian, interpret_beta
from app.utils.distribution import generate_normal_curve, calculate_overlap_area
from app.utils.numeric import round4
from app.models.kl import CurvePoint, NormalDistribution, KLBetaInterpretation


def calculate_kl(
    beta: float,
    ref_distribution: dict | None = None,
    actor_distribution: dict | None = None,
    x_range: list[float] | None = None,
    num_points: int = 200,
) -> dict:
    if ref_distribution is None:
        ref_distribution = {"mean": 0.0, "std": 1.0}
    if actor_distribution is None:
        actor_distribution = {"mean": 0.0, "std": 1.0}
    if x_range is None:
        x_range = [-4.0, 4.0]

    ref_mean = ref_distribution["mean"]
    ref_std = ref_distribution["std"]
    actor_mean = actor_distribution["mean"]
    actor_std = actor_distribution["std"]

    # 来源：算法B2 — KL散度解析解
    kl_divergence = calculate_kl_gaussian(ref_mean, ref_std, actor_mean, actor_std)

    # 来源：算法B3 — 分布曲线生成
    ref_curve_points = generate_normal_curve(ref_mean, ref_std, tuple(x_range), num_points)
    actor_curve_points = generate_normal_curve(actor_mean, actor_std, tuple(x_range), num_points)

    ref_curve = NormalDistribution(
        mean=ref_mean, std=ref_std,
        curve=[CurvePoint(x=p["x"], y=p["y"]) for p in ref_curve_points],
    )
    actor_curve = NormalDistribution(
        mean=actor_mean, std=actor_std,
        curve=[CurvePoint(x=p["x"], y=p["y"]) for p in actor_curve_points],
    )

    overlap_area = calculate_overlap_area(ref_mean, ref_std, actor_mean, actor_std, tuple(x_range))

    # 来源：算法B1 — β值状态解读
    interp = interpret_beta(beta)
    interpretation = KLBetaInterpretation(
        status=interp["status"],
        title=interp["title"],
        description=interp["description"],
    )

    formula = {
        "expression": "R_t = -β·(log P_actor - log P_ref)",
        "highlight": "β",
        "beta_value": beta,
    }

    return {
        "kl_divergence": kl_divergence,
        "ref_curve": ref_curve.model_dump(),
        "actor_curve": actor_curve.model_dump(),
        "overlap_area": overlap_area,
        "interpretation": interpretation.model_dump(),
        "formula": formula,
    }
