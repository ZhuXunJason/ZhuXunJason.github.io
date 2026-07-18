---
layout: article_unencrypt
title: 循环神经网络
tags:
  - 学术
  - 学习笔记
  - 深度学习(DL)
date: 2026-05-18
featured_image: /assets/images/model.webp
excerpt: 循环神经网络 (Recurrent Neural Network, RNN) 是一种适合处理序列数据的神经网络，能够利用历史信息建模时序依赖。
math: true
---

现实中的很多数据都不是“互相独立的样本”，而是天然带有顺序结构：

- 一句话中的单词有前后关系
- 一段语音信号随时间变化
- 股票价格、天气、传感器数据本质上都是时间序列

这类任务的核心难点是：**当前时刻的输出，往往依赖于之前时刻的信息。**

## RNN 的动机

如果直接使用全连接网络（MLP）处理序列，一个常见问题是：  
MLP 默认假设输入维度固定、各位置彼此独立，不擅长表达“前文会影响后文”的结构。

例如对句子进行情感分类时：

> “I thought the movie would be boring, but it was actually great.”

模型在读到 `great` 时，应该结合前面的上下文来理解整句含义，而不是只看当前词本身。

循环神经网络（Recurrent Neural Network, RNN）正是为了解决这个问题而设计的。  
它通过引入**隐藏状态（hidden state）**，让模型在处理当前输入时，同时携带过去的信息。

---

## RNN 的循环结构

RNN 在第 $t$ 个时间步接收当前输入 $\boldsymbol{x}_t$，并结合上一个时间步的隐藏状态 $\boldsymbol{h}_{t-1}$，得到新的隐藏状态 $\boldsymbol{h}_t$：

$$
\boldsymbol{h}_t = \phi(\boldsymbol{W}_{xh}\boldsymbol{x}_t + \boldsymbol{W}_{hh}\boldsymbol{h}_{t-1} + \boldsymbol{b}_h)
$$

再根据隐藏状态得到输出：

$$
\boldsymbol{y}_t = \boldsymbol{W}_{hy}\boldsymbol{h}_t + \boldsymbol{b}_y
$$

其中：

- $\boldsymbol{x}_t$：第 $t$ 个时刻的输入
- $\boldsymbol{h}_t$：第 $t$ 个时刻的隐藏状态
- $\boldsymbol{y}_t$：第 $t$ 个时刻的输出
- $\phi$：激活函数，常见为 `tanh` 或 `ReLU`

与普通前馈网络不同，RNN 的关键在于：

- **同一组参数会在每个时间步重复使用**
- **隐藏状态负责在时间维度上传递信息**

---

## 时间展开（Unrolling）

RNN 看起来像“一个会循环的网络”，但为了理解和训练，通常会把它沿时间轴展开：

$$
\boldsymbol{h}_1 \rightarrow \boldsymbol{h}_2 \rightarrow \boldsymbol{h}_3 \rightarrow \cdots \rightarrow \boldsymbol{h}_T
$$

展开后可以发现：

- 它在结构上像一个“很深的网络”
- 但每一层其实共享同一组参数

这也是 RNN 能处理任意长度序列的原因之一：  
**网络不是为每个位置单独学一套参数，而是把同一个状态转移规则反复应用。**

---

## RNN 与全连接网络的结构联系

RNN 和全连接网络也不是割裂的，它们之间有明显的结构联系：

1. **若去掉循环项，RNN 会退化成普通全连接层**  
   若没有 $\boldsymbol{W}_{hh}\boldsymbol{h}_{t-1}$ 这一项，那么每个时间步只是在做：

   $$
   \boldsymbol{h}_t = \phi(\boldsymbol{W}_{xh}\boldsymbol{x}_t + \boldsymbol{b}_h)
   $$

   这本质上就是“把同一个全连接层应用到每个时间步”。

2. **时间展开后的 RNN，可看作一个跨时间的深层网络**  
   不同之处在于：这些“层”共享参数，而普通 MLP 每层参数独立。

3. **RNN 的本质是“全连接 + 状态记忆”**  
   它仍然在做线性变换 + 非线性激活，只是多了一条隐藏状态通路，把过去的信息带到现在。

<div class="callout note" title="结构理解">
<p>MLP 适合固定长度、位置之间相对独立的输入；RNN 则是在 MLP 的基础上加入“记忆机制”，使模型能够处理序列依赖。</p>
</div>

---

## RNN 的前向传播

给定一个长度为 $T$ 的序列 $(\boldsymbol{x}_1, \boldsymbol{x}_2, \dots, \boldsymbol{x}_T)$，RNN 会递归地更新隐藏状态：

$$
\boldsymbol{h}_t = \phi(\boldsymbol{W}_{xh}\boldsymbol{x}_t + \boldsymbol{W}_{hh}\boldsymbol{h}_{t-1} + \boldsymbol{b}_h)
$$

如果是序列分类任务，常见做法是只取最后一个时间步的隐藏状态来做预测：

$$
\hat{\boldsymbol{y}} = \boldsymbol{W}\boldsymbol{h}_T + \boldsymbol{b}
$$

如果是序列标注任务（如词性标注），则可能在每个时间步都输出一个预测。

常见任务形式：

- **Many-to-One**：整个序列对应一个输出（如文本分类）
- **Many-to-Many**：每个时间步对应一个输出（如序列标注）
- **One-to-Many**：一个输入生成一个序列（如简单文本生成）

---

## BPTT：通过时间的反向传播

RNN 的训练通常使用 **BPTT（Backpropagation Through Time）**，也就是“把展开后的网络按时间反向传播”。

若总损失为：

