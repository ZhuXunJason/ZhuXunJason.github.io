---
layout: article_unencrypt
title: 贝叶斯分类器
tags:
  - 学术
  - 学习笔记
  - 机器学习(ML)
date: 2026-04-13
featured_image: /assets/images/bayes.png
excerpt: 贝叶斯分类器（Bayes Classifier）是一种通过最大化后验概率进行单点估计的分类器。
---
根据 贝叶斯定理（Bayes' Theorem），具有特征 $\boldsymbol{x}$ 的样本属于类别 $c$ 的概率为：

$$ P(c\mid\boldsymbol{x}) = \frac{P(\boldsymbol{x}\mid c)P(c)}{P(\boldsymbol{x})}  $$

-   $P(c)$ ： **先验概率（Prior)**，样本属于类别 $c$ 的固有概率，用 $\dfrac{\lvert D_{c} \rvert}{\lvert D \rvert}$ 代替。

-   $P(\boldsymbol{x} \mid c)$ ：**类条件概率/似然（Likelihood）**。对于离散变量，用  $\dfrac{\lvert D_{c,\boldsymbol{x}} \rvert}{\lvert D_{c} \rvert}$ 代替；对连续变量，利用极大似然估计求出分布参数，然后用概率密度代替。

-   $P(\boldsymbol{x})$ ：**证据因子（Evidence）** ，样本具有特征 $\boldsymbol{x}$ 的概率（对于所有类别，这个分母是一样的，所以分类时通常忽略）。

-   $P(c \mid \boldsymbol{x})$ ：**后验概率（Posterior）** ，计算目标。


<div class="callout tip" title="似然和类条件概率的区别">
<ul>
<li><strong>类条件概率 (Class-Conditional Probability)：</strong>类别 $c$ 已知，特征 $\boldsymbol{x}$ 未知。表示 如果已经确定了样本属于类别 $c$，那么它表现出特征 $\boldsymbol{x}$ 的概率有多大。</li>
<li><strong>似然 (Likelihood)：</strong>特征 $\boldsymbol{x}$ 已知，类别 $c$ 未知。表示 如果观察到某样本具有特征 $\boldsymbol{x}$ ，其属于类别 $c$ 的可能性有多大。</li>
</ul>
</div>


---

### 朴素贝叶斯分类器

现实中，特征 $x$ 往往是由很多个属性组成的，比如 $\boldsymbol{x} = (x_1, x_2, ..., x_d)$。要计算 $P(\boldsymbol{x} \mid c) = P(x_1, x_2, ..., x_d \mid c)$ 是非常困难的，因为如果属性很多，组合爆炸，训练集根本无法覆盖所有的属性组合（维度灾难）。

为了解决这个问题，学者们做了一个极其“大胆”甚至“天真”的假设——**属性条件独立性假设**。这也是它得名“朴素（Naive）”的原因。


基于这个假设，类条件概率就可以拆解为各个属性单独概率的乘积：

$$ P(\boldsymbol{x}\mid c) = P(x_1, x_2, ..., x_d \mid c) = \prod_{i=1}^{d} P(x_i \mid c) $$

代入贝叶斯定理，朴素贝叶斯分类器（Naive Bayes Classifier）)的目标函数变为：

$$ h_{nb}(\boldsymbol{x}) = \arg\max_{c \in Y} P(c) \prod_{i=1}^{d} P(x_i \mid c) $$

<div class="callout note" title="极大似然估计">
<p>使用 <strong>极大似然估计</strong> （Maximum Likelihood Estimation, MLE）计算公式（1）中的 $P( \boldsymbol{x} \mid c)$。</p>

<p>假设类条件概率 $P(x\mid c)$ 具有某种确定的数学形式（比如高斯分布），但参数 $\theta_c$ 未知。所有样本独立同分布。似然函数（Likelihood Function）定义为：</p>

$$ L(\theta_c) = \prod_{i=1}^{N} P(x_i \mid \theta_c) $$

<p>（对于连续变量，用概率密度代替）为了防止多个连乘导致极小值下溢出，并且方便求导，我们通常取对数，得到<strong>对数似然（Log-Likelihood）</strong>。通过对 $\theta_c$ 求导并令导数为0，就能解出最优的参数 $\hat{\theta}_c$。</p>
</div>


### 拉普拉斯修正

若某个属性值在训练集中没有与某个类同时出现过，则直接计算会导致乘0问题。为此引入**拉普拉斯修正**（Laplace Smoothing）：在计算概率时，给分子加上1，给分母加上类别的可能取值数。

*   先验概率平滑：$\hat{P}(c) = \dfrac{\lvert D_c \rvert + 1}{\lvert D \rvert + N}$ （$N$ 是总类别数）

*   条件概率平滑：$\hat{P}(x_i \mid c) = \dfrac{\lvert D_{c, x_i} \rvert + 1}{\lvert D_c \rvert + N_i}$ （$N_i$ 是第 $i$ 个属性可能的取值总数）

---

### 半朴素贝叶斯分类器

“朴素”假设虽然大大简化了计算，但在现实中，属性之间往往是有关联的，假设它们完全独立会导致模型误差很大。半朴素贝叶斯分类器（Semi-Naive Bayes Classifiers）利用**独依赖估计（One-Dependent Estimator, ODE）**，即假设每个属性除了依赖类别 $c$ 之外，最多只依赖一个其他属性。此时类条件概率变为：

$$ P(x\mid c) = \prod_{i=1}^{d} P(x_i \mid c, pa_i) $$

其中 $pa_i$ 是属性 $x_i$ 所依赖的另一个属性（称为父属性）。

常见方法：

1.  **SPODE（Super-Parent ODE）**：假设所有属性都依赖同一个“超级父属性”。

2.  **TAN（Tree Augmented Naive Bayes）**：通过计算属性间的互信息，用最大生成树算法找出一棵树状的依赖关系图。

3.  **AODE（Averaged ODE）**：集成学习的思想，尝试把每个属性轮流当作超级父属性训练出多个SPODE，然后把结果平均起来。

---

### 贝叶斯网络

如果我们把半朴素贝叶斯的思想进一步扩展——允许属性之间有任意复杂的依赖关系，我们得到的就是**贝叶斯网络**（Bayesian Networks，又称信念网络 Belief Network）。它是概率图模型（Probabilistic Graphical Models）的基石。

贝叶斯网络由两部分组成 $B = \langle G, \Theta \rangle$：

1.  **结构 $G$**：一个有向无环图（DAG）。

2.  **参数 $\Theta$**：每个节点对应的条件概率表（CPT, Conditional Probability Table）。

在贝叶斯网络中，所有变量的联合概率分布可以表示为每个变量在其父节点给定的情况下的条件概率的乘积：

$$ P(x_1, x_2, ..., x_d) = \prod_{i=1}^{d} P(x_i \mid \pi_i) $$

（$\pi_i$ 表示在图 $G$ 中变量 $x_i$ 的所有父节点集合）。

朴素贝叶斯其实是贝叶斯网络的一种极其特殊的特例（图中除了类别节点指向各个属性节点外，属性节点之间没有任何连线）。

---
