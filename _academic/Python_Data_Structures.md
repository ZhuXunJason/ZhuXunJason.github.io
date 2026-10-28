---
layout: article_unencrypt
title: Python 数据结构
tags:
  - 学术
  - 学术笔记
  - Python
date: 2026-10-28
featured_image: /assets/images/default.webp
excerpt: 介绍Python常用数据结构。
---

## Python数据结构性质

- **可变性**：对象能否原地修改；给变量重新赋值不等于修改原对象。

- **可哈希性**：对象能否作为普通字典的键或集合的元素。

<div class="table-scroll" role="region" aria-label="数据结构性质速查" tabindex="0" markdown="1">

| 类型 | 可变性 | 可哈希性 |
| --- | --- | --- |
| `list` | 可变 | 不可哈希 |
| `tuple` | 不可变 | 所有元素均可哈希时才可哈希 |
| `str` | 不可变 | 可哈希 |
| `dict` | 可变 | 不可哈希 |
| `set` | 可变 | 不可哈希 |

</div>

元组不可变，不代表内部引用的列表也不可变；字典的键必须可哈希，但值没有这一要求。

## 通用函数与操作

<div class="table-scroll" role="region" aria-label="通用函数与操作" tabindex="0" markdown="1">

| 写法 | 用途 | 注意 |
| --- | --- | --- |
| `len(data)` | 元素个数 | 字符串返回字符数 |
| `x in data` | 成员检测 | 对字典检测的是键，不是值 |
| `data[i]`、`data[-1]` | 按位置取值 | 用于列表、元组、字符串；字典使用键 |
| `data[start:stop:step]` | 切片 | 适用于列表、元组、字符串； |
| `enumerate(data)` | 同时遍历下标和值 | 可用 `start=1` 从 1 开始编号 |
| `zip(a, b)` | 配对遍历 | 默认在最短的输入耗尽时结束 |
| `sorted(data, key=..., reverse=...)` | 返回排序后的新**列表** | 不修改原容器；字典直接传入时排序的是键 |
| `min(data)`、`max(data)`、`sum(data)` | 最小值、最大值、求和 |  |

</div>



## list：列表

<div class="table-scroll" role="region" aria-label="列表常用方法" tabindex="0" markdown="1">

| 方法 | 作用 |
| --- | --- |
| `a.append(x)` | 尾部添加一个元素 |
| `a.extend(iterable)` | 将可迭代对象的元素逐个追加 |
| `a.insert(i, x)` | 在位置 `i` 前插入元素 |
| `a.pop(i)`、`a.pop()` | 删除指定位置或最后一个元素 |
| `a.remove(x)` | 删除第一个等于 `x` 的元素 |
| `a.index(x)` | 查找第一次出现的位置 |
| `a.count(x)` | 统计出现次数 |
| `a.sort(key=..., reverse=...)` | 原地排序 |
| `a.reverse()` | 原地反转当前顺序 |
| `a.copy()` | 创建浅拷贝 |
| `a.clear()` | 清空列表 |

</div>

```python
items = [3, 1, 2]
items.append(4)
items.extend([5, 6])
items.insert(0, 0)
assert items == [0, 3, 1, 2, 4, 5, 6]

assert items.pop() == 6
items.remove(3)
assert items.index(4) == 3
assert items.count(1) == 1

items.sort()
assert items == [0, 1, 2, 4, 5]
items.reverse()
assert items == [5, 4, 2, 1, 0]
```

### append 与 extend

```python
a = [1]
a.append([2, 3])
assert a == [1, [2, 3]]    # 把整个列表当作一个元素

b = [1]
b.extend([2, 3])
assert b == [1, 2, 3]      # 逐个追加元素
```

### sort 与 sorted

```python
words = ["pear", "fig", "apple"]
ordered = sorted(words, key=len)
assert ordered == ["fig", "pear", "apple"]
assert words == ["pear", "fig", "apple"]

result = words.sort(key=len, reverse=True)
assert result is None
assert words == ["apple", "pear", "fig"]
```

## tuple：元组

适合表达位置固定的一组数据，例如坐标或函数返回的多个值。不能增删元素或给槽位重新赋值，因此没有 `append()`、`remove()`、`sort()` 等原地修改方法。

```python
point = (3, 4)
x, y = point
assert (x, y) == (3, 4)

values = (1, 2, 2)
assert values.count(2) == 2
assert values.index(2) == 1
assert values[:2] == (1, 2)
assert sorted(values, reverse=True) == [2, 2, 1]  # 结果是列表

```

## str：字符串

`str` 不能原地修改字符。常用的替换、裁剪和大小写转换方法会返回新的字符串，使用时要接收返回值。

<div class="table-scroll" role="region" aria-label="字符串常用方法" tabindex="0" markdown="1">

