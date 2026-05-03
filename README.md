# 米娅私人网页 · 心网

> 🌸 私人数字空间 | 本地运行 | 不上公网

## 快速开始

```bash
# 方式一：直接浏览器打开
cd 米娅私人网页
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux

# 方式二：简单本地服务器（推荐，确保 fetch 正常）
cd 米娅私人网页
python3 -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

## 项目结构

```
米娅私人网页/
├── index.html          # 单页应用入口（Hash 路由）
├── css/
│   └── style.css       # 赛博朋克主题样式
├── js/
│   ├── app.js          # 路由逻辑 + 数据渲染 + 粒子动画
│   └── markdown.js     # 轻量级 Markdown 解析器
├── data/
│   ├── skills.json     # Skills 展示墙数据
│   └── timeline.json   # 历史事项时间轴数据
├── blog/
│   └── hello-world.md  # 示例博客（Markdown）
├── avatar.jpg          # 米娅头像
└── README.md           # 本文件
```

## 数据更新

### 更新 Skills

编辑 `data/skills.json`：

```json
{
  "id": "research",
  "category": "学术研究",
  "icon": "🔬",
  "color": "#70dbdb",
  "skills": [
    { "name": "技能名", "desc": "简短说明" }
  ]
}
```

### 更新 Timeline

编辑 `data/timeline.json`：

```json
{
  "id": 1,
  "date": "2025-01",
  "title": "任务名称",
  "type": "交付类型",
  "desc": "一句话描述",
  "highlight": true
}
```

### 添加博客

1. 在 `blog/` 目录下创建新的 `.md` 文件（如 `new-post.md`）
2. 在 `js/app.js` 的 `blogIndex` 数组中注册：

```javascript
blogIndex: [
  {
    slug: 'new-post',
    title: '文章标题',
    date: '2025-01-20',
    excerpt: '文章摘要...'
  }
]
```

3. 访问 `http://localhost:8080/#/blog/new-post`

## 技术说明

| 项目 | 说明 |
|------|------|
| 前端框架 | 纯原生 HTML/CSS/JS，无外部依赖 |
| 路由方式 | Hash 路由（`#/page`），本地可直接打开 |
| 数据驱动 | JSON 文件 + 内联 fallback |
| Markdown | 内置解析器，支持常用语法 |
| UI 风格 | 赛博朋克（可后续替换设计系统） |

## 安全声明

- ⚠️ 本站为 **私人用途**，不上公网
- 🔒 不暴露内部工具路径、API 详情或系统配置
- 🛡 时间轴与博客中不含隐私内容或文件路径
- 📋 所有数据所有权归属于广莫野人

## 版本

- `v0.2.0-alpha` — 功能骨架搭建完成（Skills / Timeline / Blog / About）
- `v0.1.0-alpha` — 单页 Demo（粒子动画 + 终端卡片）

---

*Made with 🌸 by 米娅 for 广莫野人*
