/**
 * 轻量 Markdown 渲染器（billing 模块合同文档专用）
 *
 * 不引入第三方 md 库，只支持合同模板用到的语法，输出已转义的安全 HTML：
 *   - 标题：# / ## / ###
 *   - 加粗：**text**
 *   - 有序列表：1. 2. 3.（含 2 空格缩进的续行段落）
 *   - 水平分割线：---
 *   - 段落与不换行空格：&nbsp;
 *   - 内联原生 HTML 注释锚点（如印章锚点）原样保留
 *
 * 注意：渲染前请确保 fillTemplate 已完成 {{字段}} 替换；
 * 所有非锚点内容均经 HTML 转义，避免字段值注入。
 */

// HTML 转义（锚点注释 <!- -xxx- -> 由调用方在转义后注入，字段值一律转义）
export function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 行内：转义后处理 **加粗** 与 &nbsp;
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/&amp;nbsp;/g, "&nbsp;");
}

// 有序列表项内部的缩进续行（列表块渲染时调用）
function listItemHtml(line) {
  // 去掉 "1. " 前缀后按行内渲染
  return inline(line.replace(/^\s*\d+\.\s*/, ""));
}

/**
 * md 文本 → HTML
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行
    if (!trimmed) {
      i++;
      continue;
    }
    // 锚点注释原样保留（合同模板注入印章/买方章位置）
    if (/^<!--[\s\S]*?-->$/.test(trimmed)) {
      html.push(trimmed);
      i++;
      continue;
    }
    // 装配阶段注入的表格 HTML 块原样保留（可信内部内容）
    if (/^<div class="doc-table-wrap">[\s\S]*<\/div>$/.test(trimmed)) {
      html.push(trimmed);
      i++;
      continue;
    }
    // 水平分割线
    if (/^-{3,}$/.test(trimmed)) {
      html.push('<hr class="doc-hr" />');
      i++;
      continue;
    }
    // 标题
    const h = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      html.push(`<h${level} class="doc-h doc-h${level}">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    // 有序列表：聚合连续的 "数字. " 行
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push("<li>" + listItemHtml(lines[i].trim()) + "</li>");
        i++;
      }
      html.push('<ol class="doc-ol">' + items.join("") + "</ol>");
      continue;
    }
    // 普通段落
    html.push('<p class="doc-p">' + inline(trimmed) + "</p>");
    i++;
  }

  return html.join("\n");
}

export default renderMarkdown;
