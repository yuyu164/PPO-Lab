import pytest
from app.algorithm.critic_loss import calculate_critic_loss


class TestCalculateCriticLoss:
    def test_basic_critic_loss(self):
        values = [0.6, 0.7, 0.4]
        old_values = [0.5, 0.6, 0.3]
        returns = [0.8, 0.9, 0.5]
        clip_range = 0.2

        critic_loss = calculate_critic_loss(values, old_values, returns, clip_range)

        assert abs(critic_loss - 0.015) < 1e-6, f"critic_loss期望0.015，实际{critic_loss}"

    def test_user_test_case(self):
        # 用户测试3：values = [0.5, 0.9], old_values = [0.4, 0.5], clip_range = 0.2
        # 验证V_CLIP[1]被裁剪到0.7
        values = [0.5, 0.9]
        old_values = [0.4, 0.5]
        returns = [0.8, 0.8]
        clip_range = 0.2

        # 手动验证V_CLIP
        import numpy as np
        v = np.array(values)
        ov = np.array(old_values)
        values_clipped = np.clip(v, ov - clip_range, ov + clip_range)

        # V_CLIP[1] = clip(0.9, 0.5-0.2, 0.5+0.2) = clip(0.9, 0.3, 0.7) = 0.7
        assert abs(values_clipped[1] - 0.7) < 1e-6, f"V_CLIP[1]期望0.7，实际{values_clipped[1]}"

        # 计算critic_loss
        critic_loss = calculate_critic_loss(values, old_values, returns, clip_range)
        assert isinstance(critic_loss, float)

    def test_clipping_activates(self):
        values = [1.0]
        old_values = [0.5]
        returns = [0.8]
        clip_range = 0.2

        critic_loss = calculate_critic_loss(values, old_values, returns, clip_range)

        # V_clip = clip(1.0, 0.3, 0.7) = 0.7
        # loss1 = (1.0 - 0.8)² = 0.04
        # loss2 = (0.7 - 0.8)² = 0.01
        # max(0.04, 0.01) = 0.04
        # critic_loss = 0.04 × 0.5 = 0.02
        assert abs(critic_loss - 0.02) < 1e-6

    def test_clipping_below_range(self):
        values = [0.1]
        old_values = [0.5]
        returns = [0.8]
        clip_range = 0.2

        critic_loss = calculate_critic_loss(values, old_values, returns, clip_range)

        # V_clip = clip(0.1, 0.3, 0.7) = 0.3
        # loss1 = (0.1 - 0.8)² = 0.49
        # loss2 = (0.3 - 0.8)² = 0.25
        # max(0.49, 0.25) = 0.49
        # critic_loss = 0.49 × 0.5 = 0.245
        assert abs(critic_loss - 0.245) < 1e-6

    def test_length_mismatch_raises(self):
        with pytest.raises(ValueError):
            calculate_critic_loss([0.6], [0.5, 0.6], [0.8], 0.2)
