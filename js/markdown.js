// Minimal Markdown parser for local use
// Supports: headers, bold, italic, inline-code, code-blocks, lists, blockquotes, links, hr, paragraphs

const Markdown = {
  parse(text) {
    if (!text) return '';
    let html = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Escape HTML entities
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (fenced)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block"><code>${code.trimEnd()}</code></pre>`;
    });

    // Inline code
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

    // Lists (simple: process line by line)
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
        // nested inside previous li
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

    // Paragraphs: wrap non-tag lines in <p>
    html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return line;
      return `<p>${trimmed}</p>`;
    }).join('\n');

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n{2,}/g, '\n');

    return html;
  }
};

if (typeof module !== 'undefined') module.exports = Markdown;
