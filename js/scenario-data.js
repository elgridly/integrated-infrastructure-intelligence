/**
 * Scenario Planning Data Model — KSIA Regional Infrastructure Decision Intelligence Platform
 * Multi-asset, multi-stream architecture
 */
window.SCENARIO_DATA = {

    // ─── Assets ────────────────────────────────────────────────────────
    assets: [
        {
            id: "t6",
            name: "Terminal 6",
            milestone: "Q3 2028",
            description: "Primary passenger terminal — 12M passengers/year capacity",
            streams: {
                "potable-water": {
                    demand: 28700,
                    supply: 27400,
                    gap: 1300,
                    status: "Conditional",
                    entity: "NWC",
                    keyRisk: "W-07 pipeline delivery timing",
                    projects: [
                        { id: "W-07", name: "W-07 Pipeline (NWC)", capacity: 12000, date: "Q3 2028", status: "At Risk", type: "committed" },
                        { id: "MIAHONA", name: "Miahona Treatment Plant", capacity: 8000, date: "Q1 2027", status: "On Track", type: "committed" },
                        { id: "WELLS", name: "Existing Wells", capacity: 7400, date: "Operational", status: "Ready", type: "existing" },
                        { id: "RWA", name: "RWA Connection", capacity: 12000, date: "Q2 2027", status: "On Track", type: "committed" }
                    ],
                    timeseriesDemand: [
                        { quarter: "Q1 2026", value: 18000 },
                        { quarter: "Q2 2026", value: 18400 },
                        { quarter: "Q3 2026", value: 18900 },
                        { quarter: "Q4 2026", value: 19300 },
                        { quarter: "Q1 2027", value: 19800 },
                        { quarter: "Q2 2027", value: 20300 },
                        { quarter: "Q3 2027", value: 20800 },
                        { quarter: "Q4 2027", value: 21400 },
                        { quarter: "Q1 2028", value: 22000 },
                        { quarter: "Q2 2028", value: 22600 },
                        { quarter: "Q3 2028", value: 28700 },
                        { quarter: "Q4 2028", value: 29200 },
                        { quarter: "Q1 2029", value: 29700 },
                        { quarter: "Q2 2029", value: 30300 },
                        { quarter: "Q3 2029", value: 30900 },
                        { quarter: "Q4 2029", value: 31500 },
                        { quarter: "Q1 2030", value: 32000 },
                        { quarter: "Q2 2030", value: 32600 },
                        { quarter: "Q3 2030", value: 33100 },
                        { quarter: "Q4 2030", value: 33600 },
                        { quarter: "Q1 2031", value: 34000 },
                        { quarter: "Q2 2031", value: 34400 },
                        { quarter: "Q3 2031", value: 34800 },
                        { quarter: "Q4 2031", value: 35100 },
                        { quarter: "Q1 2032", value: 35400 },
                        { quarter: "Q2 2032", value: 35700 },
                        { quarter: "Q3 2032", value: 35900 },
                        { quarter: "Q4 2032", value: 36200 }
                    ],
                    timeseriesSupply: [
                        { quarter: "Q1 2026", value: 15400 },
                        { quarter: "Q2 2026", value: 15400 },
                        { quarter: "Q3 2026", value: 15400 },
                        { quarter: "Q4 2026", value: 15400 },
                        { quarter: "Q1 2027", value: 23400 },
                        { quarter: "Q2 2027", value: 35400 },
                        { quarter: "Q3 2027", value: 35400 },
                        { quarter: "Q4 2027", value: 35400 },
                        { quarter: "Q1 2028", value: 35400 },
                        { quarter: "Q2 2028", value: 35400 },
                        { quarter: "Q3 2028", value: 35400 },
                        { quarter: "Q4 2028", value: 47400 },
                        { quarter: "Q1 2029", value: 47400 },
                        { quarter: "Q2 2029", value: 47400 },
                        { quarter: "Q3 2029", value: 47400 },
                        { quarter: "Q4 2029", value: 47400 },
                        { quarter: "Q1 2030", value: 47400 },
                        { quarter: "Q2 2030", value: 47400 },
                        { quarter: "Q3 2030", value: 47400 },
                        { quarter: "Q4 2030", value: 47400 },
                        { quarter: "Q1 2031", value: 47400 },
                        { quarter: "Q2 2031", value: 47400 },
                        { quarter: "Q3 2031", value: 47400 },
                        { quarter: "Q4 2031", value: 47400 },
                        { quarter: "Q1 2032", value: 47400 },
                        { quarter: "Q2 2032", value: 47400 },
                        { quarter: "Q3 2032", value: 47400 },
                        { quarter: "Q4 2032", value: 47400 }
                    ],
                    assumptions: [
                        { id: "pw_t6DemandDaily", name: "T6 Daily Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 21000, min: 15000, max: 30000, step: 500 },
                        { id: "pw_demandGrowthRate", name: "Annual Demand Growth", category: "demand", unit: "%", baselineValue: 3.5, min: 1, max: 8, step: 0.5 },
                        { id: "pw_w07Completion", name: "W-07 Completion Quarter", category: "schedule", unit: "quarter-index", baselineValue: 10, min: 8, max: 20, step: 1 },
                        { id: "pw_w07Capacity", name: "W-07 Pipeline Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 12000, min: 8000, max: 15000, step: 500 },
                        { id: "pw_miahonaCapacity", name: "Miahona Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 8000, min: 5000, max: 15000, step: 500 },
                        { id: "pw_miahonaCompletion", name: "Miahona Completion Quarter", category: "schedule", unit: "quarter-index", baselineValue: 4, min: 2, max: 10, step: 1 },
                        { id: "pw_rwaAllocation", name: "RWA Allocation", category: "supply", unit: "m\u00b3/day", baselineValue: 12000, min: 4000, max: 16000, step: 500 },
                        { id: "pw_wellCapacity", name: "Existing Well Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 7400, min: 5000, max: 10000, step: 200 },
                        { id: "pw_interimWells", name: "Endorsed Interim Wells", category: "supply", unit: "m\u00b3/day", baselineValue: 0, min: 0, max: 5000, step: 500 },
                        { id: "pw_miahonaExpansion", name: "Miahona Expansion", category: "supply", unit: "m\u00b3/day", baselineValue: 0, min: 0, max: 8000, step: 500 }
                    ],
                    sensitivityDrivers: [
                        { name: "W-07 Completion Date", variable: "pw_w07Completion", impact: { negative: -2800, positive: 1200 }, rank: 1 },
                        { name: "T6 Demand Growth", variable: "pw_t6DemandDaily", impact: { negative: -1800, positive: 800 }, rank: 2 },
                        { name: "Interim Well Capacity", variable: "pw_interimWells", impact: { negative: -1200, positive: 1500 }, rank: 3 },
                        { name: "Miahona Expansion", variable: "pw_miahonaExpansion", impact: { negative: -600, positive: 2400 }, rank: 4 },
                        { name: "RWA Allocation", variable: "pw_rwaAllocation", impact: { negative: -800, positive: 600 }, rank: 5 },
                        { name: "Demand Growth Rate", variable: "pw_demandGrowthRate", impact: { negative: -500, positive: 300 }, rank: 6 }
                    ],
                    thresholds: [
                        { variable: "pw_w07Completion", threshold: 12, description: "W-07 must be operational by Q1 2029 at the latest to avoid an unacceptable supply gap at T6" },
                        { variable: "pw_interimWells", threshold: 2000, description: "Minimum 2,000 m\u00b3/day interim well capacity required if W-07 is delayed past Q4 2028" }
                    ],
                    monteCarlo: {
                        simulationRuns: 5000,
                        inputs: [
                            { variable: "pw_w07Completion", distributionType: "triangular", params: { min: 9, mode: 10, max: 16 }, dataConfidence: "medium", source: "NWC project reports Aug 2026" },
                            { variable: "pw_t6DemandDaily", distributionType: "normal", params: { mean: 21000, stdDev: 2500 }, dataConfidence: "high", source: "Master plan demand model v3" },
                            { variable: "pw_miahonaCapacity", distributionType: "uniform", params: { min: 6000, max: 10000 }, dataConfidence: "medium", source: "SWA design capacity range" },
                            { variable: "pw_rwaAllocation", distributionType: "normal", params: { mean: 12000, stdDev: 1500 }, dataConfidence: "high", source: "RWA allocation agreement" },
                            { variable: "pw_interimWells", distributionType: "triangular", params: { min: 0, mode: 0, max: 3500 }, dataConfidence: "low", source: "Pending endorsement — no commitment" },
                            { variable: "pw_miahonaExpansion", distributionType: "triangular", params: { min: 0, mode: 0, max: 5000 }, dataConfidence: "low", source: "Feasibility study only" }
                        ],
                        displayConfig: { bins: 25, showP50: true, showP80: true, showP90: true }
                    },
                    interventions: [
                        { id: "endorsed-wells", name: "Endorsed Interim Wells", type: "Alternative Supply", gapReduction: 3500, cost: 45, timing: "Q2 2028", feasibility: "High", readinessImpact: "Conditional \u2192 Ready if W-07 on time", assumptions: { pw_interimWells: 3500 } },
                        { id: "miahona-expansion", name: "Miahona Expansion to 13,000", type: "Capacity Expansion", gapReduction: 5000, cost: 120, timing: "Q1 2028", feasibility: "Medium", readinessImpact: "At Risk \u2192 Conditional", assumptions: { pw_miahonaExpansion: 5000 } },
                        { id: "w07-acceleration", name: "Accelerate W-07", type: "Acceleration", gapReduction: 12000, cost: 80, timing: "Move Q1 2029 \u2192 Q3 2028", feasibility: "Low", readinessImpact: "At Risk \u2192 Ready", assumptions: { pw_w07Completion: 10 } },
                        { id: "combined-package", name: "Combined Package", type: "Combination", gapReduction: 8500, cost: 165, timing: "Q2 2028", feasibility: "High", readinessImpact: "At Risk \u2192 Ready (with interim supply)", assumptions: { pw_interimWells: 3500, pw_miahonaExpansion: 5000, pw_w07Completion: 14 } }
                    ]
                },
                "power": {
                    demand: 45,
                    supply: 52,
                    gap: 0,
                    status: "Ready",
                    entity: "SEC",
                    keyRisk: "Substation S-12 commissioning timeline",
                    projects: [
                        { id: "S-12", name: "Substation S-12", capacity: 30, date: "Q2 2027", status: "On Track", type: "committed" },
                        { id: "GRID-EXIST", name: "Existing Grid", capacity: 22, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pe_demand", name: "T6 Power Demand", category: "demand", unit: "MW", baselineValue: 45, min: 30, max: 60, step: 1 },
                        { id: "pe_s12Completion", name: "S-12 Completion Quarter", category: "schedule", unit: "quarter-index", baselineValue: 5, min: 3, max: 12, step: 1 },
                        { id: "pe_s12Capacity", name: "S-12 Capacity", category: "supply", unit: "MW", baselineValue: 30, min: 20, max: 40, step: 1 },
                        { id: "pe_gridCapacity", name: "Existing Grid Capacity", category: "supply", unit: "MW", baselineValue: 22, min: 15, max: 28, step: 1 }
                    ],
                    monteCarlo: {
                        inputs: [
                            { variable: "pe_demand", distributionType: "normal", params: { mean: 45, stdDev: 5 }, dataConfidence: "high", source: "Load study Q2 2026" },
                            { variable: "pe_s12Completion", distributionType: "triangular", params: { min: 4, mode: 5, max: 10 }, dataConfidence: "medium", source: "SEC contractor schedule" },
                            { variable: "pe_s12Capacity", distributionType: "normal", params: { mean: 30, stdDev: 3 }, dataConfidence: "high", source: "SEC design specification" },
                            { variable: "pe_gridCapacity", distributionType: "uniform", params: { min: 18, max: 25 }, dataConfidence: "medium", source: "Existing grid capacity assessment" }
                        ]
                    }
                },
                "mobility": {
                    demand: 12000,
                    supply: 8500,
                    gap: 3500,
                    status: "At Risk",
                    entity: "MOT",
                    keyRisk: "Northern access road delayed by land acquisition",
                    projects: [
                        { id: "NORTH-RD", name: "Northern Access Road", capacity: 5000, date: "Q2 2028", status: "At Risk", type: "committed" },
                        { id: "EAST-CON", name: "Eastern Connector", capacity: 3500, date: "Operational", status: "Ready", type: "existing" },
                        { id: "INT-ROADS", name: "Internal Roads", capacity: 5000, date: "Q4 2027", status: "On Track", type: "committed" }
                    ],
                    assumptions: [
                        { id: "mo_demand", name: "T6 Mobility Demand", category: "demand", unit: "veh/hr", baselineValue: 12000, min: 8000, max: 18000, step: 500 },
                        { id: "mo_northernCompletion", name: "Northern Road Completion", category: "schedule", unit: "quarter-index", baselineValue: 9, min: 6, max: 16, step: 1 },
                        { id: "mo_northernCapacity", name: "Northern Road Capacity", category: "supply", unit: "veh/hr", baselineValue: 5000, min: 3000, max: 8000, step: 500 },
                        { id: "mo_internalCompletion", name: "Internal Roads Completion", category: "schedule", unit: "quarter-index", baselineValue: 7, min: 5, max: 12, step: 1 }
                    ],
                    monteCarlo: {
                        inputs: [
                            { variable: "mo_demand", distributionType: "normal", params: { mean: 12000, stdDev: 1500 }, dataConfidence: "medium", source: "Traffic model v2 — limited calibration data" },
                            { variable: "mo_northernCompletion", distributionType: "triangular", params: { min: 6, mode: 9, max: 12 }, dataConfidence: "low", source: "Land acquisition unresolved" },
                            { variable: "mo_northernCapacity", distributionType: "normal", params: { mean: 5000, stdDev: 800 }, dataConfidence: "medium", source: "Preliminary design — subject to change" },
                            { variable: "mo_internalCompletion", distributionType: "triangular", params: { min: 6, mode: 7, max: 10 }, dataConfidence: "high", source: "KSIA-controlled project" }
                        ]
                    }
                },
                "district-cooling": {
                    demand: 18000,
                    supply: 22000,
                    gap: 0,
                    status: "Ready",
                    entity: "KSIA",
                    keyRisk: "None \u2014 capacity secured",
                    projects: [
                        { id: "CCP", name: "Central Cooling Plant", capacity: 15000, date: "Q1 2027", status: "On Track", type: "committed" },
                        { id: "BACKUP-CH", name: "Backup Chillers", capacity: 7000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "dc_demand", name: "T6 Cooling Demand", category: "demand", unit: "TR", baselineValue: 18000, min: 12000, max: 25000, step: 500 },
                        { id: "dc_centralCompletion", name: "Central Plant Completion", category: "schedule", unit: "quarter-index", baselineValue: 4, min: 3, max: 8, step: 1 },
                        { id: "dc_centralCapacity", name: "Central Plant Capacity", category: "supply", unit: "TR", baselineValue: 15000, min: 10000, max: 20000, step: 500 }
                    ],
                    monteCarlo: {
                        inputs: [
                            { variable: "dc_demand", distributionType: "normal", params: { mean: 18000, stdDev: 2000 }, dataConfidence: "high", source: "Cooling load calculation" },
                            { variable: "dc_centralCompletion", distributionType: "triangular", params: { min: 3, mode: 4, max: 7 }, dataConfidence: "high", source: "On-site contractor progress" },
                            { variable: "dc_centralCapacity", distributionType: "normal", params: { mean: 15000, stdDev: 1500 }, dataConfidence: "high", source: "Equipment specifications confirmed" }
                        ]
                    }
                },
                "digital": {
                    demand: 10,
                    supply: 12,
                    gap: 0,
                    status: "Ready",
                    entity: "STC",
                    keyRisk: "None \u2014 fibre backbone commissioned",
                    projects: [
                        { id: "FIBRE", name: "Fibre Backbone", capacity: 8, date: "Q3 2027", status: "On Track", type: "committed" },
                        { id: "NET-EXIST", name: "Existing Network", capacity: 4, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "di_demand", name: "T6 Digital Demand", category: "demand", unit: "Gbps", baselineValue: 10, min: 5, max: 20, step: 1 },
                        { id: "di_fibreCompletion", name: "Fibre Backbone Completion", category: "schedule", unit: "quarter-index", baselineValue: 6, min: 4, max: 10, step: 1 },
                        { id: "di_fibreCapacity", name: "Fibre Backbone Capacity", category: "supply", unit: "Gbps", baselineValue: 8, min: 5, max: 12, step: 1 }
                    ],
                    monteCarlo: {
                        inputs: [
                            { variable: "di_demand", distributionType: "normal", params: { mean: 10, stdDev: 2 }, dataConfidence: "medium", source: "IT requirements — scope may expand" },
                            { variable: "di_fibreCompletion", distributionType: "triangular", params: { min: 5, mode: 6, max: 9 }, dataConfidence: "high", source: "STC fibre deployment on schedule" },
                            { variable: "di_fibreCapacity", distributionType: "normal", params: { mean: 8, stdDev: 1 }, dataConfidence: "high", source: "Fibre link design confirmed" }
                        ]
                    }
                },
                "wastewater": {
                    demand: 18500,
                    supply: 20000,
                    gap: 0,
                    status: "Conditional",
                    entity: "SWA",
                    keyRisk: "Treatment capacity expansion pending approval",
                    projects: [
                        { id: "STP-EXP", name: "STP Expansion", capacity: 12000, date: "Q2 2028", status: "Conditional", type: "committed" },
                        { id: "STP-EXIST", name: "Existing STP", capacity: 8000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "ww_demand", name: "T6 Wastewater Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 18500, min: 12000, max: 25000, step: 500 },
                        { id: "ww_stpCompletion", name: "STP Expansion Completion", category: "schedule", unit: "quarter-index", baselineValue: 7, min: 5, max: 14, step: 1 },
                        { id: "ww_stpCapacity", name: "STP Expansion Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 12000, min: 8000, max: 16000, step: 500 },
                        { id: "ww_existingCapacity", name: "Existing STP Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 8000, min: 6000, max: 10000, step: 500 }
                    ],
                    monteCarlo: {
                        inputs: [
                            { variable: "ww_demand", distributionType: "normal", params: { mean: 18500, stdDev: 2000 }, dataConfidence: "medium", source: "Derived from potable water demand" },
                            { variable: "ww_stpCompletion", distributionType: "triangular", params: { min: 5, mode: 7, max: 11 }, dataConfidence: "medium", source: "SWA contractor progress" },
                            { variable: "ww_stpCapacity", distributionType: "normal", params: { mean: 12000, stdDev: 1500 }, dataConfidence: "medium", source: "Design capacity \u2014 commissioning uncertainty" },
                            { variable: "ww_existingCapacity", distributionType: "uniform", params: { min: 6500, max: 9000 }, dataConfidence: "high", source: "Operational performance data" }
                        ]
                    }
                }
            }
        },
        {
            id: "airport-city-p1",
            name: "Airport City Phase 1",
            milestone: "Q4 2029",
            description: "Mixed-use commercial and hospitality development",
            streams: {
                "potable-water": {
                    demand: 15000, supply: 12000, gap: 3000, status: "At Risk",
                    entity: "NWC", keyRisk: "Dependent on W-07 and additional NWC allocation",
                    projects: [
                        { id: "W-07-AC", name: "W-07 Pipeline (shared)", capacity: 5000, date: "Q3 2028", status: "At Risk", type: "committed" },
                        { id: "AC-WELLS", name: "On-site Wells", capacity: 3000, date: "Operational", status: "Ready", type: "existing" },
                        { id: "RWA-AC", name: "RWA Allocation (AC)", capacity: 4000, date: "Q2 2027", status: "On Track", type: "committed" }
                    ],
                    assumptions: [
                        { id: "ac_pw_demand", name: "AC P1 Water Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 15000, min: 10000, max: 22000, step: 500 },
                        { id: "ac_pw_w07Share", name: "W-07 Allocation to AC", category: "supply", unit: "m\u00b3/day", baselineValue: 5000, min: 2000, max: 8000, step: 500 },
                        { id: "ac_pw_rwaAlloc", name: "RWA Allocation to AC", category: "supply", unit: "m\u00b3/day", baselineValue: 4000, min: 2000, max: 6000, step: 500 }
                    ]
                },
                "power": {
                    demand: 35, supply: 38, gap: 0, status: "Ready",
                    entity: "SEC", keyRisk: "Grid extension on track",
                    projects: [
                        { id: "S-12-AC", name: "S-12 Extension", capacity: 20, date: "Q3 2028", status: "On Track", type: "committed" },
                        { id: "GRID-AC", name: "Existing Grid (AC)", capacity: 18, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "ac_pe_demand", name: "AC P1 Power Demand", category: "demand", unit: "MW", baselineValue: 35, min: 25, max: 50, step: 1 },
                        { id: "ac_pe_s12Capacity", name: "S-12 Extension Capacity", category: "supply", unit: "MW", baselineValue: 20, min: 15, max: 30, step: 1 },
                        { id: "ac_pe_gridCapacity", name: "Existing Grid (AC)", category: "supply", unit: "MW", baselineValue: 18, min: 12, max: 22, step: 1 }
                    ]
                },
                "mobility": {
                    demand: 8000, supply: 6500, gap: 1500, status: "Conditional",
                    entity: "MOT", keyRisk: "Access road capacity dependent on northern road completion",
                    projects: [
                        { id: "NORTH-RD-AC", name: "Northern Access Road (shared)", capacity: 3000, date: "Q1 2028", status: "At Risk", type: "committed" },
                        { id: "AC-INT", name: "AC Internal Roads", capacity: 3500, date: "Q2 2029", status: "On Track", type: "committed" }
                    ],
                    assumptions: [
                        { id: "ac_mo_demand", name: "AC P1 Mobility Demand", category: "demand", unit: "veh/hr", baselineValue: 8000, min: 5000, max: 12000, step: 500 },
                        { id: "ac_mo_northShare", name: "Northern Road AC Share", category: "supply", unit: "veh/hr", baselineValue: 3000, min: 1500, max: 5000, step: 500 },
                        { id: "ac_mo_intCompletion", name: "AC Internal Roads Completion", category: "schedule", unit: "quarter-index", baselineValue: 13, min: 10, max: 18, step: 1 }
                    ]
                },
                "district-cooling": {
                    demand: 25000, supply: 22000, gap: 3000, status: "At Risk",
                    entity: "KSIA", keyRisk: "Cooling plant Phase 2 not yet funded",
                    projects: [
                        { id: "CCP-P2", name: "Central Cooling Phase 2", capacity: 12000, date: "Q3 2029", status: "At Risk", type: "planned" },
                        { id: "CCP-P1-AC", name: "Central Cooling Phase 1 (shared)", capacity: 10000, date: "Q1 2027", status: "On Track", type: "committed" }
                    ],
                    assumptions: [
                        { id: "ac_dc_demand", name: "AC P1 Cooling Demand", category: "demand", unit: "TR", baselineValue: 25000, min: 18000, max: 35000, step: 1000 },
                        { id: "ac_dc_p2Capacity", name: "Cooling Phase 2 Capacity", category: "supply", unit: "TR", baselineValue: 12000, min: 8000, max: 18000, step: 1000 },
                        { id: "ac_dc_p2Completion", name: "Cooling Phase 2 Completion", category: "schedule", unit: "quarter-index", baselineValue: 14, min: 12, max: 20, step: 1 }
                    ]
                },
                "digital": {
                    demand: 8, supply: 8, gap: 0, status: "Ready",
                    entity: "STC", keyRisk: "None \u2014 fibre allocation confirmed",
                    projects: [
                        { id: "FIBRE-AC", name: "Fibre Extension (AC)", capacity: 5, date: "Q1 2029", status: "On Track", type: "committed" },
                        { id: "NET-AC", name: "Existing Network (AC)", capacity: 3, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "ac_di_demand", name: "AC P1 Digital Demand", category: "demand", unit: "Gbps", baselineValue: 8, min: 4, max: 15, step: 1 },
                        { id: "ac_di_fibreCapacity", name: "Fibre Extension Capacity", category: "supply", unit: "Gbps", baselineValue: 5, min: 3, max: 8, step: 1 }
                    ]
                },
                "wastewater": {
                    demand: 12000, supply: 10000, gap: 2000, status: "Conditional",
                    entity: "SWA", keyRisk: "STP capacity allocation pending confirmation",
                    projects: [
                        { id: "STP-AC", name: "STP Allocation (AC)", capacity: 6000, date: "Q2 2029", status: "Conditional", type: "committed" },
                        { id: "STP-EXIST-AC", name: "Existing STP (shared)", capacity: 4000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "ac_ww_demand", name: "AC P1 Wastewater Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 12000, min: 8000, max: 18000, step: 500 },
                        { id: "ac_ww_stpCapacity", name: "STP Allocation (AC)", category: "supply", unit: "m\u00b3/day", baselineValue: 6000, min: 4000, max: 10000, step: 500 }
                    ]
                }
            }
        },
        {
            id: "cargo-p1",
            name: "Cargo Village Phase 1",
            milestone: "Q2 2029",
            description: "Dedicated cargo and logistics hub for KSIA operations",
            streams: {
                "potable-water": {
                    demand: 5000, supply: 5500, gap: 0, status: "Ready",
                    entity: "NWC", keyRisk: "None \u2014 supply secured via existing network",
                    projects: [
                        { id: "RWA-CG", name: "RWA Connection (Cargo)", capacity: 3500, date: "Q2 2027", status: "On Track", type: "committed" },
                        { id: "WELLS-CG", name: "On-site Wells (Cargo)", capacity: 2000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_pw_demand", name: "Cargo Water Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 5000, min: 3000, max: 8000, step: 500 },
                        { id: "cg_pw_rwaCapacity", name: "RWA Cargo Allocation", category: "supply", unit: "m\u00b3/day", baselineValue: 3500, min: 2000, max: 5000, step: 500 },
                        { id: "cg_pw_wellCapacity", name: "Cargo Well Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 2000, min: 1500, max: 3000, step: 200 }
                    ]
                },
                "power": {
                    demand: 20, supply: 22, gap: 0, status: "Ready",
                    entity: "SEC", keyRisk: "None \u2014 substation allocation confirmed",
                    projects: [
                        { id: "S-CG", name: "Cargo Substation", capacity: 14, date: "Q4 2028", status: "On Track", type: "committed" },
                        { id: "GRID-CG", name: "Existing Grid (Cargo)", capacity: 8, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_pe_demand", name: "Cargo Power Demand", category: "demand", unit: "MW", baselineValue: 20, min: 12, max: 30, step: 1 },
                        { id: "cg_pe_subCapacity", name: "Cargo Substation Capacity", category: "supply", unit: "MW", baselineValue: 14, min: 10, max: 20, step: 1 },
                        { id: "cg_pe_gridCapacity", name: "Existing Grid (Cargo)", category: "supply", unit: "MW", baselineValue: 8, min: 5, max: 12, step: 1 }
                    ]
                },
                "mobility": {
                    demand: 4000, supply: 3200, gap: 800, status: "Conditional",
                    entity: "MOT", keyRisk: "Cargo access road requires grade separation approval",
                    projects: [
                        { id: "CARGO-RD", name: "Cargo Access Road", capacity: 2000, date: "Q1 2029", status: "Conditional", type: "committed" },
                        { id: "EAST-CG", name: "Eastern Connector (shared)", capacity: 1200, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_mo_demand", name: "Cargo Mobility Demand", category: "demand", unit: "veh/hr", baselineValue: 4000, min: 2500, max: 6000, step: 500 },
                        { id: "cg_mo_roadCompletion", name: "Cargo Road Completion", category: "schedule", unit: "quarter-index", baselineValue: 12, min: 10, max: 16, step: 1 },
                        { id: "cg_mo_roadCapacity", name: "Cargo Road Capacity", category: "supply", unit: "veh/hr", baselineValue: 2000, min: 1500, max: 3500, step: 500 }
                    ]
                },
                "district-cooling": {
                    demand: 8000, supply: 10000, gap: 0, status: "Ready",
                    entity: "KSIA", keyRisk: "None \u2014 cooling capacity available from central plant",
                    projects: [
                        { id: "CCP-CG", name: "Central Cooling Allocation (Cargo)", capacity: 6000, date: "Q1 2027", status: "On Track", type: "committed" },
                        { id: "LOCAL-CG", name: "Local Cooling Units", capacity: 4000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_dc_demand", name: "Cargo Cooling Demand", category: "demand", unit: "TR", baselineValue: 8000, min: 5000, max: 12000, step: 500 },
                        { id: "cg_dc_centralAlloc", name: "Central Cooling Allocation", category: "supply", unit: "TR", baselineValue: 6000, min: 4000, max: 8000, step: 500 }
                    ]
                },
                "digital": {
                    demand: 5, supply: 6, gap: 0, status: "Ready",
                    entity: "STC", keyRisk: "None \u2014 fibre connection planned",
                    projects: [
                        { id: "FIBRE-CG", name: "Fibre Extension (Cargo)", capacity: 4, date: "Q3 2028", status: "On Track", type: "committed" },
                        { id: "NET-CG", name: "Existing Network (Cargo)", capacity: 2, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_di_demand", name: "Cargo Digital Demand", category: "demand", unit: "Gbps", baselineValue: 5, min: 3, max: 10, step: 1 },
                        { id: "cg_di_fibreCapacity", name: "Fibre Capacity (Cargo)", category: "supply", unit: "Gbps", baselineValue: 4, min: 2, max: 6, step: 1 }
                    ]
                },
                "wastewater": {
                    demand: 4000, supply: 4500, gap: 0, status: "Ready",
                    entity: "SWA", keyRisk: "None \u2014 existing STP capacity sufficient",
                    projects: [
                        { id: "STP-CG", name: "STP Allocation (Cargo)", capacity: 2500, date: "Q4 2028", status: "On Track", type: "committed" },
                        { id: "STP-EXIST-CG", name: "Existing STP (shared)", capacity: 2000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "cg_ww_demand", name: "Cargo Wastewater Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 4000, min: 2500, max: 6000, step: 500 },
                        { id: "cg_ww_stpCapacity", name: "STP Allocation (Cargo)", category: "supply", unit: "m\u00b3/day", baselineValue: 2500, min: 1500, max: 4000, step: 500 }
                    ]
                }
            }
        },
        {
            id: "private-aviation",
            name: "Private Aviation",
            milestone: "Q1 2028",
            description: "Dedicated private and VIP aviation terminal and facilities",
            streams: {
                "potable-water": {
                    demand: 3500, supply: 4000, gap: 0, status: "Ready",
                    entity: "NWC", keyRisk: "None \u2014 supply secured",
                    projects: [
                        { id: "RWA-PA", name: "RWA Connection (Private)", capacity: 2500, date: "Q2 2027", status: "On Track", type: "committed" },
                        { id: "WELLS-PA", name: "On-site Wells (Private)", capacity: 1500, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_pw_demand", name: "Private Aviation Water Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 3500, min: 2000, max: 5000, step: 500 },
                        { id: "pa_pw_rwaCapacity", name: "RWA Private Allocation", category: "supply", unit: "m\u00b3/day", baselineValue: 2500, min: 1500, max: 4000, step: 500 }
                    ]
                },
                "power": {
                    demand: 8, supply: 10, gap: 0, status: "Ready",
                    entity: "SEC", keyRisk: "None \u2014 grid capacity available",
                    projects: [
                        { id: "GRID-PA", name: "Grid Allocation (Private)", capacity: 10, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_pe_demand", name: "Private Aviation Power Demand", category: "demand", unit: "MW", baselineValue: 8, min: 5, max: 15, step: 1 },
                        { id: "pa_pe_gridCapacity", name: "Grid Allocation (Private)", category: "supply", unit: "MW", baselineValue: 10, min: 6, max: 15, step: 1 }
                    ]
                },
                "mobility": {
                    demand: 2000, supply: 1500, gap: 500, status: "At Risk",
                    entity: "MOT", keyRisk: "VIP access road requires security clearance and dedicated lane",
                    projects: [
                        { id: "VIP-RD", name: "VIP Access Road", capacity: 1000, date: "Q4 2027", status: "At Risk", type: "committed" },
                        { id: "EXIST-PA", name: "Existing Access (Private)", capacity: 500, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_mo_demand", name: "Private Aviation Mobility Demand", category: "demand", unit: "veh/hr", baselineValue: 2000, min: 1000, max: 3500, step: 250 },
                        { id: "pa_mo_vipCompletion", name: "VIP Road Completion", category: "schedule", unit: "quarter-index", baselineValue: 7, min: 5, max: 12, step: 1 },
                        { id: "pa_mo_vipCapacity", name: "VIP Road Capacity", category: "supply", unit: "veh/hr", baselineValue: 1000, min: 500, max: 2000, step: 250 }
                    ]
                },
                "district-cooling": {
                    demand: 5000, supply: 5000, gap: 0, status: "Ready",
                    entity: "KSIA", keyRisk: "None \u2014 local cooling plant operational",
                    projects: [
                        { id: "LOCAL-PA", name: "Local Cooling Plant (Private)", capacity: 5000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_dc_demand", name: "Private Aviation Cooling Demand", category: "demand", unit: "TR", baselineValue: 5000, min: 3000, max: 8000, step: 500 }
                    ]
                },
                "digital": {
                    demand: 3, supply: 4, gap: 0, status: "Ready",
                    entity: "STC", keyRisk: "None \u2014 network available",
                    projects: [
                        { id: "NET-PA", name: "Existing Network (Private)", capacity: 4, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_di_demand", name: "Private Aviation Digital Demand", category: "demand", unit: "Gbps", baselineValue: 3, min: 1, max: 6, step: 1 }
                    ]
                },
                "wastewater": {
                    demand: 2800, supply: 3000, gap: 0, status: "Ready",
                    entity: "SWA", keyRisk: "None \u2014 existing STP capacity sufficient",
                    projects: [
                        { id: "STP-PA", name: "STP Allocation (Private)", capacity: 3000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "pa_ww_demand", name: "Private Aviation Wastewater Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 2800, min: 1500, max: 4500, step: 500 }
                    ]
                }
            }
        },
        {
            id: "iconic-terminal",
            name: "Iconic Terminal",
            milestone: "Q4 2030",
            description: "Landmark terminal with advanced passenger experience and expanded capacity",
            streams: {
                "potable-water": {
                    demand: 35000, supply: 28000, gap: 7000, status: "Blocked",
                    entity: "NWC", keyRisk: "No credible supply plan to close 7,000 m\u00b3/day gap",
                    projects: [
                        { id: "W-07-IT", name: "W-07 Pipeline (shared)", capacity: 8000, date: "Q3 2028", status: "At Risk", type: "committed" },
                        { id: "RWA-IT", name: "RWA Connection (Iconic)", capacity: 10000, date: "Q2 2027", status: "On Track", type: "committed" },
                        { id: "WELLS-IT", name: "Existing Wells (shared)", capacity: 5000, date: "Operational", status: "Ready", type: "existing" },
                        { id: "NWC-NEW", name: "New NWC Pipeline (planned)", capacity: 5000, date: "Q2 2030", status: "Not Started", type: "planned" }
                    ],
                    assumptions: [
                        { id: "it_pw_demand", name: "Iconic Terminal Water Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 35000, min: 25000, max: 45000, step: 1000 },
                        { id: "it_pw_nwcNewCapacity", name: "New NWC Pipeline Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 5000, min: 0, max: 15000, step: 1000 },
                        { id: "it_pw_nwcNewCompletion", name: "New NWC Pipeline Completion", category: "schedule", unit: "quarter-index", baselineValue: 17, min: 14, max: 24, step: 1 }
                    ]
                },
                "power": {
                    demand: 60, supply: 45, gap: 15, status: "At Risk",
                    entity: "SEC", keyRisk: "Second substation not yet approved by SEC",
                    projects: [
                        { id: "S-12-IT", name: "Substation S-12 (shared)", capacity: 25, date: "Q2 2027", status: "On Track", type: "committed" },
                        { id: "S-15", name: "Substation S-15 (planned)", capacity: 20, date: "Q1 2030", status: "At Risk", type: "planned" }
                    ],
                    assumptions: [
                        { id: "it_pe_demand", name: "Iconic Terminal Power Demand", category: "demand", unit: "MW", baselineValue: 60, min: 40, max: 80, step: 5 },
                        { id: "it_pe_s15Capacity", name: "S-15 Capacity", category: "supply", unit: "MW", baselineValue: 20, min: 10, max: 35, step: 5 },
                        { id: "it_pe_s15Completion", name: "S-15 Completion", category: "schedule", unit: "quarter-index", baselineValue: 16, min: 12, max: 22, step: 1 }
                    ]
                },
                "mobility": {
                    demand: 18000, supply: 12000, gap: 6000, status: "Blocked",
                    entity: "MOT", keyRisk: "Metro connection and highway interchange both unfunded",
                    projects: [
                        { id: "NORTH-RD-IT", name: "Northern Access Road (shared)", capacity: 5000, date: "Q1 2028", status: "At Risk", type: "committed" },
                        { id: "EAST-IT", name: "Eastern Connector (shared)", capacity: 3500, date: "Operational", status: "Ready", type: "existing" },
                        { id: "HWY-INT", name: "Highway Interchange (planned)", capacity: 3500, date: "Q2 2030", status: "Not Started", type: "planned" }
                    ],
                    assumptions: [
                        { id: "it_mo_demand", name: "Iconic Terminal Mobility Demand", category: "demand", unit: "veh/hr", baselineValue: 18000, min: 12000, max: 25000, step: 1000 },
                        { id: "it_mo_hwyCompletion", name: "Highway Interchange Completion", category: "schedule", unit: "quarter-index", baselineValue: 17, min: 14, max: 24, step: 1 },
                        { id: "it_mo_hwyCapacity", name: "Highway Interchange Capacity", category: "supply", unit: "veh/hr", baselineValue: 3500, min: 2000, max: 6000, step: 500 }
                    ]
                },
                "district-cooling": {
                    demand: 30000, supply: 20000, gap: 10000, status: "At Risk",
                    entity: "KSIA", keyRisk: "Cooling Phase 3 requires significant capital and lead time",
                    projects: [
                        { id: "CCP-P1-IT", name: "Central Cooling Phase 1 (shared)", capacity: 10000, date: "Q1 2027", status: "On Track", type: "committed" },
                        { id: "CCP-P3", name: "Central Cooling Phase 3 (planned)", capacity: 10000, date: "Q3 2030", status: "Not Started", type: "planned" }
                    ],
                    assumptions: [
                        { id: "it_dc_demand", name: "Iconic Terminal Cooling Demand", category: "demand", unit: "TR", baselineValue: 30000, min: 20000, max: 40000, step: 1000 },
                        { id: "it_dc_p3Capacity", name: "Cooling Phase 3 Capacity", category: "supply", unit: "TR", baselineValue: 10000, min: 5000, max: 18000, step: 1000 },
                        { id: "it_dc_p3Completion", name: "Cooling Phase 3 Completion", category: "schedule", unit: "quarter-index", baselineValue: 18, min: 14, max: 24, step: 1 }
                    ]
                },
                "digital": {
                    demand: 15, supply: 10, gap: 5, status: "Conditional",
                    entity: "STC", keyRisk: "Additional fibre capacity requires new duct route",
                    projects: [
                        { id: "FIBRE-IT", name: "Fibre Backbone (shared)", capacity: 6, date: "Q3 2027", status: "On Track", type: "committed" },
                        { id: "NET-IT", name: "Existing Network (shared)", capacity: 4, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "it_di_demand", name: "Iconic Terminal Digital Demand", category: "demand", unit: "Gbps", baselineValue: 15, min: 8, max: 25, step: 1 },
                        { id: "it_di_additionalFibre", name: "Additional Fibre Capacity", category: "supply", unit: "Gbps", baselineValue: 0, min: 0, max: 10, step: 1 }
                    ]
                },
                "wastewater": {
                    demand: 28000, supply: 20000, gap: 8000, status: "At Risk",
                    entity: "SWA", keyRisk: "STP Phase 2 expansion not yet approved",
                    projects: [
                        { id: "STP-EXP-IT", name: "STP Expansion (shared)", capacity: 12000, date: "Q2 2028", status: "Conditional", type: "committed" },
                        { id: "STP-EXIST-IT", name: "Existing STP (shared)", capacity: 8000, date: "Operational", status: "Ready", type: "existing" }
                    ],
                    assumptions: [
                        { id: "it_ww_demand", name: "Iconic Terminal Wastewater Demand", category: "demand", unit: "m\u00b3/day", baselineValue: 28000, min: 18000, max: 38000, step: 1000 },
                        { id: "it_ww_stpP2Capacity", name: "STP Phase 2 Capacity", category: "supply", unit: "m\u00b3/day", baselineValue: 0, min: 0, max: 15000, step: 1000 },
                        { id: "it_ww_stpP2Completion", name: "STP Phase 2 Completion", category: "schedule", unit: "quarter-index", baselineValue: 20, min: 16, max: 26, step: 1 }
                    ]
                }
            }
        }
    ],

    // ─── Stream Definitions ────────────────────────────────────────────
    streamDefs: [
        { id: "potable-water", name: "Potable Water", unit: "m\u00b3/day", icon: "\ud83d\udca7" },
        { id: "power", name: "Power & Energy", unit: "MW", icon: "\u26a1" },
        { id: "mobility", name: "Mobility & Roads", unit: "veh/hr", icon: "\ud83d\ude97" },
        { id: "district-cooling", name: "District Cooling", unit: "TR", icon: "\u2744\ufe0f" },
        { id: "digital", name: "Digital & Telecom", unit: "Gbps", icon: "\ud83d\udce1" },
        { id: "wastewater", name: "Wastewater", unit: "m\u00b3/day", icon: "\ud83d\udd04" }
    ],

    // ─── Scenarios (global, apply across streams) ──────────────────────
    scenarios: [
        {
            slot: 1,
            name: "W-07 Delay",
            templateId: "supply-delay",
            color: "#FF5C5C",
            active: true,
            assumptions: { pw_w07Completion: 14 }
        },
        {
            slot: 2,
            name: "Higher Demand",
            templateId: "higher-demand",
            color: "#FFAA00",
            active: true,
            assumptions: { pw_t6DemandDaily: 26000, pw_demandGrowthRate: 5.5 }
        },
        {
            slot: 3,
            name: "Mitigation Package",
            templateId: "mitigation",
            color: "#00C48C",
            active: true,
            assumptions: { pw_w07Completion: 14, pw_interimWells: 3500, pw_miahonaExpansion: 5000 }
        }
    ],

    // ─── Templates ─────────────────────────────────────────────────────
    templates: [
        {
            id: "supply-delay",
            name: "Supply Delay",
            icon: "\u23f3",
            description: "W-07 delayed by 4 quarters to Q3 2029",
            changes: { pw_w07Completion: 14 }
        },
        {
            id: "higher-demand",
            name: "Higher Demand",
            icon: "\ud83d\udcc8",
            description: "T6 demand 24% above baseline with accelerated growth",
            changes: { pw_t6DemandDaily: 26000, pw_demandGrowthRate: 5.5 }
        },
        {
            id: "accelerated",
            name: "Accelerated Opening",
            icon: "\u26a1",
            description: "W-07 and Miahona both delivered ahead of schedule",
            changes: { pw_w07Completion: 8, pw_miahonaCompletion: 3 }
        },
        {
            id: "capacity-constraint",
            name: "Capacity Constraint",
            icon: "\ud83d\udd12",
            description: "W-07 and RWA deliver below design capacity",
            changes: { pw_w07Capacity: 9000, pw_rwaAllocation: 5000 }
        },
        {
            id: "mitigation",
            name: "Mitigation Package",
            icon: "\ud83d\udee1\ufe0f",
            description: "W-07 delayed but offset by interim wells and Miahona expansion",
            changes: { pw_w07Completion: 14, pw_interimWells: 3500, pw_miahonaExpansion: 5000 }
        },
        {
            id: "custom",
            name: "Custom",
            icon: "\u2699\ufe0f",
            description: "Build your own scenario with custom assumptions",
            changes: {}
        }
    ],

    // ─── AI Insights ───────────────────────────────────────────────────
    aiInsights: [
        {
            id: "INS-001",
            type: "critical",
            title: "W-07 Delay Risk Materializing",
            description: "NWC progress reports from August 2026 indicate civil works are 14% behind schedule. Based on historical NWC project delivery patterns, Q1 2029 completion is more likely than the contractual Q3 2028 date. Recommend planning on the basis of a 2-4 quarter delay.",
            relatedScenario: 1,
            confidence: "high",
            source: "NWC Monthly Progress Report \u2014 August 2026"
        },
        {
            id: "INS-002",
            type: "warning",
            title: "Demand Forecast May Underestimate Airport City Phase 1",
            description: "Airport City Phase 1 commercial tenants have submitted water connection applications totalling 4,200 m\u00b3/day, which is 1,800 m\u00b3/day above the master plan allocation used in the baseline demand model.",
            relatedScenario: 2,
            confidence: "medium",
            source: "Airport City Leasing Office \u2014 Tenant Applications Register"
        },
        {
            id: "INS-003",
            type: "recommendation",
            title: "Endorse Interim Wells by Q4 2026",
            description: "Interim well deployment requires a 6-month lead time for permitting, drilling, and commissioning. To ensure availability by Q2 2028, committee endorsement and land allocation must be secured no later than Q4 2026.",
            relatedScenario: 3,
            confidence: "high",
            source: "KSIA Water Infrastructure Team \u2014 Delivery Assessment"
        },
        {
            id: "INS-004",
            type: "info",
            title: "Miahona Expansion Feasibility Confirmed",
            description: "SWA has confirmed that the Miahona site can accommodate expansion to 13,000 m\u00b3/day within the existing land boundary. Preliminary design is available and environmental pre-screening is positive.",
            relatedScenario: 3,
            confidence: "high",
            source: "SWA Feasibility Study \u2014 July 2026"
        },
        {
            id: "INS-005",
            type: "warning",
            title: "Combined Intervention Exceeds Approved Budget",
            description: "The Combined Package cost of SAR 165M exceeds the current approved water infrastructure contingency budget by SAR 45M. A supplementary budget request will be required through the Regional Infrastructure Committee.",
            relatedScenario: null,
            confidence: "high",
            source: "Finance & Budget Office \u2014 Allocation Register"
        },
        {
            id: "INS-006",
            type: "recommendation",
            title: "Establish Monthly W-07 Progress Review with NWC",
            description: "Current reporting from NWC is quarterly with a 6-week lag. Monthly progress reviews with site verification would improve early warning capability and enable faster response to further schedule deterioration.",
            relatedScenario: null,
            confidence: "medium",
            source: "KSIA Program Management Office \u2014 Risk Register"
        }
    ],

    // ─── Decision Brief ────────────────────────────────────────────────
    decisionBrief: {
        title: "T6 Potable Water Readiness \u2014 Decision Brief",
        decisionRequired: "Confirm preferred mitigation approach for T6 potable-water opening exposure",
        currentPosition: {
            status: "At Risk",
            description: "W-07 pipeline delivery timing creates a 1,300 m\u00b3/day baseline gap at T6 opening. Any further delay compounds the shortfall."
        },
        scenariosTested: [
            { name: "W-07 Delay", summary: "4-quarter delay to Q3 2029 widens the gap to 13,300 m\u00b3/day at T6 opening, status drops to Blocked" },
            { name: "Higher Demand", summary: "T6 demand at 26,000 m\u00b3/day with 5.5% growth increases baseline gap to 6,300 m\u00b3/day" },
            { name: "Mitigation Package", summary: "Interim wells (3,500) and Miahona expansion (5,000) close the gap even under W-07 delay, achieving Ready status" }
        ],
        probabilityAssessment: {
            probabilityOfReadiness: 62,
            basis: "Monte Carlo simulation with 5,000 runs based on current uncertainty ranges"
        },
        preferredIntervention: {
            name: "Combined Package",
            rationale: "Provides 8,500 m\u00b3/day additional capacity by Q2 2028, fully closing the gap under the most likely delay scenario. High feasibility due to proven interim-well approach and confirmed Miahona expansion design. Cost of SAR 165M is justified by criticality of T6 opening date."
        },
        residualRisk: {
            level: "Low",
            description: "With the combined package in place, supply exceeds demand under all tested scenarios except the extreme case of simultaneous W-07 delay beyond Q1 2030 and demand exceeding 28,000 m\u00b3/day. Residual exposure is less than 500 m\u00b3/day with a probability below 5%."
        },
        actions: [
            {
                owner: "Regional Infrastructure Committee",
                action: "Endorse the Combined Package (interim wells + Miahona expansion) and approve SAR 165M funding request",
                deadline: "Q4 2026",
                status: "Pending"
            },
            {
                owner: "KSIA Program Office",
                action: "Submit land allocation request for interim well field to Riyadh Municipality",
                deadline: "November 2026",
                status: "Pending"
            },
            {
                owner: "NWC Liaison",
                action: "Establish monthly W-07 progress review with dedicated acceleration tracking",
                deadline: "October 2026",
                status: "In Progress"
            },
            {
                owner: "Finance & Budget",
                action: "Prepare supplementary budget request for SAR 45M shortfall above current approved allocation",
                deadline: "Q4 2026",
                status: "Pending"
            }
        ],
        monitoringTriggers: [
            {
                condition: "W-07 forecast date slips beyond Q4 2028",
                response: "Immediately activate interim well deployment and escalate to Steering Committee"
            },
            {
                condition: "T6 demand forecast exceeds 25,000 m\u00b3/day in next quarterly update",
                response: "Reassess Miahona expansion scope and evaluate additional RWA allocation"
            },
            {
                condition: "SWA rejects Miahona expansion design or environmental assessment",
                response: "Accelerate interim well capacity to 5,000 m\u00b3/day and engage alternative treatment providers"
            }
        ],
        preparedBy: "KSIA Infrastructure Intelligence Platform",
        date: "September 2026"
    },

    // ─── Cross-Stream Dependencies ─────────────────────────────────────
    dependencies: [
        {
            id: "utility-corridor",
            name: "Shared Utility Corridor",
            description: "Northern utility corridor serves water, power and digital. A delay affects all three.",
            affectedVariables: ["pw_w07Completion", "pe_s12Completion", "di_fibreCompletion"],
            correlationType: "shared-delay",
            correlationStrength: 0.6,
            dataConfidence: "medium"
        },
        {
            id: "northern-road-access",
            name: "Northern Road Construction Access",
            description: "Road construction delays affect mobility directly and delay utility commissioning access.",
            affectedVariables: ["mo_northernCompletion", "pw_w07Completion"],
            correlationType: "causal",
            correlationStrength: 0.4,
            dataConfidence: "low"
        },
        {
            id: "power-cooling-dependency",
            name: "Power \u2192 District Cooling",
            description: "Central cooling plant requires permanent power connection. Power delay cascades to cooling.",
            affectedVariables: ["pe_s12Completion", "dc_centralCompletion"],
            correlationType: "causal",
            correlationStrength: 0.7,
            dataConfidence: "high"
        },
        {
            id: "power-water-dependency",
            name: "Power \u2192 Water Treatment",
            description: "Miahona treatment plant requires reliable power for full commissioning.",
            affectedVariables: ["pe_s12Completion", "pw_miahonaCapacity"],
            correlationType: "causal",
            correlationStrength: 0.3,
            dataConfidence: "medium"
        },
        {
            id: "regulatory-approval",
            name: "Common Regulatory Approval",
            description: "Environmental approval process affects wastewater STP and interim wells simultaneously.",
            affectedVariables: ["ww_stpCompletion", "pw_interimWells"],
            correlationType: "shared-delay",
            correlationStrength: 0.5,
            dataConfidence: "medium"
        }
    ],

    // ─── Monte Carlo Global Configuration ──────────────────────────────
    monteCarloConfig: {
        defaultRuns: 10000,
        readinessThresholds: {
            // For each stream, gap <= 0 means ready. Severity buckets below define granularity.
        },
        severityBuckets: [
            { label: "No gap (Ready)", condition: "gap <= 0" },
            { label: "Minor gap", condition: "gap > 0 && gap <= 2000" },
            { label: "Moderate gap", condition: "gap > 2000 && gap <= 5000" },
            { label: "Severe gap", condition: "gap > 5000" }
        ]
    }
};
