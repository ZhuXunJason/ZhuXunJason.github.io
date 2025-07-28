---
layout: article_unencrypt
title: 约束满足问题
tags:
  - 学术
  - 学习笔记
  - 搜索
date: 2025-07-17
featured_image: /assets/images/default.webp
excerpt: 约束满足问题（Constraint Satisfaction Problems, CSPs）只关心最终的解本身是否满足一系列给定的约束。
---
## 概览

约束满足问题（Constraint Satisfaction Problems, CSPs）与寻路问题不同，CSP通常不关心如何到达一个解（路径是trivial的），而只关心最终的解本身是否满足一系列给定的约束（规则）。

许多看似无关的问题，如**地图着色**、**课程表安排**、**数独求解**等，都可以被抽象为CSP模型，从而使用一套通用的算法来解决。

## 通用问题框架

一个CSP问题由三个核心部分组成：

- **变量 (Variables)**：一组需要被赋值的对象 `X = {X_1, X_2, ..., X_n}`。
    * *例如，在地图着色中，变量就是每一个地区。*

2.  **域 (Domains)**：每个变量 `X_i` 可以被赋予的值的集合，表示为 `D_i`。
    * 域可以是离散有限的（如颜色集合），也可以是连续的。本文主要关注离散有限域。
    * *例如，在地图着色中，域就是颜色的集合 `{红色, 绿色, 蓝色}`。*

3.  **约束 (Constraints)**
    * 规定了变量可以同时取哪些值的规则。一个约束关联了若干个变量，并指定了这些变量的合法赋值组合。
    * **一元约束**: 只涉及单个变量（如 `X_1 ≠ 红色`）。
    * **二元约束**: 涉及两个变量（如 `X_1 ≠ X_2`）。这是最常见的约束类型。
    * **高阶约束**: 涉及三个或更多变量。

<div class="callout note">
<p>任何高阶约束都可以被转化为一组二元约束（虽然有时需要引入辅助变量），因此二元约束是CSP理论研究的核心。我们可以用<strong>约束图（Constraint Graph）</strong> 来可视化一个CSP，其中节点代表变量，边代表它们之间存在约束。</p>
</div>

---

## 回溯搜索

回溯搜索 (Backtracking Search)是解决CSP最基础、最核心的系统性算法。本质上是深度优先搜索（DFS）的变体，但通过“边赋值边检查”的策略，能够智能地剪掉大量无效的搜索分支。

**核心思想**：增量式地为变量赋值，每一步都检查当前的部分赋值是否违反了任何约束。一旦发现冲突，就立即回溯（撤销上一步赋值），并尝试其他值。如果一个变量的所有值都尝试失败，则进一步向上回溯。

### 算法流程
1.  如果所有变量都已成功赋值，则返回解。
2.  选择一个尚未赋值的变量 `var`。
3.  对于 `var` 域中的每一个值 `value`：
    a. 尝试将 `value` 赋给 `var`。
    b. 检查这次赋值是否与之前已赋值的变量相冲突。
    c. 如果不冲突，则递归调用回溯算法。
    d. 如果递归调用成功返回了一个解，则直接返回该解。
4.  如果 `var` 的所有值都尝试失败，说明当前路径无解，回溯（返回失败）。

### 复杂度分析
* **时间复杂度**: 在没有任何优化的情况下，最坏情况是 $O(d^n)$ (探索整个赋值树)，其中 $n$ 是变量数量，$d$ 是域的大小。
* **空间复杂度**: $O(n)$，用于存储递归调用栈的深度，即当前路径的长度。

### 代码实现
以澳大利亚着色问题为例：
![](/assets/images/澳大利亚着色问题.png)

