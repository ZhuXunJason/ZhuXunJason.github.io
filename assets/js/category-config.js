/* 分类层级配置：文章聚合页（archive.html）的唯一数据源。
 * 后续增删改分类只需编辑本文件，无需改动页面与逻辑代码。
 *
 * 节点字段：
 *   id       {string}   必填，ASCII slug（勿用中文），用于 hash 深链（#/academic/notes/dl）
 *   label    {string}   必填，界面显示名（可与文章标签值不同，如"传统机器学习"）
 *   match    {string[]} 必填，命中条件：文章 tags 须【全部包含】这些值（大小写不敏感）
 *   exclude  {string[]} 可选，排除条件：文章 tags 含任一值即不命中【仅作用于本节点】
 *   children {Array}    可选，子节点
 *
 * 匹配语义：
 *   - 叶子节点命中 = match 全含 且 exclude 全不含；
 *   - 父级节点命中 = 自身 match 命中 ∪ 任一子节点命中（按文章 URL 去重计数）。
 *     父级的 match 兼作"兜底"：新增子方向标签的文章在尚无对应子分类时仍能被父级兜住。
 */
window.BLOG_CATEGORY_TREE = [
    {
        id: 'academic',
        label: '学术',
        match: ['学术'],
        children: [
            {
                id: 'notes',
                label: '学习笔记',
                match: ['学术', '学习笔记'],
                children: [
                    { id: 'search', label: '搜索',         match: ['搜索'] },
                    { id: 'ml',     label: '传统机器学习', match: ['机器学习(ML)'] },
                    { id: 'dl',     label: '深度学习',     match: ['深度学习(DL)'] },
                    { id: 'rl',     label: '强化学习',     match: ['强化学习(RL)'] }
                ]
            },
            { id: 'papers', label: '论文', match: ['论文'] }
        ]
    },
    {
        id: 'life',
        label: '生活',
        match: ['生活'],
        children: [
            { id: 'original', label: '原创', match: ['生活'], exclude: ['转载'] },
            { id: 'repost',   label: '转载', match: ['生活', '转载'] }
        ]
    }
];
