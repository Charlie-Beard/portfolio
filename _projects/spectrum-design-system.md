---
layout: project
title: Spectrum Design System
slug: spectrum-design-system
subtitle: A tokenised, multi-surface design system — React component library, Figma design library, and MCP-powered distribution — delivering consistent platform experiences across 100+ Spectrum applications.
description: How Charles Beard led the Spectrum Design System as a governed shared platform product at J.P.Morgan Asset Management, evolving from a foundational component library to a tokenised, AI-distributed system serving hundreds of engineers across the enterprise.
role: Senior Product Manager
company: J.P.Morgan Asset Management
timeline: 2019 - Present
impact: Evolved from a foundational library to a tokenised, MCP-served design system enabling thousands of automated code changes across hundreds of engineers and 100+ applications.
cardSummary: Owned roadmap and delivery for the design system — a tokenised React and Figma library in sync, now distributed via MCP to hundreds of engineers enabling automated code changes at scale.
order: 2
heroImage: content/projects/images/spectrum-design-system.svg
heroAlt: Placeholder product concept for a shared enterprise design system
heroCaption: Placeholder concept illustrating shared foundations for Spectrum product experiences
---

## Problem

Spectrum supports thousands of internal users across investment, client service, and operations. As the platform grew, maintaining a consistent, high-quality user experience across a 100+ application estate became a platform-level problem — one that could not be solved locally by individual product teams.

Without a strategic shared design foundation, teams risked duplicating patterns, diverging in workflow quality, and slowing delivery across the broader platform. The cost of inconsistency compounds as an estate scales.

## Approach

I owned roadmap, prioritisation, OKRs, and delivery for core platform capabilities, including the design system. The job was not only to define components and patterns, but to lead the design system as a product that teams across Spectrum would actively adopt and rely on.

That meant influencing product teams to use strategic core products, tooling, and processes — and governing adoption at platform level, not leaving it to individual team discretion. I worked in close triad partnership with Engineering and Design leads to ensure quality, resilience, and a shared direction throughout.

The thinking behind this approach is documented in my article [Product Owning a Design System: Things I've Learned](https://medium.com/swlh/product-owning-a-design-system-things-ive-learned-3f799e301280), which covers the component strategy, contribution model, and economic justification for building design systems as governed platform products.

## The product suite

Spectrum Design System is not a single library — it is a suite of tightly coupled products sharing a common token foundation.

**React component library** — the engineering-facing implementation of the design system. It covers foundational components (Button, Card, Modal) and complex, high-value ones (Grid, Chart), all built with consistent, well-documented APIs engineered for adoption at scale. Accessibility compliance and API consistency are non-negotiable standards.

**Figma design library** — kept in sync with the React component library so designers and engineers share a single source of truth. Eliminating drift between design and implementation was a deliberate product decision: when design and code diverge, quality erodes silently across every team that depends on both.

**Design tokens** — the binding layer. A token architecture powers theming, density, and visual consistency across both libraries and all downstream applications. Token parity means a change in one surface propagates cleanly to the other — enabling platform-wide theming without per-application rework.

## The tokenisation journey

Moving to a fully tokenised system was a significant engineering and design undertaking — not a visual refresh, but a platform-level architectural decision about how design decisions flow through the estate.

This journey is documented by my colleague Vicky Kocan in her talk [Tokenisation Revolution](https://www.youtube.com/watch?v=qMMiNmj4KcM), which covers the depth of change required to move a live, multi-application design system onto a token architecture. Tokens became the foundation that made scalable, coherent theming possible across 100+ applications — and the mechanism through which design intent and engineering implementation could stay aligned as the platform grows.

## Strategic evolution: MCP-powered distribution

As AI coding tools spread across Spectrum engineering teams, the adoption model evolved. Rather than relying on engineers discovering and integrating the design system manually, we shifted strategy: the design system is now offered as an MCP (Model Context Protocol) server.

Rolled out to hundreds of engineers across the enterprise, this makes the design system an active participant in code generation rather than a passive reference. Engineers access components, tokens, and patterns directly through their AI tool of choice — whether Copilot, Cursor, Claude Code, or another — and the design system guides generated code toward platform standards automatically.

The result: thousands of automated code changes across the enterprise, with design system compliance built into the engineering workflow rather than bolted on after. This is explored further in my article [Designing for AI Experiences](https://medium.com/design-bootcamp/designing-for-ai-experiences-a6f5248b0e86), which examines how design systems must evolve to support AI-powered product development — covering transparency patterns, explainability, latency states, and token architecture for AI components.

### Product decisions

- Positioned the design system as a strategic core product, not a passive library teams could opt out of
- Used triad partnership with Engineering and Design to keep quality, resilience, and adoption aligned
- Made platform-level consistency and adoption a measured outcome, not an assumption
- Invested in design token architecture as the binding layer between React and Figma libraries, enabling consistent theming across 100+ applications without per-team rework
- Shifted distribution strategy to MCP to embed design system access into engineering AI workflows — reducing adoption friction and enabling automated consistency at scale

## Impact

- Supported a consistently high-quality user experience across thousands of Spectrum users
- Accelerated product delivery across a 100+ application platform estate by reducing duplication and reinvention
- Established a durable shared foundation that scales as new products and workflows are introduced to Spectrum
- Rolled out as an MCP server to hundreds of engineers, enabling thousands of automated code changes across the enterprise
- Integrated with engineers' AI tools of choice, making the design system an active participant in code generation at scale

## Publications and talks

- [Product Owning a Design System: Things I've Learned](https://medium.com/swlh/product-owning-a-design-system-things-ive-learned-3f799e301280) — Charles Beard, The Startup (2020). Lessons from leading the design system as a product: component selection, documentation, contribution models, and building the economic case for a governed platform investment.
- [Designing for AI Experiences](https://medium.com/design-bootcamp/designing-for-ai-experiences-a6f5248b0e86) — Charles Beard, Design Bootcamp (2024). How design systems must evolve to support AI-powered products — transparency, explainability, latency states, and a token architecture built for AI component surfaces.
- [Tokenisation Revolution](https://www.youtube.com/watch?v=qMMiNmj4KcM) — Vicky Kocan. An account of the team's journey to implement a full design token architecture across the Spectrum design system.
