window.FH_DATA = {
  reports: [
    {
      id: "bank-run",
      title: "Can AI Trigger a Bank Run?",
      date: "18 February 2025",
      category: "Financial disinformation",
      summary:
        "A simulated influence campaign showed how synthetic media, ad targeting, and false urgency could push savers to move money before a bank has time to respond.",
      impact:
        "Developed with Say No to Disinfo and used to frame the business risk of AI-enabled influence operations in banking.",
      stats: [
        "60.8% of respondents said they would consider moving money",
        "Potential movement of up to £1m for every £10 in ad spend",
        "28-page report focused on resilience, war-gaming, and comms response"
      ],
      findings: [
        "Influence operations can create liquidity pressure even without a cyber breach.",
        "Most bank readiness plans over-index on technical incidents and underweight narrative attacks.",
        "Rapid cross-functional escalation between comms, fraud, legal, and customer operations is now essential."
      ]
    },
    {
      id: "starmer-meta",
      title: "43% of Meta Ads About Starmer Were Disinformation",
      date: "13 August 2024",
      category: "Platform integrity",
      summary:
        "Public ad libraries were analysed to map the volume, cost, and likely reach of deepfake-led scam creative tied to the UK prime minister.",
      impact:
        "The work helped show how scam infrastructure can outnumber authentic political communication on major platforms.",
      stats: [
        "Over 250 suspect adverts identified",
        "Estimated spend of up to £21,053",
        "Potential reach of up to 891,834 people"
      ],
      findings: [
        "Synthetic creative is becoming cheap enough to test at scale and iterate fast.",
        "Political identity can be repurposed for financial scams far beyond election messaging.",
        "Detection workflows need model-assisted triage paired with human verification."
      ]
    },
    {
      id: "red-team",
      title: "Deepfake Red Team Exercise for the UK Election Environment",
      date: "11 April 2024",
      category: "Adversarial testing",
      summary:
        "A controlled red-team project mapped how quickly off-the-shelf models and cheap tooling can be pushed into harmful election-style misinformation.",
      impact:
        "The exercise translated abstract AI risk into concrete production costs, timings, and moderation gaps.",
      stats: [
        "£100 budget modelled a high-volume deepfake operation",
        "10 hours of deceptive fake-news content could be produced",
        "Nine example assets were created in under 30 minutes"
      ],
      findings: [
        "Barriers to entry are collapsing for malicious actors.",
        "Prompt safety layers alone are not enough to stop harmful narrative generation.",
        "Scenario-based training is the most practical way to prepare teams for synthetic media incidents."
      ]
    },
    {
      id: "sunak-ads",
      title: "Over 100 Deepfake Sunak Ads Found on Meta",
      date: "13 January 2024",
      category: "Election risk",
      summary:
        "An investigation into paid political-style creative uncovered widespread impersonation and international funding patterns around deepfake video ads.",
      impact:
        "The report was part of the early evidence base showing how AI-enabled electoral misinformation could scale through paid placement.",
      stats: [
        "143 individual ads documented",
        "Potential reach above 400,000 people",
        "Funding traced to 23 countries"
      ],
      findings: [
        "Paid distribution dramatically increases the harm of synthetic media.",
        "Open ad library analysis can still surface patterns before platforms act.",
        "Campaign monitoring now has to include scam, reputational, and democratic harms at once."
      ]
    }
  ],
  press: [
    {
      year: "2026",
      date: "17 March 2026",
      outlet: "GB News",
      title: "Reaction to Rachel Reeves' AI speech",
      type: "Broadcast",
      href: "https://x.com/"
    },
    {
      year: "2026",
      date: "13 March 2026",
      outlet: "Times Radio",
      title: "Is AI making everyone sound the same?",
      type: "Radio",
      href: "https://www.linkedin.com/"
    },
    {
      year: "2025",
      date: "12 November 2025",
      outlet: "Which?",
      title: "Leaked Meta documents and scam ads",
      type: "Press",
      href: "https://www.which.co.uk/"
    },
    {
      year: "2025",
      date: "30 October 2025",
      outlet: "ABC",
      title: "Disinformation, digital tech and democracy",
      type: "Broadcast",
      href: "https://www.abc.net.au/"
    },
    {
      year: "2025",
      date: "9 September 2025",
      outlet: "The Guardian",
      title: "Understanding AI slopaganda",
      type: "Opinion",
      href: "https://www.theguardian.com/"
    },
    {
      year: "2025",
      date: "14 February 2025",
      outlet: "Reuters",
      title: "AI-generated content raises bank run risks, study shows",
      type: "Press",
      href: "https://www.reuters.com/"
    },
    {
      year: "2025",
      date: "23 January 2025",
      outlet: "BBC One",
      title: "Rip Off Britain: fake AI celebrity scams",
      type: "Broadcast",
      href: "https://www.bbc.co.uk/"
    },
    {
      year: "2024",
      date: "13 August 2024",
      outlet: "The Times",
      title: "Crypto scammers use deepfake PM and prince",
      type: "Press",
      href: "https://www.thetimes.com/"
    },
    {
      year: "2024",
      date: "30 June 2024",
      outlet: "Channel 4 Dispatches",
      title: "Can AI Steal Your Vote?",
      type: "Documentary",
      href: "https://www.youtube.com/"
    },
    {
      year: "2024",
      date: "10 April 2024",
      outlet: "Channel 4 News",
      title: "Could deepfakes change the way you vote?",
      type: "Broadcast",
      href: "https://www.channel4.com/"
    },
    {
      year: "2024",
      date: "18 January 2024",
      outlet: "Bloomberg",
      title: "AI isn't the only misinformation culprit to worry about",
      type: "Press",
      href: "https://www.bloomberg.com/"
    },
    {
      year: "2024",
      date: "17 January 2024",
      outlet: "The Economist",
      title: "Researchers warn fakes will become harder to detect",
      type: "Press",
      href: "https://www.economist.com/"
    }
  ],
  sectors: [
    "Government and public institutions",
    "Financial services",
    "Healthcare and life sciences",
    "Consumer brands",
    "Technology platforms",
    "Political and policy campaigns"
  ],
  signals: [
    {
      id: "signal-001",
      watchlist: "Banking",
      title: "Synthetic savings-switch testimonials are accelerating",
      risk: 92,
      level: "high",
      status: "Escalate",
      summary:
        "AI-generated customer clips and spoofed commentary are being used to funnel savers into scam WhatsApp groups using urgency around ISA deadlines.",
      channels: ["Meta Ads", "TikTok", "Search"],
      opportunity: "Issue early guidance and arm branch staff with a concise rebuttal before weekend coverage builds.",
      actions: [
        "Alert fraud, comms, and customer-service leads within the hour.",
        "Prepare a short owned-channel post with verification guidance.",
        "Collect ad examples for a platform takedown request."
      ],
      sources: [
        { name: "Paid ad creative cluster", volume: "41 assets" },
        { name: "Search breakout terms", volume: "+230%" },
        { name: "Influencer stitch chain", volume: "18 videos" }
      ],
      velocity: [18, 24, 30, 42, 57, 71, 92],
      attention: [14, 21, 27, 33, 51, 68, 79]
    },
    {
      id: "signal-002",
      watchlist: "Election integrity",
      title: "Voice-cloned pundit clips are seeding false polling claims",
      risk: 88,
      level: "high",
      status: "Escalate",
      summary:
        "Short-form audio edits impersonating familiar broadcast voices are being attached to fabricated polling graphics and cross-posted into Telegram and X threads.",
      channels: ["X", "Telegram", "YouTube"],
      opportunity: "A pre-bunking explainer could reduce pickup before linear media opens the story.",
      actions: [
        "Flag likely impersonation examples for legal and platform policy review.",
        "Prepare Q&A for presenters and spokespeople.",
        "Stand up hourly monitoring until narrative fatigue sets in."
      ],
      sources: [
        { name: "Telegram seeding channels", volume: "9 communities" },
        { name: "X repost chain", volume: "2.6k reposts" },
        { name: "Search interest", volume: "+180%" }
      ],
      velocity: [11, 16, 19, 25, 39, 60, 88],
      attention: [13, 18, 23, 35, 47, 59, 72]
    },
    {
      id: "signal-003",
      watchlist: "Consumer brand",
      title: "Packaging complaint narrative is breaking from Reddit into news",
      risk: 64,
      level: "watch",
      status: "Watch",
      summary:
        "A product-quality thread with authentic customer imagery is crossing into tabloid pickup and creator explainers, with rising search interest around refunds.",
      channels: ["Reddit", "Online News", "TikTok"],
      opportunity: "Transparent remedial messaging could turn a defect conversation into a trust story.",
      actions: [
        "Brief retail partners on approved holding language.",
        "Send the operations team the common complaint clusters.",
        "Track whether refund terms are becoming the new focus."
      ],
      sources: [
        { name: "Reddit post family", volume: "4 core threads" },
        { name: "Search breakout terms", volume: "+96%" },
        { name: "Publisher pickup", volume: "7 outlets" }
      ],
      velocity: [22, 25, 29, 31, 40, 51, 64],
      attention: [17, 18, 22, 27, 36, 48, 57]
    },
    {
      id: "signal-004",
      watchlist: "Healthcare",
      title: "False side-effect claims are hitchhiking on real testimony",
      risk: 79,
      level: "high",
      status: "Escalate",
      summary:
        "Misleading edits of genuine patient clips are being repackaged with synthetic captions that overstate clinical risk and misrepresent regulator guidance.",
      channels: ["Facebook", "TikTok", "YouTube"],
      opportunity: "A clinician-fronted response could interrupt the narrative before local outlets localise it.",
      actions: [
        "Prioritise video debunks over text-only correction.",
        "Coordinate medical review and regulator-safe language.",
        "Identify accounts repeatedly resharing the same asset family."
      ],
      sources: [
        { name: "Caption variants tracked", volume: "34 versions" },
        { name: "Creator remixes", volume: "56 posts" },
        { name: "Search interest", volume: "+141%" }
      ],
      velocity: [14, 17, 21, 33, 50, 67, 79],
      attention: [12, 13, 19, 28, 41, 50, 62]
    },
    {
      id: "signal-005",
      watchlist: "Technology",
      title: "Policy launch is attracting unusually positive creator commentary",
      risk: 34,
      level: "low",
      status: "Opportunity",
      summary:
        "A new product governance announcement is gaining traction with policy creators and industry newsletters, with favourable framing around transparency.",
      channels: ["LinkedIn", "Podcasts", "Online News"],
      opportunity: "Turn the moment into executive thought leadership while attention remains constructive.",
      actions: [
        "Offer a senior spokesperson to the top three interested outlets.",
        "Package supportive creator reactions into a board update.",
        "Extend the narrative with a fast follow explainer."
      ],
      sources: [
        { name: "Newsletter mentions", volume: "12 issues" },
        { name: "LinkedIn leadership posts", volume: "380 interactions" },
        { name: "Podcast references", volume: "5 shows" }
      ],
      velocity: [9, 12, 16, 20, 26, 30, 34],
      attention: [16, 24, 30, 37, 43, 47, 51]
    }
  ],
  briefings: {
    comms: {
      label: "Communications lead",
      strap: "Focus on action, timing, and message discipline.",
      headline: "Three narratives need active handling before the 8am news cycle.",
      overview:
        "The banking scam cluster is the only red-alert item this morning. Two additional narratives are moving fast enough to justify prepared lines and stakeholder note-outs.",
      priorities: [
        "Escalate the savings-switch scam narrative and publish verification guidance.",
        "Prepare presenter-facing lines on cloned polling audio.",
        "Keep the packaging complaint story in watch mode unless refunds become the lead."
      ],
      watchouts: [
        "Search behaviour is now validating scam language even where social volumes look manageable.",
        "Traditional coverage may over-index on novelty unless a factual frame is supplied quickly."
      ],
      recommendations: [
        "Send a one-page morning note to spokespeople and customer-facing teams.",
        "Use short video correction where synthetic media is part of the narrative.",
        "Hold an 11am review on whether the election-integrity thread needs external response."
      ]
    },
    executive: {
      label: "Executive team",
      strap: "Focus on commercial risk, reputation, and decisions.",
      headline: "One issue carries direct customer harm risk; two more may affect confidence.",
      overview:
        "The lead risk is a scam narrative targeting savings behaviour. It is moving through paid and organic channels and could become a trust issue if customers feel unsupported.",
      priorities: [
        "Approve a visible customer-protection message this morning.",
        "Confirm a single decision-maker for further escalation if false polling clips spill into mainstream coverage.",
        "Review whether the packaging issue merits proactive retail outreach."
      ],
      watchouts: [
        "A delayed response increases the chance that other people define the problem first.",
        "Narratives tied to scams can move from reputational concern to regulatory attention quickly."
      ],
      recommendations: [
        "Keep decision-making tight: fraud, legal, customer ops, and communications in one thread.",
        "Ask for an end-of-day risk snapshot rather than constant updates.",
        "Use the live briefing to distinguish genuine customer concerns from coordinated manipulation."
      ]
    },
    policy: {
      label: "Policy and public affairs",
      strap: "Focus on misinformation, compliance, and institutional response.",
      headline: "Synthetic media remains the common factor across the highest-friction narratives.",
      overview:
        "The strongest common thread is not ideology but format: cheap synthetic assets are being attached to existing public anxieties to accelerate spread and confuse verification.",
      priorities: [
        "Document evidence chains for the cloned-audio and healthcare narratives.",
        "Note where platform response times are materially affecting the harm curve.",
        "Capture examples suitable for future training and committee evidence."
      ],
      watchouts: [
        "The most dangerous claims may appear mundane rather than overtly sensational.",
        "Cross-platform migration is becoming the key indicator that a narrative is maturing."
      ],
      recommendations: [
        "Treat the highest-risk items as scenario-planning inputs, not just monitoring outputs.",
        "Update escalation thresholds for narratives combining scam, safety, and public-interest angles.",
        "Use a common taxonomy so policy, comms, and research teams are describing the same threat."
      ]
    },
    risk: {
      label: "Risk and resilience",
      strap: "Focus on thresholds, controls, and operational readiness.",
      headline: "The live risk picture is concentrated, but the escalation paths are clear.",
      overview:
        "Current signal mix suggests one priority incident, two elevated watch items, and one positive opportunity. The control gap remains speed of cross-functional alignment, not lack of data.",
      priorities: [
        "Treat the banking signal as an incident candidate with defined owners.",
        "Set review points for the election-integrity and healthcare threads.",
        "Use the low-risk technology narrative as a benchmark for positive anomaly detection."
      ],
      watchouts: [
        "Human review bandwidth remains the main failure point once multiple narratives spike together.",
        "Without source labelling, teams may act on volume before understanding provenance."
      ],
      recommendations: [
        "Adopt a simple high/watch/low decision matrix across watchlists.",
        "Tie each morning brief to named actions and next checkpoints.",
        "Refresh war-room drills against synthetic-media scenarios, not just organic backlash."
      ]
    }
  }
};
