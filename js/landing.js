document.addEventListener('DOMContentLoaded', () => {
  renderFilters();
  renderStreamClusters();
  renderExecutiveIndicators();
  renderDataFreshness();
  renderMilestones();
  renderStreamReadiness();
  renderCommitteeActions();
  renderPrerequisiteReadiness();
  renderEntityPerformance();
  renderModuleCards();
  initQuickNav();
  initAssistantChat();
  // Lock panel heights then animate bars/numbers on initial load
  requestAnimationFrame(() => {
    lockIntelPanelHeights();
    animateIntelPanels();
  });

  // Wire Executive Overview button
  const execBtn = document.querySelector('.hero-exec-btn');
  if (execBtn) {
    execBtn.addEventListener('click', function() {
      window.location.href = 'executive-overview.html';
    });
  }
});

const STATUS_COLORS = {
  'Ready': 'var(--status-ready)',
  'On Track': 'var(--status-on-track)',
  'Conditional': 'var(--status-conditional)',
  'At Risk': 'var(--status-at-risk)',
  'Blocked': 'var(--status-blocked)',
  'Not Assessed': 'var(--status-not-assessed)',
  'Delayed': 'var(--status-at-risk)',
  'Overdue': 'var(--status-at-risk)',
  'Pending': 'var(--status-conditional)',
  'In Progress': 'var(--status-in-progress)'
};

const STATUS_BG = {
  'On Track': 'rgba(0,196,140,0.12)',
  'Ready': 'rgba(0,196,140,0.12)',
  'Conditional': 'rgba(255,170,0,0.12)',
  'At Risk': 'rgba(255,92,92,0.12)',
  'Blocked': 'rgba(230,57,70,0.12)',
  'Not Assessed': 'rgba(92,92,112,0.12)'
};

function color(status) { return STATUS_COLORS[status] || 'var(--text-tertiary)'; }

function renderFilters() {
  const el = document.getElementById('header-filters');
  const defs = [
    { key: 'majorDevelopment', label: 'Major Development' },
    { key: 'ksiaArea', label: 'KSIA Area' },
    { key: 'infrastructureStream', label: 'Infrastructure Stream' },
    { key: 'externalEntity', label: 'External Entity' },
    { key: 'timePeriod', label: 'Time Horizon' }
  ];
  defs.forEach(d => {
    const sel = document.createElement('select');
    sel.className = 'header-filter';
    sel.title = d.label;
    sel.setAttribute('aria-label', d.label);
    KSIA_DATA.filters[d.key].forEach(o => {
      const opt = document.createElement('option');
      opt.textContent = o;
      sel.appendChild(opt);
    });
    el.appendChild(sel);
  });
}

function renderDataFreshness() {
  const section = document.querySelector('.hero').parentElement;
  const div = document.createElement('div');
  div.className = 'data-freshness';
  div.setAttribute('aria-label', 'Data last updated');
  div.innerHTML = '<span class="freshness-dot" aria-hidden="true"></span> Data as of 27 Aug 2026, 09:15 AST &middot; Illustrative data';
  section.insertBefore(div, section.firstChild);
}

