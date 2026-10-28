---
layout: article_unencrypt
title: Python 变量与赋值
tags:
  - 学术
  - 学习笔记
  - Python
date: 2026-10-28
featured_image: /assets/images/default.webp
excerpt: 理解 Python 的名字绑定、赋值、函数传参与浅深拷贝。
---

## Python 变量与赋值

**对象拥有身份、类型和值；变量名与对象建立绑定关系。** 一个对象可以同时被多个名字引用。

`a = [1, 2]` 创建列表并将名字 `a` 绑定到它；`b = a` 则让 `b` 绑定到同一个列表，并没有复制列表。

<div class="code-tabs" markdown="1">

```python
a = [1, 2]
b = a
assert a is b

b.append(3)             # 修改共享的列表
assert a == [1, 2, 3]

b = [9]                 # 重新绑定 b，不修改原列表
assert a == [1, 2, 3]
assert b == [9]
assert a is not b
```

```cpp
#include <cassert>
#include <vector>

int main() {
    std::vector<int> a{1, 2};
    auto* b = &a;

    b->push_back(3);     // 通过指针修改 a
    assert((a == std::vector<int>{1, 2, 3}));

    std::vector<int> other{9};
    b = &other;          // 改变指针指向，不修改 a
    assert((a == std::vector<int>{1, 2, 3}));
    assert(((*b) == std::vector<int>{9}));
}
```

</div>

要区分两类操作：

- **修改对象（mutation）**：`b.append(3)`、`b[0] = 9`。
- **重新绑定名字（rebinding）**：`b = [9]`，让 `b` 与另一个对象关联。

### `==` 与 `is`

`==` 比较类型定义的相等关系（如对列表来说，是按对应元素比较）。`is` 判断是否为同一个对象。

```python
a = [1, 2]
b = [1, 2]
c = a

assert a == b
assert a is not b
assert a is c

value = None
assert value is None     # 判断 None 通常使用 is
```

### 赋值、浅拷贝与深拷贝

```python
import copy

original = [[1], [2]]
alias = original
shallow = original.copy()
deep = copy.deepcopy(original)

assert alias is original
assert shallow is not original
assert shallow[0] is original[0]
assert deep[0] is not original[0]

original[0].append(9)
assert alias == [[1, 9], [2]]
assert shallow == [[1, 9], [2]]
assert deep == [[1], [2]]
```

- **赋值**：没有创建新的列表。
- **浅拷贝**：创建新的外层列表，里面仍引用原来的子对象；列表的 `copy()`、切片 `[:]` 都属于这种情形。
- **深拷贝**：对这个嵌套列表示例，递归复制其中的可变对象，使修改内层列表互不影响。

## Python 对象共享



调用函数时，形参名与传入的对象建立绑定。函数可以通过形参修改共享的可变对象；**给形参重新赋值，不会重新绑定调用者的变量名**。这一模型常称为“**对象共享**”或“**传对象引用**”。

<div class="code-tabs" markdown="1">

```python
def update(items):
    items.append(3)       # 修改调用者也能看到的列表
    items = [99]          # 只重新绑定局部形参
    assert items == [99]

values = [1, 2]
update(values)
assert values == [1, 2, 3]
```

```cpp
#include <cassert>
#include <vector>

void update(std::vector<int>* items) {
    items->push_back(3);  // 修改共享对象
    std::vector<int> local{99};
    items = &local;       // 指针按值传入，只修改局部指针
    assert(((*items) == std::vector<int>{99}));
}                        // local 在此销毁，指针未被返回或继续使用

int main() {
    std::vector<int> values{1, 2};
    update(&values);
    assert((values == std::vector<int>{1, 2, 3}));
}
```

</div>





<div class="callout warning">

由于默认参数表达式在执行函数定义时求值，不会在每次调用时重新求值。因此<strong>不要用可变对象作为共享的默认参数</strong>

</div>

```python
def collect_bad(value, result=[]):
    result.append(value)
    return result

assert collect_bad(1) == [1]
assert collect_bad(2) == [1, 2]  # 同一个默认列表被重复使用

def collect(value, result=None):
    if result is None:
        result = []
    result.append(value)
    return result

assert collect(1) == [1]
assert collect(2) == [2]
```