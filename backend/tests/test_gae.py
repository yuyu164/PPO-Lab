import pytest
from app.algorithm.gae import compute_gae, compute_gae_step, get_variance_bias_interpretation


class TestComputeGAE:
    def test_basic_gae_computation(self):
        rewards = [0.5, 0.3, 0.8, -0.1, 1.5, 0.5]
        values = [0.4, 0.6, 0.5, 0.3, 0.8, 0.6]
        gamma = 0.99
        lam = 0.95

        advantages, returns = compute_gae(rewards, values, gamma, lam)

        # 验证最后一个时刻: A_5 = r_5 - V_5 = 0.5 - 0.6 = -0.1
        assert abs(advantages[5] - (-0.1)) < 1e-3, f"A_5期望-0.1000，实际{advantages[5]}"

        # 验证倒数第二个时刻
        assert abs(advantages[4] - 1.1999) < 1e-3, f"A_4期望1.1999，实际{advantages[4]}"

        # 验证returns = advantages + values
        for i in range(len(advantages)):
            assert abs(returns[i] - (advantages[i] + values[i])) < 1e-6

    def test_user_test_case(self):
        # 用户测试1：rewards = [0.5, 0.3, 0.8], values = [0.4, 0.6, 0.5]
        # 验证最后一个advantage = 0.8 - 0.5 = 0.3
        rewards = [0.5, 0.3, 0.8]
        values = [0.4, 0.6, 0.5]
        advantages, _ = compute_gae(rewards, values, 0.99, 0.95)

        assert abs(advantages[2] - 0.3) < 1e-6, f"最后一个advantage期望0.3，实际{advantages[2]}"

    def test_length_mismatch_raises(self):
        with pytest.raises(ValueError):
            compute_gae([0.5, 0.3], [0.4], 0.99, 0.95)

    def test_short_sequence_raises(self):
        with pytest.raises(ValueError):
            compute_gae([0.5], [0.4], 0.99, 0.95)

    def test_lambda_zero(self):
        # λ=0时，GAE退化为TD error
        rewards = [1.0, 0.5]
        values = [0.3, 0.4]
        advantages, _ = compute_gae(rewards, values, 0.99, 0.0)

        # A_1 = r_1 - V_1 = 0.5 - 0.4 = 0.1
        assert abs(advantages[1] - 0.1) < 1e-6
        # A_0 = r_0 + γ·V_1 - V_0 = 1.0 + 0.99×0.4 - 0.3 = 1.096
        assert abs(advantages[0] - 1.096) < 1e-6


class TestComputeGAEStep:
    def test_step_computation(self):
        rewards = [0.5, 0.3, 0.8, -0.1, 1.5, 0.5]
        values = [0.4, 0.6, 0.5, 0.3, 0.8, 0.6]

        delta, advantage, calculation = compute_gae_step(
            t=3, rewards=rewards, values=values,
            gamma=0.99, lam=0.95, next_advantage=1.2001,
        )

        assert abs(delta - 0.392) < 1e-3
        assert abs(advantage - 1.5213) < 1e-3
        assert calculation["td_error"]["result"] == delta
        assert calculation["gae"]["result"] == advantage

    def test_last_step(self):
        rewards = [0.5, 0.3]
        values = [0.4, 0.6]

        delta, advantage, _ = compute_gae_step(
            t=1, rewards=rewards, values=values,
            gamma=0.99, lam=0.95, next_advantage=0.0,
        )

        assert abs(delta - (-0.3)) < 1e-6
        assert abs(advantage - (-0.3)) < 1e-6


class TestVarianceBiasInterpretation:
    def test_low_lambda(self):
        result = get_variance_bias_interpretation(0.1)
        assert result["bias"] == "高偏差"
        assert result["variance"] == "低方差"

    def test_mid_lambda(self):
        result = get_variance_bias_interpretation(0.5)
        assert result["bias"] == "中等偏差"
        assert result["variance"] == "中等方差"

    def test_high_lambda(self):
        result = get_variance_bias_interpretation(0.9)
        assert result["bias"] == "低偏差"
        assert result["variance"] == "高方差"
