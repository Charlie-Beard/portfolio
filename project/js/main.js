import { fetchProjectMarkdown, parseProjectMarkdown, renderMarkdown } from "./markdown.js";

const PROJECT_SLUGS = [
  "spectrum-design-system",
  "telemetry-analytics",
  "help-support",
  "dashboards",
  "spectrumiq-chat"
];

const PROJECT_PATH = "content/projects";
const PAGE_TRANSITION_MS = 750;
const PAGE_EXIT_DELAY_MS = 220;
const PAGE_TRANSITION_KEY = "portfolio-page-transition-start";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setupHeaderState() {
  const updateHeader = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupPageLoader() {
  const releaseLoader = () => {
    let delay = 0;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        const startedAt = Number(window.sessionStorage.getItem(PAGE_TRANSITION_KEY) || 0);

        if (startedAt) {
          delay = Math.max(0, PAGE_TRANSITION_MS - (Date.now() - startedAt));
        }
      } catch (error) {
        delay = 0;
      }
    }

    window.setTimeout(() => {
      try {
        window.sessionStorage.removeItem(PAGE_TRANSITION_KEY);
      } catch (error) {
        // Ignore storage access issues and let the page render normally.
      }

      requestAnimationFrame(() => {
        document.body.classList.add("is-ready");
        document.body.classList.remove("is-navigating");
      });
    }, delay);
  };

  releaseLoader();
  window.addEventListener("pageshow", releaseLoader);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link) {
      return;
    }

    if (link.target === "_blank" || link.hasAttribute("download")) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) {
      return;
    }

    if (url.pathname === window.location.pathname && url.hash) {
      return;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-navigating");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        window.sessionStorage.setItem(PAGE_TRANSITION_KEY, String(Date.now()));
      } catch (error) {
        // Ignore storage access issues and fall back to a local-only transition.
      }
    }

    window.setTimeout(() => {
      window.location.href = url.href;
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : PAGE_EXIT_DELAY_MS);
  });
}

function setupYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function getProjectFilePath(slug) {
  return `${PROJECT_PATH}/${slug}.md`;
}

async function loadProject(slug) {
  const markdown = await fetchProjectMarkdown(getProjectFilePath(slug));
  return parseProjectMarkdown(markdown);
}

function createProjectCardMarkup(project) {
  const { meta } = project;
  const title = escapeHtml(meta.title || "Untitled project");
  const summary = escapeHtml(meta.cardSummary || "");
  const role = escapeHtml(meta.role || "Technical Product Manager");
  const company = escapeHtml(meta.company || "Independent");
  const impact = escapeHtml(meta.impact || "");
  const slug = encodeURIComponent(meta.slug || "");

  return `
    <article class="project-card fade-in" data-delay="${meta.order || 1}">
      <div class="project-card__content">
        <div class="project-card__intro">
          <h3 class="project-card__title">${title}</h3>
          <p class="project-card__summary">${summary}</p>
        </div>
        <dl class="project-card__meta">
          <div>
            <dt>Role</dt>
            <dd>${role}</dd>
          </div>
          <div>
            <dt>Company</dt>
            <dd>${company}</dd>
          </div>
        </dl>
        <p class="project-card__impact">${impact}</p>
      </div>
      <a class="button-link" href="project-${slug}.html">View case study</a>
    </article>
  `;
}

async function renderProjectCards() {
  const list = document.querySelector("[data-project-list]");

  if (!list) {
    return;
  }

  try {
    const projects = await Promise.all(PROJECT_SLUGS.map((slug) => loadProject(slug)));
    const sorted = projects.sort((left, right) => Number(left.meta.order || 0) - Number(right.meta.order || 0));
    list.innerHTML = sorted.map(createProjectCardMarkup).join("");
  } catch (error) {
    list.innerHTML = `
      <article class="project-card">
        <div class="project-card__content">
          <h3 class="project-card__title">Projects are temporarily unavailable</h3>
          <p class="project-card__summary">The case study markdown could not be loaded in this preview.</p>
          <p class="project-card__impact">Check that you are serving the site over a local web server.</p>
        </div>
      </article>
    `;
    console.error(error);
  }
}

function setText(selector, value) {
  const node = document.querySelector(selector);

  if (node) {
    node.textContent = value || "";
  }
}

function renderSection(selector, content) {
  const node = document.querySelector(selector);

  if (!node) {
    return;
  }

  node.innerHTML = content ? renderMarkdown(content) : '<p class="placeholder-copy">Content coming soon.</p>';
}

function renderHero(meta) {
  const figure = document.querySelector("[data-project-hero]");

  if (!figure) {
    return;
  }

  if (!meta.heroImage) {
    figure.classList.add("is-hidden");
    return;
  }

  const image = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");

  image.src = meta.heroImage;
  image.alt = meta.heroAlt || meta.title || "Project image";
  caption.textContent = meta.heroCaption || meta.heroAlt || "";
  figure.classList.remove("is-hidden");
}

function resolveProjectSlug() {
  const explicitSlug = document.body.dataset.project;

  if (explicitSlug) {
    return explicitSlug;
  }

  if (document.body.dataset.page === "project-template") {
    return new URLSearchParams(window.location.search).get("project");
  }

  return null;
}

async function renderProjectPage() {
  const slug = resolveProjectSlug();

  if (!slug) {
    setText("[data-project-title]", "Select a project");
    setText("[data-project-subtitle]", "Add ?project=slug to the template URL or open one of the generated project pages.");
    renderSection('[data-section="Problem"]', "");
    renderSection('[data-section="Approach"]', "");
    renderSection('[data-section="Solution"]', "");
    renderSection('[data-section="Impact"]', "");
    return;
  }

  try {
    const { meta, sections, order } = await loadProject(slug);

    document.title = `${meta.title || "Project"} | Charles Beard`;
    setText("[data-project-title]", meta.title || "Project");
    setText("[data-project-subtitle]", meta.subtitle || "");
    setText("[data-meta-role]", meta.role || "Technical Product Manager");
    setText("[data-meta-company]", meta.company || "Independent");
    setText("[data-meta-timeline]", meta.timeline || "Recent");

    renderHero(meta);
    renderSection('[data-section="Problem"]', sections.Problem);
    renderSection('[data-section="Approach"]', sections.Approach);
    renderSection('[data-section="Solution"]', sections.Solution);
    renderSection('[data-section="Impact"]', sections.Impact);

    const extras = order.filter((heading) => !["Overview", "Problem", "Approach", "Solution", "Impact"].includes(heading));
    const extraContainer = document.querySelector("[data-extra-sections]");

    if (extraContainer) {
      extraContainer.innerHTML = extras
        .map(
          (heading) => `
            <section class="content-section">
              <h2>${heading}</h2>
              <div class="rich-text">${renderMarkdown(sections[heading])}</div>
            </section>
          `
        )
        .join("");
    }
  } catch (error) {
    setText("[data-project-title]", "Project not found");
    setText("[data-project-subtitle]", "The markdown file for this case study could not be loaded.");
    renderSection('[data-section="Problem"]', "");
    renderSection('[data-section="Approach"]', "");
    renderSection('[data-section="Solution"]', "");
    renderSection('[data-section="Impact"]', "");
    console.error(error);
  }
}

function init() {
  setupHeaderState();
  setupPageLoader();
  setupYear();
  renderProjectCards();
  renderProjectPage();
}

document.addEventListener("DOMContentLoaded", init);
