(function () {
  if (!window.FH_DATA) return;

  const switcher = document.querySelector("[data-audience-switch]");
  const summary = document.querySelector("[data-briefing-summary]");
  const detail = document.querySelector("[data-briefing-detail]");
  const chips = document.querySelector("[data-audience-cards]");
  if (!switcher || !summary || !detail || !chips) return;

  let active = "comms";

  renderAudienceCards();
  render();

  switcher.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      active = button.dataset.audience || "comms";
      render();
    });
  });

  function render() {
    const profile = window.FH_DATA.briefings[active];
    if (!profile) return;

    switcher.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.audience === active);
    });

    summary.innerHTML = `
      <article class="briefing-card">
        <div class="detail-meta">
          <span class="meta-chip">06:30 delivery</span>
          <span class="meta-chip">${profile.label}</span>
          <span class="meta-chip">Illustrative briefing</span>
        </div>
        <h2 style="font-family:var(--serif); font-size:2.3rem; letter-spacing:-0.04em;">${profile.headline}</h2>
        <p>${profile.overview}</p>
        <div class="quote">
          <p>${profile.strap}</p>
          <cite>Tailored from the same monitored signal set, not rewritten from scratch every time.</cite>
        </div>
      </article>
    `;

    detail.innerHTML = `
      <article class="briefing-card">
        <section class="briefing-card__section">
          <h3>Priorities</h3>
          <ul class="detail-list">
            ${profile.priorities.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
        <section class="briefing-card__section">
          <h3>Watch-outs</h3>
          <ul class="detail-list">
            ${profile.watchouts.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
        <section class="briefing-card__section">
          <h3>Recommended next steps</h3>
          <ul class="detail-list">
            ${profile.recommendations.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      </article>
    `;
  }

  function renderAudienceCards() {
    chips.innerHTML = Object.entries(window.FH_DATA.briefings)
      .map(
        ([key, profile]) => `
          <article class="audience-card">
            <div class="detail-meta">
              <span class="meta-chip">${profile.label}</span>
            </div>
            <strong>${key === "comms" ? "01" : key === "executive" ? "02" : key === "policy" ? "03" : "04"}</strong>
            <h3>${profile.headline}</h3>
            <p>${profile.strap}</p>
          </article>
        `
      )
      .join("");
  }
})();