function renderExecutiveIndicators() {
  const d = KSIA_DATA.executive;
  const el = document.getElementById('exec-dashboard');
  const circ = 2 * Math.PI * 34;
  const gc = d.overallReadiness >= 80 ? 'var(--status-ready)' : d.overallReadiness >= 60 ? 'var(--status-conditional)' : 'var(--status-at-risk)';

  // Asset ticks
  const assetTicks = Array.from({ length: d.totalAssets }, (_, i) => {
    if (i < d.assetsEnabled) return 'var(--status-ready)';
    if (i < d.assetsEnabled + d.assetsAtRisk) return 'var(--status-conditional)';
    return 'var(--status-blocked)';
  });

  // Project bar
  const projTotal = (d.projectsNotStarted || 0) + d.projectsCompleted + d.projectsOnTrack + d.projectsAtRisk + d.projectsDelayed;
  const projSegs = [
    { pct: (d.projectsNotStarted || 0) / projTotal * 100, color: '#C0C0D0' },
    { pct: d.projectsCompleted / projTotal * 100, color: '#4DA6FF' },
    { pct: d.projectsOnTrack / projTotal * 100, color: 'var(--status-ready)' },
    { pct: d.projectsAtRisk / projTotal * 100, color: 'var(--status-conditional)' },
    { pct: d.projectsDelayed / projTotal * 100, color: 'var(--status-at-risk)' },
  ];

  // Committee ring helper
  function miniRing(value, total, color, size) {
    const r = (size - 4) / 2, c = 2 * Math.PI * r;
    const pct = total > 0 ? value / total : 0;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="2.5"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" style="transform:rotate(-90deg);transform-origin:center"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" fill="var(--text-dark)" font-size="11" font-weight="800">${value}</text>
    </svg>`;
  }

  // Card icons
  const icons = {
    readiness: '<svg viewBox="0 0 20 20" fill="none" stroke="var(--status-conditional)" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5" stroke-linecap="round"/></svg>',
    assets: '<svg viewBox="0 0 20 20" fill="none" stroke="var(--status-ready)" stroke-width="1.5"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M7 5V3a3 3 0 016 0v2"/><path d="M10 10v3" stroke-linecap="round"/></svg>',
    funding: '<svg viewBox="0 0 20 20" fill="none" stroke="var(--status-conditional)" stroke-width="1.5"><path d="M10 2v16M6 5h5.5a2.5 2.5 0 010 5H7M7 10h6a2.5 2.5 0 010 5H6"/></svg>',
    land: '<svg viewBox="0 0 20 20" fill="none" stroke="var(--status-ready)" stroke-width="1.5"><path d="M2 18l5-7 4 3 3-5 4 9"/><path d="M15 4l-3 3M15 4h-3M15 4v3"/></svg>',
    committee: '<svg viewBox="0 0 20 20" fill="none" stroke="#4DA6FF" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="4" cy="8" r="2"/><circle cx="16" cy="8" r="2"/></svg>',
    assistant: '<svg viewBox="0 0 20 20" fill="none" stroke="var(--ey-yellow)" stroke-width="1.5"><path d="M10 2L2 6l8 4 8-4-8-4z"/><path d="M2 14l8 4 8-4M2 10l8 4 8-4"/></svg>',
  };

  el.innerHTML = `
    <div class="ed-grid">
      <!-- 1. Readiness & Projects -->
      <div class="ed-card">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.readiness}</span>
          <span class="ed-card-title">Readiness & Projects</span>
        </div>
        <div class="ed-rp-top">
          <div class="ed-gauge" aria-label="Overall readiness: ${d.overallReadiness} percent">
            <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
              <circle cx="38" cy="38" r="34" fill="none" stroke="#E8E8F0" stroke-width="5"/>
              <circle cx="38" cy="38" r="34" fill="none" stroke="${gc}" stroke-width="5" stroke-linecap="round"
                stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - d.overallReadiness / 100)}"
                style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)"/>
            </svg>
            <div class="ed-gauge-val"><span class="ed-gauge-num" data-count="${d.overallReadiness}">${d.overallReadiness}</span><span class="ed-gauge-pct">%</span></div>
          </div>
          <div class="ed-rp-meta">
            <div class="ed-delta ed-delta-up">
              <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true"><polygon points="5,1 9,7 1,7" fill="var(--status-ready)"/></svg>
              ${d.readinessDelta} pp
            </div>
            <div class="ed-meta-sub">vs. ${d.readinessPrevLabel} (${d.readinessPrev}%)</div>
          </div>
        </div>
        <div class="ed-rp-divider"></div>
        <div class="ed-seg-bar">${projSegs.map(s => `<div class="ed-seg" style="width:${s.pct}%;background:${s.color}"></div>`).join('')}</div>
        <div class="ed-proj-legend">
          <span class="ed-leg-item"><span class="ed-leg-dot" style="background:#C0C0D0"></span>Not started <strong>${d.projectsNotStarted || 0}</strong></span>
          <span class="ed-leg-item"><span class="ed-leg-dot" style="background:#4DA6FF"></span>Completed <strong>${d.projectsCompleted}</strong></span>
          <span class="ed-leg-item"><span class="ed-leg-dot" style="background:var(--status-ready)"></span>On track <strong>${d.projectsOnTrack}</strong></span>
          <span class="ed-leg-item"><span class="ed-leg-dot" style="background:var(--status-conditional)"></span>At risk <strong>${d.projectsAtRisk}</strong></span>
          <span class="ed-leg-item"><span class="ed-leg-dot" style="background:var(--status-at-risk)"></span>Delayed <strong>${d.projectsDelayed}</strong></span>
        </div>
      </div>

      <!-- 2. Asset Enablement -->
      <div class="ed-card">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.assets}</span>
          <span class="ed-card-title">Asset Enablement</span>
          <span class="ed-card-badge">${d.totalAssets} Assets</span>
        </div>
        <div class="ed-ae-list">
          <div class="ed-ae-row">
            <div class="ed-ae-ring">
              ${miniRing(d.assetsEnabled, d.totalAssets, 'var(--status-ready)', 38)}
              <div class="ed-ae-ring-icon"><svg viewBox="0 0 16 16" fill="none" stroke="var(--status-ready)" stroke-width="2" stroke-linecap="round"><polyline points="4 8.5 7 11.5 12 5"/></svg></div>
            </div>
            <div class="ed-ae-info"><span class="ed-ae-label">Enabled</span><span class="ed-ae-sub">Fully operational</span></div>
            <div class="ed-ae-frac"><span class="ed-ae-num" data-count="${d.assetsEnabled}">${d.assetsEnabled}</span><span class="ed-ae-den">/${d.totalAssets}</span></div>
          </div>
          <div class="ed-ae-row">
            <div class="ed-ae-ring">
              ${miniRing(d.assetsAtRisk, d.totalAssets, 'var(--status-conditional)', 38)}
              <div class="ed-ae-ring-icon"><svg viewBox="0 0 16 16" fill="none" stroke="var(--status-conditional)" stroke-width="2" stroke-linecap="round"><path d="M8 5v4"/><circle cx="8" cy="11.5" r="0.5" fill="var(--status-conditional)"/></svg></div>
            </div>
            <div class="ed-ae-info"><span class="ed-ae-label">At Risk</span><span class="ed-ae-sub">Prerequisites pending</span></div>
            <div class="ed-ae-frac"><span class="ed-ae-num" data-count="${d.assetsAtRisk}">${d.assetsAtRisk}</span><span class="ed-ae-den">/${d.totalAssets}</span></div>
          </div>
          <div class="ed-ae-row">
            <div class="ed-ae-ring">
              ${miniRing(d.assetsBlocked, d.totalAssets, 'var(--status-blocked)', 38)}
              <div class="ed-ae-ring-icon"><svg viewBox="0 0 16 16" fill="none" stroke="var(--status-blocked)" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="5"/><path d="M5.5 5.5l5 5"/></svg></div>
            </div>
            <div class="ed-ae-info"><span class="ed-ae-label">Blocked</span><span class="ed-ae-sub">Critical impediment</span></div>
            <div class="ed-ae-frac"><span class="ed-ae-num" data-count="${d.assetsBlocked}">${d.assetsBlocked}</span><span class="ed-ae-den">/${d.totalAssets}</span></div>
          </div>
        </div>
      </div>

      <!-- 3. Funding & Budget -->
      <div class="ed-card">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.funding}</span>
          <span class="ed-card-title">Funding & Budget</span>
        </div>
        <div class="ed-fb-rows">
          <div class="ed-fb-line">
            <div class="ed-fb-line-head">
              <span class="ed-fb-line-label">Allocated</span>
              <span class="ed-fb-line-val"><span data-count="${d.budgetAllocated}" data-suffix=" Bn">${d.budgetAllocated}</span> <small>Bn</small></span>
            </div>
            <div class="ed-fb-line-bar">
              <div class="ed-fb-line-fill" data-target-width="${Math.round(d.budgetAllocated / d.fundingTotalReq * 100)}%" style="width:${Math.round(d.budgetAllocated / d.fundingTotalReq * 100)}%;background:var(--status-ready)">
                <span class="ed-fb-fill-lbl">${Math.round(d.budgetAllocated / d.fundingTotalReq * 100)}%</span>
              </div>
              <span class="ed-fb-bar-rest">Approved envelope</span>
            </div>
          </div>
          <div class="ed-fb-line">
            <div class="ed-fb-line-head">
              <span class="ed-fb-line-label">Spent</span>
              <span class="ed-fb-line-val"><span data-count="${d.budgetSpentAmt}">${d.budgetSpentAmt}</span> <small>Bn</small></span>
            </div>
            <div class="ed-fb-line-bar">
              <div class="ed-fb-line-fill" data-target-width="${Math.round(d.budgetSpentAmt / d.fundingTotalReq * 100)}%" style="width:${Math.round(d.budgetSpentAmt / d.fundingTotalReq * 100)}%;background:#4DA6FF">
                <span class="ed-fb-fill-lbl">${d.budgetSpentPct}%</span>
              </div>
              <span class="ed-fb-bar-rest">${d.budgetSpentPct}% of allocated drawn</span>
            </div>
          </div>
          <div class="ed-fb-line ed-fb-line-gap">
            <div class="ed-fb-line-head">
              <span class="ed-fb-line-label">Funding Gap</span>
              <span class="ed-fb-line-val ed-c-amber"><span data-count="${d.fundingGap}">${d.fundingGap}</span> <small>Bn</small></span>
            </div>
            <div class="ed-fb-line-bar">
              <div class="ed-fb-line-fill" data-target-width="${d.fundingGapPct}%" style="width:${d.fundingGapPct}%;background:var(--status-conditional)">
                <span class="ed-fb-fill-lbl">${d.fundingGapPct}%</span>
              </div>
              <span class="ed-fb-bar-rest">${d.fundingGapPct}% unfunded</span>
            </div>
            <div class="ed-fb-gap-sub">${d.fundingGapPct}% of total budget SAR ${d.fundingTotalReq} Bn</div>
          </div>
        </div>
      </div>

      <!-- 4. Land Acquisition -->
      <div class="ed-card">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.land}</span>
          <span class="ed-card-title">Land Acquisition</span>
          <span class="ed-card-badge">Parcels</span>
        </div>
        <div class="ed-land-hero">
          <span class="ed-land-val" data-count="${d.landAcquired}">${d.landAcquired}</span>
          <span class="ed-land-of">of ${d.landTotalParcels.toLocaleString()}</span>
          <span class="ed-land-pct">${d.landPct}%</span>
        </div>
        <div class="ed-land-bar">
          <div class="ed-land-fill" data-target-width="${d.landPct}%" style="width:${d.landPct}%"><span class="ed-land-fill-label">Acquired</span></div>
          <div class="ed-land-remaining"><span>Remaining ${(d.landTotalParcels - d.landAcquired).toLocaleString()}</span></div>
        </div>
        <p class="ed-narrative">${d.landNarrative}</p>
      </div>

      <!-- 5. Committee & Decisions -->
      <div class="ed-card">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.committee}</span>
          <span class="ed-card-title">Committee & Decisions</span>
        </div>
        <div class="ed-comm-rings">
          <div class="ed-comm-ring-item">
            ${miniRing(d.committeePending, d.committeeTotal, '#B0B0C4', 40)}
            <span class="ed-comm-ring-lbl">Pending</span>
          </div>
          <div class="ed-comm-ring-item">
            ${miniRing(d.committeeWIP, d.committeeTotal, 'var(--status-ready)', 40)}
            <span class="ed-comm-ring-lbl">In Progress</span>
          </div>
          <div class="ed-comm-ring-item">
            ${miniRing(d.committeeCompleted, d.committeeTotal, '#4DA6FF', 40)}
            <span class="ed-comm-ring-lbl">Completed</span>
          </div>
        </div>
        <div class="ed-comm-facts">
          <div class="ed-comm-fact">
            <span class="ed-comm-fact-val" data-count="${d.committeeTotal}">${d.committeeTotal}</span>
            <span class="ed-comm-fact-lbl">Total # of decisions</span>
          </div>
          <div class="ed-comm-fact">
            <span class="ed-comm-fact-val ed-c-red" data-count="${d.overdueActions}">${d.overdueActions}</span>
            <span class="ed-comm-fact-lbl">Overdue actions</span>
          </div>
          <div class="ed-comm-fact">
            <span class="ed-comm-fact-val ed-c-amber" data-count="${d.criticalDecisions}">${d.criticalDecisions}</span>
            <span class="ed-comm-fact-lbl">Awaiting escalation</span>
          </div>
        </div>
        <div class="ed-comm-next">Next Committee: <strong>${d.nextCommitteeDate}</strong></div>
      </div>

      <!-- 6. Ask KSIA Assistant -->
      <div class="ed-card ed-assistant">
        <div class="ed-card-head">
          <span class="ed-card-icon" aria-hidden="true">${icons.assistant}</span>
          <span class="ed-card-title">Ask KSIA Assistant</span>
        </div>
        <div class="ed-asst-chat" id="assistant-chat">
          <div class="ed-asst-msg ed-asst-ai">
            <div class="ed-asst-bubble ed-asst-bubble-ai">Welcome. How can I help you today?</div>
          </div>
        </div>
        <div class="ed-asst-input-row">
          <input class="ed-asst-input" type="text" placeholder="Ask about readiness, funding..." aria-label="Ask KSIA Assistant a question">
          <button class="ed-asst-send" aria-label="Send question">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

