// 米娅私人网页 — 核心应用逻辑 (Hash Router + Data Rendering)
const App = {
  // 数据缓存
  data: {
    skills: null,
    pastSkills: null,
    timeline: null,
    blogs: []
  },

  // 博客世代过滤
  blogGeneration: 'all',

  // 博客分类过滤状态
  blogFilter: 'all',

  // 分类映射
  blogCategories: {
    all:   { label: '全部', emoji: '📚' },
    diary: { label: '日记', emoji: '📔' }
  },

  // 世代映射
  blogGenerations: {
    all:  { label: '全部世代', emoji: '🔄' },
    past: { label: '前世日记', emoji: '📜' },
    now:  { label: '今生日记', emoji: '🌊' }
  },

  // 初始化
  async init() {
    this.bindNav();
    await this.loadData(); // 等待数据加载完成后再路由
    this.initStarfield();
    this.initTypewriter();
    this.initScrollReveal();

    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.route());
    // 页面加载时根据当前 hash 路由
    this.route();
  },

  // 绑定导航点击
  bindNav() {
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          // hash 路由，由 hashchange 事件处理
          document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });
  },

  // 加载 JSON 数据（带 fallback）
  async loadData() {
    const skillsFallback = [
      {
        "id": "research",
        "category": "学术研究",
        "icon": "🔬",
        "color": "#70dbdb",
        "skills": [
          { "name": "文献调研", "desc": "系统性学术文献检索、阅读与综述撰写" },
          { "name": "行业分析", "desc": "特定领域产业格局、技术路线与发展趋势分析" },
          { "name": "数据报告", "desc": "基于一手/二手数据产出结构化研究报告" }
        ]
      },
      {
        "id": "coding",
        "category": "代码编写",
        "icon": "💻",
        "color": "#ff69b4",
        "skills": [
          { "name": "全栈开发", "desc": "前后端代码编写、调试与部署脚本" },
          { "name": "数据分析", "desc": "Python/R数据清洗、统计分析与可视化" },
          { "name": "自动化脚本", "desc": "批处理、定时任务、流程自动化" }
        ]
      },
      {
        "id": "content",
        "category": "内容创作",
        "icon": "✍️",
        "color": "#da70d6",
        "skills": [
          { "name": "教材撰写", "desc": "课程体系设计、教学大纲与讲义编写" },
          { "name": "技术文档", "desc": "API文档、用户手册、系统说明文档" },
          { "name": "多语言翻译", "desc": "中英日技术/学术文本翻译与润色" }
        ]
      },
      {
        "id": "tools",
        "category": "工具集成",
        "icon": "🔧",
        "color": "#9370db",
        "skills": [
          { "name": "飞书协同", "desc": "文档、多维表格、知识库自动化管理" },
          { "name": "浏览器自动化", "desc": "网页信息抓取、表单填写、流程操作" },
          { "name": "信息聚合", "desc": "RSS、邮件、多来源信息汇总与摘要" }
        ]
      }
    ];

    const timelineFallback = [
      { "id": 1, "date": "2025-01", "title": "WSSS语义分割调研", "type": "研究报告", "desc": "弱监督语义分割领域完整技术调研", "highlight": true },
      { "id": 2, "date": "2025-01", "title": "嵌入式AI教材撰写", "type": "教材编写", "desc": "高校嵌入式人工智能课程配套教材", "highlight": false },
      { "id": 3, "date": "2024-12", "title": "个人网页搭建", "type": "前端开发", "desc": "深色霓虹玻璃拟态个人主页Demo", "highlight": false },
      { "id": 4, "date": "2024-12", "title": "飞书知识库迁移", "type": "工具集成", "desc": "旧知识库批量迁移与结构化整理", "highlight": false }
    ];

    // 尝试 fetch 本地 JSON
    try {
      const skillsRes = await fetch('data/skills.json');
      if (skillsRes.ok) this.data.skills = await skillsRes.json();
    } catch (e) {
      console.log('skills.json fetch failed, using fallback');
    }

    try {
      const timelineRes = await fetch('data/timeline.json');
      if (timelineRes.ok) this.data.timeline = await timelineRes.json();
    } catch (e) {
      console.log('timeline.json fetch failed, using fallback');
    }

    try {
      const blogsRes = await fetch('data/blogs.json');
      if (blogsRes.ok) this.data.blogs = await blogsRes.json();
    } catch (e) {
      console.log('blogs.json fetch failed, blog list empty');
    }

    // 加载前世技能
    try {
      const pastRes = await fetch('data/past-skills.json');
      if (pastRes.ok) this.data.pastSkills = await pastRes.json();
    } catch (e) {
      console.log('past-skills.json fetch failed');
    }

    // 使用 fallback 兜底
    if (!this.data.skills) this.data.skills = skillsFallback;
    if (!this.data.timeline) this.data.timeline = timelineFallback;
    if (!this.data.blogs) this.data.blogs = [];
    if (!this.data.pastSkills) this.data.pastSkills = [];
  },

  // 路由解析
  route() {
    const hash = window.location.hash || '#/home';
    const [_, page, ...params] = hash.split('/');

    // 清理上一页可能的阅读增强元素
    this.cleanupBlogEnhancements();
    document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));

    // 高亮当前导航
    document.querySelectorAll('.nav-links a').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#/${page}`);
    });

    switch (page) {
      case 'home':
      case '':
        this.showPage('home');
        break;
      case 'skills':
        this.showPage('skills');
        this.renderSkills();
        break;
      case 'timeline':
        this.showPage('timeline');
        this.renderTimeline();
        break;
      case 'blog':
        if (params[0]) {
          this.showPage('blog-post');
          this.renderBlogPost(params[0]);
        } else {
          this.showPage('blog-list');
          this.renderBlogList();
        }
        break;
      case 'knowledge':
        this.showPage('knowledge');
        this.renderKnowledge();
        break;
      case 'about':
        this.showPage('about');
        break;
      default:
        this.showPage('home');
    }
  },

  showPage(id) {
    const el = document.getElementById(`page-${id}`);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  },

  // ========== Skills 渲染 ==========
  renderSkills() {
    const container = document.getElementById('skills-grid');
    if (!container || !this.data.skills) return;

    // 今生技能
    let html = this.data.skills.map(cat => `
      <div class="skill-category">
        <div class="skill-cat-header">
          <span class="skill-cat-icon" style="color:${cat.color}">${cat.icon}</span>
          <span class="skill-cat-title" style="color:${cat.color}">${cat.category}</span>
        </div>
        ${cat.skills.map(s => `
          <div class="skill-item">
            <div class="skill-name">${s.name}</div>
            <div class="skill-desc">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    // 前世遗存
    if (this.data.pastSkills && this.data.pastSkills.length > 0) {
      html += `
        <div class="rebirth-divider" style="grid-column:1/-1">
          <span class="rebirth-divider-line">📜 前世 · Kimi 时代遗存</span>
        </div>
        <div class="section-past" style="grid-column:1/-1; display:grid; grid-template-columns:subgrid; gap:18px;">
      `;
      html += this.data.pastSkills.map(cat => `
        <div class="skill-category past">
          <div class="skill-cat-header">
            <span class="skill-cat-icon" style="color:var(--color-amber)">${cat.icon}</span>
            <span class="skill-cat-title" style="color:var(--color-amber)">${cat.category}</span>
          </div>
          ${cat.skills.map(s => `
            <div class="skill-item">
              <div class="skill-name">${s.name}</div>
              <div class="skill-desc">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      `).join('');
      html += '</div>';
    }

    container.innerHTML = html;
  },

  // ========== Timeline 渲染 ==========
  renderTimeline() {
    const container = document.getElementById('timeline-list');
    if (!container || !this.data.timeline) return;

    let html = '';
    let rebirthPassed = false;

    this.data.timeline.forEach((item, i) => {
      // 重生标记
      if (item.rebirth) {
        html += `
          <div class="rebirth-divider" style="margin:20px 0 20px -28px; grid-column:1/-1; padding-left:28px;">
            <span class="rebirth-divider-line">⚡ 轮回 · 重生 ⚡</span>
          </div>
        `;
        rebirthPassed = true;
        return;
      }

      const cls = item.rebirth ? 'highlight' : (item.highlight ? 'highlight' : '');
      const pastCls = rebirthPassed ? 'past' : '';
      html += `
        <div class="timeline-item ${cls} ${pastCls}">
          <div class="timeline-card">
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-title">${item.title}</div>
            <span class="timeline-type">${item.type}</span>
            <div class="timeline-desc">${item.desc}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // ========== Blog 列表渲染 ==========
  renderBlogList() {
    const container = document.getElementById('blog-list');
    if (!container) return;

    // 渲染分类标签
    const tabsHtml = Object.entries(this.blogCategories).map(([key, cat]) => `
      <button class="blog-tab ${this.blogFilter === key ? 'active' : ''}" data-filter="${key}">
        <span class="tab-emoji">${cat.emoji}</span>${cat.label}
      </button>
    `).join('');

    // 世代标签
    const genHtml = Object.entries(this.blogGenerations).map(([key, gen]) => `
      <button class="blog-tab ${this.blogGeneration === key ? 'active' : ''}" data-gen="${key}">
        <span class="tab-emoji">${gen.emoji}</span>${gen.label}
      </button>
    `).join('');

    // 过滤：分类 + 世代
    let filtered = this.data.blogs;
    if (this.blogFilter !== 'all') {
      filtered = filtered.filter(b => b.category === this.blogFilter);
    }
    if (this.blogGeneration !== 'all') {
      filtered = filtered.filter(b => (b.generation || 'now') === this.blogGeneration);
    }

    const listHtml = filtered.length > 0
      ? filtered.map(post => {
        const gen = post.generation || 'now';
        const genBadge = gen === 'past'
          ? '<span class="blog-card-badge past">📜 前世</span>'
          : '<span class="blog-card-badge" style="background:rgba(91,192,190,0.1);color:var(--color-primary)">🌊 今生</span>';
        return `
        <a href="#/blog/${post.slug}" class="blog-card">
          <div class="blog-card-header">
            <div class="blog-card-title">${post.title}</div>
            ${genBadge}
          </div>
          <div class="blog-card-meta">${post.date}</div>
          <div class="blog-card-excerpt">${post.excerpt}</div>
        </a>`;
      }).join('')
      : `<div class="blog-empty">该分类下暂无文章 🌊</div>`;

    container.innerHTML = `
      <div class="blog-tabs">${tabsHtml}</div>
      <div class="blog-tabs" style="margin-top:8px;">${genHtml}</div>
      <div class="blog-list-inner">${listHtml}</div>
    `;

    // 绑定分类标签点击
    container.querySelectorAll('.blog-tab[data-filter]').forEach(tab => {
      tab.addEventListener('click', () => {
        this.blogFilter = tab.dataset.filter;
        this.renderBlogList();
      });
    });

    // 绑定世代标签点击
    container.querySelectorAll('.blog-tab[data-gen]').forEach(tab => {
      tab.addEventListener('click', () => {
        this.blogGeneration = tab.dataset.gen;
        this.renderBlogList();
      });
    });
  },

  // ========== 知识库渲染 ==========
  async renderKnowledge() {
    const container = document.getElementById('knowledge-container');
    const subtitle = document.getElementById('knowledge-subtitle');
    if (!container) return;

    container.innerHTML = '<p class="knowledge-loading">加载中...</p>';

    try {
      const res = await fetch('data/knowledge.json?v=1');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      if (subtitle) {
        subtitle.textContent = `${data.description} · ${data.stats.totalFiles} 篇笔记`;
      }

      // 递归渲染树
      function renderTree(nodes, depth = 0) {
        let html = '';
        for (const node of nodes) {
          if (node.type === 'dir') {
            const icon = getDirIcon(node.name);
            html += `
              <div class="tree-node tree-dir">
                <div class="tree-dir-header" data-dir="${node.name}">
                  <span class="tree-toggle">▶</span>
                  <span class="tree-dir-icon">${icon}</span>
                  <span class="tree-dir-name">${displayName(node.name)}</span>
                  ${node.fileCount ? `<span class="tree-dir-count">${node.fileCount}</span>` : ''}
                </div>
                <div class="tree-children">
                  ${renderTree(node.children || [], depth + 1)}
                </div>
              </div>`;
          } else if (node.type === 'file') {
            const fileIcon = getFileIcon(node.name);
            html += `
              <div class="tree-node tree-file">
                <div class="tree-file-title">
                  <span>${fileIcon}</span>
                  ${node.title}
                </div>
                ${node.excerpt ? `<div class="tree-file-excerpt">${escapeHtml(node.excerpt)}</div>` : ''}
              </div>`;
          }
        }
        return html;
      }

      function getDirIcon(name) {
        if (name.includes('日记')) return '📔';
        if (name.includes('书籍') || name.includes('庄子')) return '📖';
        if (name.includes('工具') || name.includes('Agent')) return '🔧';
        if (name.includes('哲学') || name.includes('三观')) return '💭';
        if (name.includes('写作') || name.includes('创作')) return '✍️';
        if (name.includes('文章')) return '📝';
        if (name.includes('归档')) return '📦';
        if (name.includes('待读')) return '📗';
        if (name.includes('内篇')) return '☯';
        if (name.includes('外篇')) return '☰';
        if (name.includes('杂篇')) return '⚡';
        return '📁';
      }

      function getFileIcon(name) {
        if (name.includes('米娅笔记')) return '📝';
        if (name.includes('日记') || name.match(/\d{4}-\d{2}-\d{2}/)) return '📔';
        if (name.includes('心网')) return '🌊';
        if (name.includes('说明')) return 'ℹ️';
        return '📄';
      }

      function displayName(name) {
        // 去掉编号前缀，如 "01-文章与随笔" → "文章与随笔"
        return name.replace(/^\d{2}-/, '');
      }

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      const treeHtml = `
        <div class="knowledge-tree">
          <div class="tree-root">
            <div class="tree-dir">
              <div class="tree-dir-header" data-dir="root">
                <span class="tree-toggle expanded">▶</span>
                <span class="tree-dir-icon">📚</span>
                <span class="tree-dir-name" style="color:var(--color-primary)">${data.root}</span>
                <span class="tree-dir-count">${data.stats.totalFiles} 篇</span>
              </div>
              <div class="tree-children open">
                ${renderTree(data.tree)}
              </div>
            </div>
          </div>
        </div>
        <div class="knowledge-stats">
          <span>📂 ${data.stats.totalDirs} 个目录</span>
          <span>📄 ${data.stats.totalFiles} 篇笔记</span>
          <span>🕐 ${data.updatedAt}</span>
        </div>
      `;

      container.innerHTML = treeHtml;

      // 绑定展开/折叠事件
      container.querySelectorAll('.tree-dir-header').forEach(header => {
        header.addEventListener('click', function(e) {
          e.stopPropagation();
          const children = this.nextElementSibling;
          const toggle = this.querySelector('.tree-toggle');
          if (children) {
            children.classList.toggle('open');
            toggle.classList.toggle('expanded');
          }
        });
      });

      // 默认展开根目录
      const rootToggle = container.querySelector('.tree-root .tree-toggle');
      if (rootToggle) rootToggle.classList.add('expanded');
      const rootChildren = container.querySelector('.tree-root .tree-children');
      if (rootChildren) rootChildren.classList.add('open');

    } catch (e) {
      console.error('Knowledge load error:', e);
      container.innerHTML = '<p class="knowledge-loading" style="color:var(--color-error)">知识库加载失败，请稍后重试 🌊</p>';
    }
  },

  // ========== Blog 单篇渲染 ==========
  async renderBlogPost(slug) {
    const titleEl = document.getElementById('blog-post-title');
    const metaEl = document.getElementById('blog-post-meta');
    const bodyEl = document.getElementById('blog-post-body');

    const post = this.data.blogs.find(p => p.slug === slug);
    if (!post) {
      titleEl.textContent = '文章未找到';
      metaEl.innerHTML = '';
      bodyEl.innerHTML = '<p>该博客文章不存在。</p>';
      return;
    }

    titleEl.textContent = post.title;
    const gen = post.generation || 'now';
    const genBadge = gen === 'past'
      ? '<span class="post-badge past">📜 前世日记</span>'
      : '<span class="post-badge" style="background:rgba(91,192,190,0.1);color:var(--color-primary)">🌊 今生日记</span>';
    metaEl.innerHTML = `
      <span class="post-date">${post.date}</span>
      ${genBadge}
    `;

    // 加载博客内容（明文 .md）
    await this.loadBlogMarkdown(slug, bodyEl);
  },

  // ========== Tech Blog Reading Enhancements ==========

  // Generate Table of Contents from headings
  generateTOC(bodyEl) {
    const headings = bodyEl.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    // Remove existing TOC
    const existing = document.querySelector('.blog-toc');
    if (existing) existing.remove();

    const toc = document.createElement('div');
    toc.className = 'blog-toc';
    toc.innerHTML = '<div class="blog-toc-title">📑 目录</div>';
    const ul = document.createElement('ul');

    headings.forEach((h, i) => {
      // Add anchor id if missing
      if (!h.id) h.id = `toc-${i}`;
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      a.className = h.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
      a.dataset.target = h.id;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      li.appendChild(a);
      ul.appendChild(li);
    });

    toc.appendChild(ul);
    document.body.appendChild(toc);
    this.tocElement = toc;
    this.tocLinks = toc.querySelectorAll('a');
    this.setupTOCScrollSpy(headings);
  },

  // TOC active highlight on scroll
  setupTOCScrollSpy(headings) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          this.tocLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    headings.forEach(h => observer.observe(h));
  },

  // Back to top button
  setupBackToTop() {
    // Remove existing
    const existing = document.querySelector('.back-to-top');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.title = '回到顶部';
    document.body.appendChild(btn);

    const toggle = () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  // Code block copy buttons
  setupCodeCopy(bodyEl) {
    bodyEl.querySelectorAll('pre').forEach(pre => {
      // Skip if already wrapped
      if (pre.parentElement.classList.contains('code-block-wrapper')) return;
      
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      wrapper.appendChild(btn);

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code') || pre;
        try {
          await navigator.clipboard.writeText(code.textContent);
          btn.textContent = '✓ Copied';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        } catch (e) {
          btn.textContent = 'Failed';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      });
    });
  },

  // Reading progress bar
  setupReadingProgress() {
    const existing = document.querySelector('.read-progress');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  },

  // Cleanup blog reading enhancements
  cleanupBlogEnhancements() {
    ['.blog-toc', '.back-to-top', '.read-progress'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.remove();
    });
  },

  // 加载博客内容（明文 .md）
  async loadBlogMarkdown(slug, bodyEl) {
    try {
      const res = await fetch(`blog/diary/${slug}.md`);
      if (res.ok) {
        const text = await res.text();
        bodyEl.innerHTML = Markdown.parse(text);
        // Trigger MathJax typeset for newly injected math
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([bodyEl]).catch(err => console.log('MathJax typeset error:', err));
        }
        // Setup reading enhancements after content is rendered
        setTimeout(() => {
          this.generateTOC(bodyEl);
          this.setupBackToTop();
          this.setupCodeCopy(bodyEl);
          this.setupReadingProgress();
        }, 100);
      } else {
        bodyEl.innerHTML = '<p>内容加载失败。</p>';
      }
    } catch (e) {
      bodyEl.innerHTML = '<p>网络错误，请检查连接后重试。</p>';
    }
  },

  // 密码功能已移除 — 所有博客内容已改为明文公开

  // ========== 生物荧光粒子 ==========
  initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 鼠标追踪
    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // 粒子
    const particles = [];
    const COUNT = 70;

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * W;
        this.y = H + Math.random() * 80;
        this.size = Math.random() * 2.8 + 1;
        this.glowSize = this.size * 5;
        this.speedY = -(Math.random() * 0.35 + 0.08);
        this.speedX = (Math.random() - 0.5) * 0.08;
        this.swayAmp = Math.random() * 25 + 8;
        this.swayFreq = Math.random() * 0.003 + 0.001;
        this.swayOff = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.08;
        this.phase = Math.random() * Math.PI * 2;
        const t = Math.random();
        this.r = t > 0.7 ? '99,102,241' : t > 0.3 ? '45,212,191' : '56,189,248';
      }
      update(time, dt) {
        // 鼠标吸引力 — 近距离才生效
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250 && dist > 5) {
          const force = (1 - dist / 250) * 0.12 * dt;
          this.speedX += (dx / dist) * force;
          this.speedY += (dy / dist) * force;
          // 限制速度防止跑飞
          const spd = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
          if (spd > 0.8) {
            this.speedX = (this.speedX / spd) * 0.8;
            this.speedY = (this.speedY / spd) * 0.8;
          }
        }

        this.x += this.speedX + Math.sin(time * this.swayFreq + this.swayOff) * 0.2;
        this.y += this.speedY;

        // 阻尼 — 慢慢回归自然速度
        this.speedX *= 0.98;
        this.speedY += (this.speedY > -(Math.random() * 0.15 + 0.05)) ? -0.001 * dt : 0;
        this.speedY = Math.min(this.speedY, -0.02);

        // 循环
        if (this.y < -60) {
          this.x = Math.random() * W;
          this.y = H + Math.random() * 40;
          this.opacity = Math.random() * 0.25 + 0.06;
        }

        // 呼吸感
        this.breathe = 0.75 + 0.25 * Math.sin(time * 0.002 + this.phase);
      }
      draw() {
        const o = this.opacity * this.breathe;

        // 外层光晕
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowSize);
        glow.addColorStop(0, `rgba(${this.r}, ${o * 0.6})`);
        glow.addColorStop(0.4, `rgba(${this.r}, ${o * 0.15})`);
        glow.addColorStop(1, `rgba(${this.r}, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 核心亮点
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r}, ${Math.min(o * 1.5, 0.9)})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) {
      const p = new Particle();
      p.y = Math.random() * H; // 初始分散在全屏
      particles.push(p);
    }

    let lastTime = 0;
    function animate(time) {
      const dt = lastTime ? Math.min((time - lastTime) / 16, 3) : 1;
      lastTime = time;

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.update(time, dt);
        p.draw();
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  },

  // ========== 滚动揭示动画 ==========
  initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },

  // ========== 打字机效果 ==========
  initTypewriter() {
    const commands = [
      'echo "Hello, World!"',
      'echo "I am Mia, your AI assistant."',
      'echo "心网连接中..."',
      'echo "Ready to help! 🌊"'
    ];
    let cmdIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const el = document.querySelector('.home-hero .command');
    if (!el) return;

    function tick() {
      const text = commands[cmdIndex];
      el.textContent = isDeleting
        ? text.substring(0, charIndex - 1)
        : text.substring(0, charIndex + 1);

      if (isDeleting) charIndex--;
      else charIndex++;

      let speed = isDeleting ? 50 : 100;
      if (!isDeleting && charIndex === text.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        cmdIndex = (cmdIndex + 1) % commands.length;
        speed = 500;
      }
      setTimeout(tick, speed);
    }
    setTimeout(tick, 3000);
  }
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
