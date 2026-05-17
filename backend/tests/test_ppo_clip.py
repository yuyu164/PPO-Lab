import pytest
import math
from app.algorithm.ppo_clip import calculate_actor_loss


class TestCalculateActorLoss:
    def test_ratio_calculation(self):
        # 用户测试2：验证ratio[0] = 1.0
        log_probs = [-1.0, -0.5, -1.5]
        old_log_probs = [-1.0, -1.0, -1.0]
        advantages = [0.5, -0.3, 0.8]
        clip_range = 0.2

        actor_loss, ratios, clipped_ratios = calculate_actor_loss(
            log_probs, old_log_probs, advantages, clip_range,
        )

        # ratio[0] = exp(-1.0 - (-1.0)) = exp(0) = 1.0
        assert abs(ratios[0] - 1.0) < 1e-4, f"ratio[0]期望1.0，实际{ratios[0]}"
        # ratio[1] = exp(-0.5 - (-1.0)) = exp(0.5) ≈ 1.6487
        assert abs(ratios[1] - math.exp(0.5)) < 1e-4
        # ratio[2] = exp(-1.5 - (-1.0)) = exp(-0.5) ≈ 0.6065
        assert abs(ratios[2] - math.exp(-0.5)) < 1e-4

    def test_clipping_positive_advantage(self):
        # 当A > 0时，ratio被裁剪到1+ε
        log_probs = [-1.0, -0.5]
        old_log_probs = [-1.0, -1.0]
        advantages = [0.5, 0.8]
        clip_range = 0.2

        _, ratios, clipped_ratios = calculate_actor_loss(
            log_probs, old_log_probs, advantages, clip_range,
        )

        # ratio[1] ≈ 1.6487，应被裁剪为1.2
        assert abs(clipped_ratios[1] - 1.2) < 1e-4

    def test_no_clipping_needed(self):
        log_probs = [-1.0]
        old_log_probs = [-1.0]
        advantages = [0.5]
        clip_range = 0.2

        actor_loss, ratios, clipped_ratios = calculate_actor_loss(
            log_probs, old_log_probs, advantages, clip_range,
        )

        assert ratios[0] == clipped_ratios[0]
        assert abs(actor_loss - (-0.5)) < 1e-6

    def test_length_mismatch_raises(self):
        with pytest.raises(ValueError):
            calculate_actor_loss([-1.0], [-1.0, -0.5], [0.5], 0.2)