const MILESTONE_ICONS = {
  'Cargo Village': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3M12 11v6M9 14h6"/></svg>',
  'Central Runways': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20V10l8-6 8 6v10"/><path d="M9 20v-5h6v5"/></svg>',
  'Private Aviation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L2 9l7 3 4 7 9-17z"/></svg>',
  'East Runways': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4M8 20l8-12M12 20l4-6"/></svg>',
  'West Runways': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4M8 20l8-12M12 20l4-6"/></svg>',
  'T1-T4': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M8 6V2M16 6V2"/></svg>',
  'Terminal 6': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M8 6V2M16 6V2"/></svg>',
  'Terminal 5': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h4"/><circle cx="17" cy="17" r="3"/></svg>',
  'Iconic Terminal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,20 2,20"/><path d="M12 8v6M12 17h.01"/></svg>'
};

// Per-milestone intel panel data — filters the 4 dark panels when a milestone is clicked
const MILESTONE_INTEL = {
  'Private Aviation': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 85, status: 'Ready' },
      { stream: 'Power & Energy', readiness: 80, status: 'Conditional' },
      { stream: 'Potable Water', readiness: 90, status: 'Ready' },
      { stream: 'Wastewater', readiness: 88, status: 'Ready' },
      { stream: 'District Cooling', readiness: 72, status: 'Conditional' },
      { stream: 'Digital & Telecom', readiness: 92, status: 'Ready' },
    ],
    committeeActions: [
      { action: 'Confirm PAD road access from Ring Road R-04', severity: 'High', due: '20 Dec 2025', status: 'In Progress' },
      { action: 'Approve private terminal power allocation', severity: 'Medium', due: '15 Jan 2026', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 92, total: 100 },
      { category: 'Land Acquisition', secured: 100, total: 100 },
      { category: 'Permits & Approvals', secured: 85, total: 100 },
      { category: 'Procurement', secured: 78, total: 100 },
    ],
    entityPerformance: [
      { entity: 'SEC', projects: 2, onTrack: 2, atRisk: 0, delayed: 0 },
      { entity: 'RCRC', projects: 1, onTrack: 1, atRisk: 0, delayed: 0 },
      { entity: 'NWC', projects: 1, onTrack: 1, atRisk: 0, delayed: 0 },
    ]
  },
  'Central Runways': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 82, status: 'Conditional' },
      { stream: 'Power & Energy', readiness: 75, status: 'Conditional' },
      { stream: 'Stormwater & Drainage', readiness: 68, status: 'Conditional' },
      { stream: 'Digital & Telecom', readiness: 88, status: 'Ready' },
      { stream: 'Waste & Environmental', readiness: 70, status: 'Conditional' },
    ],
    committeeActions: [
      { action: 'Approve runway lighting power feed from substation P-03', severity: 'High', due: '10 Mar 2026', status: 'Pending' },
      { action: 'Confirm stormwater drainage capacity for RW apron', severity: 'Medium', due: '01 Apr 2026', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 88, total: 100 },
      { category: 'Land Acquisition', secured: 95, total: 100 },
      { category: 'Permits & Approvals', secured: 72, total: 100 },
      { category: 'Procurement', secured: 80, total: 100 },
    ],
    entityPerformance: [
      { entity: 'RCRC', projects: 3, onTrack: 2, atRisk: 1, delayed: 0 },
      { entity: 'SEC', projects: 2, onTrack: 2, atRisk: 0, delayed: 0 },
      { entity: 'MOT', projects: 2, onTrack: 1, atRisk: 1, delayed: 0 },
    ]
  },
  'Terminal 6': {
    streamReadiness: [
      { stream: 'Potable Water', readiness: 38, status: 'At Risk' },
      { stream: 'Wastewater', readiness: 52, status: 'At Risk' },
      { stream: 'Power & Energy', readiness: 60, status: 'At Risk' },
      { stream: 'District Cooling', readiness: 42, status: 'At Risk' },
      { stream: 'Mobility & Roads', readiness: 65, status: 'Conditional' },
      { stream: 'Digital & Telecom', readiness: 72, status: 'Conditional' },
      { stream: 'Stormwater & Drainage', readiness: 55, status: 'At Risk' },
    ],
    committeeActions: [
      { action: 'Approve interim water treatment solution for Terminal 6', severity: 'Critical', due: '15 Jan 2026', status: 'Pending' },
      { action: 'Expedite NWC pipeline W-07 acceleration', severity: 'Critical', due: '28 Jan 2026', status: 'Overdue' },
      { action: 'Review district cooling capacity shortfall', severity: 'High', due: '10 Feb 2026', status: 'Pending' },
      { action: 'Approve power substation P-07 funding', severity: 'High', due: '15 Feb 2026', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 45, total: 100 },
      { category: 'Land Acquisition', secured: 32, total: 100 },
      { category: 'Permits & Approvals', secured: 40, total: 100 },
      { category: 'Procurement', secured: 55, total: 100 },
      { category: 'Utility Corridors / ROW', secured: 28, total: 100 },
      { category: 'Entity Commitments', secured: 50, total: 100 },
    ],
    entityPerformance: [
      { entity: 'NWC', projects: 4, onTrack: 1, atRisk: 2, delayed: 1 },
      { entity: 'SEC', projects: 3, onTrack: 1, atRisk: 1, delayed: 1 },
      { entity: 'RCRC', projects: 2, onTrack: 1, atRisk: 1, delayed: 0 },
      { entity: 'SWA', projects: 2, onTrack: 0, atRisk: 1, delayed: 1 },
    ]
  },
  'Terminal 5': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 72, status: 'Conditional' },
      { stream: 'District Cooling', readiness: 48, status: 'At Risk' },
      { stream: 'Power & Energy', readiness: 65, status: 'Conditional' },
      { stream: 'Potable Water', readiness: 58, status: 'At Risk' },
      { stream: 'Digital & Telecom', readiness: 78, status: 'Conditional' },
    ],
    committeeActions: [
      { action: 'Review district cooling capacity for Airport City', severity: 'High', due: '15 Feb 2026', status: 'Pending' },
      { action: 'Confirm SEC power allocation for AC Phase 1', severity: 'Medium', due: '01 Mar 2026', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 60, total: 100 },
      { category: 'Land Acquisition', secured: 55, total: 100 },
      { category: 'Permits & Approvals', secured: 50, total: 100 },
      { category: 'Procurement', secured: 45, total: 100 },
    ],
    entityPerformance: [
      { entity: 'RCRC', projects: 3, onTrack: 2, atRisk: 1, delayed: 0 },
      { entity: 'SEC', projects: 2, onTrack: 1, atRisk: 1, delayed: 0 },
      { entity: 'NWC', projects: 2, onTrack: 1, atRisk: 0, delayed: 1 },
    ]
  },
  'West Runways': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 80, status: 'Conditional' },
      { stream: 'Power & Energy', readiness: 76, status: 'Conditional' },
      { stream: 'Stormwater & Drainage', readiness: 82, status: 'Ready' },
      { stream: 'Digital & Telecom', readiness: 85, status: 'Ready' },
    ],
    committeeActions: [
      { action: 'Confirm land corridor for taxiway extension', severity: 'Medium', due: '15 Jun 2028', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 75, total: 100 },
      { category: 'Land Acquisition', secured: 70, total: 100 },
      { category: 'Permits & Approvals', secured: 68, total: 100 },
      { category: 'Procurement', secured: 60, total: 100 },
    ],
    entityPerformance: [
      { entity: 'RCRC', projects: 2, onTrack: 2, atRisk: 0, delayed: 0 },
      { entity: 'SEC', projects: 1, onTrack: 1, atRisk: 0, delayed: 0 },
    ]
  },
  'Cargo Village': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 68, status: 'Conditional' },
      { stream: 'Power & Energy', readiness: 58, status: 'At Risk' },
      { stream: 'Potable Water', readiness: 65, status: 'Conditional' },
      { stream: 'Waste & Environmental', readiness: 50, status: 'At Risk' },
    ],
    committeeActions: [
      { action: 'Approve cargo access road R-18 funding', severity: 'High', due: '01 Sep 2028', status: 'Pending' },
      { action: 'Confirm waste management facility timeline', severity: 'Medium', due: '15 Oct 2028', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 55, total: 100 },
      { category: 'Land Acquisition', secured: 62, total: 100 },
      { category: 'Permits & Approvals', secured: 48, total: 100 },
      { category: 'Procurement', secured: 40, total: 100 },
    ],
    entityPerformance: [
      { entity: 'RCRC', projects: 3, onTrack: 1, atRisk: 1, delayed: 1 },
      { entity: 'MOT', projects: 2, onTrack: 1, atRisk: 1, delayed: 0 },
    ]
  },
  'Iconic Terminal': {
    streamReadiness: [
      { stream: 'Mobility & Roads', readiness: 35, status: 'At Risk' },
      { stream: 'Public Transport', readiness: 20, status: 'Blocked' },
      { stream: 'Potable Water', readiness: 30, status: 'At Risk' },
      { stream: 'Power & Energy', readiness: 28, status: 'Blocked' },
      { stream: 'District Cooling', readiness: 15, status: 'Blocked' },
      { stream: 'Digital & Telecom', readiness: 40, status: 'At Risk' },
    ],
    committeeActions: [
      { action: 'Initiate public transport corridor feasibility study', severity: 'Critical', due: '01 Jun 2028', status: 'Pending' },
      { action: 'Confirm mega-substation land allocation', severity: 'Critical', due: '01 Sep 2028', status: 'Pending' },
      { action: 'Review district cooling master plan for Iconic Terminal zone', severity: 'High', due: '15 Dec 2028', status: 'Pending' },
    ],
    prerequisiteReadiness: [
      { category: 'Funding', secured: 22, total: 100 },
      { category: 'Land Acquisition', secured: 18, total: 100 },
      { category: 'Permits & Approvals', secured: 15, total: 100 },
      { category: 'Procurement', secured: 10, total: 100 },
      { category: 'Utility Corridors / ROW', secured: 8, total: 100 },
      { category: 'Entity Commitments', secured: 25, total: 100 },
    ],
    entityPerformance: [
      { entity: 'RCRC', projects: 5, onTrack: 1, atRisk: 2, delayed: 2 },
      { entity: 'NWC', projects: 3, onTrack: 0, atRisk: 2, delayed: 1 },
      { entity: 'SEC', projects: 3, onTrack: 0, atRisk: 1, delayed: 2 },
      { entity: 'CST', projects: 2, onTrack: 0, atRisk: 1, delayed: 1 },
    ]
  }
};

