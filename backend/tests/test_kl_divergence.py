import pytest
import math
from app.algorithm.kl_divergence import calculate_kl_gaussian, calculate_kl_per_token, interpret_beta


class TestCalculateKLGaussian:
    def test_same_distribution(self):
        kl = calculate_kl_gaussian(0.0, 1.0, 0.0, 1.0)
        assert abs(kl) < 1e-6, f"相同分布KL散度应为0，实际{kl}"

    def test_different_means(self):
        # KL(N(0,1) ‖ N(0.5,1)) = 0 + (1 + 0.25)/2 - 0.5 = 0.125
        kl = calculate_kl_gaussian(0.0, 1.0, 0.5, 1.0)
        assert abs(kl - 0.125) < 1e-4

    def test_different_stds(self):
        # KL(N(0,1) ‖ N(0,2)) = log(2) + 1/8 - 0.5 ≈ 0.3181
        kl = calculate_kl_gaussian(0.0, 1.0, 0.0, 2.0)
        assert abs(kl - 0.3181) < 1e-3

    def test_negative_sigma_raises(self):
        with pytest.raises(ValueError):
            calculate_kl_gaussian(0.0, 0.0, 0.5, 1.0)
        with pytest.raises(ValueError):
            calculate_kl_gaussian(0.0, 1.0, 0.5, -1.0)


class TestCalculateKLPerToken:
    def test_basic(self):
        kl_divs = calculate_kl_per_token([-1.0, -0.5], [-1.2, -0.3])
        assert abs(kl_divs[0] - 0.2) < 1e-6
        assert abs(kl_divs[1] - (-0.2)) < 1e-6


class TestInterpretBeta:
    def test_warning(self):
        result = interpret_beta(0.02)
        assert result["status"] == "warning"

    def test_optimal(self):
        result = interpret_beta(0.1)
        assert result["status"] == "optimal"

    def test_locked(self):
        result = interpret_beta(0.5)
        assert result["status"] == "locked"
