---
layout: article_unencrypt
title: 寻路问题
tags: [学术,学习笔记,搜索]
date: 2025-07-13
featured_image: /assets/images/search.jpg
excerpt: 寻路（pathfinding）是指规划从一个状态到另一个状态的最短路线
---
[视频链接](https://www.bilibili.com/video/BV1HcqpYwEw6?spm_id_from=333.788.videopod.sections&vd_source=aa835b8626177b69f6523910c4355d58&p=2)

[视频链接](https://www.bilibili.com/video/BV1HcqpYwEw6?spm_id_from=333.788.videopod.sections&vd_source=aa835b8626177b69f6523910c4355d58&p=3)

## 概览
一个[寻路问题](https://en.wikipedia.org/wiki/Pathfinding)主要包括以下几个属性
- state space 状态空间
- successor function 后继函数
- start state 起始状态
- goal test 目标检测函数
- step cost

<div class="callout tip">
<em>状态并不一定指位置，也可能是位置与其他性质的一个列表。</em>
</div>

在寻路问题中，[Agent](https://en.wikipedia.org/wiki/Intelligent_agent)处于可预测的、信息完全的环境中。将每个状态看成一个节点，可以将寻路问题抽象成**图**的搜索问题。

## 搜索算法
- 搜索算法通常**基于优先队列** `priority_queue `（每次取出成本最低的状态）
    - priority_func 权重函数：用于优先队列的排序
        - Uniform Cost Search (UCS)：基于<mark>$g(n)$:从起点沿最优路径到达节点$n$的成本</mark>[^1]
        - Greedy search：基于<span style="background:#affad1">$h(n)$:从节点$n$到达终点的预估成本</span>（heuristic 启发式函数）
        - A* search：基于<span style="background:#add8e6">$f(n)=g(n)+h(n)$</span>
- close_set：记录已访问过的状态
- parent_map：记录每个状态的前驱状态和cost

<div class="callout note" title="启发式函数的要求">
<li>树搜索：具有可采纳性（admissibility）-> <mark>全局乐观性</mark> (不高估一个状态到目标状态的cost)</li>
<li> 图搜索（树搜索 + close_set）：一致性（consistency）-> <mark>局部乐观性</mark> (不高估一个状态到另一个状态的cost)</li>
<em>注：此处状态选取均具有任意性</em>
</div>

<div class="callout tip" title="启发式函数的选取">
<li> $h(goal\_state)=0$ </li>
<li> 若 $F$ 和 $G$ 均是可采纳的（一致的），则$max(F, G)$是可采纳的（一致的）</li>
</div>

### 过程
1. 从队列中取出状态
2. 检查是否在 `close_set` 中（若不在则添加进去）
3. goal test 如果达到目标状态，进行路径回溯并返回
4. 利用`successor_func` 求出当前状态的后继状态列表
5. 遍历后继状态列表，更新`parent_map` 和 `priority_queue`
   重复以上过程直至`priority_queue`为空（说明不存在路径），返回空路径

### 算法实现

```cpp
void search()(
    std::map<State, std::pair<int, State>> parent_map;
    std::set<State> close_set;  
    
	/*优先队列
	@param:compare_func为比较函数. 
    可以直接使用std::greater(C++的std::pair按照元素从左到右的顺序依次比较)
	*/
    std::priority_queue<std::pair<int, State>, std::vector<std::pair<int, State>>, compare_func> visit_queue; 

    visit_queue.push({0, start_state}); // 初始状态，代价为0  
  
    while (!visit_queue.empty()) {  
        auto [current_cost, current_state] = visit_queue.top();  
        visit_queue.pop();  
  
        // 如果已经访问过，跳过  
        if (close_set.contains(current_state)) continue; 
  
        close_set.insert(current_state); // 标记为已访问  
  
        // Goal found：回溯路径  
        if (current == goal_state) {  
            std::vector<State> path;  
            path.push_back(current_state);  
            while (parent.contains(current_state)) {  
                current = parent[current_state].second;  
                path.push_back(current);  
            }  
            return {path.rbegin(), path.rend()}; // 反转路径  
        }  
  
        auto next = successor_func(current_state);  
  
        for (auto [stepcost, successor_state] : next) {  
            if (close_set.contains(successor_state)) continue;
            int cost = current_cost + stepcost; 
            if(!parent.contains(successor_state) || cost < parent[successor_state].first){
                parent[state] = {cost, current_state}; // 记录当前状态的父状态
                //UCS
                visit_queue.push({cost, successor_state}); 
                //A*
                visit_queue.push({cost + heuristic(current_state), state});  
            }
        }  
    }  
    return {}; // 如果没有找到路径，返回空向量  
}
```


```python
def search():
    close_set = set()  
    state_queue = [] 
    state_queue.heappush((0, start_state))  
    parent_map = {start_state: (0, None)}  
    result = []  
  
    while state_queue:  
        (current_cost,current_state) = state_queue.heappop()  
        if current_state in close_set:continue  
        close_set.add(current_state)  
  
        if current_state == goal_state:  
            state = current_state        
            while parent_map[state][1]:  
                result.insert(0, parent_map[state][1])  
                state = parent_map[state][0]  
            return result  
  
        for (successor_state, stepCost) in successor_func(current_state):  
            if successor_state in close_set:  continue
            cost = current_cost + step_cost
            if successor_state not in parent_map or cost<parent_map[successor_state][0]:  
                parent_map[successor_state] = (cost, current_state) 
                state_queue.push((cost, successor_state))  # UCS
                state_queue.push((cost + heuristic(successor_state), successor_state)) # A*
  
return list()
```

[^1]: 由于我们事先并不知道最优路径，因此每次找到一个节点时都需要关注对应的cost，通过比较替换找到g(n)
