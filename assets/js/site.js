(function () {
  const navItems = [
    { href: "/", label: "Home", page: "home" },
    { href: "/intelligence/", label: "Intelligence", page: "intelligence" },
    { href: "/platform/", label: "Platform", page: "platform" },
    { href: "/research/", label: "Research", page: "research" },
    { href: "/services/", label: "Services", page: "services" },
    { href: "/press/", label: "Press", page: "press" },
    { href: "/about/", label: "About", page: "about" }
  ];

  const body = document.body;
  const page = body.dataset.page || "home";

  renderHeader();
  renderFooter();
  initMenu();
  initReveal();
  initMailtoForms();
  renderReportCards();
  renderReportDetails();
  renderPressHighlights();
  renderPressArchive();

  function renderHeader() {
    const headerMount = document.querySelector("[data-site-header]");
    if (!headerMount) return;

    headerMount.innerHTML = `
      <header class="site-header">
        <div class="site-header__inner">
          <a class="brand" href="/" aria-label="Fenimore Harper home">
            <span class="brand__mark" aria-hidden="true"></span>
            <span class="brand__text">
              <span class="brand__title">Fenimore Harper</span>
              <span class="brand__subtitle">Intelligence and advisory</span>
            </span>
          </a>
          <nav class="nav" aria-label="Primary">
            <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav">
              Menu
            </button>
            <div class="nav__list" id="site-nav">
              ${navItems
                .map(
                  (item) => `
                    <a class="nav__link ${page === item.page ? "is-active" : ""}" href="${item.href}">
                      ${item.label}
                    </a>
                  `
                )
                .join("")}
              <a class="button button--subtle" href="mailto:marcus@fenimoreharper.com?subject=Request%20a%20trial%20briefing">
                Request a briefing
              </a>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const footerMount = document.querySelector("[data-site-footer]");
    if (!footerMount) return;

    footerMount.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer__inner">
          <div class="site-footer__top">
            <div>
              <a class="brand" href="/">
                <span class="brand__mark" aria-hidden="true"></span>
                <span class="brand__text">
                  <span class="brand__title">Fenimore Harper</span>
                  <span class="brand__subtitle">Modern communications intelligence</span>
                </span>
              </a>
              <p style="margin-top:16px; max-width:56ch;">
                AI-native media intelligence, counter-misinformation strategy, and executive-ready briefings for organisations that cannot afford to learn about risk late.
              </p>
            </div>
            <div class="footer-links">
              <a class="badge" href="mailto:marcus@fenimoreharper.com">marcus@fenimoreharper.com</a>
              <a class="badge" href="tel:+447809323683">+44 7809 323 683</a>
            </div>
          </div>
          <div class="site-footer__meta">
            <span>Founded in 2021</span>
            <span>London and remote</span>
            <span>Broadcast, research, and advisory</span>
            <span>&copy; <span data-current-year></span> Fenimore Harper Ltd</span>
          </div>
        </div>
      </footer>
    `;

    const year = footerMount.querySelector("[data-current-year]");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  function initMenu() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__list");
    if (!nav || !toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initReveal() {
    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal", "is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  }

  function initMailtoForms() {
    const forms = document.querySelectorAll("[data-mailto-form]");
    forms.forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const subject = form.getAttribute("data-subject") || "Fenimore Harper enquiry";
        const recipient = form.getAttribute("data-recipient") || "marcus@fenimoreharper.com";
        const lines = [];

        for (const [key, value] of data.entries()) {
          lines.push(`${humanize(key)}: ${String(value).trim()}`);
        }

        const status = form.querySelector("[data-form-status]");
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

        if (status) {
          status.textContent = "Opening your email client with the drafted enquiry.";
        }

        window.location.href = mailto;
      });
    });
  }

  function renderReportCards() {
    const mount = document.querySelector("[data-render='report-cards']");
    if (!mount || !window.FH_DATA) return;

    mount.innerHTML = window.FH_DATA.reports
      .map(
        (report) => `
          <article class="report-card product-card" id="report-card-${report.id}">
            <div class="report-card__meta">
              <span class="meta-chip">${report.category}</span>
              <span class="meta-chip">${report.date}</span>
            </div>
            <h3>${report.title}</h3>
            <p>${report.summary}</p>
            <div class="report-card__stats">
              ${report.stats.map((item) => `<strong>${item}</strong>`).join("")}
            </div>
            <div class="cta-actions">
              <a class="button button--ghost" href="#${report.id}">View findings</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderReportDetails() {
    const mount = document.querySelector("[data-render='report-details']");
    if (!mount || !window.FH_DATA) return;

    mount.innerHTML = window.FH_DATA.reports
      .map(
        (report) => `
          <article class="research-detail" id="${report.id}">
            <div class="detail-meta">
              <span class="meta-chip">${report.category}</span>
              <span class="meta-chip">${report.date}</span>
            </div>
            <h3>${report.title}</h3>
            <p>${report.impact}</p>
            <ul class="detail-list">
              ${report.findings.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  function renderPressHighlights() {
    const mount = document.querySelector("[data-render='press-highlights']");
    if (!mount || !window.FH_DATA) return;

    mount.innerHTML = window.FH_DATA.press
      .slice(0, 6)
      .map(
        (item) => `
          <article class="press-item">
            <div class="press-item__meta">
              <span class="meta-chip">${item.outlet}</span>
              <span class="meta-chip">${item.type}</span>
              <span class="meta-chip">${item.date}</span>
            </div>
            <h3>${item.title}</h3>
            <a class="press-item__link" href="${item.href}" target="_blank" rel="noreferrer">Open coverage</a>
          </article>
        `
      )
      .join("");
  }

  function renderPressArchive() {
    const mount = document.querySelector("[data-render='press-archive']");
    if (!mount || !window.FH_DATA) return;

    const years = Array.from(new Set(window.FH_DATA.press.map((item) => item.year)));
    mount.innerHTML = years
      .map((year) => {
        const items = window.FH_DATA.press.filter((item) => item.year === year);
        return `
          <section class="section--tight">
            <div class="section-head">
              <div class="section-kicker">${year}</div>
            </div>
            <div class="press-list">
              ${items
                .map(
                  (item) => `
                    <article class="press-item">
                      <div class="press-item__meta">
                        <span class="meta-chip">${item.outlet}</span>
                        <span class="meta-chip">${item.type}</span>
                        <span class="meta-chip">${item.date}</span>
                      </div>
                      <h3>${item.title}</h3>
                      <a class="press-item__link" href="${item.href}" target="_blank" rel="noreferrer">Open coverage</a>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function humanize(value) {
    return value
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
})();