$$
\mathcal{L} = \sum_{t=1}^{T}\mathcal{L}_t
$$

那么在计算梯度时，某个较早时刻的隐藏状态会影响后面很多步的损失，因此梯度会沿时间链不断相乘。

这会带来两个经典问题：

- **梯度消失（Vanishing Gradient）**：梯度越来越小，早期信息难以学习
- **梯度爆炸（Exploding Gradient）**：梯度越来越大，训练不稳定

<div class="callout tip" title="为什么会梯度消失/爆炸">
<p>RNN 在时间上反复乘以同一个状态转移矩阵 $\boldsymbol{W}_{hh}$ 及激活函数导数。如果这些连乘结果的范数长期小于 1，就容易消失；长期大于 1，就容易爆炸。</p>
</div>

常见缓解方法有：

- 梯度裁剪（Gradient Clipping）
- 更好的初始化
- 使用门控结构，如 **LSTM**

---

## LSTM 的核心思想

LSTM（Long Short-Term Memory）是 RNN 的一种改进结构，专门用于缓解长序列中的梯度消失问题。

它的关键思想是：  
**不要把所有信息都塞进一个隐藏状态里反复覆盖，而是额外引入一条“细胞状态（cell state）”通路，用门控机制决定哪些信息保留、哪些丢弃、哪些写入。**

相比普通 RNN，LSTM 多了一个核心变量：

- $\boldsymbol{c}_t$：细胞状态（长期记忆）

而 $\boldsymbol{h}_t$ 更像是当前时刻暴露给外部的“短期工作状态”。

---

## LSTM 的门控结构

LSTM 在每个时间步主要计算以下几部分。

### 遗忘门（Forget Gate）

决定上一个时刻的细胞状态保留多少：

$$
\boldsymbol{f}_t = \sigma(\boldsymbol{W}_f[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t] + \boldsymbol{b}_f)
$$

### 输入门（Input Gate）

决定当前输入中的新信息写入多少：

$$
\boldsymbol{i}_t = \sigma(\boldsymbol{W}_i[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t] + \boldsymbol{b}_i)
$$

### 候选记忆（Candidate Memory）

生成当前可写入的候选内容：

$$
\tilde{\boldsymbol{c}}_t = \tanh(\boldsymbol{W}_c[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t] + \boldsymbol{b}_c)
$$

### 更新细胞状态

$$
\boldsymbol{c}_t = \boldsymbol{f}_t \odot \boldsymbol{c}_{t-1} + \boldsymbol{i}_t \odot \tilde{\boldsymbol{c}}_t
$$

其中 $\odot$ 表示逐元素相乘。

### 输出门（Output Gate）

决定当前时刻对外输出多少信息：

$$
\boldsymbol{o}_t = \sigma(\boldsymbol{W}_o[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t] + \boldsymbol{b}_o)
$$

最后得到隐藏状态：

$$
\boldsymbol{h}_t = \boldsymbol{o}_t \odot \tanh(\boldsymbol{c}_t)
$$

---

## 为什么 LSTM 更适合长依赖

普通 RNN 中，历史信息必须不断压缩进 $\boldsymbol{h}_t$，很容易在反复更新中被冲淡。  
LSTM 则通过细胞状态 $\boldsymbol{c}_t$ 提供了一条更稳定的信息通路：

- 遗忘门决定“旧信息留多少”
- 输入门决定“新信息写多少”
- 输出门决定“当前暴露多少”

因此，LSTM 更擅长处理：

- 长句子中的远距离依赖
- 长时间跨度的时间序列
- 需要记住关键信息较久的任务

<div class="callout note" title="直观理解">
<p>可以把普通 RNN 想成“只有一个小黑板，写新内容时很容易把旧内容擦掉”；LSTM 则像“有一个专门的长期存储区，并且有门来控制读写”。</p>
</div>

---

## 一个基础 RNN 示例（PyTorch）

下面给出一个简单的序列分类模型。假设输入张量形状为：

$$
(\text{batch}, \text{seq\_len}, \text{input\_size})
$$

```python
import torch
import torch.nn as nn

class SimpleRNNClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super().__init__()
        self.rnn = nn.RNN(
            input_size=input_size,
            hidden_size=hidden_size,
            batch_first=True,
        )
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, h_n = self.rnn(x)
        last_hidden = out[:, -1, :]   # 取最后一个时间步
        logits = self.fc(last_hidden)
        return logits
```

这个模型的逻辑是：

1. 用 `nn.RNN` 按时间顺序处理整个序列
2. 取最后一个时间步的隐藏状态
3. 用全连接层输出分类结果

---

## 一个基础 LSTM 示例（PyTorch）

```python
import torch
import torch.nn as nn

class SimpleLSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            batch_first=True,
        )
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        last_hidden = out[:, -1, :]
        logits = self.fc(last_hidden)
        return logits
```

与 `nn.RNN` 相比，`nn.LSTM` 会额外维护：

- `h_n`：最后时刻的隐藏状态
- `c_n`：最后时刻的细胞状态

因此它更适合较长的序列建模。

---

## 总结

- RNN 适合处理带有顺序结构的序列数据。
- 它通过隐藏状态把过去的信息传递到当前时刻。
- 从结构上看，RNN 可以看作“带共享参数和状态记忆的全连接网络”。
- 普通 RNN 容易出现梯度消失/爆炸，难以建模长距离依赖。
- LSTM 通过门控机制和细胞状态显著提升了长期记忆能力，是 RNN 的重要改进。

一句话概括：

> RNN 让神经网络“记住过去”，LSTM 则让这种记忆更稳定、更持久。
