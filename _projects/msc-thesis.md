---
layout: project
title: "MSc Thesis: NLP and ML for Support Ticket Classification"
slug: msc-thesis
subtitle: Research into automating support ticket classification on J.P.Morgan Asset Management's Spectrum platform using natural language processing and machine learning.
description: MSc dissertation by Charles Beard (University of Bath, Distinction 2023) applying TF-IDF and SVM classification to automate support ticket triage on J.P.Morgan Asset Management's Spectrum platform, achieving 83.21% F1 Score with an estimated $9.15 saving per automated ticket.
role: MSc Researcher
company: University of Bath
timeline: 2022–2023
impact: Achieved 83.21% F1 Score on unseen support ticket data, demonstrating that TF-IDF and SVM classification can automate enterprise support triage at scale, with an estimated $9.15 saving per automated ticket.
cardSummary: MSc dissertation applying NLP and machine learning to classify 12,000+ annual support tickets on Spectrum, awarded Distinction by the University of Bath.
order: 6
published: false
heroImage: content/projects/images/msc-thesis.svg
heroAlt: Placeholder diagram showing an NLP and machine learning classification pipeline for support tickets
heroCaption: Conceptual pipeline illustrating the NLP pre-processing and SVM classification system built for the dissertation
---

## Problem

Spectrum, J.P.Morgan Asset Management's internal investment platform, generates over 12,000 support tickets a year across 120+ applications and 5,000 users. A significant subset of those tickets can be resolved without human review: they require a pre-defined response (for access requests, AG Grid licence queries, or blank ticket auto-closures) or need routing to a specific team.

Without automated classification, every ticket enters a first-in-first-out queue and requires a support agent to read, categorise, and respond, even for repeat, predictable queries. Each unnecessarily manual classification costs approximately $9.15 in staff time, and customers wait longer for resolutions that could have been instant.

The research question: can NLP and machine learning classify these tickets with sufficient accuracy to make automation viable in a production environment?

## Approach

This research formed the dissertation for my MSc in Computer Science at the University of Bath, awarded with Distinction. I worked with real support ticket data from Spectrum: 1,297 tickets manually labelled across 10 classification categories, drawn from two years of live support operations.

The study was structured around three phases.

**Literature and technology review:** Surveying NLP pre-processing techniques (tokenisation, lemmatisation, stemming, stop word removal), feature extraction methods (BoW, TF-IDF, Word2Vec), and multi-class classification algorithms including Naïve Bayes, KNN, Decision Trees, Random Forest, SVM, and LSTM neural networks.

**System design and implementation:** Building a modular Python classification pipeline using NLTK, spaCy, scikit-learn, and Pandas. The architecture followed low-coupling and high-cohesion principles, ensuring components could be improved or replaced without refactoring the whole system. Three support ticket ingestion channels (Help, Portal, and Email) each introduced different data quality characteristics that shaped the pre-processing design.

**Iterative evaluation and improvement:** Using F1 Score as the primary metric (preferred over accuracy for class-imbalanced data), systematically improving the pipeline from a baseline result toward and beyond the 75% OKR threshold set in the project requirements.

## Solution

TF-IDF feature extraction paired with a LinearSVC (Support Vector Machine) classifier was selected after comparing multiple approaches. TF-IDF weighted infrequent, domain-specific terms more heavily than common cross-document tokens, better suited to the relatively small, domain-specific corpus than Word2Vec, which requires large corpora to learn quality embeddings.

The NLP pre-processing pipeline included tokenisation, case normalisation, contraction expansion, accented character removal, punctuation removal, Part-of-Speech-aware lemmatisation, and a custom stop word set combining NLTK, spaCy, and domain-specific tokens (JPMorgan email addresses, URL fragments, tokens exceeding 20 characters).

Iterative improvements to the pipeline and model produced the following results:

| Technique applied | F1 Score |
|---|---|
| Baseline (standard pre-processing, full vocabulary) | 64.35% |
| Enhanced stop word removal (spaCy + domain tokens) | 70.52% |
| Class balancing (inversely proportional class weights) | 71.61% |
| C hyperparameter optimisation (C = 0.5) | ~71% |
| Feature selection (3,500 features via TF-IDF) | ~71% |
| Problem reframing (ambiguous categories merged into Other) | **83.21%** |

### Key decisions

- **TF-IDF over Word2Vec:** the corpus of ~1,300 tickets was insufficient for quality word embeddings; TF-IDF's inverse document frequency weighting handled domain-specific vocabulary (product names, internal system identifiers) more effectively at this scale
- **LinearSVC over standard SVC:** better scaling characteristics and more flexibility on penalty and loss functions for this text classification task, as documented in scikit-learn
- **Custom stop word enhancement:** adding domain-specific tokens to the combined NLTK and spaCy stop word set increased stop word removal by 15% and contributed a 6 percentage point improvement in F1
- **Class balancing:** the 'Other' category comprised 42% of all tickets; weighting classes inversely proportional to frequency improved minority-class precision meaningfully
- **Problem reframing:** two low-volume, ambiguous categories ('help' and 'log') were recategorised as 'Other', removing classification noise that had capped the F1 ceiling

## Impact

- **83.21% F1 Score** on unseen support ticket data, exceeding the 75% OKR threshold defined in the project requirements
- **$9.15 estimated saving per automated ticket**, with 58% of 12,000+ annual tickets identified as candidates for automation, the research demonstrates meaningful operational efficiency at scale
- **Distinction awarded** at the University of Bath
- The research directly informs how I think about AI-enabled tooling in my day-to-day product work on Spectrum, particularly the SpectrumIQ and Help and Support products I own, where understanding how unstructured user language maps to intent and resolution paths is central to the product strategy
