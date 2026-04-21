function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseScalar(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

function splitFrontMatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return { meta: {}, body: normalized.trim() };
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);

  if (closingIndex === -1) {
    return { meta: {}, body: normalized.trim() };
  }

  const frontMatter = normalized.slice(4, closingIndex);
  const body = normalized.slice(closingIndex + 5).trim();
  const meta = {};

  frontMatter.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      return;
    }

    meta[key] = parseScalar(value);
  });

  return { meta, body };
}

function renderInline(text) {
  let output = escapeHtml(text);

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return output;
}

export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const chunks = [];
  let paragraph = [];
  let listItems = [];
  let listType = null;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    chunks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) {
      return;
    }

    const items = listItems.map((item) => `<li>${renderInline(item)}</li>`).join("");
    chunks.push(`<${listType}>${items}</${listType}>`);
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (imageMatch) {
      flushParagraph();
      flushList();
      const altText = imageMatch[1] || "";
      const alt = escapeHtml(altText);
      const src = imageMatch[2];
      chunks.push(
        `<figure><img src="${src}" alt="${alt}" loading="lazy" width="1280" height="720">${altText ? `<figcaption>${renderInline(altText)}</figcaption>` : ""}</figure>`
      );
      return;
    }

    const headingMatch = trimmed.match(/^(#{3,4})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(4, headingMatch[1].length);
      chunks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);

    if (unorderedMatch) {
      flushParagraph();

      if (listType && listType !== "ul") {
        flushList();
      }

      listType = "ul";
      listItems.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (orderedMatch) {
      flushParagraph();

      if (listType && listType !== "ol") {
        flushList();
      }

      listType = "ol";
      listItems.push(orderedMatch[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return chunks.join("");
}

export function parseProjectMarkdown(raw) {
  const { meta, body } = splitFrontMatter(raw);
  const sections = {};
  const order = [];
  let currentHeading = "Overview";
  let buffer = [];

  const commitSection = () => {
    const content = buffer.join("\n").trim();

    if (!content) {
      buffer = [];
      return;
    }

    sections[currentHeading] = content;

    if (!order.includes(currentHeading)) {
      order.push(currentHeading);
    }

    buffer = [];
  };

  body.split("\n").forEach((line) => {
    const sectionMatch = line.match(/^##\s+(.+)$/);

    if (sectionMatch) {
      commitSection();
      currentHeading = sectionMatch[1].trim();
      return;
    }

    buffer.push(line);
  });

  commitSection();

  return { meta, sections, order };
}

export async function fetchProjectMarkdown(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load markdown from ${path}`);
  }

  return response.text();
}
