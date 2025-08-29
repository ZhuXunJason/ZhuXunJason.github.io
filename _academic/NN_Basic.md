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
z=\boldsymbol{xw^T}+b
$$

$\boldsymbol{w},b$ 即是需要进行学习的参数。

然后通过**激活函数**进行非线性变换 $a=g(z)$ ，并传递给下一层神经元。常用的激活函数为ReLu函数: $\text{Relu}(z)=max(0,z)$ 

<div class="callout tip" title="为什么需要激活函数">
<p>如果没有激活函数，最终输出等同于对输入进行若干次仿射变换的复合，其结果仍为仿射变换。此时，神经网络和逻辑回归/线性回归完全相同。</p>
<p>通过激活函数进行非线性变换，神经网络能够进行更为复杂的拟合。(如使用ReLu函数时，结果为分段函数，每一段都是一个仿射函数)</p>
</div>

## 学习过程

- **前向传播**(Forward Propagation)：输入数据 $X$ 进入输入层，经过隐藏层的一系列计算（每个隐藏层执行 $\text{Output} = g(\boldsymbol{w^T}\cdot\text{Input}+b)$ ），在输出层的的每个神经元产生 $\hat{y}$  
- 计算损失：将 $\hat{y}$ 和真实标签 $y$ 比较，通过损失函数计算损失
- 梯度下降：利用反向传播(Backpropagation)计算出损失函数对于网络中每一个权重 $w$ 和偏置 $b$ 的梯度并更新

神经网络会循环以上步骤若干次。每一次循环，神经网络的参数都会被微调，使得它做出的预测越来越接近真实值。就这样，网络逐渐“学会”了如何从输入数据中提取模式并做出准确的预测。

### 反向传播

