# PPO-Lab API 接口规范

> **版本**：v1.0
> **基础路径**：`/api`
> **协议**：HTTP RESTful + WebSocket
> **数据格式**：JSON
> **后端框架**：Python FastAPI
> **数据验证**：Pydantic v2

---

## 一、通用约定

### 1.1 响应格式

所有 RESTful 接口统一使用以下响应结构：

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

失败时：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "参数 beta 必须在 [0.01, 1.0] 范围内"
  }
}
```

### 1.2 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | 请求处理成功 |
| 400 | 请求错误 | 参数校验失败 |
| 404 | 未找到 | 资源不存在 |
| 422 | 验证失败 | Pydantic 校验不通过 |
| 500 | 服务器错误 | 算法计算异常 |

### 1.3 数值精度

- 所有浮点数保留 **4 位小数**（后端计算完成后 round 至 4 位）
- 数组类型字段不得为空数组（至少包含 1 个元素）

### 1.4 跨域配置

后端需配置 CORS，允许前端开发服务器访问：

```
Allow-Origin: http://localhost:5173
Allow-Methods: GET, POST, OPTIONS
Allow-Headers: Content-Type
```

---

## 二、数据模型（Pydantic）

### 2.1 基础模型

```python
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class StatusEnum(str, Enum):
    WARNING = "warning"
    OPTIMAL = "optimal"
    LOCKED = "locked"


