---
layout: article_unencrypt
title: 梯度下降
tags:
  - 学术
  - 学习笔记
  - 机器学习(ML)
date: 2025-08-19
featured_image: /assets/images/gradient-descent.png
excerpt: 梯度下降是机器学习的一种常用方法，目标是找到使成本函数最小的参数值
math: true
---
梯度下降法用于更新线性回归模型中的参数 ($\boldsymbol{w}, b$)，公式为

$$
w'_i = w_i - \alpha \dfrac{\partial J(\boldsymbol{w}, b)}{\partial w_i},\quad
b' = b - \alpha \dfrac{\partial J(\boldsymbol{w}, b)}{\partial b}
$$

其中 $J(\boldsymbol{w}, b)$ 是成本函数，偏导数主要控制梯度下降的方向，$\alpha$ 为超参数（学习率），控制参数的变化幅度。

<div class="callout note">
<li>当成本函数为凸函数（如<mark>线性回归中的均方误差函数 和 逻辑回归中的对数损失函数</mark>）时，梯度下降可以收敛到全局最小值。</li>
<li>当成本函数不是凸函数时，梯度下降通常只能保证收敛到某个局部最小值或驻点；单纯增大学习率有时能越过浅的局部极小值或鞍点，但也更容易震荡甚至发散。</li>
</div>


## 优化方法

学习率 $\alpha$ 是梯度下降中最重要的超参数之一。一个**固定不变的学习率**通常存在两难问题：

- 如果设置得**太大**，训练初期下降很快，但后期会在最优点附近剧烈震荡，甚至直接发散。
- 如果设置得**太小**，虽然更稳定，但收敛会非常缓慢。

因此，实际训练中通常会同时使用两类技巧：

1. **优化器（Optimizer）**：决定“梯度应该如何被处理之后再更新参数”，例如 Momentum、Adam、AdamW。
2. **调度器（Scheduler）**：决定“学习率应该如何随训练过程变化”，例如 StepLR、CosineAnnealingLR、OneCycleLR。


### 优化器

#### 小批量梯度下降
小批量随机梯度下降（Mini-batch gradient descent）每次选取一小部分数据来计算梯度并更新参数。它综合了两种极端情况：

- **Batch Gradient Descent**：每次用整个训练集计算梯度，稳定但慢。
- **Stochastic Gradient Descent (SGD)**：每次只用一个样本更新，快但噪声大。

Mini-batch 正好折中：既能利用矩阵并行加速，又能保留一定随机性，通常是深度学习训练中的默认选择。

![](/assets/images/gd.svg)

##### 工作流程
1. **Shuffle**：在每个训练周期（Epoch）开始前，将训练集打乱。（增加训练随机性）
2. **划分批次（Batching）**：将打乱后的数据集按指定大小（`batch_size`）切分成若干个小批量。
3. **循环迭代（Iterate）**：
   - 取出一个小批量数据。
   - 计算这个小批量数据的**平均梯度**，更新模型参数。
   - 重复以上过程，直到遍历完所有的小批量数据，完成一个 Epoch。

#### Momentum
普通 SGD 每一步只看当前梯度：

$$
\theta_t = \theta_{t-1} - \alpha g_t
$$

其中 $g_t = \nabla_\theta J(\theta_{t-1})$。

Momentum（`torch.optim.SGD`）在此基础上引入“速度”变量 $v_t$：

$$
v_t = \beta v_{t-1} + g_t
$$

$$
\theta_t = \theta_{t-1} - \alpha v_t
$$

其中 $\beta \in [0, 1)$， 一般取 $0.9$ 左右。

- 如果梯度方向长期一致，$v_t$ 会不断累积，更新会越来越快。
- 如果梯度方向频繁来回变化，累积项会互相抵消，从而减小震荡。

所以 Momentum 的核心作用是**沿着主下降方向加速，沿着震荡方向减振**

