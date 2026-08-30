const KSIA_DATA = {
  // Global filter options
  filters: {
    majorDevelopment: ['All Major Developments', 'T1-T4', 'Terminal 5', 'Terminal 6', 'Iconic Terminal', 'Cargo Village', 'Private Aviation'],
    ksiaArea: ['All Areas', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'],
    infrastructureStream: ['All Streams', 'Mobility & Roads', 'Public Transport', 'Potable Water', 'Wastewater', 'Power & Energy', 'District Cooling', 'Digital & Telecommunications', 'Stormwater & Drainage', 'Waste & Environmental Services', 'Natural Gas'],
    externalEntity: ['All Entities', 'RCRC', 'NWC', 'SWA', 'SEC', 'CST', 'MOT'],
    timePeriod: ['Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', '2027', '2028', '2029', '2030', '2035', '2040', '2050+']
  },

  // Executive indicators (LP-03)
  executive: {
    overallReadiness: 72,
    readinessDelta: 5,
    readinessPrev: 67,
    readinessPrevLabel: 'July 2026',
    readinessTrend: [42, 48, 51, 55, 58, 62, 67, 72],
    readinessTrendLabel: 'Jan–Aug 2026',
    totalAssets: 12,
    assetsEnabled: 8,
    assetsAtRisk: 3,
    assetsBlocked: 1,
    assetNarrative: 'Each tick is one asset. 67% of the asset base is fully enabled; 1 asset is blocked pending a committee ruling.',
    fundingGap: 46,
    fundingGapPct: 32,
    fundingTotalReq: 143.8,
    projectsActive: 47,
    projectsNotStarted: 4,
    projectsCompleted: 11,
    projectsOnTrack: 19,
    projectsAtRisk: 12,
    projectsDelayed: 5,
    projectNarrative: '64% of projects are completed or on track. 5 delayed projects sit on the critical path to terminal handover.',
    landTotalParcels: 2320,
    landAcquired: 345,
    landPct: 14.9,
    landNarrative: 'Acquisition is the pacing constraint for the airside package — current run-rate delivers the remaining 1,975 parcels beyond the 2029 enabling-works window.',
    budgetAllocated: 26.1,
    budgetSpentPct: 33,
    budgetSpentAmt: 8.6,
    budgetReleased: 642,
    committeeTotal: 17,
    committeePending: 0,
    committeeWIP: 6,
    committeeCompleted: 11,
    criticalDecisions: 8,
    committeeNarrative: '8 critical decisions awaiting escalation this cycle',
    daysToNextCommittee: 12,
    nextCommitteeDate: '10 Sep 2026',
    overdueActions: 3
  },

  // Upcoming key milestones (LP-05)
  milestones: [
    { date: 'Q2 2026', asset: 'Cargo Village', status: 'Ready' },
    { date: 'Q4 2026', asset: 'Central Runways', status: 'On Track' },
    { date: 'Q1 2027', asset: 'Private Aviation', status: 'Conditional' },
    { date: 'Q2 2027', asset: 'East Runways', status: 'Conditional' },
    { date: 'Q3 2027', asset: 'West Runways', status: 'Blocked' },
    { date: 'Q4 2027', asset: 'T1-T4', status: 'At Risk' },
    { date: 'Q3 2028', asset: 'Terminal 6', status: 'At Risk' },
    { date: 'Q1 2029', asset: 'Terminal 5', status: 'Conditional' },
    { date: 'Q4 2038', asset: 'Iconic Terminal', status: 'At Risk' }
  ],

  // Infrastructure readiness by stream (LP-10)
  streamReadiness: [
    { stream: 'Mobility & Roads', readiness: 78, status: 'Conditional' },
    { stream: 'Public Transport', readiness: 45, status: 'At Risk' },
    { stream: 'Potable Water', readiness: 62, status: 'At Risk' },
    { stream: 'Wastewater', readiness: 71, status: 'Conditional' },
    { stream: 'Power & Energy', readiness: 68, status: 'Conditional' },
    { stream: 'District Cooling', readiness: 55, status: 'At Risk' },
    { stream: 'Digital & Telecom', readiness: 82, status: 'Conditional' },
    { stream: 'Stormwater & Drainage', readiness: 75, status: 'Conditional' },
    { stream: 'Waste & Environmental', readiness: 80, status: 'Ready' },
    { stream: 'Natural Gas', readiness: 70, status: 'Conditional' }
  ],

  // Committee action center (LP-11)
  committeeActions: [
    { action: 'Approve interim water treatment solution for Terminal 6', severity: 'Critical', due: '15 Jan 2026', status: 'Pending' },
    { action: 'Expedite land acquisition for pipeline corridor W-12', severity: 'Critical', due: '28 Jan 2026', status: 'Overdue' },
    { action: 'Funding approval for power substation P-07', severity: 'High', due: '10 Feb 2026', status: 'Pending' },
    { action: 'Review district cooling capacity for Airport City', severity: 'High', due: '15 Feb 2026', status: 'Pending' },
    { action: 'Approve road interchange R-12 accelerated schedule', severity: 'Medium', due: '28 Feb 2026', status: 'In Progress' },
    { action: 'NWC commitment confirmation for booster station BS-07', severity: 'High', due: '01 Mar 2026', status: 'Pending' }
  ],

  // Prerequisite readiness overview (LP-12)
  prerequisiteReadiness: [
    { category: 'Funding', secured: 67, total: 100 },
    { category: 'Land Acquisition', secured: 48, total: 100 },
    { category: 'Permits & Approvals', secured: 55, total: 100 },
    { category: 'Procurement', secured: 62, total: 100 },
    { category: 'Utility Corridors / ROW', secured: 42, total: 100 },
    { category: 'Entity Commitments', secured: 71, total: 100 }
  ],

  // External entity performance (LP-13)
  entityPerformance: [
    { entity: 'RCRC', projects: 8, onTrack: 4, atRisk: 2, delayed: 2 },
    { entity: 'NWC', projects: 6, onTrack: 3, atRisk: 2, delayed: 1 },
    { entity: 'SEC', projects: 5, onTrack: 3, atRisk: 1, delayed: 1 },
    { entity: 'SWA', projects: 4, onTrack: 2, atRisk: 1, delayed: 1 },
    { entity: 'CST', projects: 3, onTrack: 1, atRisk: 1, delayed: 1 },
    { entity: 'MOT', projects: 4, onTrack: 3, atRisk: 1, delayed: 0 }
  ],

  // Module cards (LP-07, LP-08)
  modules: [
    { number: 1, title: 'Master Plan Readiness Cockpit', description: 'Assess whether KSIA assets and milestones are enabled by the required infrastructure services.', icon: '📊', href: '#' },
    { number: 2, title: 'Scenario Planning', description: 'Compare alternative infrastructure, growth, funding and delivery scenarios and their effects on readiness.', icon: '🔄', href: '#' },
    { number: 3, title: 'Supply, Demand & Gap Management', description: 'Determine whether sufficient infrastructure supply will be available when each KSIA asset requires it.', icon: '📈', href: 'supply-demand.html' },
    { number: 4, title: 'Infrastructure Solutions & Gap Closure', description: 'Identify and assess permanent, interim and alternative solutions that close confirmed gaps.', icon: '🔧' },
    { number: 5, title: 'Funding, Budget Requests & Cash Flow', description: 'Track the funding required to deliver infrastructure projects and gap-closure solutions.', icon: '💰' },
    { number: 6, title: 'Land, Corridors, Approvals & Prerequisites', description: 'Monitor non-construction prerequisites that enable infrastructure projects and KSIA connections.', icon: '🗺️' },
    { number: 7, title: 'Integrated Dependencies & Critical Path', description: 'Show the complete critical path from enabling infrastructure to every KSIA asset milestone.', icon: '🔗' },
    { number: 8, title: 'AI Insights & Recommendations', description: 'Surface material risks, opportunities, root causes and recommended committee interventions.', icon: '🤖' }
  ]
};
