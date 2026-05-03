// Enhanced Markdown parser for Mia's blog
// Supports: headers, bold, italic, inline-code, code-blocks, lists, blockquotes, links, hr, paragraphs
// NEW: LaTeX math ($...$ / $$...$$) preservation, HTML details/summary preservation

const Markdown = {
  // Counter for placeholders
  _phId: 0,
  _placeholders: {},

  _reset() {
    this._phId = 0;
    this._placeholders = {};
  },

  _save(content) {
    const id = `__PH_${this._phId++}__`;
    this._placeholders[id] = content;
    return id;
  },

  _restore(html) {
    for (const [id, content] of Object.entries(this._placeholders)) {
      html = html.split(id).join(content);
    }
    return html;
  },

  parse(text) {
    if (!text) return '';
    this._reset();

    let html = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // === PROTECTION PHASE ===
    // 1. Protect fenced code blocks FIRST (so math inside code isn't touched)
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = this._save(`<pre class="code-block"><code>${code.trimEnd()}</code></pre>`);
      codeBlocks.push(placeholder);
      return placeholder;
    });

    // 2. Protect display math $$...$$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      return this._save(`$$${math}$$`);
    });

    // 3. Protect inline math $...$ (must be non-greedy, avoid $ in text)
    // Only match when there's actual content between $ and $, and it's not adjacent to another $
    html = html.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (match, math) => {
      // Skip if it looks like money or table separator (pure digits or spaces)
      if (/^\s*\d+\s*$/.test(math)) return match;
      return this._save(`$${math}$`);
    });

    // 4. Protect HTML fold tags (details/summary)
    html = html.replace(/<(details|summary|/details|/summary)(\s[^>]*)?>/g, (match) => {
      return this._save(match);
    });

    // === MARKDOWN PARSING PHASE ===
    // Escape remaining HTML entities
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Inline code (not inside pre)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Lists
    const lines = html.split('\n');
    const out = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const ulMatch = line.match(/^\s*[-\*]\s+(.*)$/);
      const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
      const indentUl = line.match(/^(\s{2,})[-\*]\s+(.*)$/);

      if (ulMatch && !indentUl) {
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (!inOl) { out.push('<ol>'); inOl = true; }
        out.push(`<li>${olMatch[2]}</li>`);
      } else if (indentUl && inUl) {
        out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, '');
        out.push(`<ul><li>${indentUl[2]}</li></ul></li>`);
      } else {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push(line);
      }
    }
    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');

    html = out.join('\n');

    // Paragraphs
    html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return line;
      if (trimmed.startsWith('__PH_')) return line; // skip protected placeholders
      return `<p>${trimmed}</p>`;
    }).join('\n');

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n{2,}/g, '\n');

    // === RESTORATION PHASE ===
    html = this._restore(html);

    return html;
  }
};

if (typeof module !== 'undefined') module.exports = Markdown;