| 方法 | 作用 | 返回值或注意事项 |
| --- | --- | --- |
| `s.find(sub)` | 查找子串第一次出现的位置 | 找不到返回 `-1` |
| `s.index(sub)` | 查找子串第一次出现的位置 | 找不到抛出 `ValueError` |
| `s.count(sub)` | 统计子串出现次数 | 按不重叠的匹配计数 |
| `s.replace(old, new, count)` | 替换子串 | 返回字符串；省略 `count` 时替换全部 |
| `s.split(sep)` | 按分隔符拆分 | 返回列表；省略 `sep` 时按连续空白拆分 |
| `sep.join(parts)` | 用分隔符连接字符串 | 返回字符串；`parts` 中每个元素都必须是字符串 |
| `s.strip()`、`s.lstrip()`、`s.rstrip()` | 去除两端、左端或右端空白 | 不删除字符串中间的空白 |
| `s.startswith(prefix)`、`s.endswith(suffix)` | 检测前缀或后缀 | 返回布尔值 |
| `s.lower()`、`s.upper()` | 大小写转换 | 返回字符串 |
| `s.isalpha()`、`s.isdigit()` | 检测是否全为字母或数字字符 | 返回布尔值；空字符串返回 `False` |

</div>

```python
raw = "  Python notes  "
clean = raw.strip()
assert clean == "Python notes"
assert raw == "  Python notes  "
assert clean.lower() == "python notes"
assert clean.replace("notes", "data") == "Python data"
assert clean.find("Java") == -1
assert clean.startswith("Python")

parts = "a,b,c".split(",")
assert parts == ["a", "b", "c"]
assert " / ".join(parts) == "a / b / c"
assert "  a   b  ".split() == ["a", "b"]
```

## dict：字典

适合“按键找值”。键不能重复，更新同一个键会覆盖值；遍历保留键的插入顺序，但不会自动按键排序。

<div class="table-scroll" role="region" aria-label="字典常用方法" tabindex="0" markdown="1">

| 方法或操作 | 作用 | 返回值或注意事项 |
| --- | --- | --- |
| `d[key]`、`d[key] = value` | 读取或设置值 | 读取不存在的键会抛出 `KeyError` |
| `d.get(key, default)` | 安全读取 | 键不存在时返回 `default`，省略时为 `None`；不插入键 |
| `d.keys()` | 获取键视图 | 可用 `list(d.keys())` 转成列表 |
| `d.values()` | 获取值视图 | 可迭代，允许重复值 |
| `d.items()` | 获取键值对视图 | 常配合 `for key, value in d.items()` |
| `d.update(other)` | 批量增加或覆盖键值对 | 返回 `None` |
| `d.pop(key, default)` | 删除指定键 | 返回对应值；键不存在且未提供默认值时抛出 `KeyError` |
| `d.copy()`、`d.clear()` | 浅拷贝、清空 | 分别返回新字典、`None` |

</div>

```python
scores = {"Alice": 90}
assert scores.get("Bob", 0) == 0
assert "Bob" not in scores

scores.update({"Alice": 95, "Bob": 85})
assert list(scores.keys()) == ["Alice", "Bob"]
assert list(scores.values()) == [95, 85]
assert list(scores.items()) == [("Alice", 95), ("Bob", 85)]
assert scores.pop("Bob") == 85

teams = {}
teams.setdefault("A", []).append("Alice")
teams.setdefault("A", []).append("Bob")
assert teams == {"A": ["Alice", "Bob"]}
```



## set：集合

<div class="table-scroll" role="region" aria-label="集合常用方法" tabindex="0" markdown="1">

| 方法 | 作用 | 返回值或注意事项 |
| --- | --- | --- |
| `s.add(x)` | 加入一个元素 | 已存在时不重复加入；返回 `None` |
| `s.update(iterable)` | 逐个加入元素 | 返回 `None` |
| `s.remove(x)` | 删除指定元素 | 不存在时抛出 `KeyError`；返回 `None` |
| `s.discard(x)` | 删除指定元素 | 不存在时也不报错；返回 `None` |
| `s.pop()` | 删除并返回任意一个元素 | 不保证顺序；空集合时抛出 `KeyError` |
| `s.clear()`、`s.copy()` | 清空、浅拷贝 | 分别返回 `None`、新集合 |
| `a.union(b)` | 并集 | 返回新集合 |
| `a.intersection(b)` | 交集 | 返回新集合 |
| `a.difference(b)` | 差集 | 返回在 `a` 中但不在 `b` 中的元素集合 |
| `a.issubset(b)`、`a.issuperset(b)` | 子集、超集判断 | 返回布尔值 |
| `a.isdisjoint(b)` | 是否没有公共元素 | 返回布尔值 |

</div>

```python
seen = set([1, 2, 2])
seen.add(3)
seen.update([3, 4])
seen.discard(99)         # 不存在也不会报错
assert seen == {1, 2, 3, 4}

a, b = {1, 2}, {2, 3}
assert a.union(b) == {1, 2, 3}
assert a.intersection(b) == {2}
assert a.difference(b) == {1}
assert a.symmetric_difference(b) == {1, 3}
assert {1}.issubset(a)
assert a.isdisjoint({9})
```



