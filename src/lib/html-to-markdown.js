export function htmlToMarkdown(html) {
  if (!html) return "";

  // This is a simple implementation - for a more robust solution,
  // consider using a library like turndown

  // Replace <br> tags with newlines
  let markdown = html.replace(/<br\s*\/?>/gi, "\n");

  // Replace heading tags
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");

  // Replace paragraph tags
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Replace bold tags
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");

  // Replace italic tags
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Replace code blocks
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis,
    "```\n$1\n```\n\n"
  );

  // Replace inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Replace unordered lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  });

  // Replace ordered lists
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${index++}. $1\n`;
    });
  });

  // Replace links
  markdown = markdown.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    "[$2]($1)"
  );

  // Replace images
  markdown = markdown.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi,
    "![$2]($1)"
  );
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "![]($1)");

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");

  return markdown.trim();
}