// Store original intel panel data for "all" reset
const ORIGINAL_INTEL = {
  streamReadiness: KSIA_DATA.streamReadiness,
  committeeActions: KSIA_DATA.committeeActions,
  prerequisiteReadiness: KSIA_DATA.prerequisiteReadiness,
  entityPerformance: KSIA_DATA.entityPerformance
};

let activeMilestone = null;

function selectMilestone(assetName, btn) {
  // Update active state
  document.querySelectorAll('.tl-item').forEach(item => item.classList.remove('tl-active'));

  if (activeMilestone === assetName) {
    // Deselect — back to all
    activeMilestone = null;
    KSIA_DATA.streamReadiness = ORIGINAL_INTEL.streamReadiness;
    KSIA_DATA.committeeActions = ORIGINAL_INTEL.committeeActions;
    KSIA_DATA.prerequisiteReadiness = ORIGINAL_INTEL.prerequisiteReadiness;
    KSIA_DATA.entityPerformance = ORIGINAL_INTEL.entityPerformance;
  } else {
    activeMilestone = assetName;
    btn.classList.add('tl-active');
    const data = MILESTONE_INTEL[assetName];
    if (data) {
      KSIA_DATA.streamReadiness = data.streamReadiness;
      KSIA_DATA.committeeActions = data.committeeActions;
      KSIA_DATA.prerequisiteReadiness = data.prerequisiteReadiness;
      KSIA_DATA.entityPerformance = data.entityPerformance;
    }
  }

  // Animate the intel-grid panels
  const intelGrid = document.querySelector('.intel-grid');
  intelGrid.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  intelGrid.style.opacity = '0';
  intelGrid.style.transform = 'translateY(8px)';
  setTimeout(() => {
    // Clear and re-render all 4 panels
    document.getElementById('stream-readiness').innerHTML = '';
    document.getElementById('committee-actions').innerHTML = '';
    document.getElementById('prereq-readiness').innerHTML = '';
    document.getElementById('entity-bars').innerHTML = '';
    renderStreamReadiness();
    renderCommitteeActions();
    renderPrerequisiteReadiness();
    renderEntityPerformance();
    // Update committee count badge
    const countEl = document.getElementById('committee-count');
    if (countEl) countEl.textContent = KSIA_DATA.committeeActions.length + ' pending';

    intelGrid.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    intelGrid.style.opacity = '1';
    intelGrid.style.transform = 'translateY(0)';

    // Animate bars and numbers after fade-in
    animateIntelPanels();
  }, 200);
}

// Lock panel heights after first render so they don't shrink
function lockIntelPanelHeights() {
  document.querySelectorAll('.intel-panel').forEach(panel => {
    panel.style.minHeight = panel.offsetHeight + 'px';
  });
}

// Animate progress bars from 0→target and entity numbers from 0→target
function animateIntelPanels() {
  // Stream readiness gauges (ring strokes)
  document.querySelectorAll('#stream-readiness [data-target-offset]').forEach(circle => {
    const targetOffset = parseFloat(circle.getAttribute('data-target-offset'));
    const circ = parseFloat(circle.getAttribute('stroke-dasharray'));
    circle.style.transition = 'none';
    circle.setAttribute('stroke-dashoffset', circ);
    requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)';
      circle.setAttribute('stroke-dashoffset', targetOffset);
    });
  });
  // Stream readiness percentage numbers
  document.querySelectorAll('#stream-readiness .stream-pct').forEach(el => {
    const target = parseInt(el.textContent);
    animateNumber(el, 0, target, '%');
  });

  // Prerequisite bars
  document.querySelectorAll('#prereq-readiness .prereq-fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    bar.style.transition = 'none';
    requestAnimationFrame(() => {
      bar.style.transition = 'width 0.7s cubic-bezier(0.16,1,0.3,1)';
      bar.style.width = target;
    });
  });
  // Prerequisite percentage numbers
  document.querySelectorAll('#prereq-readiness .prereq-pct').forEach(el => {
    const target = parseInt(el.textContent);
    animateNumber(el, 0, target, '%');
  });

  // Entity bar segments animate via CSS transition (width set inline)
}