对于每个神经元，我们需要通过[梯度下降](gradient-descent)更新 $\boldsymbol{w},b$ .因此，我们需要计算出$\dfrac{\partial J}{\partial \boldsymbol{w}},\dfrac{\partial J}{\partial b}$ .根据偏导数计算的链式法则，我们可以反向逐层计算([查看详细过程](https://g.co/gemini/share/ec47d1d49f39))，得到(上标代表层标号)

$$\frac{\partial J}{\partial \boldsymbol{w}^i} = \delta^i \cdot (\boldsymbol{a}^{i-1})^T$$

其中，对于一个 $n$ 层神经网络，误差项 $\delta^i$ 的计算方式如下：

1.  **对于输出层 ($i=n$):**

    $$
    \delta^n = \dfrac{\partial J}{\partial \boldsymbol{a}^n} \cdot\ (g^n)'
    $$

2.  **对于隐藏层 ($i < n$):**

    $$
    \delta^i = \left( \sum_j w_{j}^{i+1} \delta_j^{i+1} \right) \cdot(g^i)'
    $$

## Example:多类别

下面以两层神经网络实现的多类别分类为例，介绍人工神经网络的代码实现。

训练数据：
- `X_train`: Tensor of shape(N, C) # 共有N组数据，C个特征
- `Y_train`: Tensor of shape(N, ) # 每组标签为真实类别

---
### 手搓版

```python
class Multi_Classifier:
	def __init__(self, weight_1 = None, bias_1 = None, weight_2 = None, bias_2 = None):
		self.weight_1 = weight_1 # Tensor of shape(k_1, C)
		self.bias_1 = bias_1 # Tensor of shape(N, k_1)
		self.weight_2 = weight_2 # Tensor of shape(k_2, k_1)
		self.bias_2 = bias_2 # Tensor of shape(N, k_2)
```

- 前向传播

```python
def forward_pass(
	classifier: Multi_Classfier,
	X_train_batch: torch.Tensor
) -> torch.Tensor:

	z_1 = torch.mm(classifier.weight_1, X_train_batch) + classifier.bias_1
	a_1 = torch.clamp(z_1, min=0) # 将张量中所有小于0的位置值设为0
	
	z_2 = torch.mm(classifier.weight_2, X_train_batch) + classifier.bias_2 # scores
	
	return a_1, z_2
```

- [Softmax函数](supervised-learning#heading-8)

```python
def softmax(
	classifier: Multi_Classfier,
	scores: torch.Tensor, # 最后一层隐藏层的输出
) -> torch.Tensor:

	scores_stable = scores - torch.max(scores, dim=1, keepdim=True).values
	exp_scores = torch.exp(scores_stable)
	
	return exp_scores / torch.sum(exp_scores, dim=1, keepdim=True)
```

- Cost/Loss函数(采用交叉熵损失)

多元分类任务中

$$
loss = -\dfrac{1}{N}\sum\log\hat{y_i}
$$

其中 $\hat{y_i}$ 为真实标签对应的概率

```python
def compute_loss(
	classifier: Multi_Classfier,
	probs: torch.Tensor,
	num_train: int
	Y_train_batch: torch.Tensor,
	reg: float # reg为正则化率
) -> float: 
	
	loss = -torch.sum(torch.log(probs[torch.arange(num_train), Y_train_batch])) / num_train
		+ reg * classifier.weight_1 * classifier.weight_1 
		+ reg * classifier.weight_2 * classifier.weight_2
	
	return loss
```

- 梯度下降

对于**输出层**（激活函数为Softmax），根据 `Y_train_batch` 构建独热编码(One-hot Encoding)的标签矩阵 $\boldsymbol{Y}$ .

$$
\dfrac{\partial J}{\partial \boldsymbol{w^2}}=\dfrac{\partial \boldsymbol{z^2}}{\partial \boldsymbol{w^2}}\cdot\dfrac{\partial J}{\partial \boldsymbol{z^2}}=\boldsymbol{(a^1)^T}\cdot(\boldsymbol{a^2-Y})
$$

对于隐藏层（激活函数为Relu）

$$
\begin{aligned}
\dfrac{\partial J}{\partial \boldsymbol{w^1}}&=\dfrac{\partial \boldsymbol{a^1}}{\partial \boldsymbol{w^1}}\cdot\dfrac{\partial J}{\partial \boldsymbol{z^2}}\cdot\dfrac{\partial \boldsymbol{z^2}}{\partial \boldsymbol{a^1}}\\\\&=\boldsymbol{X^T}\cdot(\boldsymbol{a^2-Y})\cdot\boldsymbol{(w^2)^T}\cdot(\boldsymbol{a^1}>0)
\end{aligned}
$$

```python
def grad(
	classifier: Multi_Classfier,
	X_train_batch: torch.Tensor,
	Y_train_batch: torch.Tensor,
	reg: float # reg为正则化率
) -> torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor:

	num_train = X.shape[0]
	a_1, scores = forward_pass(classifier, X_train_batch)
	probs = softmax(classifier, scores)
	loss = compute_loss(classifier, probs, num_train, Y_train_batch)
	
	Y_onehot = torch.zeros_like(probs)
	Y_onehot[torch.arange(num_train), Y_train_batch] = 1 # 标签转为独热编码
	probs -= Y_onehot # a_2 - Y
	
	db_1 = probs
	dW_1 = a_1.T().mm(probs) + 2 * reg

	db_2 = probs.mm(classifier.weight_2.T())(a_1 > 0) # 布尔索引 
	dW_2 = X_train_batch.T().mm(db_2) + 2 * reg
	
	
	return loss, dW_1, db_1, dW_2, db_2
```

```python
def train(
	classifier: Multi_Classfier,
	X_train_batch: torch.Tensor,
	Y_train_batch: torch.Tensor,
	reg: float # reg为正则化率
	learning_rate: float # 学习率
	num_iters: int # 训练次数
)

	for i in range(num_iters):
		loss, dW_1, db_1, dW_2, db_2 = 
			grad(classifier, X_train_batch, Y_train_batch, reg)
		
		self.weight_1 -= learning_rate * dW_1
		self.bias_1 -= learning_rate * db_1
		self.weight_2 -= learning_rate * dW_2
		self.bias_2 -= learning_rate * db_2
```

---
### 库函数版

一些超参数：
- `k_folds`
- `epochs`：训练周期
- `weight_decay`：L2正则化率

1.使用 `torch.nn` 构建神经网络

```python

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.model_selection import KFold

 class TorchNN(nn.Module):
     """
     一个使用 torch.nn.Module 构建的两层神经网络。
     结构: Input -> Linear -> ReLU -> Linear -> (Logits)
     """
     def __init__(self, input_dim, hidden_dim, output_dim):
         super(TorchNN, self).__init__()
         # 定义第一层：线性变换
         self.layer1 = nn.Linear(input_dim, hidden_dim)
         # 定义第二层（输出层）：线性变换
         self.layer2 = nn.Linear(hidden_dim, output_dim)

     def forward(self, x):
         """定义前向传播的流程"""
        
         a_1 = nn.ReLu(self.layer1(x))
         # -> (batch_size, hidden_dim)
         scores = self.layer2(out)
         # -> (batch_size, output_dim)
         return scores
```

2.训练和k折交叉验证

```python
# --- 初始化K折交叉验证 ---
# 使用scikit-learn的KFold
kfold = KFold(n_splits=k_folds, shuffle=True, random_state=42)
fold_accuracies = []

# --- 开始K折交叉验证 ---
for i, (train_ids, val_ids) in enumerate(kfold.split(X_train)):
	print(f"--- 第 {i+1}/{k_folds} 折 ---")

    # --- 数据准备 ---
    X_train_batch, y_train_batch = X_train[train_ids], y_train[train_ids]
    X_val, y_val = X_train[val_ids], y_train[val_ids]

    # --- 初始化模型、损失函数和优化器 ---
    # 为每一折重新初始化模型
    model = TorchNN(
        input_dim=n_features,
        hidden_dim=32, # 隐藏层神经元数
        output_dim=n_classes
    )

    # PyTorch的CrossEntropyLoss内置了Softmax，因此网络末尾不需要加Softmax
    criterion = nn.CrossEntropyLoss()

    # 使用Adam优化器，并传入weight_decay实现L2正则化
    optimizer = optim.Adam(model.parameters(), weight_decay=weight_decay)

    # --- 训练循环 ---
    for epoch in range(epochs):
        model.train() # 将模型设置为训练模式

        # 1. 前向传播
        outputs = model(X_train)

        # 2. 计算损失
        loss = criterion(outputs, y_train)

        # 3. 反向传播和优化
        optimizer.zero_grad() # 清空之前的梯度
        loss.backward()       # 计算梯度
        optimizer.step()      # 更新权重
             
         # --- 在验证集上评估 ---
        model.eval() # 将模型设置为评估模式
        with torch.no_grad(): # 在评估时不需要计算梯度
	        val_outputs = model(X_val)

             # 获取预测结果 (获取概率最高的类别的索引)
             _, predicted = torch.max(val_outputs.data, 1)

             correct_predictions = (predicted == y_val).sum().item()
             accuracy = correct_predictions / y_val.shape[0]
             fold_accuracies.append(accuracy)

        print(f"第 {i+1} 折的验证准确率: {accuracy:.4f}\n")
```

## 分类

按网络结构，神经网络有以下几个主流类别。
- CNN (Convolutional Neural Network, 卷积神经网络)
- RNN (Recurrent Neural Network, 循环神经网络)
- GAN (Generative Adversarial Network, 生成对抗网络)
- Transformer