(function () {
  if (!window.FH_DATA) return;

  const search = document.querySelector("[data-platform-search]");
  const watchlist = document.querySelector("[data-platform-watchlist]");
  const threshold = document.querySelector("[data-platform-threshold]");
  const sort = document.querySelector("[data-platform-sort]");
  const list = document.querySelector("[data-signal-list]");
  const detail = document.querySelector("[data-signal-detail]");
  const briefList = document.querySelector("[data-brief-list]");
  const counter = document.querySelector("[data-platform-count]");

  if (!list || !detail || !briefList || !counter) return;

  let filteredSignals = [...window.FH_DATA.signals];
  let activeId = filteredSignals[0] ? filteredSignals[0].id : null;

  [search, watchlist, threshold, sort].forEach((control) => {
    if (!control) return;
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });

  update();

  function update() {
    const searchValue = search ? search.value.trim().toLowerCase() : "";
    const watchlistValue = watchlist ? watchlist.value : "all";
    const thresholdValue = threshold ? Number(threshold.value) : 0;
    const sortValue = sort ? sort.value : "risk";

    filteredSignals = window.FH_DATA.signals.filter((signal) => {
      const haystack = `${signal.title} ${signal.summary} ${signal.watchlist}`.toLowerCase();
      const matchesSearch = !searchValue || haystack.includes(searchValue);
      const matchesWatchlist = watchlistValue === "all" || signal.watchlist === watchlistValue;
      const matchesThreshold = signal.risk >= thresholdValue;
      return matchesSearch && matchesWatchlist && matchesThreshold;
    });

    filteredSignals.sort((a, b) => {
      if (sortValue === "alpha") return a.title.localeCompare(b.title);
      if (sortValue === "watchlist") return a.watchlist.localeCompare(b.watchlist);
      return b.risk - a.risk;
    });

    if (!filteredSignals.some((signal) => signal.id === activeId)) {
      activeId = filteredSignals[0] ? filteredSignals[0].id : null;
    }

    renderList();
    renderDetail();
    renderBriefing();
    counter.textContent = `${filteredSignals.length} monitored narratives`;
  }

  function renderList() {
    if (!filteredSignals.length) {
      list.innerHTML = `
        <div class="console-card">
          <h3 class="console-card__title">No narratives match the current filters.</h3>
          <p>Try lowering the threshold or switching to a different watchlist.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filteredSignals
      .map(
        (signal) => `
          <button class="console-card ${signal.id === activeId ? "is-active" : ""}" type="button" data-signal-id="${signal.id}">
            <div class="console-card__top">
              <div>
                <div class="console-meta">
                  <span class="meta-chip">${signal.watchlist}</span>
                  <span class="meta-chip">${signal.status}</span>
                </div>
                <h3 class="console-card__title" style="margin-top:12px;">${signal.title}</h3>
              </div>
              <div class="risk-score" data-level="${signal.level}">${signal.risk}</div>
            </div>
            <p>${signal.summary}</p>
            <div class="pill-row">
              ${signal.channels.map((channel) => `<span class="tag">${channel}</span>`).join("")}
            </div>
          </button>
        `
      )
      .join("");

    list.querySelectorAll("[data-signal-id]").forEach((button) => {
      button.addEventListener("click", () => {
        activeId = button.getAttribute("data-signal-id");
        renderList();
        renderDetail();
        renderBriefing();
      });
    });
  }

  function renderDetail() {
    const signal = filteredSignals.find((item) => item.id === activeId);
    if (!signal) {
      detail.innerHTML = "";
      return;
    }

    detail.innerHTML = `
      <article class="console-detail panel">
        <div class="console-detail__header">
          <div class="console-meta">
            <span class="meta-chip">${signal.watchlist}</span>
            <span class="meta-chip">${signal.channels.join(" / ")}</span>
            <span class="meta-chip">Risk ${signal.risk}</span>
          </div>
          <div class="signal-card__top">
            <div>
              <h2 style="font-family:var(--serif); font-size:2.1rem; letter-spacing:-0.04em;">${signal.title}</h2>
              <p style="margin-top:12px;">${signal.summary}</p>
            </div>
            <span class="signal-pill ${signal.level === "high" ? "signal-pill--danger" : signal.level === "watch" ? "signal-pill--watch" : "signal-pill--good"}">${signal.status}</span>
          </div>
        </div>
        <div class="console-detail__grid">
          <section class="console-detail__block">
            <h3>Recommended action</h3>
            <p>${signal.opportunity}</p>
            <ul class="action-list detail-list">
              ${signal.actions.map((action) => `<li>${action}</li>`).join("")}
            </ul>
          </section>
          <section class="console-detail__block">
            <h3>Source evidence</h3>
            <div class="source-list">
              ${signal.sources
                .map(
                  (source) => `
                    <div class="source-item">
                      <span>${source.name}</span>
                      <strong>${source.volume}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
          <section class="console-detail__block">
            <h3>Velocity</h3>
            ${renderChart(signal.velocity, "#f4c977")}
            <div class="chart-labels">
              <span>7 days ago</span>
              <span>Today</span>
            </div>
          </section>
          <section class="console-detail__block">
            <h3>Audience attention</h3>
            ${renderChart(signal.attention, "#88b3ff")}
            <div class="chart-labels">
              <span>7 days ago</span>
              <span>Today</span>
            </div>
          </section>
        </div>
      </article>
    `;
  }

  function renderBriefing() {
    const topThree = filteredSignals.slice(0, 3);
    briefList.innerHTML = topThree
      .map(
        (signal, index) => `
          <article class="brief-item">
            <div class="brief-item__top">
              <strong>${index + 1}. ${signal.title}</strong>
              <span class="signal-pill ${signal.level === "high" ? "signal-pill--danger" : signal.level === "watch" ? "signal-pill--watch" : "signal-pill--good"}">${signal.status}</span>
            </div>
            <p>${signal.summary}</p>
            <p><strong style="color:var(--text);">Next move:</strong> ${signal.actions[0]}</p>
          </article>
        `
      )
      .join("");
  }

  function renderChart(values, color) {
    const width = 320;
    const height = 110;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const step = width / Math.max(values.length - 1, 1);
    const points = values
      .map((value, index) => {
        const x = index * step;
        const normalized = max === min ? 0.5 : (value - min) / (max - min);
        const y = height - normalized * (height - 24) - 12;
        return `${x},${y}`;
      })
      .join(" ");

    return `
      <svg class="mini-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id="gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.35"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>
        <polyline fill="url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, "")})" stroke="none" points="0,${height} ${points} ${width},${height}"></polyline>
      </svg>
    `;
  }
})();
