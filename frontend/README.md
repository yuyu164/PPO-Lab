# PPO-Lab — AI驯化实验室

通过交互式可视化，深入理解 RLHF 与 PPO 算法核心机制的沉浸式教学网站。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript 6 |
| 构建 | Vite 8 |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 4 |
| 样式 | Tailwind CSS 4 |
| 图表 | ECharts 6 (Canvas 渲染) |
| 动画 | GSAP 3 |
| 公式渲染 | KaTeX |
| HTTP 客户端 | Axios |
| 图标 | Lucide Vue Next |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npx vue-tsc --noEmit

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 环境变量

在 `.env.development` 中配置：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/training
```

## 项目结构

```
src/
├── api/                    # API 层
│   ├── request.ts          # Axios 实例与拦截器
│   ├── quadModel.ts        # 四模演武场 API
│   ├── kl.ts               # KL 散度 API
│   ├── gae.ts              # GAE 回溯 API
│   ├── training.ts         # 训练模拟器 API
│   └── websocket.ts        # WebSocket 客户端（心跳/重连）
├── components/             # 通用组件
│   ├── AppHeader.vue       # 顶部导航栏
│   ├── SectionWrapper.vue  # 板块容器（淡入动画）
│   ├── ParamSlider.vue     # 参数滑块
│   ├── FormulaDisplay.vue  # KaTeX 公式渲染
│   ├── StatusBadge.vue     # 状态徽章
│   ├── ModelNode.vue       # 模型节点
│   ├── TokenChip.vue       # Token 芯片
│   ├── DataFlowLine.vue    # 数据流线
│   ├── AchievementBadge.vue# 成就徽章
│   └── ExpandablePanel.vue # 可展开面板
├── composables/            # 组合函数
│   ├── useAnimation.ts     # GSAP Timeline 管理
│   ├── useECharts.ts       # ECharts 生命周期
│   ├── useIntersection.ts  # IntersectionObserver
│   ├── useScrollTo.ts      # 平滑滚动
│   ├── useQuadModelStateMachine.ts  # 四模状态机
│   ├── useKlController.ts  # KL 控制器
│   ├── useGaeTracer.ts     # GAE 回溯控制器
│   └── useTrainingController.ts    # 训练控制器
├── mock/                   # Mock 数据（符合算法逻辑）
│   ├── quadModel.ts        # Token 生成模拟
│   ├── kl.ts               # KL 散度模拟
│   ├── gae.ts              # GAE 计算模拟
│   └── training.ts         # 训练指标模拟
├── router/                 # 路由配置
├── sections/               # 板块子组件
│   ├── alignment/          # 对齐剧场（3 组件）
│   ├── gae-retracer/       # GAE 回溯器（5 组件）
│   ├── kl-controller/      # KL 散度调节器（4 组件）
│   ├── quad-model/         # 四模演武场（4 组件）
│   └── training/           # 训练模拟器（10 组件）
├── stores/                 # Pinia Store
│   ├── app.ts              # 全局应用状态
│   ├── quadModel.ts        # 四模演武场
│   ├── kl.ts               # KL 散度
│   ├── gae.ts              # GAE 回溯
│   └── training.ts         # 训练模拟器
├── types/                  # TypeScript 类型定义
│   ├── algorithm.ts        # 算法类型
│   ├── api.ts              # API 类型
│   ├── request.ts          # 请求类型
│   ├── response.ts         # 响应类型
│   ├── websocket.ts        # WebSocket 类型
│   ├── frontend.ts         # 前端类型
│   └── index.ts            # 桶导出
├── utils/                  # 工具函数
│   ├── algorithm.ts        # 算法计算（正态分布、KL、GAE）
│   ├── format.ts           # 数字格式化
│   └── chart.ts            # ECharts 主题与系列工厂
├── views/                  # 页面视图
│   ├── HeroSection.vue     # Hero 区
│   ├── AlignmentTheater.vue# 对齐剧场
│   ├── QuadModelArena.vue  # 四模演武场
│   ├── KLController.vue    # KL 散度调节器
│   ├── GAERetracer.vue     # GAE 回溯器
│   ├── TrainingSimulator.vue # 训练模拟器
│   └── AppFooter.vue       # 页脚
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
└── style.css               # 全局样式 + Tailwind 主题
```

## 六大板块

### 1. Hero 区

Canvas 粒子背景（代码字符飘浮），渐变标题与 CTA 按钮，引导用户进入交互体验。

### 2. 对齐剧场

- **野生/对齐 AI 对比卡片**：展示 RLHF 前后的对话差异，打字机效果逐字呈现
- **5 星评分交互**：用户扮演 Reward Model 角色，评分后弹出 RLHF 原理解释
- **RLHF 路线图**：SFT → Reward Model → PPO 三阶段可交互展开

### 3. 四模演武场

- **四模型关系图**：Actor / Reference / Critic / Reward 四节点，GSAP 逐节点高亮
- **Token 序列**：逐步生成，每个 Token 带优势值颜色标记
- **步进控制**：播放/暂停/单步/重置，4 子步骤动画（Actor 生成 → Reference 对比 → Critic 预测 → 计算优势）
- **公式展示**：KaTeX 渲染当前步骤的 PPO 裁剪公式

### 4. KL 散度调节器

- **双正态分布曲线**：ECharts 实时渲染 Reference 与 Actor 的概率分布
- **β 滑块**：0.01 ~ 1.0 连续调节，300ms 防抖计算
- **3 预设模式**：自由 (β=0.01) / 标准 (β=0.1) / 严格 (β=0.5)，GSAP 动画过渡
- **状态解读**：根据 β 值实时显示约束强度与策略偏离程度
- **公式面板**：KL 散度公式，β 值高亮闪烁

### 5. GAE 回溯器

- **Token 序列条**：回溯指示器跟随当前计算位置
- **优势函数柱状图**：GSAP 控制柱体生长动画，正值绿/负值红
- **计算面板**：TD 误差 δ_t 与 GAE A_t 公式，打字机效果逐行展示
- **γ / λ 参数控制**：滑块调节，1x/2x/4x 速度切换
- **方差-偏差指示器**：λ 值在偏差-方差谱上的可视化

### 6. 训练模拟器

- **7 个实时图表**：Actor Loss / Critic Loss / KL 散度 / Reward / Returns / 优势分布 / 质量热力图
- **6 参数控制台**：β / γ / λ / ε / lr / PPO 轮数，3 套预设
- **5 成就系统**：首次收敛 / KL 守护者 / 奖励攀升 / 精准微调 / PPO 专家
- **模拟训练**：无需后端，Mock 数据按算法逻辑生成

## 算法实现

Mock 数据严格遵循 PPO/RLHF 算法逻辑：

- **正态分布曲线**：`generateNormalCurve()` 基于高斯函数生成采样点
- **KL 散度**：`calculateKLGaussian()` 计算两个高斯分布间的 KL 散度
- **GAE**：`computeGAE()` 从后向前动态规划计算广义优势估计
- **训练指标**：`generateTrainingMetrics()` 模拟 PPO 训练过程中的损失/奖励/KL 变化

## 启动与部署

### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npx vue-tsc --noEmit

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000(或python run.py)

# 运行全部测试
pytest tests/ -v

# 运行特定模块测试
pytest tests/test_gae.py -v
pytest tests/test_ppo_clip.py -v
pytest tests/test_critic_loss.py -v
pytest tests/test_kl_divergence.py -v
```

### 前后端联调

1. 启动后端：`cd backend && uvicorn app.main:app --reload --port 8000`
2. 启动前端：`cd frontend && npm run dev`
3. 前端 `.env.development` 中配置：
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000/ws/training
   ```
4. 访问 http://localhost:5173

### 后端API文档

启动后端后访问：
- Swagger UI：http://localhost:8000/docs
- ReDoc：http://localhost:8000/redoc

## 开发约定

- 组件逻辑代码控制在 300-400 行以内
- 动画使用 GSAP Timeline 管理，组件卸载时自动清理
- 图表使用 ECharts Canvas 渲染模式，禁用内置动画（由 GSAP 控制）
- 类型定义完整，严格模式（`strict: true` + `verbatimModuleSyntax`）
- 后端算法实现严格遵循《算法开发参考.md》中的公式，禁止使用随机数据