class ErrorResponse(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[ErrorResponse] = None
```

### 2.2 四模演武场模型

```python
class TokenStep(BaseModel):
    token: str = Field(..., description="Token文本")
    log_prob: float = Field(..., description="Actor log概率")
    ref_log_prob: float = Field(..., description="Reference log概率")
    kl_div: float = Field(..., description="KL散度值")
    V_t: float = Field(..., description="Critic预测状态价值")
    V_next: float = Field(..., description="下一状态价值")
    r_t: float = Field(..., description="即时奖励")
    A_t: float = Field(..., description="优势值（TD error）")


class GenerationEpisode(BaseModel):
    prompt: str = Field(..., description="输入提示词")
    steps: list[TokenStep] = Field(..., description="Token步骤列表")
    R_global: float = Field(..., description="全局奖励")
```

### 2.3 KL 散度调节器模型

```python
class KLBetaInterpretation(BaseModel):
    status: StatusEnum = Field(..., description="状态标识")
    title: str = Field(..., description="状态标题")
    description: str = Field(..., description="状态描述")


class CurvePoint(BaseModel):
    x: float
    y: float


class NormalDistribution(BaseModel):
    mean: float = Field(..., description="均值")
    std: float = Field(..., gt=0, description="标准差")
    curve: list[CurvePoint] = Field(..., description="分布曲线采样点")
```

### 2.4 GAE 回溯器模型

```python
class GAEStep(BaseModel):
    t: int = Field(..., ge=0, description="时刻索引")
    token: str = Field(..., description="Token文本")
    r_t: float = Field(..., description="即时奖励")
    V_t: float = Field(..., description="预测价值")
    V_next: float = Field(..., description="下一时刻价值")
    delta: float = Field(..., description="TD error")
    A_t: float = Field(..., description="优势值")
    is_positive: bool = Field(..., description="优势值是否为正")


class VarianceBiasResult(BaseModel):
    bias: str = Field(..., description="偏差等级")
    variance: str = Field(..., description="方差等级")
    description: str = Field(..., description="说明文字")


class GAEResult(BaseModel):
    steps: list[GAEStep] = Field(..., description="GAE步骤列表")
    advantages: list[float] = Field(..., description="优势函数数组")
    returns: list[float] = Field(..., description="实际收益数组")
    gamma: float = Field(..., description="折扣因子")
    lambda_: float = Field(..., alias="lambda", description="GAE权衡因子")
    variance_bias: VarianceBiasResult = Field(..., description="方差-偏差解读")


class StepCalculation(BaseModel):
    step: int = Field(..., description="当前时刻")
    formulas: dict = Field(..., description="公式计算详情")
    is_positive: bool = Field(..., description="优势值是否为正")
```

### 2.5 训练模拟器模型

```python
class TrainingHyperparams(BaseModel):
    kl_ctl: float = Field(0.1, ge=0.01, le=1.0, description="KL惩罚系数β")
    gamma: float = Field(0.99, ge=0.9, le=1.0, description="折扣因子")
    lam: float = Field(0.95, ge=0.0, le=1.0, description="GAE权衡因子λ")
    clip_range: float = Field(0.2, ge=0.05, le=0.5, description="PPO clip范围ε")
    learning_rate: float = Field(0.03, gt=0, le=0.1, description="学习率")
    ppo_epochs: int = Field(3, ge=1, le=10, description="PPO迭代轮数")


class TrainingMetrics(BaseModel):
    epoch: int = Field(..., ge=0, description="当前Epoch")
    actor_loss: float = Field(..., description="Actor Loss")
    critic_loss: float = Field(..., description="Critic Loss")
    kl_div: float = Field(..., ge=0, description="平均KL散度")
    reward: float = Field(..., description="平均奖励")
    advantages: list[float] = Field(..., description="优势函数数组")
    returns: list[float] = Field(..., description="Returns数组")


class AchievementType(str, Enum):
    FIRST_CONVERGE = "first_converge"
    KL_STABLE = "kl_stable"
    CONTINUOUS_IMPROVE = "continuous_improve"
    PRECISE_TUNING = "precise_tuning"
    MASTER = "master"


class AchievementUnlock(BaseModel):
    achievement: AchievementType
    description: str
    unlocked_at_epoch: int


class PresetEnum(str, Enum):
    BEGINNER = "beginner"
    STANDARD = "standard"
    AGGRESSIVE = "aggressive"
```

---

## 三、RESTful API 接口

### 3.1 四模演武场

#### 3.1.1 生成完整 Token 序列

生成一次完整的 Token 序列，包含所有步骤的算法计算结果。

```
POST /api/quad-model/generate
```

**请求体：**

```json
{
  "prompt": "Hello",
  "actor_params": {
    "mean": 0.0,
    "std": 1.0
  },
  "ref_params": {
    "mean": 0.0,
    "std": 1.0
  },
  "kl_ctl": 0.1,
  "max_tokens": 6
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | string | 是 | - | 输入提示词 |
| actor_params | object | 否 | {mean:0, std:1} | Actor模型参数 |
| actor_params.mean | float | 否 | 0.0 | Actor分布均值 |
| actor_params.std | float | 否 | 1.0 | Actor分布标准差（>0） |
| ref_params | object | 否 | {mean:0, std:1} | Reference模型参数（固定） |
| ref_params.mean | float | 否 | 0.0 | Reference分布均值 |
| ref_params.std | float | 否 | 1.0 | Reference分布标准差（>0） |
| kl_ctl | float | 否 | 0.1 | KL惩罚系数β |
| max_tokens | int | 否 | 6 | 最大生成Token数（1-20） |

**响应体：**

```json
{
  "success": true,
  "data": {
    "episode": {
      "prompt": "Hello",
      "steps": [
        {
          "token": "I",
          "log_prob": -1.2034,
          "ref_log_prob": -1.1024,
          "kl_div": -0.1010,
          "V_t": 0.4521,
          "V_next": 0.5832,
          "r_t": 0.0101,
          "A_t": 0.1383
        }
      ],
      "R_global": 0.7523
    }
  },
  "error": null
}
```

**关联算法**：A1(Token生成) + A2(KL散度) + A3(Reward计算) + A4(Critic预测) + A5(优势计算)

---

#### 3.1.2 单步演示

获取下一步的 Token 生成数据，用于步进式动画。

```
POST /api/quad-model/step
```

**请求体：**

```json
{
  "prompt": "Hello",
  "current_tokens": ["I", "am"],
  "actor_params": {
    "mean": 0.0,
    "std": 1.0
  },
  "ref_params": {
    "mean": 0.0,
    "std": 1.0
  },
  "kl_ctl": 0.1
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | string | 是 | - | 原始提示词 |
| current_tokens | string[] | 否 | [] | 已生成的Token序列 |
| actor_params | object | 否 | {mean:0, std:1} | Actor模型参数 |
| ref_params | object | 否 | {mean:0, std:1} | Reference模型参数 |
| kl_ctl | float | 否 | 0.1 | KL惩罚系数β |

**响应体：**

```json
{
  "success": true,
  "data": {
    "step": {
      "token": "an",
      "log_prob": -0.8932,
      "ref_log_prob": -0.9124,
      "kl_div": 0.0192,
      "V_t": 0.5123,
      "V_next": 0.6234,
      "r_t": -0.0019,
      "A_t": 0.1098
    },
    "is_complete": false
  },
  "error": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| step | TokenStep | 当前步骤数据 |
| is_complete | bool | 序列是否已生成完毕 |

**关联算法**：A1 + A2 + A4 + A5（单步执行）

---

### 3.2 KL 散度调节器

#### 3.2.1 计算 KL 散度

根据 β 值计算两个正态分布之间的 KL 散度，并返回分布曲线和状态解读。

```
POST /api/kl/calculate
```

**请求体：**

```json
{
  "beta": 0.1,
  "ref_distribution": {
    "mean": 0.0,
    "std": 1.0
  },
  "actor_distribution": {
    "mean": 0.5,
    "std": 1.2
  },
  "x_range": [-4, 4],
  "num_points": 200
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| beta | float | 是 | - | KL惩罚系数β（0.01-1.0） |
| ref_distribution | object | 否 | {mean:0, std:1} | Reference分布参数 |
| ref_distribution.mean | float | 否 | 0.0 | Reference均值 |
| ref_distribution.std | float | 否 | 1.0 | Reference标准差（>0） |
| actor_distribution | object | 否 | {mean:0, std:1} | Actor分布参数 |
| actor_distribution.mean | float | 否 | 0.0 | Actor均值 |
| actor_distribution.std | float | 否 | 1.0 | Actor标准差（>0） |
| x_range | float[] | 否 | [-4, 4] | x轴范围（2个元素） |
| num_points | int | 否 | 200 | 曲线采样点数（50-500） |

**响应体：**

```json
{
  "success": true,
  "data": {
    "kl_divergence": 0.2647,
    "ref_curve": {
      "mean": 0.0,
      "std": 1.0,
      "curve": [
        { "x": -4.0, "y": 0.0001 },
        { "x": -3.96, "y": 0.0002 }
      ]
    },
    "actor_curve": {
      "mean": 0.5,
      "std": 1.2,
      "curve": [
        { "x": -4.0, "y": 0.0001 },
        { "x": -3.96, "y": 0.0001 }
      ]
    },
    "overlap_area": 0.8234,
    "interpretation": {
      "status": "optimal",
      "title": "理想状态",
      "description": "Actor在探索与约束之间取得平衡"
    },
    "formula": {
      "expression": "R_t = -β·(log P_actor - log P_ref)",
      "highlight": "β",
      "beta_value": 0.1
    }
  },
  "error": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| kl_divergence | float | KL(N_ref ‖ N_actor) 散度值 |
| ref_curve | NormalDistribution | Reference分布曲线数据 |
| actor_curve | NormalDistribution | Actor分布曲线数据 |
| overlap_area | float | 两分布重叠面积（0-1） |
| interpretation | KLBetaInterpretation | β值状态解读 |
| formula | object | 联动公式信息 |

**关联算法**：B1(PPO-Penalty解读) + B2(KL高斯计算) + B3(分布曲线生成)

---

### 3.3 GAE 回溯器

#### 3.3.1 完整 GAE 计算

一次性计算完整序列的 GAE 优势和 Returns。

```
POST /api/gae/compute
```

**请求体：**

```json
{
  "tokens": ["Hello", "I", "am", "an", "AI", "assistant"],
  "rewards": [0.5, 0.3, 0.8, -0.1, 1.5, 0.5],
  "values": [0.4, 0.6, 0.5, 0.3, 0.8, 0.6],
  "gamma": 0.99,
  "lambda": 0.95
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| tokens | string[] | 是 | - | Token文本数组 |
| rewards | float[] | 是 | - | 即时奖励数组 |
| values | float[] | 是 | - | Critic预测价值数组 |
| gamma | float | 否 | 0.99 | 折扣因子（0.9-1.0） |
| lambda | float | 否 | 0.95 | GAE权衡因子（0.0-1.0） |

**约束**：`rewards`、`values`、`tokens` 三者长度必须相同，且 ≥ 2。

**响应体：**

```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "t": 5,
        "token": "assistant",
        "r_t": 0.5,
        "V_t": 0.6,
        "V_next": 0.0,
        "delta": -0.1000,
        "A_t": -0.1000,
        "is_positive": false
      },
      {
        "t": 4,
        "token": "AI",
        "r_t": 1.5,
        "V_t": 0.8,
        "V_next": 0.6,
        "delta": 1.2940,
        "A_t": 1.2001,
        "is_positive": true
      }
    ],
    "advantages": [2.4070, 1.8234, 1.5892, -0.2341, 1.2001, -0.1000],
    "returns": [2.8070, 2.4234, 2.0892, 0.0659, 2.0001, 0.5000],
    "gamma": 0.99,
    "lambda": 0.95,
    "variance_bias": {
      "bias": "低偏差",
      "variance": "高方差",
      "description": "更信任实际采样结果，偏差小但需要更多采样"
    }
  },
  "error": null
}
```

**说明**：`steps` 数组按从后向前的回溯顺序排列（t 从大到小），`advantages` 和 `returns` 按原始时间顺序排列（t 从小到大）。

**关联算法**：C1(GAE完整计算) + 方差-偏差解读

---

#### 3.3.2 单步 GAE 计算

获取某个时刻的 GAE 计算详情，用于步进式回溯动画。

```
POST /api/gae/step
```

**请求体：**

```json
{
  "t": 3,
  "tokens": ["Hello", "I", "am", "an", "AI", "assistant"],
  "rewards": [0.5, 0.3, 0.8, -0.1, 1.5, 0.5],
  "values": [0.4, 0.6, 0.5, 0.3, 0.8, 0.6],
  "gamma": 0.99,
  "lambda": 0.95,
  "next_advantage": 1.2001
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| t | int | 是 | - | 当前回溯时刻（≥0） |
| tokens | string[] | 是 | - | Token文本数组 |
| rewards | float[] | 是 | - | 即时奖励数组 |
| values | float[] | 是 | - | Critic预测价值数组 |
| gamma | float | 否 | 0.99 | 折扣因子 |
| lambda | float | 否 | 0.95 | GAE权衡因子 |
| next_advantage | float | 否 | 0.0 | 下一时刻已计算的优势值 |

**响应体：**

```json
{
  "success": true,
  "data": {
    "step": {
      "t": 3,
      "token": "an",
      "r_t": -0.1,
      "V_t": 0.3,
      "V_next": 0.8,
      "delta": 0.3920,
      "A_t": 1.5147,
      "is_positive": true
    },
    "calculation": {
      "td_error": {
        "formula": "δ_t = r_t + γ·V_{t+1} - V_t",
        "substitution": "δ_3 = -0.1000 + 0.99×0.8000 - 0.3000",
        "result": 0.3920
      },
      "gae": {
        "formula": "A_t = δ_t + γ·λ·A_{t+1}",
        "substitution": "A_3 = 0.3920 + 0.99×0.95×1.2001",
        "result": 1.5147
      }
    }
  },
  "error": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| step | GAEStep | 当前步骤数据 |
| calculation | object | 公式计算详情（用于前端展示打字机效果） |
| calculation.td_error | object | TD error 计算过程 |
| calculation.gae | object | GAE 递归计算过程 |

**关联算法**：C2(单步GAE计算)

---

### 3.4 训练预设查询

获取训练模拟器的预设参数方案。

```
GET /api/training/presets
```

**响应体：**

```json
{
  "success": true,
  "data": {
    "presets": {
      "beginner": {
        "label": "新手推荐",
        "params": {
          "kl_ctl": 0.1,
          "gamma": 0.99,
          "lam": 0.95,
          "clip_range": 0.2,
          "learning_rate": 0.01,
          "ppo_epochs": 3
        }
      },
      "standard": {
        "label": "标准训练",
        "params": {
          "kl_ctl": 0.1,
          "gamma": 0.99,
          "lam": 0.95,
          "clip_range": 0.2,
          "learning_rate": 0.03,
          "ppo_epochs": 3
        }
      },
      "aggressive": {
        "label": "激进探索",
        "params": {
          "kl_ctl": 0.01,
          "gamma": 0.99,
          "lam": 0.98,
          "clip_range": 0.3,
          "learning_rate": 0.05,
          "ppo_epochs": 5
        }
      }
    }
  },
  "error": null
}
```

---

## 四、WebSocket 接口

### 4.1 连接

```
WebSocket /ws/training
```

前端通过此连接与后端建立实时通信，控制训练过程并接收训练指标。

### 4.2 客户端 → 服务端消息

#### 4.2.1 开始训练

```json
{
  "action": "start",
  "params": {
    "kl_ctl": 0.1,
    "gamma": 0.99,
    "lam": 0.95,
    "clip_range": 0.2,
    "learning_rate": 0.03,
    "ppo_epochs": 3
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定为 `"start"` |
| params | TrainingHyperparams | 否 | 训练超参数，缺省使用默认值 |

**后端行为**：初始化模型参数，开始训练循环，每个 Epoch 结束后推送指标。

---

#### 4.2.2 暂停训练

```json
{
  "action": "pause"
}
```

**后端行为**：暂停训练循环，保持当前状态，可随时恢复。

---

#### 4.2.3 恢复训练

```json
{
  "action": "resume"
}
```

**后端行为**：从暂停处继续训练循环。

---

#### 4.2.4 单步训练

```json
{
  "action": "step"
}
```

**后端行为**：仅执行一个 Epoch 的训练，然后自动暂停。

---

#### 4.2.5 重置训练

```json
{
  "action": "reset"
}
```

**后端行为**：重置所有模型参数和训练状态，清空历史记录。

---

#### 4.2.6 更新参数

```json
{
  "action": "update_params",
  "params": {
    "kl_ctl": 0.2,
    "clip_range": 0.15
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定为 `"update_params"` |
| params | object | 是 | 需要更新的参数（仅包含变更项） |

**后端行为**：更新指定参数，下一个 Epoch 将使用新参数。不重置训练状态。

---

### 4.3 服务端 → 客户端消息

#### 4.3.1 Epoch 指标推送

每个 Epoch 完成后推送：

```json
{
  "type": "epoch",
  "data": {
    "epoch": 1,
    "actor_loss": 0.8234,
    "critic_loss": 0.4521,
    "kl_div": 0.1523,
    "reward": 0.3456,
    "advantages": [0.8234, -0.1234, 1.2345, -0.0567, 0.9876, 0.3456],
    "returns": [1.2234, 0.4766, 1.7345, 0.2433, 1.7876, 0.9456]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 固定为 `"epoch"` |
| data | TrainingMetrics | 当前 Epoch 的训练指标 |

**关联算法**：D1(Actor Loss) + D2(Critic Loss) + D3(Returns) + D4(PPO训练步骤)

---

#### 4.3.2 成就解锁推送

训练过程中检测到成就达成时推送：

```json
{
  "type": "achievement",
  "data": {
    "achievement": "first_converge",
    "description": "Actor Loss首次降到0.5以下",
    "unlocked_at_epoch": 23
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 固定为 `"achievement"` |
| data | AchievementUnlock | 成就解锁信息 |

**成就判定条件**：

| achievement | 条件 |
|-------------|------|
| first_converge | actor_loss < 0.5（首次） |
| kl_stable | KL散度连续10个Epoch在 [0.1, 0.3] 之间 |
| continuous_improve | actor_loss连续20个Epoch下降 |
| precise_tuning | actor_loss < 0.3 且 kl_div < 0.2 |
| master | actor_loss < 0.1 且 kl_div < 0.2 且 reward > 0.8 |

**关联算法**：D5(成就判定)

---

#### 4.3.3 训练状态推送

训练状态变化时推送（开始、暂停、恢复、重置、完成）：

```json
{
  "type": "status",
  "data": {
    "state": "running",
    "epoch": 5,
    "max_epochs": 100
  }
}
```

| state 值 | 说明 |
|-----------|------|
| idle | 初始/重置后状态 |
| running | 训练进行中 |
| paused | 训练已暂停 |
| completed | 训练已完成（达到最大Epoch数） |
| error | 训练出错 |

---

#### 4.3.4 错误推送

训练过程中发生错误时推送：

```json
{
  "type": "error",
  "data": {
    "code": "TRAINING_DIVERGED",
    "message": "训练发散：Loss值溢出，请降低学习率"
  }
}
```

| code | 说明 |
|------|------|
| TRAINING_DIVERGED | Loss值溢出（NaN或Inf） |
| INVALID_PARAMS | 参数组合无效 |
| INTERNAL_ERROR | 内部计算错误 |

---

### 4.4 连接生命周期

```
客户端                                服务端
  │                                     │
  │──── WebSocket 握手 ────────────────→│
  │←─── 连接成功 ──────────────────────│
  │                                     │
  │──── {action: "start", params} ────→│
  │←─── {type: "status", running} ─────│
  │←─── {type: "epoch", data} ────────│  ← Epoch 1
  │←─── {type: "epoch", data} ────────│  ← Epoch 2
  │←─── {type: "achievement", ...} ───│  ← 成就解锁
  │──── {action: "pause"} ───────────→│
  │←─── {type: "status", paused} ─────│
  │                                     │
  │──── {action: "resume"} ──────────→│
  │←─── {type: "epoch", data} ────────│  ← Epoch 3
  │   ...                               │
  │←─── {type: "status", completed} ──│  ← 训练完成
  │                                     │
  │──── 关闭连接 ─────────────────────→│
```

### 4.5 心跳机制

- 客户端每 **30 秒**发送一次 Ping
- 服务端收到 Ping 后回复 Pong
- 超过 **60 秒**未收到心跳，服务端主动断开连接

---

## 五、接口与板块对应关系

| 板块 | RESTful 接口 | WebSocket 接口 | 关联算法 |
|------|-------------|----------------|----------|
| 对齐剧场 | 无（纯前端交互） | 无 | 无 |
| 四模演武场 | `POST /api/quad-model/generate` | 无 | A1-A5 |
| 四模演武场 | `POST /api/quad-model/step` | 无 | A1+A2+A4+A5 |
| KL散度调节器 | `POST /api/kl/calculate` | 无 | B1+B2+B3 |
| GAE回溯器 | `POST /api/gae/compute` | 无 | C1 |
| GAE回溯器 | `POST /api/gae/step` | 无 | C2 |
| 训练模拟器 | `GET /api/training/presets` | `/ws/training` | D1-D5 |

---

## 六、错误码汇总

| 错误码 | HTTP状态码 | 说明 | 触发场景 |
|--------|-----------|------|----------|
| INVALID_PARAMETER | 400 | 参数校验失败 | 参数类型/范围错误 |
| ARRAY_LENGTH_MISMATCH | 400 | 数组长度不匹配 | rewards/values/tokens长度不一致 |
| INVALID_BETA_RANGE | 400 | β值超出范围 | beta ∉ [0.01, 1.0] |
| INVALID_STEP_INDEX | 400 | 步骤索引无效 | t < 0 或 t ≥ 序列长度 |
| TRAINING_DIVERGED | 200(WS) | 训练发散 | Loss为NaN/Inf |
| INTERNAL_ERROR | 500 | 内部计算错误 | 算法执行异常 |

---

## 七、性能要求

| 指标 | 要求 | 说明 |
|------|------|------|
| RESTful 响应时间 | ≤ 200ms | 单次计算类请求 |
| WebSocket 推送间隔 | ≥ 100ms | Epoch 间最小间隔，防止前端渲染压力 |
| GAE 计算时间 | ≤ 50ms | 序列长度 ≤ 20 时 |
| KL 计算时间 | ≤ 30ms | 包含曲线生成 |
| 训练单步时间 | ≤ 100ms | 单个 Epoch 的完整 PPO 步骤 |

---

## 八、安全与限流

- WebSocket 连接数上限：**1**（同一时间只允许一个训练会话）
- RESTful API 限流：**60 次/分钟**（每 IP）
- 所有输入参数经过 Pydantic 严格校验
- 数值计算中加入溢出检测（NaN / Inf → 返回错误）
