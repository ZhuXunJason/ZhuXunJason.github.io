---
layout: article_unencrypt
title: 支持向量机
tags:
  - 学术
  - 学习笔记
  - 机器学习(ML)
date: 2026-04-06
featured_image: /assets/images/SVM.png
excerpt: 支持向量机（Support Vector Machine, SVM）是一种监督式学习模型，主要用于二元分类任务。
---


假设有一个二分类的训练数据集：$D = \lbrace (x_1, y_1), (x_2, y_2), \dots, (x_N, y_N) \rbrace$，其中特征向量 $x_i \in \mathbb{R}^d$，类别标签 $y_i \in \lbrace +1, -1 \rbrace$。假设数据是**线性可分的**。

SVM的目标是在这个 $d$ 维空间中找一个**超平面 (Hyperplane)** 将两类样本完全分开。超平面的方程可以写为：

$$w^T x + b = 0$$

其中，$w$ 是超平面的法向量（决定平面的方向），$b$ 是偏置项（决定平面到原点的距离）。

## 构建最优化问题

最优分类超平面不仅要求能将两类样本正确无误地完全分开，并且在所有满足该条件的超平面中，它能使得**距离超平面最近的样本点，到该平面的几何距离达到最大**。

点 $(x_{i},y_{i})$ 到平面的几何距离为

$$\gamma_i =\frac{|w^T x_i + b|}{||w||} =\frac{y_i(w^T x_i + b)}{||w||}$$

（在点 $(x_{i},y_{i})$ 被正确分类时）

我们希望寻找参数 $w$ 和 $b$，使得最小的几何间隔 $\gamma$ 最大化，同时必须保证所有的数据点都满足这个最小的几何间隔要求。因此最优化问题可以写为：

$$\max_{w, b} \gamma$$

$$\text{s.t.} \quad \frac{y_i(w^T x_i + b)}{||w||} \ge \gamma, \quad i=1,2,\dots,N$$

令 $\displaystyle \gamma = \frac{\hat{\gamma}}{\|\|w\|\|}$ 得到：

$$\max_{w, b} \frac{\hat{\gamma}}{||w||}$$

$$\text{s.t.} \quad y_i(w^T x_i + b) \ge \hat{\gamma}, \quad i=1,2,\dots,N$$

实际上， $\hat{\gamma}$ 的取值并不影响最终求得的超平面位置，因为等比例缩放 $w, b$，超平面不变。

令 $\hat{\gamma} = 1$ ，目标函数变成了最大化 $\dfrac{1}{\|\|w\|\|}$，约束条件变成了 $y_i(w^T x_i + b) \ge 1$。而最大化 $\dfrac{1}{\|\|w\|\|}$ 等价于最小化 $\dfrac{1}{2}\|\|w\|\|^2$。

最终得到的二次优化问题是：

$$\min_{w, b} \frac{1}{2} ||w||^2$$

$$\text{s.t.} \quad y_i(w^T x_i + b) - 1 \ge 0, \quad i=1,2,\dots,N$$


这是一个凸二次优化问题。引入拉格朗日乘子 $\alpha_i \ge 0$，构建拉格朗日函数

$$L(w, b, \alpha) = \frac{1}{2} ||w||^2 - \sum_{i=1}^N \alpha_i [y_i(w^T x_i + b) - 1]$$

- $\displaystyle\frac{\partial L}{\partial w} = w - \sum_{i=1}^N \alpha_i y_i x_i = 0 \implies w = \sum_{i=1}^N \alpha_i y_i x_i$
- $\displaystyle\frac{\partial L}{\partial b} = -\sum_{i=1}^N \alpha_i y_i = 0 \implies \sum_{i=1}^N \alpha_i y_i = 0$

对偶问题为：

$$\max_{\alpha} \sum_{i=1}^N \alpha_i - \frac{1}{2} \sum_{i=1}^N \sum_{j=1}^N \alpha_i \alpha_j y_i y_j x_i^T x_j$$

$$\text{s.t.} \quad \sum_{i=1}^N \alpha_i y_i = 0$$

$$\quad \quad \alpha_i \ge 0, \quad i=1,2,\dots,N$$

此优化问题可以通过 [SMO算法](https://zh.wikipedia.org/wiki/%E5%BA%8F%E5%88%97%E6%9C%80%E5%B0%8F%E4%BC%98%E5%8C%96%E7%AE%97%E6%B3%95) 求解。

<div class="callout tip" title="支持向量">

<p>由于这是凸二次优化问题，强对偶性成立，最优解必然满足互补松弛条件。</p>

$$\alpha_i [y_i(w^T x_i + b) - 1] = 0$$

<ul>
<li>若$y_i(w^T x_i + b) > 1$，即点在间隔边界之外，必然有 $\alpha_i = 0$</li>
<li>若$\alpha_i > 0$，则$y_i(w^T x_i + b) = 1$。这意味着该样本点恰好落在间隔边界上。</li>
</ul>
<p>在求得的解中，绝大多数样本的 $\alpha_i = 0$。模型参数 $w = \sum_{i=1}^N \alpha_i y_i x_i$ 实际上只由极少数 $\alpha_i > 0$ 的样本决定。这些数据点即为“支持向量”。</p>
</div>


## 软间隔

真实数据中常常有噪声或异常点，为了提升泛化能力，引入**松弛变量 (Slack Variables)** $\xi_i \ge 0$ 和罚函数 $C\sum\xi_{i}$ (其中超参数 $C$ 为惩罚系数)。

目标函数变为

$$\min_{w, b, \xi} \frac{1}{2} ||w||^2 + C \sum_{i=1}^N \xi_i$$

对偶问题 $\alpha_i$ 的约束多了一个上限：

$$0 \le \alpha_i \le C$$

## 非线性SVM

当数据在原始空间内完全线性不可分时（例如同心圆分布），我们需要将数据映射到一个更高维的特征空间 $\phi(x)$ 中，使其在新的空间里线性可分。此时，对偶问题中的内积 $x_i^T x_j$ 就变成了高维空间的内积 $\phi(x_i)^T \phi(x_j)$。直接计算此内积可能会导致极为庞大的计算量（数据会被映射到很大的维度）。

### 核函数

由于我们只关心两个高维向量的内积  $ϕ(x_i)^Tϕ(x_j)$ ，因此直接定义核函数

$$K(x_i, x_j) = \phi(x_i)^T \phi(x_j)$$

从而避免了复杂的中间计算。

<div class="callout note" title="常见核函数">
<ul>
<li><strong>多项式核</strong></li>
$$K(x_i, x_j) = (\gamma x_i^T x_j + r)^d$$
<p>相当于把数据映射到了 $d$ 维的多项式空间，主要应用于图像处理。</p>
<li><strong>高斯核（RBF Kernel）</strong></li>
$$K(x_i, x_j) =e^{-\gamma \|x_i - x_j\|^2}$$
<p>高斯核隐式地将数据映射到了无限维空间，理论上可以分离任何复杂的非线性数据集。参数 $\gamma$  决定了单个样本点的影响范围。$\gamma$ 越大，高斯钟形曲线越窄，模型越复杂（容易过拟合）</p>
<li><strong>Sigmoid核</strong></li>
$$K(x_i, x_j) = \tanh(\gamma x_i^T x_j + r)$$
<p>加上Sigmoid核函数后，SVM 的数学结构等价于一个没有隐藏层的多层感知机。</p>
</ul>
</div>