$$\begin{aligned}
X =\{NT&, WA, Q, SA, NSW, V, T\}\\
D_{i} = \{red&, blue, green\}\\
C=\{WA&: [NT, SA],\\
NT&: [WA, SA, Q],\\
SA&: [WA, NT, Q, NSW, V],\\
Q&: [NT, SA, NSW],\\
NSW&: [Q, SA, V],\\
V&: [SA, NSW],\\
T&: [~]\}
\end{aligned}$$

#### 检查函数

- 方案一：检查一个赋值是否与现有约束冲突

```python
def checking(variable:str, assignment:dict[str, str], constraints:dict[str, list[str]]):
    for neighbor, color in assignment.items():
        # 检查邻居是否在约束中，并且颜色是否相同
        if neighbor in constraints.get(variable, []) and color == assignment[variable]:
            return False
    return True
```

```cpp
bool checking(const string& var, const map<string, string>& assignment, const map<string, vector<string>>& constraints) {
    string current_color = assignment.at(var);
    if (constraints.find(var) == constraints.end()) return true;

    for (const auto& neighbor : constraints.at(var)) 
        if (assignment.contains(neighbor) && assignment[neighbor] == current_color) 
            return false;
    return true;
}
```

- 方案二：**前向检查**
<div class="callout note" title="前向检查(Forward Checking)">
<p>在递归过程中维护一个动态变化的域副本。当给一个变量赋值后，检查与其有约束的<strong>所有未赋值的邻居</strong>，并从它们的域中移除与当前赋值冲突的值。</p>

 优点: 如果任何邻居的域因此变空，我们就可以立刻断定当前路径是死路并回溯，无需再对那个邻居进行递归。
</div>

  ```python
def checking(domains: dict[str, list[str]], variable: str, constraints: dict[str, list[str]], value: str) -> tuple[bool, dict[str, list[str]]]:
    '''
    @param domains: 变量域(地区名: 颜色列表)
    @param variable: 当前地区
    @param value: 当前颜色
    '''
    
    domains_copy = copy.deepcopy(domains)
    domains_copy[variable] = [value]  # 将当前变量的域设置为只包含当前值
    
    for neighbor in constraints.get(variable, []):
        if value in domains_copy[neighbor]:
            domains_copy[neighbor].remove(value)
            if not domains_copy[neighbor]:
                return False, domains # 导致邻居域为空，失败
    
    return True, domains_copy  # 返回修改后的域
```

- 方案三：**弧相容**

弧相容 (Arc Consistency, AC-3)是一种更强大的推理形式。它不止检查“已赋值”和“未赋值”变量间的约束，还会检查**未赋值变量之间**的约束，形成“连锁反应”。

AC-3算法会系统性地移除所有弧中不 相容[^1]的值，直到整个系统稳定。

  * **复杂度分析**: 时间复杂度为 $O(cd^2)$，其中 $c$ 是约束（弧）的数量，$d$ 是最大域大小。

```python
def checking(domains: dict[str, list[str]], variable: str, constraints: dict[str, list[str]], value: str,  assignment: dict) -> tuple[bool, dict[str, list[str]]]:
    domains_copy = copy.deepcopy(domains)
    domains_copy[variable] = [value]

    queue = []
    for neighbor in constraints.get(variable, []):
        if neighbor not in assignment:
            queue.append((neighbor, variable))

    while queue:
        xi, xj = queue.pop(0)

        revised = False
        for x_val in list(domains_copy[xi]):
            if not any(x_val != y_val for y_val in domains_copy[xj]):
                domains_copy[xi].remove(x_val)
                revised = True

        if revised:
            if not domains_copy[xi]:
                return False, domains

            for xk in constraints.get(xi, []):
                if xk not in assignment and xk != xj:
                    queue.append((xk, xi))

    return True, domains_copy
   ```

#### 变量选择：MRV

<div class="callout note">
<p>最小剩余价值 (Minimum Remaining Values, MRV)也称为“最受约束变量”或“fail-first”启发式，核心思想是<strong>选择域中剩余合法值最少的未赋值变量</strong>。</p>
    
