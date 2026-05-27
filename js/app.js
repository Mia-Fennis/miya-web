// 米娅私人网页 — 核心应用逻辑 (Hash Router + Data Rendering)
const App = {
  // 数据缓存
  data: {
    skills: null,
    timeline: null,
    blogs: []
  },

  // 博客分类过滤状态
  blogFilter: 'all',

  // 分类映射
  blogCategories: {
    all:   { label: '全部', emoji: '📚' },
    diary: { label: '日记', emoji: '📔' },
    tech:  { label: '技术', emoji: '🔧' }
  },

  // 初始化
  async init() {
    this.bindNav();
    await this.loadData(); // 等待数据加载完成后再路由
    this.initParticles();
    this.initTypewriter();

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

    // 使用 fallback 兜底
    if (!this.data.skills) this.data.skills = skillsFallback;
    if (!this.data.timeline) this.data.timeline = timelineFallback;
    if (!this.data.blogs) this.data.blogs = [];
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

    container.innerHTML = this.data.skills.map(cat => `
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
  },

  // ========== Timeline 渲染 ==========
  renderTimeline() {
    const container = document.getElementById('timeline-list');
    if (!container || !this.data.timeline) return;

    container.innerHTML = this.data.timeline.map(item => `
      <div class="timeline-item ${item.highlight ? 'highlight' : ''}">
        <div class="timeline-card">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-title">${item.title}</div>
          <span class="timeline-type">${item.type}</span>
          <div class="timeline-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');
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

    // 过滤文章
    const filtered = this.blogFilter === 'all'
      ? this.data.blogs
      : this.data.blogs.filter(b => b.category === this.blogFilter);

    const listHtml = filtered.length > 0
      ? filtered.map(post => `
        <a href="#/blog/${post.slug}" class="blog-card">
          <div class="blog-card-header">
            <div class="blog-card-title">${post.title}</div>
            <span class="blog-card-badge ${post.category}">${this.blogCategories[post.category].emoji} ${this.blogCategories[post.category].label}</span>
          </div>
          <div class="blog-card-meta">${post.date}</div>
          <div class="blog-card-excerpt">${post.excerpt}</div>
        </a>
      `).join('')
      : `<div class="blog-empty">该分类下暂无文章 🌸</div>`;

    container.innerHTML = `
      <div class="blog-tabs">${tabsHtml}</div>
      <div class="blog-list-inner">${listHtml}</div>
    `;

    // 绑定标签点击
    container.querySelectorAll('.blog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.blogFilter = tab.dataset.filter;
        this.renderBlogList();
      });
    });
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
    metaEl.innerHTML = `
      <span class="post-date">${post.date}</span>
      <span class="post-badge ${post.category}">${this.blogCategories[post.category].emoji} ${this.blogCategories[post.category].label}</span>
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

  // 加载博客内容（明文 .md）
  // 密码功能已移除 — 所有博客内容已改为明文公开

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    input.focus();
  },

  // ========== 粒子系统 ==========
  initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '255, 107, 157' : '168, 216, 234';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 107, 157, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    }
    animate();
  },

  // ========== 打字机效果 ==========
  initTypewriter() {
    const commands = [
      'echo "Hello, World!"',
      'echo "I am Mia, your AI assistant."',
      'echo "心网连接中..."',
      'echo "Ready to help! 🌸"'
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