function animateNumber(el, from, to, suffix) {
  const duration = 600;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = Math.round(from + (to - from) * ease);
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderMilestones() {
  const el = document.getElementById('milestones-track');
  const maxVisible = 7;
  const visible = KSIA_DATA.milestones.slice(0, maxVisible);
  const remaining = KSIA_DATA.milestones.length - maxVisible;

  visible.forEach(m => {
    const icon = MILESTONE_ICONS[m.asset] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>';
    const div = document.createElement('div');
    div.className = 'tl-item';
    div.setAttribute('role', 'listitem');
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <div class="tl-icon" data-s="${m.status}">${icon}</div>
      <div class="tl-card"><div class="tl-date">${m.date}</div><div class="tl-name">${m.asset}</div><span class="tl-badge" style="background:${STATUS_BG[m.status] || 'rgba(92,92,112,0.12)'};color:${color(m.status)}">${m.status}</span></div>`;
    div.addEventListener('click', () => selectMilestone(m.asset, div));
    el.appendChild(div);
  });

  if (remaining > 0) {
    const more = document.createElement('div');
    more.className = 'tl-more';
    more.setAttribute('title', `${remaining} more milestone${remaining > 1 ? 's' : ''}`);
    more.innerHTML = `<div class="tl-more-dots"><span></span><span></span><span></span></div><div class="tl-more-label">+${remaining} more</div>`;
    el.appendChild(more);
  }
}

const STREAM_ICONS = {
  'Mobility & Roads': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 18h14M3 12h18M7 6h10M12 2v4"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>',
  'Public Transport': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 10h16M9 17v3M15 17v3"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="16" cy="13" r="1" fill="currentColor"/></svg>',
  'Potable Water': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2c0 0-8 9.5-8 14a8 8 0 0016 0C20 11.5 12 2 12 2z"/></svg>',
  'Wastewater': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20h18M5 16c2-2 4 0 6-2s4 0 6-2"/><path d="M5 12c2-2 4 0 6-2s4 0 6-2"/><path d="M7 4v4M12 2v6M17 4v4"/></svg>',
  'Power & Energy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  'District Cooling': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"/><circle cx="12" cy="12" r="3"/></svg>',
  'Digital & Telecom': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6"/><path d="M12 6v8M9 9l3 3 3-3"/></svg>',
  'Stormwater & Drainage': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M16 13a4 4 0 11-8 0c0-4 4-8 4-8s4 4 4 8z"/><path d="M12 17v4M9 19h6"/></svg>',
  'Waste & Environmental': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/><path d="M10 11v6M14 11v6"/></svg>',
  'Natural Gas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-7l1-1 1 1.5c1 1.5 2 1 2-.5 3 2 5 4 5 7 0 4-3 7-6 7z"/></svg>',
};

function renderStreamReadiness() {
  const el = document.getElementById('stream-readiness');
  el.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'sr-grid';
  KSIA_DATA.streamReadiness.forEach(s => {
    const c = color(s.status);
    const bg = STATUS_BG[s.status] || 'rgba(92,92,112,0.12)';
    const icon = STREAM_ICONS[s.stream] || '';
    const r = 15, circ = 2 * Math.PI * r;
    const offset = circ * (1 - s.readiness / 100);
    const div = document.createElement('div');
    div.className = 'sr-cell';
    div.innerHTML = `
      <div class="sr-gauge">
        <svg viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
          <circle cx="19" cy="19" r="${r}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}" data-target-offset="${offset}"
            style="transform:rotate(-90deg);transform-origin:center"/>
        </svg>
        <div class="sr-gauge-icon">${icon}</div>
      </div>
      <div class="sr-meta">
        <div class="sr-name" title="${s.stream}">${s.stream}</div>
        <div class="sr-val stream-pct" style="color:${c}">${s.readiness}%</div>
      </div>`;
    grid.appendChild(div);
  });
  el.appendChild(grid);
}

function renderCommitteeActions() {
  const el = document.getElementById('committee-actions');
  KSIA_DATA.committeeActions.slice(0, 4).forEach(a => {
    const div = document.createElement('div');
    div.className = 'action-item';
    div.innerHTML = `
      <span class="action-dot ${a.severity}" aria-hidden="true"></span>
      <div class="action-body">
        <div class="action-text">${a.action}</div>
        <div class="action-meta">
          <span class="action-tag severity-${a.severity}">${a.severity}</span>
          <span class="action-due">${a.due}</span>
        </div>
      </div>`;
    el.appendChild(div);
  });
}

const PREREQ_ICONS = {
  'Funding': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M6 6h7a3 3 0 010 6H7M7 12h6.5a3 3 0 010 6H6"/></svg>',
  'Land Acquisition': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 21h18M5 21V10l7-7 7 7v11"/><rect x="9" y="14" width="6" height="7"/></svg>',
  'Permits & Approvals': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 12l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/></svg>',
  'Procurement': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>',
  'Utility Corridors / ROW': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20L20 4M4 4l16 16"/><circle cx="12" cy="12" r="3"/></svg>',
  'Entity Commitments': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0112 0v2"/></svg>',
};

function renderPrerequisiteReadiness() {
  const el = document.getElementById('prereq-readiness');
  el.innerHTML = '';
  KSIA_DATA.prerequisiteReadiness.forEach(p => {
    const c = p.secured >= 70 ? 'var(--status-ready)' : p.secured >= 50 ? 'var(--status-conditional)' : 'var(--status-at-risk)';
    const cHex = p.secured >= 70 ? '#00C48C' : p.secured >= 50 ? '#FFAA00' : '#FF5C5C';
    const bg = p.secured >= 70 ? 'rgba(0,196,140,0.12)' : p.secured >= 50 ? 'rgba(255,170,0,0.12)' : 'rgba(255,92,92,0.12)';
    const status = p.secured >= 70 ? 'Ready' : p.secured >= 50 ? 'Conditional' : 'At Risk';
    const icon = PREREQ_ICONS[p.category] || '';
    const div = document.createElement('div');
    div.className = 'pr-row';
    div.innerHTML = `
      <div class="pr-icon">${icon}</div>
      <div class="pr-info">
        <div class="pr-top">
          <span class="pr-name">${p.category}</span>
        </div>
        <div class="pr-bar">
          <div class="prereq-fill" style="width:${p.secured}%;background:${c}"></div>
          <span class="pr-bar-label">${status}</span>
          <span class="pr-bar-pct">${p.secured}%</span>
        </div>
      </div>`;
    el.appendChild(div);
  });
}

function renderEntityPerformance() {
  const container = document.getElementById('entity-bars');
  KSIA_DATA.entityPerformance.forEach(e => {
    const total = e.projects || 1;
    const onPct = (e.onTrack / total * 100).toFixed(1);
    const arPct = (e.atRisk / total * 100).toFixed(1);
    const dlPct = (e.delayed / total * 100).toFixed(1);
    const row = document.createElement('div');
    row.className = 'entity-row';
    row.innerHTML = `
      <div class="entity-avatar">${e.entity}</div>
      <div class="entity-info">
        <div class="entity-name-row">
          <span class="entity-name">${e.entity}</span>
          <span class="entity-projects">${e.projects} project${e.projects !== 1 ? 's' : ''}</span>
        </div>
        <div class="entity-bar-track">
          ${e.onTrack ? `<div class="entity-bar-seg entity-bar-on-track" style="width:${onPct}%"></div>` : ''}
          ${e.atRisk ? `<div class="entity-bar-seg entity-bar-at-risk" style="width:${arPct}%"></div>` : ''}
          ${e.delayed ? `<div class="entity-bar-seg entity-bar-delayed" style="width:${dlPct}%"></div>` : ''}
        </div>
      </div>`;
    container.appendChild(row);
  });
}

// Module chart preview SVGs — simplified representative visualizations
const MODULE_CHARTS = [
  // 1: Master Plan Readiness — horizontal bar chart
  `<svg viewBox="0 0 200 60" fill="none">
    <rect x="0" y="2" width="140" height="8" rx="2" fill="#00C48C" opacity="0.8"/>
    <rect x="0" y="16" width="95" height="8" rx="2" fill="#FFAA00" opacity="0.8"/>
    <rect x="0" y="30" width="120" height="8" rx="2" fill="#00C48C" opacity="0.8"/>
    <rect x="0" y="44" width="60" height="8" rx="2" fill="#FF5C5C" opacity="0.8"/>
    <rect x="148" y="2" width="4" height="8" rx="1" fill="#E0E0EA"/>
    <rect x="103" y="16" width="4" height="8" rx="1" fill="#E0E0EA"/>
    <rect x="128" y="30" width="4" height="8" rx="1" fill="#E0E0EA"/>
    <rect x="68" y="44" width="4" height="8" rx="1" fill="#E0E0EA"/>
  </svg>`,
  // 2: Scenario Planning — multi-line chart
  `<svg viewBox="0 0 200 60" fill="none">
    <polyline points="0,50 30,42 60,38 90,30 120,28 150,20 180,15 200,10" stroke="#00C48C" stroke-width="2" fill="none"/>
    <polyline points="0,50 30,45 60,42 90,38 120,35 150,32 180,30 200,28" stroke="#FFAA00" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    <polyline points="0,50 30,48 60,46 90,44 120,42 150,45 180,48 200,50" stroke="#FF5C5C" stroke-width="2" fill="none" stroke-dasharray="2 2"/>
    <circle cx="150" cy="20" r="3" fill="#00C48C"/>
    <circle cx="150" cy="32" r="3" fill="#FFAA00"/>
    <circle cx="150" cy="45" r="3" fill="#FF5C5C"/>
  </svg>`,
  // 3: Supply, Demand & Gap — area chart with gap
  `<svg viewBox="0 0 200 60" fill="none">
    <path d="M0,55 L40,48 L80,40 L120,30 L160,22 L200,15" stroke="#4DA6FF" stroke-width="2"/>
    <path d="M0,55 L40,50 L80,45 L120,42 L160,40 L200,38" stroke="#00C48C" stroke-width="2"/>
    <path d="M120,30 L120,42" stroke="#FF5C5C" stroke-width="1.5" stroke-dasharray="3 2"/>
    <path d="M160,22 L160,40" stroke="#FF5C5C" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="115" y="30" width="50" height="12" rx="2" fill="#FF5C5C" opacity="0.1"/>
    <text x="132" y="39" font-size="7" fill="#FF5C5C" font-family="Inter" font-weight="600">GAP</text>
  </svg>`,
  // 4: Solutions & Gap Closure — stacked segments
  `<svg viewBox="0 0 200 60" fill="none">
    <rect x="10" y="10" width="25" height="45" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="45" y="20" width="25" height="35" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="45" y="5" width="25" height="12" rx="2" fill="#FFAA00" opacity="0.6"/>
    <rect x="80" y="25" width="25" height="30" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="80" y="10" width="25" height="12" rx="2" fill="#4DA6FF" opacity="0.5" stroke-dasharray="3 2" stroke="#4DA6FF" stroke-width="1"/>
    <rect x="115" y="30" width="25" height="25" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="115" y="15" width="25" height="12" rx="2" fill="#FFAA00" opacity="0.6"/>
    <rect x="150" y="18" width="25" height="37" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="150" y="5" width="25" height="10" rx="2" fill="#4DA6FF" opacity="0.5"/>
  </svg>`,
  // 5: Funding & Budget — waterfall chart
  `<svg viewBox="0 0 200 60" fill="none">
    <rect x="5" y="5" width="22" height="50" rx="2" fill="#1A1A2E" opacity="0.15"/>
    <rect x="35" y="15" width="22" height="40" rx="2" fill="#FFE600" opacity="0.6"/>
    <rect x="65" y="22" width="22" height="33" rx="2" fill="#00C48C" opacity="0.6"/>
    <rect x="95" y="30" width="22" height="25" rx="2" fill="#00C48C" opacity="0.6"/>
    <rect x="125" y="35" width="22" height="20" rx="2" fill="#FFAA00" opacity="0.6"/>
    <rect x="155" y="40" width="22" height="15" rx="2" fill="#FF5C5C" opacity="0.5"/>
    <line x1="27" y1="5" x2="35" y2="15" stroke="#1A1A2E" stroke-width="0.5" opacity="0.3"/>
    <line x1="57" y1="15" x2="65" y2="22" stroke="#1A1A2E" stroke-width="0.5" opacity="0.3"/>
  </svg>`,
  // 6: Land, Corridors, Approvals — checklist/matrix
  `<svg viewBox="0 0 200 60" fill="none">
    <rect x="5" y="5" width="12" height="12" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="5" y="23" width="12" height="12" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="5" y="41" width="12" height="12" rx="2" fill="#FFAA00" opacity="0.7"/>
    <line x1="8" y1="11" x2="11" y2="14" stroke="white" stroke-width="1.5"/>
    <line x1="11" y1="14" x2="15" y2="8" stroke="white" stroke-width="1.5"/>
    <line x1="8" y1="29" x2="11" y2="32" stroke="white" stroke-width="1.5"/>
    <line x1="11" y1="32" x2="15" y2="26" stroke="white" stroke-width="1.5"/>
    <rect x="25" y="8" width="60" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
    <rect x="25" y="26" width="45" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
    <rect x="25" y="44" width="55" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
    <rect x="100" y="5" width="12" height="12" rx="2" fill="#FF5C5C" opacity="0.7"/>
    <rect x="100" y="23" width="12" height="12" rx="2" fill="#00C48C" opacity="0.7"/>
    <rect x="100" y="41" width="12" height="12" rx="2" fill="#7575A0" opacity="0.5"/>
    <rect x="120" y="8" width="50" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
    <rect x="120" y="26" width="40" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
    <rect x="120" y="44" width="48" height="6" rx="2" fill="#1A1A2E" opacity="0.12"/>
  </svg>`,
  // 7: Dependencies & Critical Path — network/flow
  `<svg viewBox="0 0 200 60" fill="none">
    <circle cx="20" cy="30" r="8" fill="#1A1A2E" opacity="0.15" stroke="#1A1A2E" stroke-width="1" opacity="0.3"/>
    <circle cx="70" cy="15" r="6" fill="#00C48C" opacity="0.6"/>
    <circle cx="70" cy="45" r="6" fill="#FFAA00" opacity="0.6"/>
    <circle cx="120" cy="25" r="7" fill="#FF5C5C" opacity="0.6"/>
    <circle cx="120" cy="50" r="5" fill="#00C48C" opacity="0.6"/>
    <circle cx="170" cy="30" r="8" fill="#FFE600" opacity="0.5" stroke="#FFE600" stroke-width="1"/>
    <line x1="28" y1="26" x2="64" y2="17" stroke="#1A1A2E" stroke-width="1" opacity="0.25"/>
    <line x1="28" y1="34" x2="64" y2="43" stroke="#1A1A2E" stroke-width="1" opacity="0.25"/>
    <line x1="76" y1="17" x2="113" y2="23" stroke="#1A1A2E" stroke-width="1" opacity="0.25"/>
    <line x1="76" y1="43" x2="115" y2="48" stroke="#1A1A2E" stroke-width="1" opacity="0.25"/>
    <line x1="127" y1="27" x2="162" y2="30" stroke="#FF5C5C" stroke-width="1.5" opacity="0.5"/>
    <line x1="125" y1="48" x2="162" y2="33" stroke="#1A1A2E" stroke-width="1" opacity="0.25"/>
  </svg>`,
  // 8: AI Insights — abstract pattern/pulse
  `<svg viewBox="0 0 200 60" fill="none">
    <path d="M0,30 Q25,30 35,15 Q45,0 55,30 Q65,55 75,30 Q85,10 95,30" stroke="#FFE600" stroke-width="2" opacity="0.6"/>
    <path d="M95,30 Q105,45 115,30 Q125,20 135,30 Q145,38 155,30 Q165,25 175,30 L200,30" stroke="#FFE600" stroke-width="2" opacity="0.4"/>
    <circle cx="35" cy="15" r="3" fill="#FF5C5C" opacity="0.7"/>
    <circle cx="75" cy="30" r="3" fill="#00C48C" opacity="0.7"/>
    <circle cx="135" cy="30" r="3" fill="#FFAA00" opacity="0.7"/>
    <rect x="30" y="42" width="40" height="5" rx="2" fill="#1A1A2E" opacity="0.1"/>
    <rect x="120" y="42" width="55" height="5" rx="2" fill="#1A1A2E" opacity="0.1"/>
    <rect x="30" y="50" width="28" height="5" rx="2" fill="#1A1A2E" opacity="0.06"/>
    <rect x="120" y="50" width="35" height="5" rx="2" fill="#1A1A2E" opacity="0.06"/>
  </svg>`
];

// ===== Infrastructure Stream Clusters =====
const STREAM_CLUSTERS = [
  { id: 'all', label: 'All Streams', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>' },
  { id: 'transport', label: 'Transport & Mobility', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 18h14M3 12h18M7 6h10M12 2v4M8 6l-5 6M16 6l5 6M5 18l-2-6M19 18l2-6"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>',
    data: { overallReadiness: 78, readinessDelta: 3, readinessPrev: 75, assetsEnabled: 9, assetsAtRisk: 2, assetsBlocked: 1, fundingGap: 18, fundingGapPct: 22, budgetAllocated: 32.5, budgetSpentPct: 41, budgetSpentAmt: 13.3, landAcquired: 520, landPct: 22.4, committeeCompleted: 8, committeeWIP: 4, committeePending: 1, criticalDecisions: 4, overdueActions: 1 } },
  { id: 'water', label: 'Potable Water', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2c0 0-8 9.5-8 14a8 8 0 0016 0C20 11.5 12 2 12 2z"/><path d="M8 16a4 4 0 004 4"/></svg>',
    data: { overallReadiness: 58, readinessDelta: -2, readinessPrev: 60, assetsEnabled: 5, assetsAtRisk: 5, assetsBlocked: 2, fundingGap: 62, fundingGapPct: 45, budgetAllocated: 18.2, budgetSpentPct: 24, budgetSpentAmt: 4.4, landAcquired: 180, landPct: 7.8, committeeCompleted: 6, committeeWIP: 5, committeePending: 3, criticalDecisions: 11, overdueActions: 4 } },
  { id: 'wastewater', label: 'Wastewater & Drainage', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20h18M5 16c2-2 4 0 6-2s4 0 6-2"/><path d="M5 12c2-2 4 0 6-2s4 0 6-2"/><path d="M7 4v4M12 2v6M17 4v4"/></svg>',
    data: { overallReadiness: 71, readinessDelta: 4, readinessPrev: 67, assetsEnabled: 7, assetsAtRisk: 3, assetsBlocked: 2, fundingGap: 34, fundingGapPct: 28, budgetAllocated: 22.0, budgetSpentPct: 30, budgetSpentAmt: 6.6, landAcquired: 290, landPct: 12.5, committeeCompleted: 9, committeeWIP: 5, committeePending: 1, criticalDecisions: 6, overdueActions: 2 } },
  { id: 'energy', label: 'Power & Energy', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    data: { overallReadiness: 68, readinessDelta: 6, readinessPrev: 62, assetsEnabled: 7, assetsAtRisk: 4, assetsBlocked: 1, fundingGap: 52, fundingGapPct: 35, budgetAllocated: 28.4, budgetSpentPct: 38, budgetSpentAmt: 10.8, landAcquired: 410, landPct: 17.7, committeeCompleted: 10, committeeWIP: 4, committeePending: 2, criticalDecisions: 7, overdueActions: 3 } },
  { id: 'cooling', label: 'District Cooling', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"/><circle cx="12" cy="12" r="3"/></svg>',
    data: { overallReadiness: 55, readinessDelta: 2, readinessPrev: 53, assetsEnabled: 6, assetsAtRisk: 4, assetsBlocked: 2, fundingGap: 58, fundingGapPct: 42, budgetAllocated: 14.6, budgetSpentPct: 20, budgetSpentAmt: 2.9, landAcquired: 145, landPct: 6.3, committeeCompleted: 5, committeeWIP: 7, committeePending: 2, criticalDecisions: 9, overdueActions: 5 } },
  { id: 'digital', label: 'Digital & Telecom', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6"/><path d="M12 6v8M9 9l3 3 3-3"/></svg>',
    data: { overallReadiness: 82, readinessDelta: 7, readinessPrev: 75, assetsEnabled: 10, assetsAtRisk: 1, assetsBlocked: 1, fundingGap: 12, fundingGapPct: 10, budgetAllocated: 20.8, budgetSpentPct: 52, budgetSpentAmt: 10.8, landAcquired: 680, landPct: 29.3, committeeCompleted: 13, committeeWIP: 3, committeePending: 0, criticalDecisions: 2, overdueActions: 0 } },
  { id: 'environment', label: 'Waste & Environment', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 22c4-2 8-6 8-12a8 8 0 00-16 0c0 6 4 10 8 12z"/><path d="M12 8v6"/><path d="M9 11c1.5 1 4.5 1 6 0"/><circle cx="12" cy="7" r="1" fill="currentColor"/></svg>',
    data: { overallReadiness: 80, readinessDelta: 5, readinessPrev: 75, assetsEnabled: 9, assetsAtRisk: 2, assetsBlocked: 1, fundingGap: 8, fundingGapPct: 8, budgetAllocated: 12.3, budgetSpentPct: 45, budgetSpentAmt: 5.5, landAcquired: 550, landPct: 23.7, committeeCompleted: 12, committeeWIP: 3, committeePending: 0, criticalDecisions: 3, overdueActions: 1 } }
];

function renderStreamClusters() {
  const main = document.querySelector('.main');
  const hero = document.querySelector('.hero');
  const nav = document.createElement('div');
  nav.className = 'stream-nav';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Infrastructure stream filter');

  STREAM_CLUSTERS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'stream-nav-btn' + (i === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('data-cluster', c.id);
    btn.innerHTML = `<span class="stream-nav-icon">${c.icon}</span><span class="stream-nav-label">${c.label}</span>`;
    btn.addEventListener('click', () => selectCluster(c, btn));
    nav.appendChild(btn);
  });

  main.insertBefore(nav, hero);
}

function selectCluster(cluster, btn) {
  // Update active button
  document.querySelectorAll('.stream-nav-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  // Swap data
  const d = KSIA_DATA.executive;
  const src = cluster.data || d; // 'all' uses original data

  if (cluster.id === 'all') {
    // Restore original
    Object.assign(d, {
      overallReadiness: 72, readinessDelta: 5, readinessPrev: 67,
      assetsEnabled: 8, assetsAtRisk: 3, assetsBlocked: 1,
      fundingGap: 46, fundingGapPct: 32, budgetAllocated: 26.1,
      budgetSpentPct: 33, budgetSpentAmt: 8.6,
      landAcquired: 345, landPct: 14.9,
      committeeCompleted: 11, committeeWIP: 6, committeePending: 0,
      criticalDecisions: 8, overdueActions: 3
    });
  } else {
    Object.assign(d, src);
  }

  // Animate: fade out, re-render, fade in with counting numbers
  const dashboard = document.getElementById('exec-dashboard');
  dashboard.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  dashboard.style.opacity = '0';
  dashboard.style.transform = 'translateY(8px)';
  setTimeout(() => {
    renderExecutiveIndicators();
    dashboard.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    dashboard.style.opacity = '1';
    dashboard.style.transform = 'translateY(0)';
    // Animate numbers counting up
    dashboard.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const decimals = String(target).includes('.') ? 1 : 0;
      const duration = 600;
      const start = performance.now();
      const from = target * 0.4;
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = from + (target - from) * ease;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    // Animate SVG ring strokes
    dashboard.querySelectorAll('[data-target-offset]').forEach(circle => {
      const targetOffset = parseFloat(circle.getAttribute('data-target-offset'));
      const circ = parseFloat(circle.getAttribute('stroke-dasharray'));
      circle.style.transition = 'none';
      circle.setAttribute('stroke-dashoffset', circ);
      requestAnimationFrame(() => {
        circle.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)';
        circle.setAttribute('stroke-dashoffset', targetOffset);
      });
    });
    // Animate progress bars
    dashboard.querySelectorAll('[data-target-width]').forEach(bar => {
      const tw = bar.getAttribute('data-target-width');
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        bar.style.transition = 'width 0.6s cubic-bezier(0.16,1,0.3,1)';
        bar.style.width = tw;
      });
    });
  }, 200);
}

function renderModuleCards() {
  const el = document.getElementById('modules-grid');
  KSIA_DATA.modules.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'module-card';
    div.setAttribute('role', 'link');
    div.setAttribute('aria-label', 'Module ' + m.number + ': ' + m.title);
    div.innerHTML = `
      <div class="module-top">
        <div class="module-num">${m.number}</div>
      </div>
      <div class="module-title">${m.title}</div>
      <div class="module-desc">${m.description}</div>
      <div class="module-chart" aria-hidden="true">${MODULE_CHARTS[i]}</div>
      <a class="module-explore" href="${m.href || '#'}">Explore <span aria-hidden="true">&rarr;</span></a>`;
    if (m.href && m.href !== '#') {
      div.style.cursor = 'pointer';
      div.addEventListener('click', function(e) {
        if (e.target.closest('.module-explore')) return;
        window.location.href = m.href;
      });
    }
    el.appendChild(div);
  });
}

function initQuickNav() {
  const trigger = document.getElementById('qnav-trigger');
  const drawer = document.getElementById('qnav-drawer');
  const btns = drawer.querySelectorAll('.qnav-btn');
  const sectionIds = ['section-overview', 'section-intelligence', 'section-modules'];
  const sections = sectionIds.map(id => document.getElementById(id));
  // Also include intel-grid which is a sibling section without an id
  const allSections = document.querySelectorAll('.main > section, .main > .intel-grid');
  let drawerOpen = false;
  let navigating = false;

  // Toggle drawer
  function toggleDrawer() {
    drawerOpen = !drawerOpen;
    drawer.classList.toggle('open', drawerOpen);
    trigger.classList.toggle('open', drawerOpen);
  }
  trigger.addEventListener('click', toggleDrawer);

  // Close drawer on click outside
  document.addEventListener('click', (e) => {
    if (drawerOpen && !drawer.contains(e.target) && !trigger.contains(e.target)) {
      drawerOpen = false;
      drawer.classList.remove('open');
      trigger.classList.remove('open');
    }
  });

  // Get the bounding box for a navigation "view" (may span multiple DOM sections)
  function getViewBounds(targetId) {
    const headerH = 52;
    if (targetId === 'section-overview') {
      // Stream nav + hero section
      const streamNav = document.querySelector('.stream-nav');
      const hero = document.getElementById('section-overview');
      const top = streamNav ? streamNav.getBoundingClientRect().top + window.scrollY : hero.getBoundingClientRect().top + window.scrollY;
      const bottom = hero.getBoundingClientRect().bottom + window.scrollY;
      return { top, bottom, height: bottom - top };
    }
    if (targetId === 'section-intelligence') {
      // Milestones + intel-grid panels
      const milestones = document.getElementById('section-intelligence');
      const intelGrid = document.querySelector('.intel-grid');
      const top = milestones.getBoundingClientRect().top + window.scrollY;
      const bottom = intelGrid ? intelGrid.getBoundingClientRect().bottom + window.scrollY : milestones.getBoundingClientRect().bottom + window.scrollY;
      return { top, bottom, height: bottom - top };
    }
    // Modules
    const mod = document.getElementById('section-modules');
    const top = mod.getBoundingClientRect().top + window.scrollY;
    const bottom = mod.getBoundingClientRect().bottom + window.scrollY;
    return { top, bottom, height: bottom - top };
  }

  // Navigate with section transition animation
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.section;
      const target = document.getElementById(targetId);
      if (!target || navigating) return;

      // Update active button
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Determine direction
      const currentIdx = getCurrentSectionIdx();
      const targetIdx = sectionIds.indexOf(targetId);
      if (targetIdx === currentIdx) {
        drawerOpen = false;
        drawer.classList.remove('open');
        trigger.classList.remove('open');
        return;
      }

      navigating = true;

      // Animate out visible sections
      allSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          sec.classList.add('sec-leaving');
        }
      });

      // After leaving animation, scroll centered and animate in
      setTimeout(() => {
        allSections.forEach(sec => sec.classList.remove('sec-leaving'));

        // Calculate scroll position to center the view in viewport
        const headerH = 52;
        const viewportH = window.innerHeight - headerH;
        const bounds = getViewBounds(targetId);

        let scrollTop;
        if (targetId === 'section-overview') {
          // Overview: scroll to top of page
          scrollTop = 0;
        } else if (bounds.height >= viewportH) {
          // Content taller than viewport — align to top with header offset
          scrollTop = bounds.top - headerH - 16;
        } else {
          // Center vertically in available space below header
          scrollTop = bounds.top - headerH - (viewportH - bounds.height) / 2;
        }
        scrollTop = Math.max(0, scrollTop);

        // Pre-position entering sections
        allSections.forEach(sec => {
          sec.classList.add('sec-entering');
        });

        window.scrollTo({ top: scrollTop, behavior: 'instant' });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            allSections.forEach(sec => {
              sec.classList.remove('sec-entering');
              sec.classList.add('sec-active');
            });
            setTimeout(() => {
              allSections.forEach(sec => sec.classList.remove('sec-active'));
              navigating = false;
            }, 550);
          });
        });
      }, 350);

      // Close drawer
      setTimeout(() => {
        drawerOpen = false;
        drawer.classList.remove('open');
        trigger.classList.remove('open');
      }, 200);
    });
  });

  // Track current section index from scroll position
  function getCurrentSectionIdx() {
    let best = 0;
    const viewMid = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((sec, i) => {
      if (sec && sec.offsetTop <= viewMid) best = i;
    });
    return best;
  }

  // Intersection observer — update active button on manual scroll
  const observer = new IntersectionObserver((entries) => {
    if (navigating) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        btns.forEach(b => b.classList.remove('active'));
        const active = drawer.querySelector(`[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => { if (s) observer.observe(s); });
}

// Assistant Chat — canned Q&A responses
const ASSISTANT_RESPONSES = [
  {
    match: /terminal.?6.*(?:potable|water|ready|readiness|supply)/i,
    answer: '<strong>At Risk.</strong> NWC W-07 is delayed to <strong>Q1 2029</strong>, after the <strong>Q3 2028</strong> Terminal 6 opening date.'
  },
  {
    match: /(?:potable.*water|water).*(?:demand|gap)/i,
    answer: 'Demand is <strong>31,000 m³/day by 2028</strong> and <strong>85,323 m³/day by 2050</strong>. The supply gap is <strong>1,300 m³/day in 2028</strong>, rising to <strong>17,100 m³/day by 2030</strong>.'
  },
  {
    match: /(?:2028|gap).*(?:cover|close|interim|solution|how)/i,
    answer: 'Primarily through <strong>endorsed wells</strong> (approval in progress), supplemented by <strong>Miahona groundwater treatment</strong>, with capacity expandable to <strong>30,000 m³/day</strong>.'
  }
];

function initAssistantChat() {
  const chat = document.getElementById('assistant-chat');
  if (!chat) return;
  const input = document.querySelector('.ed-asst-input');
  const sendBtn = document.querySelector('.ed-asst-send');
  if (!input || !sendBtn) return;

  function addMessage(html, type) {
    const msg = document.createElement('div');
    msg.className = `ed-asst-msg ed-asst-${type}`;
    msg.innerHTML = `<div class="ed-asst-bubble ed-asst-bubble-${type}">${html}</div>`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function handleSend() {
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, 'user');
    input.value = '';

    // Find matching response
    const match = ASSISTANT_RESPONSES.find(r => r.match.test(q));
    setTimeout(() => {
      if (match) {
        addMessage(match.answer, 'ai');
      } else {
        addMessage('I can answer questions about Terminal 6 potable water readiness, demand and supply gaps, and gap closure solutions. Try asking about those topics.', 'ai');
      }
    }, 400);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSend();
  });
}