MRV 尽早地发现注定失败的路径，从而减少搜索的分支。
</div>

```python
def mrv(variables, domains, assignment):
    unassigned_vars = [v for v in variables if v not in assignment]
    return min(unassigned_vars, key=lambda var: len(domains[var]))
```
#### 值选择：LCV

<div class="callout note">
<p>最少约束值 (Least Constraining Value, LCV)也称为“succeed-first”启发式。对于一个已选定的变量，LCV 会<strong>选择域中对邻居变量的域造成的“破坏”最小（即排除掉的邻居域值最少）</strong>的值。</p>
    
LCV可以最大化后续选择的灵活性，增加找到解的可能性。
</div>

```python
def lcv(var, domains, constraints):
    """
    @return: list - 按 LCV 规则排好序的值列表
    """
    if var not in domains:
        return []

    def count_conflicts(value):
        """计算一个值对邻居域造成的冲突数"""
        conflict_count = 0
        for neighbor in constraints.get(var, []):
            if value in domains[neighbor]:
                conflict_count += 1
        return conflict_count

    # 使用 sorted 函数，key 是我们定义的冲突计数函数
    return sorted(domains[var], key=count_conflicts)
```

#### 整体实现

```python
def backtracking(variables, domains, constraints, assignment={}):
    '''
    @param domains: dict[str, list[str]] 变量域(地区名: 颜色列表)
    @param variables: list[str] 变量列表
    @param constraints: dict[str, list[str]] 约束
    @assignment: dict[str, str]
    '''

    if len(assignment) == len(variables):
        return assignment  # 所有变量都已赋值，找到解

    # 选择一个未赋值的变量
    var = mrv(variables, domains, assignment)

    for value in lcv(var, domains, constraints):
        assignment[var] = value
        check, new_domains = checking(domains, var, constraints, value) # 此处采用方案二
        if check:
            result = backtracking(variables, new_domains, constraints, assignment)
            if result:
                return result
        # 回溯
        del assignment[var]

    return None
```

-----

## 树形结构CSP

如果一个CSP的约束图是**树形结构**（没有环），那么它可以在多项式时间内被高效解决。

**算法流程:**

1.  **拓扑排序**: 对树进行拓扑排序，得到一个有序的变量序列 `{X_1, X_2, ..., X_n}`。
2.  **反向弧相容**: 从后往前（从 `X_n` 到 `X_1`），对每一个弧 `Parent(X_i) -> X_i` 强制实现弧相容。也就是说，检查父节点的域，如果某个值找不到能与子节点兼容的值，就从父节点的域中移除它。
3.  **正向赋值**: 从前往后（从 `X_1` 到 `X_n`），依次为每个变量赋值。因为经过了上一步，可以保证当你为任何变量选择一个值时，它一定不会与你之前的选择冲突。

  * **复杂度分析**: 时间复杂度为 $O(nd^2)$，这是线性的（相对于变量数量$n$），非常高效。

### 通过割集转化 

对于非树形的、有环的图，可以利用**割集转化**(Cutset Conditioning)方法。

1.  在约束图中找到一个**割集 (cutset)**，这是一组节点，移除它们后，剩下的图就变成了树。
2.  对割集中的变量进行所有可能的赋值组合。
3.  对于每一种赋值，割集变量的值就变成了固定常量。这会简化剩余变量的约束，并将剩余问题变成一个树形结构的CSP。
4.  高效地解决这个树形CSP。如果找到解，就与割集的赋值组合，形成一个完整解。

<div class="callout note">
割集转化的效率 高度依赖于找到一个尽可能小的割集。寻找最小割集本身是一个NP-hard问题，但对于“几乎是树”的图，这种方法非常有效。
</div>

[^1]: 一个弧 `X -> Y` 是相容的，当且仅当对于 `X` 域中的每个值，在 `Y` 的域中都存在一个值与之兼容。