```python
velocity = {name: torch.zeros_like(param) for name, param in model.named_parameters()}

for x, y in dataloader:
    model.zero_grad()
    loss = criterion(model(x), y)
    loss.backward()

    with torch.no_grad():
        for name, param in model.named_parameters():
            if param.grad is None:
                continue
            g = param.grad
            velocity[name] = beta * velocity[name] + g
            param -= lr * velocity[name]

    model.zero_grad()
```

---

#### Adam
Adam（Adaptive Moment Estimation，`torch.optim.Adam`）可以看作 **Momentum + 自适应学习率** 的结合。

它同时维护梯度的一阶矩（均值）和二阶矩（平方均值）：

$$
m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t
$$

$$
v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2
$$

因为初始时 $m_0 = 0, v_0 = 0$，前几步估计会偏小，所以需要做**偏置校正**：

$$
\hat{m}_t = \dfrac{m_t}{1 - \beta_1^t},\quad
\hat{v}_t = \dfrac{v_t}{1 - \beta_2^t}
$$

最终更新公式为：

$$
\theta_t = \theta_{t-1} - \alpha \dfrac{\hat{m}_t}{\sqrt{\hat{v}_t} + \varepsilon}
$$

- $m_t$：记录“梯度大致往哪个方向走”，相当于动量。
- $v_t$：记录“这个参数最近梯度波动有多大”。
- 如果某个参数梯度一直很大，分母 $\sqrt{\hat{v}_t}$ 也会大，从而自动缩小更新步长。
- 如果某个参数梯度较小，更新步长相对会更大。

```python
t = 0

m = {name: torch.zeros_like(param) for name, param in model.named_parameters()}
v = {name: torch.zeros_like(param) for name, param in model.named_parameters()}

for x, y in dataloader:
    loss = criterion(model(x), y)
    loss.backward()
    t += 1

    with torch.no_grad():
        for name, param in model.named_parameters():
            if param.grad is None:
                continue

            g = param.grad
            m[name] = beta1 * m[name] + (1 - beta1) * g
            v[name] = beta2 * v[name] + (1 - beta2) * (g * g)

            m_hat = m[name] / (1 - beta1 ** t)
            v_hat = v[name] / (1 - beta2 ** t)

            param -= lr * m_hat / (torch.sqrt(v_hat) + eps)

    model.zero_grad()
```

<div class="callout note" title="AdamW">

<p>AdamW 可以理解为：<strong>把权重衰减（Weight Decay）从 Adam 的梯度更新中解耦出来。</strong> 即最后一步参数更新变为</p>

$$
\theta_t \leftarrow \theta_t - \alpha \dfrac{\hat{m}_t}{\sqrt{\hat{v}_t} + \varepsilon} \textcolor{red}{- \alpha \lambda \theta_{t-1}}
$$

</div>

## 学习率调度器

> 优化器决定“怎么走”，调度器决定“走多快”。

训练早期，模型离最优点很远，通常希望学习率大一点；训练后期，模型已经接近最优点，通常希望学习率小一点，减少震荡。有时配合**warmup**，在最初期让学习率缓慢上升，防止梯度爆炸。

---

### StepLR
StepLR(`torch.optim.lr_scheduler.StepLR`)是最简单的调度器之一，每隔固定步数把学习率乘上一个系数 $\gamma$：

$$
\eta_t = \eta_0 \gamma^{\left\lfloor \frac{t}{s} \right\rfloor}
$$

其中：

- $\eta_0$：初始学习率
- $s$：每隔多少个 epoch 衰减一次
- $\gamma$：衰减倍率，例如 $0.1$

---

### CosineAnnealing
余弦退火(`torch.optim.lr_scheduler.CosineAnnealingLR`)会让学习率从 $\eta_{\max}$ 平滑下降到 $\eta_{\min}$：

$$
\eta_t = \eta_{\min} + \frac{1}{2}(\eta_{\max} - \eta_{\min})
\left(1 + \cos\left(\frac{\pi t}{T_{\max}}\right)\right)
$$

其优点是下降过程连续、平滑，在现代深度学习中非常常见。


