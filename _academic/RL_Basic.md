---
layout: article_unencrypt
title: 强化学习基础
tags:
  - 学术
  - 学习笔记
  - 强化学习(RL)
date: 2025-09-27
featured_image: /assets/images/RL.jpg
excerpt: 强化学习(Reinforcement learning，RL)是机器学习的一个领域，强调如何基于环境而行动，以取得最大化的预期利益。
---

强化学习的灵感来源于动物训练，即通过给动物奖励或惩罚，让动物学会特定的行为模式。在强化学习中，智能体（agent）通过与环境持续互动，以试错的方式学习，并在过程中通过奖励或惩罚来优化自己的行为策略，以实现累积回报最大化，尤其适用于解决不确定环境中的决策问题。强化学习的数学框架是马尔可夫决策过程(Markov decision processes，MDP)。

## 马尔可夫决策过程

MDP的核心要素与[搜索问题](Pathfinding)类似。

- $S$ : a set of states $s$
- $A$ : a set of actions $a$
- $T(s,a,s')$ : a transition function describing $P(s'\|s,a)$: 在状态 $s$ 下执行动作 $a$ 后，转移到状态 $s'$ 的**概率**。
- $R(s,a,s')$ : a reward function
- start state(+ terminal state)

我们的目标是寻找一个最优策略 $\pi^*: S\rightarrow A$

### 价值迭代
价值迭代(Value Iteration)用于在 $T$ 和 $R$ 已知时寻找最优策略.此时问题转化为求解每个状态的最优价值 $V^*: S\rightarrow A$.

**贝尔曼方程(The Bellman Equation)** 假设一个状态的最优价值 $V^*(s)$，等于该状态能获得的“即时奖励” $R(s)$，加上下一步能到达的“最佳期望未来价值”的折扣总和。

$$
V^*(s)=R(s)+\gamma \max_{a\in A}\sum_{s'}P(s'|s,a)V^*(s') \tag{1}
$$

其中 $\gamma\in [0,1]$ 为折扣因子(Discount Factor).

我们采用迭代算法逼近贝尔曼方程的解。

1.初始化：对所有状态的价值进行一个初始猜测，例如假设 $\forall s\in S,V_0(s)=0$

2.迭代更新每一个状态的价值

$$
V_{k+1}(s)=R(s)+\gamma \max_{a\in A}\sum_{s'}P(s'|s,a)V_{k}(s') \tag{2}
$$

<div class="callout tip">
<p>注意到公式(2)和公式(1)极为相似。在$\forall s\in S,V_0(s)=0$的假设下，我们可以将$V_k(s)$理解为从$s$出发，未来$k$步获得的期望价值。</p>
</div>

3.随着 $k$ 越来越大，$Vₖ(s)$ 会逐渐**收敛**到真正的最优价值 $V^*(s)$。在实践中，我们预设一个阈值$\epsilon$，如果$V_{k+1}-V_{k}<\epsilon$ ,我们就可以认为算法已经收敛，并停止迭代。

4.最终我们得到

$$
\pi^{*}(s)=\arg\max_{a\in A}\sum_{s'}P(s'|s,a)V^*(s')\tag{3}
$$


### 策略迭代
与价值迭代假设一个初始价值不同，策略迭代(Policy Iteration)假设一个初始策略，然后进行迭代优化。

定义策略 $\pi$ 中每个状态 $s$ 的价值 $V^{\pi}(s)$:

$$
V^{\pi}(s)=R(s)+\gamma \sum_{s'}P(s'|s,\pi )V^{\pi}(s') \tag{4}
$$

定义在状态$s$ 执行动作$a$ 获得的期望价值$Q(s,a)$:

$$
Q(s,a)=\sum_{s'}P(s'|s,a)V^\pi(s')\tag{5}
$$

新策略$\pi'(s)$:

$$
\pi'(s)=\arg\max_{a\in A}Q(s,a)\tag{6}
$$

迭代上述过程若干次，若$\pi^{k+1}=\pi^{k}$，认为找到最优策略。


## Q-learning
