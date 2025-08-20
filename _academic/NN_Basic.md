---
layout: article_unencrypt
title: 神经网络基础
tags:
  - 学术
  - 学习笔记
  - 深度学习(DL)
date: 2025-08-19
featured_image: /assets/images/neuron.jpg
excerpt: 神经网络(Neural Network)通过模仿生物神经元协同工作的方式来处理复杂问题
---
人工神经网络 (Artificial Neural Network, ANN)由输入层，隐藏层(Hidden layer)和输出层组成，每一层包括若干个神经元。每个神经元接收来自前一层神经元的输出 $\boldsymbol{x}$ 。首先进行仿射变换（类似线性回归）：

$$
z=\boldsymbol{w^Tx}+b
$$

$\boldsymbol{w},b$ 即是需要进行学习的参数。

然后通过**激活函数**进行非线性变换 $a=f(z)$ ，并传递给下一层神经元。常用的激活函数为ReLu函数: $\text{Relu}(z)=max(0,z)$ 

<div class="callout tip" title="为什么需要激活函数">
<p>如果没有激活函数，最终输出等同于对输入进行若干次仿射变换的复合，其结果仍为仿射变换。此时，神经网络和逻辑回归/线性回归完全相同。</p>
<p>通过激活函数进行非线性变换，神经网络能够进行更为复杂的拟合。(如使用ReLu函数时，结果为分段函数，每一段都是一个仿射函数)</p>
</div>

## 学习过程

- **前向传播**(Forward Propagation)：输入数据 $X$ 进入输入层，经过隐藏层的一系列计算，在输出层的的每个神经元产生 $\hat{y}$  
- 计算损失：将 $\hat{y}$ 和真实标签 $y$ 比较，通过损失函数计算损失
- 梯度下降：利用反向传播((Backpropagation))计算出损失函数对于网络中每一个权重 $w$ 和偏置 $b$ 的梯度并更新

神经网络会循环以上步骤若干次。每一次循环，神经网络的参数都会被微调，使得它做出的预测越来越接近真实值。就这样，网络逐渐“学会”了如何从输入数据中提取模式并做出准确的预测。

### 反向传播

对于每个神经元，我们需要通过[梯度下降](gradient-descent)更新 $\boldsymbol{w},b$ .因此，我们需要计算出$\dfrac{\partial J}{\partial \boldsymbol{w}},\dfrac{\partial J}{\partial b}$ .根据偏导数计算的链式法则，我们可以反向逐层计算([查看详细过程](https://g.co/gemini/share/ec47d1d49f39))，得到

$$\frac{\partial J}{\partial \boldsymbol{w}_k^i} = \delta_k^i \cdot (\boldsymbol{a}^{i-1})^T$$

其中，对于一个 $n$ 层神经网络，误差项 $\delta_k^i$ 的计算方式如下：

1.  **对于输出层 ($i=n$):**
    $$
    \delta_k^n = \frac{\partial J}{\partial a_k^n} (g^n)'(z_k^n)
    $$

2.  **对于隐藏层 ($i < n$):**
    $$
    \delta_k^i = \left( \sum_j w_{jk}^{i+1} \delta_j^{i+1} \right) (g^i)'(z_k^i)
    $$


## 分类

按网络结构，神经网络有以下几个主流类别。
- CNN (Convolutional Neural Network, 卷积神经网络)
- RNN (Recurrent Neural Network, 循环神经网络)
- GAN (Generative Adversarial Network, 生成对抗网络)
- Transformer