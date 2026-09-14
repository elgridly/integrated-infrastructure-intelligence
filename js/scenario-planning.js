/**
 * Scenario Planning Module — KSIA Regional Infrastructure Decision Intelligence Platform
 * Multi-asset, multi-stream architecture
 * 4-view structure: What-if | Scenario Comparison | Risk & Sensitivity | Interventions & Decision
 */
(function () {
    'use strict';

    var SCENARIO_DATA = window.SCENARIO_DATA;

    // ─── Chart.js Global Defaults ──────────────────────────────────────
    Chart.defaults.color = '#8585A0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.animation.duration = 600;

    // ─── Quarter Helpers ───────────────────────────────────────────────
    var QUARTERS = [];
    for (var y = 2026; y <= 2032; y++) {
        for (var q = 1; q <= 4; q++) {
            QUARTERS.push('Q' + q + ' ' + y);
        }
    }

    function quarterIndex(label) {
        return QUARTERS.indexOf(label);
    }

    function fmt(n) {
        return Number(n).toLocaleString();
    }

    // ─── State ─────────────────────────────────────────────────────────
    var state = {
        selectedAsset: 't6',
        expandedStream: null,
        activeTab: 'whatif',
        activeScenario: 'baseline',
        scenarios: JSON.parse(JSON.stringify(SCENARIO_DATA.scenarios)),
        charts: {},
        configModalSlot: null,
        monteCarloResults: {},
        mcScope: 'all',
        mcRuns: 10000
    };

    // ─── Asset / Stream Helpers ────────────────────────────────────────
    function getAsset(assetId) {
        return SCENARIO_DATA.assets.find(function (a) { return a.id === assetId; });
    }

    function getStreamDef(streamId) {
        return SCENARIO_DATA.streamDefs.find(function (s) { return s.id === streamId; });
    }

    function getAssetStreams(assetId) {
        var asset = getAsset(assetId);
        if (!asset) return [];
        var out = [];
        SCENARIO_DATA.streamDefs.forEach(function (sd) {
            if (asset.streams[sd.id]) {
                out.push({ def: sd, data: asset.streams[sd.id] });
            }
        });
        return out;
    }

    // ─── Assumption Helpers ────────────────────────────────────────────
    function getStreamBaseAssumptions(streamData) {
        var out = {};
        if (streamData && streamData.assumptions) {
            streamData.assumptions.forEach(function (a) {
                out[a.id] = a.baselineValue;
            });
        }
        return out;
    }

    function getStreamAssumptions(streamData, scenarioId) {
        var base = getStreamBaseAssumptions(streamData);
        if (scenarioId === 'baseline') return base;
        var sc = state.scenarios.find(function (s) { return String(s.slot) === String(scenarioId); });
        if (!sc) return base;
        Object.keys(sc.assumptions).forEach(function (k) {
            if (base.hasOwnProperty(k)) {
                base[k] = sc.assumptions[k];
            }
        });
        return base;
    }

    function getAllBaseAssumptions(assetId) {
        var asset = getAsset(assetId);
        if (!asset) return {};
        var out = {};
        Object.keys(asset.streams).forEach(function (sid) {
            var sd = asset.streams[sid];
            if (sd.assumptions) {
                sd.assumptions.forEach(function (a) {
                    out[a.id] = a.baselineValue;
                });
            }
        });
        return out;
    }

    function getAllScenarioAssumptions(assetId, scenarioId) {
        var base = getAllBaseAssumptions(assetId);
        if (scenarioId === 'baseline') return base;
        var sc = state.scenarios.find(function (s) { return String(s.slot) === String(scenarioId); });
        if (!sc) return base;
        Object.keys(sc.assumptions).forEach(function (k) {
            if (base.hasOwnProperty(k)) {
                base[k] = sc.assumptions[k];
            }
        });
        return base;
    }

    function mergeAssumptions(base, overrides) {
        var out = JSON.parse(JSON.stringify(base));
        Object.keys(overrides).forEach(function (k) { out[k] = overrides[k]; });
        return out;
    }

    // ─── Computation Engine ────────────────────────────────────────────

    // Full timeseries computation for T6 potable water (has timeseriesDemand/timeseriesSupply)
    function computeFullTimeseries(streamData, assumptions) {
        var demand = [];
        var supply = [];
        var gap = [];

        var baseDemand = streamData.timeseriesDemand;
        var baseGrowth = 3.5;
        // Find the demand growth assumption
        var growthId = null;
        var t6DemandId = null;
        streamData.assumptions.forEach(function (a) {
            if (a.id.indexOf('demandGrowthRate') !== -1) growthId = a.id;
            if (a.id.indexOf('t6DemandDaily') !== -1) t6DemandId = a.id;
        });
        var growthRatio = growthId && assumptions[growthId] !== undefined ? assumptions[growthId] / baseGrowth : 1;
        var t6DemandDaily = t6DemandId && assumptions[t6DemandId] !== undefined ? assumptions[t6DemandId] : 21000;

        var baseQ1 = baseDemand[0].value;
        for (var i = 0; i < QUARTERS.length; i++) {
            var baseVal = i < baseDemand.length ? baseDemand[i].value : baseDemand[baseDemand.length - 1].value;
            if (i < 10) {
                var preTgrowth = (baseVal - baseQ1) * growthRatio;
                demand.push(Math.round(baseQ1 + preTgrowth));
            } else {
                var basePreT6 = baseDemand[9].value;
                var basePostT6 = baseDemand[10].value;
                var baseT6Jump = basePostT6 - basePreT6;
                var scaledT6Jump = (t6DemandDaily / 21000) * baseT6Jump;
                var basePostGrowth = (baseVal - basePostT6) * growthRatio;
                var preT6Val = demand[9];
                demand.push(Math.round(preT6Val + scaledT6Jump + basePostGrowth));
            }
        }

        // Supply: find assumptions by ID patterns
        var wellCap = assumptions.pw_wellCapacity || 7400;
        var miahonaCap = assumptions.pw_miahonaCapacity || 8000;
        var miahonaQ = Math.round(assumptions.pw_miahonaCompletion || 4);
        var rwaCap = assumptions.pw_rwaAllocation || 12000;
        var rwaQ = 5;
        var w07Cap = assumptions.pw_w07Capacity || 12000;
        var w07Q = Math.round(assumptions.pw_w07Completion || 10);
        var interimCap = assumptions.pw_interimWells || 0;
        var interimQ = 9;
        var expansionCap = assumptions.pw_miahonaExpansion || 0;
        var expansionQ = 8;

        for (var i = 0; i < QUARTERS.length; i++) {
            var s = wellCap;
            if (i >= miahonaQ) s += miahonaCap;
            if (i >= rwaQ) s += rwaCap;
            if (i > w07Q) s += w07Cap;
            if (interimCap > 0 && i >= interimQ) s += interimCap;
            if (expansionCap > 0 && i >= expansionQ) s += expansionCap;
            supply.push(s);
        }

        for (var i = 0; i < QUARTERS.length; i++) {
            gap.push(Math.max(0, demand[i] - supply[i]));
        }

        return { demand: demand, supply: supply, gap: gap };
    }

    // Simplified timeseries for streams without full timeseries data
    function computeSimpleTimeseries(streamData, assumptions) {
        var demand = [];
        var supply = [];
        var gap = [];

        // Find the demand assumption
        var demandVal = streamData.demand;
        streamData.assumptions.forEach(function (a) {
            if (a.category === 'demand' && assumptions[a.id] !== undefined) {
                demandVal = assumptions[a.id];
            }
        });

        for (var i = 0; i < QUARTERS.length; i++) {
            demand.push(demandVal);

            var s = 0;
            streamData.projects.forEach(function (p) {
                if (p.date === 'Operational' || p.status === 'Ready' || p.type === 'existing') {
                    // Find capacity assumption override
                    var cap = p.capacity;
                    streamData.assumptions.forEach(function (a) {
                        if (a.category === 'supply' && assumptions[a.id] !== undefined) {
                            // Match by checking if assumption name relates to this project
                            if (a.id.indexOf('gridCapacity') !== -1 && p.id.indexOf('GRID') !== -1) cap = assumptions[a.id];
                            else if (a.id.indexOf('wellCapacity') !== -1 && p.id.indexOf('WELL') !== -1) cap = assumptions[a.id];
                            else if (a.id.indexOf('existingCapacity') !== -1 && p.type === 'existing') cap = assumptions[a.id];
                        }
                    });
                    s += cap;
                } else {
                    // Find the completion quarter for this project from assumptions
                    var completionQ = findProjectCompletionQuarter(p, streamData, assumptions);
                    var cap = findProjectCapacity(p, streamData, assumptions);
                    if (i > completionQ) s += cap;
                }
            });
            supply.push(s);
            gap.push(Math.max(0, demand[i] - supply[i]));
        }

        return { demand: demand, supply: supply, gap: gap };
    }

    function findProjectCompletionQuarter(project, streamData, assumptions) {
        // Try to find a schedule assumption that matches this project
        var defaultQ = quarterIndex(project.date);
        if (defaultQ < 0) defaultQ = 10; // fallback
        if (!streamData.assumptions) return defaultQ;

        for (var i = 0; i < streamData.assumptions.length; i++) {
            var a = streamData.assumptions[i];
            if (a.category === 'schedule' && a.unit === 'quarter-index') {
                // Heuristic: match assumption to project by name overlap
                var aLow = a.name.toLowerCase();
                var pLow = project.name.toLowerCase();
                // Check if the assumption name contains key words from the project
                if (matchesProject(aLow, pLow, project.id)) {
                    return Math.round(assumptions[a.id] !== undefined ? assumptions[a.id] : a.baselineValue);
                }
            }
        }
        return defaultQ;
    }

    function findProjectCapacity(project, streamData, assumptions) {
        var cap = project.capacity;
        if (!streamData.assumptions) return cap;

        for (var i = 0; i < streamData.assumptions.length; i++) {
            var a = streamData.assumptions[i];
            if (a.category === 'supply' && a.unit !== 'quarter-index') {
                var aLow = a.name.toLowerCase();
                var pLow = project.name.toLowerCase();
                if (matchesProject(aLow, pLow, project.id)) {
                    return assumptions[a.id] !== undefined ? assumptions[a.id] : a.baselineValue;
                }
            }
        }
        return cap;
    }

    function matchesProject(assumptionName, projectName, projectId) {
        // Simple heuristic matching
        var pid = projectId.toLowerCase().replace(/-/g, ' ');
        // Check for common keywords
        var keywords = projectName.split(/[\s()/]+/).filter(function (w) { return w.length > 2; });
        var matches = 0;
        keywords.forEach(function (kw) {
            if (assumptionName.indexOf(kw.toLowerCase()) !== -1) matches++;
        });
        return matches >= 1;
    }

    function computeTimeseries(streamData, assumptions) {
        if (streamData.timeseriesDemand && streamData.timeseriesSupply) {
            return computeFullTimeseries(streamData, assumptions);
        }
        return computeSimpleTimeseries(streamData, assumptions);
    }

    function computeStreamGap(streamData, assumptions, milestoneLabel) {
        var ts = computeTimeseries(streamData, assumptions);
        var idx = quarterIndex(milestoneLabel);
        if (idx < 0) idx = 10;
        idx = Math.min(idx, ts.demand.length - 1);
        return ts.demand[idx] - ts.supply[idx];
    }

    function computeReadiness(gap) {
        if (gap <= 0) return 'Ready';
        if (gap <= 1500) return 'Conditional';
        if (gap <= 5000) return 'At Risk';
        return 'Blocked';
    }

    function statusClass(status) {
        return status.toLowerCase().replace(/\s+/g, '-');
    }

    function statusColor(status) {
        var map = { 'Ready': '#00C48C', 'Conditional': '#FFAA00', 'At Risk': '#FF5C5C', 'Blocked': '#E63946' };
        return map[status] || '#8585A0';
    }

    var STATUS_PRIORITY = { 'Blocked': 4, 'At Risk': 3, 'Conditional': 2, 'Ready': 1 };

    function worstStatus(statuses) {
        var worst = 'Ready';
        statuses.forEach(function (s) {
            if ((STATUS_PRIORITY[s] || 0) > (STATUS_PRIORITY[worst] || 0)) worst = s;
        });
        return worst;
    }

    // ─── Chart Management ──────────────────────────────────────────────
    function createChart(canvasId, config) {
        if (state.charts[canvasId]) {
            state.charts[canvasId].destroy();
        }
        var el = document.getElementById(canvasId);
        if (!el) return null;
        var ctx = el.getContext('2d');
        state.charts[canvasId] = new Chart(ctx, config);
        return state.charts[canvasId];
    }

    function destroyAllCharts() {
        Object.keys(state.charts).forEach(function (k) {
            if (state.charts[k]) { state.charts[k].destroy(); delete state.charts[k]; }
        });
    }

    // ─── Context Header Helper ─────────────────────────────────────────
    function contextHeader() {
        var asset = getAsset(state.selectedAsset);
        if (!asset) return '';
        return '<div class="context-banner" style="font-size:13px;color:var(--text-secondary);padding:12px 0 4px;font-weight:500;">' +
            '<span class="context-banner-asset" style="font-weight:700;color:var(--text-primary)">' + asset.name + '</span>' +
            '<span class="context-banner-sep" style="margin:0 6px;color:var(--text-tertiary);"> \u2014 </span>' +
            '<span class="context-banner-milestone">' + asset.milestone + '</span>' +
        '</div>';
    }

    // ─── Stream Grid CSS ───────────────────────────────────────────────
    function streamGridCSS() {
        return '<style>' +
            '.stream-grid { display: flex; flex-direction: column; gap: 2px; }' +
            '.stream-row { background: var(--bg-card); border-radius: 8px; overflow: hidden; }' +
            '.stream-row-summary {' +
            '    display: grid; grid-template-columns: 36px 1.2fr 1fr 1fr 1fr 100px 80px 30px;' +
            '    align-items: center; padding: 12px 16px; cursor: pointer; gap: 8px;' +
            '    transition: background 0.15s;' +
            '}' +
            '.stream-row-summary:hover { background: var(--bg-card-hover); }' +
            '.stream-row.expanded .stream-row-summary { background: rgba(77,166,255,0.08); border-bottom: 1px solid var(--border-dark); }' +
            '.stream-detail { padding: 16px; display: none; }' +
            '.stream-row.expanded .stream-detail { display: block; }' +
            '.stream-icon { font-size: 18px; text-align: center; }' +
            '.stream-name { font-weight: 600; font-size: 12px; }' +
            '.stream-demand, .stream-supply, .stream-gap { font-size: 11px; color: var(--text-secondary); }' +
            '.stream-gap { font-weight: 600; }' +
            '.stream-status { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-align: center; text-transform: uppercase; }' +
            '.stream-status.ready { background: rgba(0,196,140,0.15); color: #00C48C; }' +
            '.stream-status.conditional { background: rgba(255,170,0,0.15); color: #FFAA00; }' +
            '.stream-status.at-risk { background: rgba(255,92,92,0.15); color: #FF5C5C; }' +
            '.stream-status.blocked { background: rgba(230,57,70,0.15); color: #E63946; }' +
            '.stream-entity { font-size: 10px; color: var(--text-tertiary); }' +
            '.stream-expand-icon { font-size: 10px; color: var(--text-tertiary); transition: transform 0.2s; }' +
            '.stream-row.expanded .stream-expand-icon { transform: rotate(180deg); }' +
        '</style>';
    }

    // ─── Context Selectors ─────────────────────────────────────────────
    function initContextSelectors() {
        var streamSelect = document.getElementById('stream-select');
        var assetSelect = document.getElementById('asset-select');
        if (!streamSelect || !assetSelect) return;

        // Populate assets
        SCENARIO_DATA.assets.forEach(function (a) {
            var opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.name + ' \u2014 ' + a.milestone;
            if (a.id === 't6') opt.selected = true;
            assetSelect.appendChild(opt);
        });

        // Populate streams (as filter)
        var allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Streams';
        allOpt.selected = true;
        streamSelect.appendChild(allOpt);
        SCENARIO_DATA.streamDefs.forEach(function (s) {
            var opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            streamSelect.appendChild(opt);
        });

        assetSelect.addEventListener('change', function () {
            state.selectedAsset = this.value;
            state.expandedStream = null;
            state.monteCarloResults = {};
            renderTab(state.activeTab);
        });

        streamSelect.addEventListener('change', function () {
            if (this.value === 'all') {
                state.expandedStream = null;
            } else {
                state.expandedStream = this.value;
            }
            renderTab(state.activeTab);
        });
    }

    // ─── Tab Management ────────────────────────────────────────────────
    function initScenarioTabs() {
        var tabs = document.querySelectorAll('#scenario-tabs .scenario-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                state.activeScenario = tab.getAttribute('data-scenario');
                renderTab(state.activeTab);
            });
        });
        updateScenarioTabLabels();
    }

    var SLOT_LETTERS = { 1: 'A', 2: 'B', 3: 'C' };

    function updateScenarioTabLabels() {
        state.scenarios.forEach(function (sc) {
            var tab = document.querySelector('.scenario-tab[data-scenario="' + sc.slot + '"]');
            var letter = SLOT_LETTERS[sc.slot] || sc.slot;
            if (tab) tab.textContent = 'Scenario ' + letter + ': ' + (sc.name || 'Untitled');
        });
    }

    function initAnalyticsTabs() {
        var tabs = document.querySelectorAll('#analytics-tabs .analytics-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                state.activeTab = tab.getAttribute('data-tab');
                renderTab(state.activeTab);
            });
        });
    }

    function renderTab(tabId) {
        state.activeTab = tabId;
        destroyAllCharts();
        switch (tabId) {
            case 'whatif': renderWhatIf(); break;
            case 'scenario': renderScenarioComparison(); break;
            case 'risk': renderRiskSensitivity(); break;
            case 'decision': renderInterventionsDecision(); break;
            default:
                document.getElementById('main-content').innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">Select a tab</div>';
        }
    }

    // ─── Toggle Stream ─────────────────────────────────────────────────
    function toggleStream(streamId) {
        if (state.expandedStream === streamId) {
            state.expandedStream = null;
        } else {
            state.expandedStream = streamId;
        }
        renderTab(state.activeTab);
    }
    window.toggleStream = toggleStream;

    // ════════════════════════════════════════════════════════════════════
    // VIEW 1: Baseline & What-if
    // ════════════════════════════════════════════════════════════════════
    function renderWhatIf() {
        var mc = document.getElementById('main-content');
        var asset = getAsset(state.selectedAsset);
        if (!asset) { mc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">No asset selected</div>'; return; }

        var streams = getAssetStreams(state.selectedAsset);
        var streamFilter = document.getElementById('stream-select');
        var filterVal = streamFilter ? streamFilter.value : 'all';

        // Compute statuses for all streams
        var statuses = [];
        var statusCounts = { 'Ready': 0, 'Conditional': 0, 'At Risk': 0, 'Blocked': 0 };
        streams.forEach(function (s) {
            var assumptions = getStreamAssumptions(s.data, state.activeScenario);
            var gapVal = computeStreamGap(s.data, assumptions, asset.milestone);
            var rdns = computeReadiness(Math.max(0, gapVal));
            statuses.push(rdns);
            statusCounts[rdns] = (statusCounts[rdns] || 0) + 1;
        });
        var overallStatus = worstStatus(statuses);

        var summaryParts = [];
        ['Ready', 'Conditional', 'At Risk', 'Blocked'].forEach(function (s) {
            if (statusCounts[s]) summaryParts.push(statusCounts[s] + ' ' + s);
        });

        var html = streamGridCSS() + contextHeader();

        // Asset readiness header
        html += '<div class="asset-readiness-header" style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:var(--bg-card);border-radius:8px;margin-bottom:8px">' +
            '<div style="font-size:16px;font-weight:800">' + asset.name + '</div>' +
            '<div style="font-size:12px;color:var(--text-tertiary)">' + asset.milestone + '</div>' +
            '<span class="stream-status ' + statusClass(overallStatus) + '" style="font-size:11px;padding:4px 12px">' + overallStatus + '</span>' +
            '<div style="font-size:11px;color:var(--text-secondary);margin-left:auto">' + summaryParts.join(' \u00b7 ') + '</div>' +
        '</div>';

        // Stream grid header
        html += '<div class="stream-grid">';
        html += '<div class="stream-row-header" style="display:grid; grid-template-columns: 36px 1.2fr 1fr 1fr 1fr 100px 80px 30px; padding: 6px 16px; gap: 8px; font-size: 9px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px;">' +
            '<span></span><span>Stream</span><span>Demand</span><span>Supply</span><span>Gap</span><span>Status</span><span>Entity</span><span></span>' +
        '</div>';

        // Stream rows
        streams.forEach(function (s, idx) {
            if (filterVal !== 'all' && s.def.id !== filterVal) return;

            var assumptions = getStreamAssumptions(s.data, state.activeScenario);
            var gapVal = computeStreamGap(s.data, assumptions, asset.milestone);
            var rdns = computeReadiness(Math.max(0, gapVal));
            var expanded = state.expandedStream === s.def.id;

            html += '<div class="stream-row' + (expanded ? ' expanded' : '') + '" data-stream="' + s.def.id + '">';
            html += '<div class="stream-row-summary" onclick="toggleStream(\'' + s.def.id + '\')">';
            html += '<span class="stream-icon">' + s.def.icon + '</span>';
            html += '<span class="stream-name">' + s.def.name + '</span>';
            html += '<span class="stream-demand">' + fmt(s.data.demand) + ' ' + s.def.unit + '</span>';
            html += '<span class="stream-supply">' + fmt(s.data.supply) + ' ' + s.def.unit + '</span>';
            html += '<span class="stream-gap" style="color:' + (gapVal > 0 ? '#FF5C5C' : '#00C48C') + '">' + (gapVal > 0 ? fmt(gapVal) : '\u2212' + fmt(Math.abs(gapVal))) + ' ' + s.def.unit + '</span>';
            html += '<span class="stream-status ' + statusClass(rdns) + '">' + rdns + '</span>';
            html += '<span class="stream-entity">' + (s.data.entity || '') + '</span>';
            html += '<span class="stream-expand-icon">\u25BC</span>';
            html += '</div>';

            // Detail panel
            html += '<div class="stream-detail">';
            if (expanded) {
                html += renderStreamDetail(s, asset, state.activeScenario);
            }
            html += '</div>';
            html += '</div>';
        });

        html += '</div>';

        mc.innerHTML = html;

        // After innerHTML, create charts for the expanded stream
        if (state.expandedStream) {
            var expandedS = streams.find(function (s) { return s.def.id === state.expandedStream; });
            if (expandedS) {
                createStreamChart(expandedS, asset, state.activeScenario);
                wireStreamSliders(expandedS, asset);
            }
        }
    }

    function renderStreamDetail(s, asset, scenarioId) {
        var assumptions = getStreamAssumptions(s.data, scenarioId);
        var chartId = 'chart-stream-' + s.def.id;

        // Sliders
        var slidersHtml = '';
        if (s.data.assumptions) {
            s.data.assumptions.forEach(function (a) {
                var val = assumptions[a.id] !== undefined ? assumptions[a.id] : a.baselineValue;
                var displayVal = a.unit === '%' ? val + '%' : (a.unit === 'quarter-index' ? QUARTERS[Math.round(val)] || val : fmt(val) + ' ' + a.unit);
                slidersHtml += '<div class="whatif-slider-group">' +
                    '<div class="whatif-slider-label"><span>' + a.name + '</span><span class="slider-value" id="val-' + a.id + '">' + displayVal + '</span></div>' +
                    '<input type="range" class="whatif-slider" id="slider-' + a.id + '" min="' + a.min + '" max="' + a.max + '" step="' + a.step + '" value="' + val + '" data-stream="' + s.def.id + '">' +
                    '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-tertiary);margin-top:2px"><span>' + a.min + '</span><span>Baseline: ' + a.baselineValue + '</span><span>' + a.max + '</span></div>' +
                '</div>';
            });
        }

        var html = '<div style="display:grid;grid-template-columns:2fr 3fr;gap:16px">';

        // Left: sliders
        html += '<div>';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
            '<span style="font-size:13px;font-weight:700">' + s.def.name + ' Assumptions</span>' +
            '<div style="display:flex;gap:8px"><button class="btn-secondary stream-reset-btn" data-stream="' + s.def.id + '" style="padding:4px 12px;font-size:10px">Reset</button><button class="btn-primary stream-save-btn" data-stream="' + s.def.id + '" style="padding:4px 12px;font-size:10px">Save as Scenario</button></div>' +
        '</div>';
        html += '<div class="whatif-controls" style="grid-template-columns:1fr">' + slidersHtml + '</div>';
        html += '</div>';

        // Right: chart
        html += '<div>';
        html += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128200;</span> Supply vs Demand \u2014 ' + s.def.name + '</div>';
        html += '<div class="panel-body">';
        html += '<div class="kpi-row-mini" id="kpi-' + s.def.id + '"></div>';
        html += '<div class="chart-container" style="height:280px"><canvas id="' + chartId + '"></canvas></div>';
        // Key risk
        if (s.data.keyRisk) {
            html += '<div style="margin-top:10px;padding:8px 12px;background:rgba(255,92,92,0.06);border-radius:6px;font-size:10px;color:var(--text-secondary)"><strong style="color:#FF5C5C">Key Risk:</strong> ' + s.data.keyRisk + '</div>';
        }
        html += '</div></div>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    function createStreamChart(s, asset, scenarioId) {
        var assumptions = getStreamAssumptions(s.data, scenarioId);
        var ts = computeTimeseries(s.data, assumptions);
        var milestoneIdx = quarterIndex(asset.milestone);
        if (milestoneIdx < 0) milestoneIdx = 10;
        milestoneIdx = Math.min(milestoneIdx, ts.demand.length - 1);

        var gapVal = ts.demand[milestoneIdx] - ts.supply[milestoneIdx];
        var rdns = computeReadiness(Math.max(0, gapVal));

        var kpiEl = document.getElementById('kpi-' + s.def.id);
        if (kpiEl) {
            kpiEl.innerHTML =
                '<div class="kpi-mini"><div class="kpi-mini-label">Gap at ' + asset.milestone + '</div><div class="kpi-mini-value" style="color:' + statusColor(rdns) + '">' + fmt(Math.abs(gapVal)) + '</div><div class="kpi-mini-sub">' + (gapVal > 0 ? 'Shortfall' : 'Surplus') + '</div></div>' +
                '<div class="kpi-mini"><div class="kpi-mini-label">Demand</div><div class="kpi-mini-value red">' + fmt(ts.demand[milestoneIdx]) + '</div></div>' +
                '<div class="kpi-mini"><div class="kpi-mini-label">Supply</div><div class="kpi-mini-value blue">' + fmt(ts.supply[milestoneIdx]) + '</div></div>' +
                '<div class="kpi-mini"><div class="kpi-mini-label">Status</div><div class="kpi-mini-value" style="color:' + statusColor(rdns) + '">' + rdns + '</div></div>';
        }

        var chartId = 'chart-stream-' + s.def.id;
        var annotations = {
            milestoneLine: { type: 'line', xMin: milestoneIdx, xMax: milestoneIdx, borderColor: '#FFE600', borderWidth: 2, label: { content: asset.name, display: true, position: 'start', backgroundColor: 'rgba(255,230,0,0.15)', color: '#FFE600', font: { size: 9 } } }
        };

        // Add W-07 annotation for potable water
        if (s.def.id === 'potable-water' && assumptions.pw_w07Completion !== undefined) {
            var w07Q = Math.round(assumptions.pw_w07Completion);
            annotations.w07Line = { type: 'line', xMin: w07Q, xMax: w07Q, borderColor: '#4DA6FF', borderDash: [4, 4], borderWidth: 1, label: { content: 'W-07', display: true, position: 'start', backgroundColor: 'rgba(77,166,255,0.15)', color: '#4DA6FF', font: { size: 9 } } };
        }

        createChart(chartId, {
            type: 'line',
            data: {
                labels: QUARTERS,
                datasets: [
                    { label: 'Demand', data: ts.demand, borderColor: '#FF5C5C', borderDash: [5, 3], fill: false, tension: 0.2, pointRadius: 0 },
                    { label: 'Supply', data: ts.supply, borderColor: '#4DA6FF', stepped: 'before', fill: false, pointRadius: 0 },
                    { label: 'Gap', data: ts.gap, backgroundColor: 'rgba(255,92,92,0.15)', fill: 'origin', borderColor: 'transparent', pointRadius: 0 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { annotation: { annotations: annotations } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return fmt(v); } } },
                    x: { grid: { display: false }, ticks: { color: '#8585A0', maxRotation: 45, autoSkip: true, maxTicksLimit: 14 } }
                }
            }
        });
    }

    function wireStreamSliders(s, asset) {
        if (!s.data.assumptions) return;
        var currentAssumptions = getStreamAssumptions(s.data, state.activeScenario);

        s.data.assumptions.forEach(function (a) {
            var slider = document.getElementById('slider-' + a.id);
            if (!slider) return;
            slider.addEventListener('input', function () {
                var val = parseFloat(this.value);
                currentAssumptions[a.id] = val;
                var display = a.unit === '%' ? val + '%' : (a.unit === 'quarter-index' ? (QUARTERS[Math.round(val)] || val) : fmt(val) + ' ' + a.unit);
                document.getElementById('val-' + a.id).textContent = display;
                // Update chart
                var ts = computeTimeseries(s.data, currentAssumptions);
                var chartId = 'chart-stream-' + s.def.id;
                var chart = state.charts[chartId];
                if (chart) {
                    chart.data.datasets[0].data = ts.demand;
                    chart.data.datasets[1].data = ts.supply;
                    chart.data.datasets[2].data = ts.gap;
                    // Update annotations if potable water
                    if (s.def.id === 'potable-water' && currentAssumptions.pw_w07Completion !== undefined) {
                        var w07Q = Math.round(currentAssumptions.pw_w07Completion);
                        chart.options.plugins.annotation.annotations.w07Line.xMin = w07Q;
                        chart.options.plugins.annotation.annotations.w07Line.xMax = w07Q;
                    }
                    chart.update('none');
                }
                // Update KPIs
                var milestoneIdx = quarterIndex(asset.milestone);
                if (milestoneIdx < 0) milestoneIdx = 10;
                milestoneIdx = Math.min(milestoneIdx, ts.demand.length - 1);
                var gapVal = ts.demand[milestoneIdx] - ts.supply[milestoneIdx];
                var rdns = computeReadiness(Math.max(0, gapVal));
                var kpiEl = document.getElementById('kpi-' + s.def.id);
                if (kpiEl) {
                    kpiEl.innerHTML =
                        '<div class="kpi-mini"><div class="kpi-mini-label">Gap at ' + asset.milestone + '</div><div class="kpi-mini-value" style="color:' + statusColor(rdns) + '">' + fmt(Math.abs(gapVal)) + '</div><div class="kpi-mini-sub">' + (gapVal > 0 ? 'Shortfall' : 'Surplus') + '</div></div>' +
                        '<div class="kpi-mini"><div class="kpi-mini-label">Demand</div><div class="kpi-mini-value red">' + fmt(ts.demand[milestoneIdx]) + '</div></div>' +
                        '<div class="kpi-mini"><div class="kpi-mini-label">Supply</div><div class="kpi-mini-value blue">' + fmt(ts.supply[milestoneIdx]) + '</div></div>' +
                        '<div class="kpi-mini"><div class="kpi-mini-label">Status</div><div class="kpi-mini-value" style="color:' + statusColor(rdns) + '">' + rdns + '</div></div>';
                }
            });
        });

        // Reset button
        var resetBtn = document.querySelector('.stream-reset-btn[data-stream="' + s.def.id + '"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                var base = getStreamBaseAssumptions(s.data);
                s.data.assumptions.forEach(function (a) {
                    var slider = document.getElementById('slider-' + a.id);
                    if (slider) {
                        slider.value = a.baselineValue;
                        currentAssumptions[a.id] = a.baselineValue;
                        var display = a.unit === '%' ? a.baselineValue + '%' : (a.unit === 'quarter-index' ? (QUARTERS[Math.round(a.baselineValue)] || a.baselineValue) : fmt(a.baselineValue) + ' ' + a.unit);
                        document.getElementById('val-' + a.id).textContent = display;
                    }
                });
                // Trigger chart update
                slider = document.getElementById('slider-' + s.data.assumptions[0].id);
                if (slider) slider.dispatchEvent(new Event('input'));
            });
        }

        // Save button
        var saveBtn = document.querySelector('.stream-save-btn[data-stream="' + s.def.id + '"]');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                if (state.activeScenario === 'baseline') {
                    alert('Cannot modify baseline. Switch to a scenario slot first.');
                    return;
                }
                var sc = state.scenarios.find(function (scn) { return String(scn.slot) === String(state.activeScenario); });
                if (sc) {
                    var base = getStreamBaseAssumptions(s.data);
                    Object.keys(currentAssumptions).forEach(function (k) {
                        if (currentAssumptions[k] !== base[k]) {
                            sc.assumptions[k] = currentAssumptions[k];
                        }
                    });
                    alert('Scenario "' + sc.name + '" updated with ' + s.def.name + ' assumptions.');
                }
            });
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // VIEW 2: Scenario Comparison
    // ════════════════════════════════════════════════════════════════════
    function renderScenarioComparison() {
        var mc = document.getElementById('main-content');
        var asset = getAsset(state.selectedAsset);
        if (!asset) { mc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">No asset selected</div>'; return; }

        var streams = getAssetStreams(state.selectedAsset);
        var entries = [{ id: 'baseline', name: 'Baseline', color: '#4DA6FF' }];
        state.scenarios.forEach(function (sc) {
            entries.push({ id: sc.slot, name: (SLOT_LETTERS[sc.slot] || sc.slot) + ': ' + sc.name, color: sc.color });
        });

        var html = streamGridCSS() + contextHeader();

        // Comparison table
        html += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#9878;</span> Scenario Comparison Across Streams</div>';
        html += '<div class="panel-body" style="overflow-x:auto">';
        html += '<table class="data-table"><thead><tr><th>Stream</th>';
        entries.forEach(function (e) {
            html += '<th style="text-align:center;color:' + e.color + '">' + e.name + '</th>';
        });
        html += '</tr></thead><tbody>';

        streams.forEach(function (s) {
            html += '<tr style="cursor:pointer" onclick="toggleStream(\'' + s.def.id + '\')">';
            html += '<td style="font-weight:600">' + s.def.icon + ' ' + s.def.name + '</td>';
            entries.forEach(function (e) {
                var assumptions = getStreamAssumptions(s.data, e.id);
                var gapVal = computeStreamGap(s.data, assumptions, asset.milestone);
                var rdns = computeReadiness(Math.max(0, gapVal));
                html += '<td style="text-align:center">' +
                    '<div style="font-size:13px;font-weight:700;color:' + statusColor(rdns) + '">' + (gapVal > 0 ? fmt(gapVal) : '\u2212' + fmt(Math.abs(gapVal))) + '</div>' +
                    '<span class="status-badge ' + statusClass(rdns) + '" style="font-size:9px">' + rdns + '</span>' +
                '</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';

        // If a stream is expanded, show overlaid chart
        if (state.expandedStream) {
            var expandedS = streams.find(function (s) { return s.def.id === state.expandedStream; });
            if (expandedS) {
                html += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128200;</span> Overlaid Supply vs Demand \u2014 ' + expandedS.def.name + ' \u2014 All Scenarios</div>' +
                    '<div class="panel-body"><div class="chart-container" style="height:320px"><canvas id="chart-sc-overlay"></canvas></div></div></div>';
            }
        }

        // Gap comparison bar chart
        html += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128202;</span> Gap Comparison \u2014 Potable Water</div>' +
            '<div class="panel-body"><div class="chart-container" style="height:260px"><canvas id="chart-gap-compare"></canvas></div></div></div>';

        mc.innerHTML = html;

        // Create overlaid chart if expanded
        if (state.expandedStream) {
            var expandedS = streams.find(function (s) { return s.def.id === state.expandedStream; });
            if (expandedS) {
                var overlayDatasets = [];
                var baseAssumptions = getStreamAssumptions(expandedS.data, 'baseline');
                var baseTs = computeTimeseries(expandedS.data, baseAssumptions);
                overlayDatasets.push({
                    label: 'Demand', data: baseTs.demand, borderColor: '#FF5C5C', borderDash: [5, 3], fill: false, tension: 0.2, pointRadius: 0, borderWidth: 2
                });
                entries.forEach(function (e) {
                    var ass = getStreamAssumptions(expandedS.data, e.id);
                    var ts = computeTimeseries(expandedS.data, ass);
                    overlayDatasets.push({
                        label: e.name + ' Supply', data: ts.supply, borderColor: e.color, borderWidth: 1.5, stepped: 'before', fill: false, pointRadius: 0
                    });
                });
                var milestoneIdx = quarterIndex(asset.milestone);
                if (milestoneIdx < 0) milestoneIdx = 10;
                createChart('chart-sc-overlay', {
                    type: 'line',
                    data: { labels: QUARTERS, datasets: overlayDatasets },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { annotation: { annotations: { mlLine: { type: 'line', xMin: milestoneIdx, xMax: milestoneIdx, borderColor: '#FFE600', borderWidth: 2, label: { content: asset.name, display: true, position: 'start', backgroundColor: 'rgba(255,230,0,0.15)', color: '#FFE600', font: { size: 9 } } } } } },
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return fmt(v); } } },
                            x: { grid: { display: false }, ticks: { color: '#8585A0', maxRotation: 45, autoSkip: true, maxTicksLimit: 14 } }
                        }
                    }
                });
            }
        }

        // Gap comparison bar chart (potable water across scenarios)
        var pwStream = asset.streams['potable-water'];
        if (pwStream) {
            var gapLabels = [];
            var gapValues = [];
            var gapColors = [];
            entries.forEach(function (e) {
                gapLabels.push(e.name);
                var ass = getStreamAssumptions(pwStream, e.id);
                gapValues.push(computeStreamGap(pwStream, ass, asset.milestone));
                gapColors.push(e.color);
            });
            createChart('chart-gap-compare', {
                type: 'bar',
                data: { labels: gapLabels, datasets: [{ label: 'Supply Gap (' + (getStreamDef('potable-water') || {}).unit + ')', data: gapValues, backgroundColor: gapColors }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return fmt(v); } } },
                        x: { grid: { display: false }, ticks: { color: '#8585A0' } }
                    }
                }
            });
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // VIEW 3: Risk & Sensitivity (Integrated Monte Carlo)
    // ════════════════════════════════════════════════════════════════════

    function mcCSS() {
        return '<style>' +
            '.mc-controls { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--bg-card); border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; }' +
            '.mc-controls label { font-size: 9px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }' +
            '.mc-controls select { background: var(--bg-panel); border: 1px solid var(--border-light); color: var(--text-primary); border-radius: var(--radius-sm); padding: 5px 10px; font-size: 11px; font-family: inherit; }' +
            '.mc-scenario-info { font-size: 11px; color: var(--text-tertiary); margin-left: auto; }' +
            '.mc-executive { text-align: center; padding: 28px 20px; background: var(--bg-card); border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border-dark); }' +
            '.mc-headline-label { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }' +
            '.mc-headline-prob { font-size: 64px; font-weight: 800; line-height: 1.1; }' +
            '.mc-headline-sub { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 4px; }' +
            '.mc-headline-detail { font-size: 11px; color: var(--text-tertiary); margin-top: 6px; max-width: 500px; margin-left: auto; margin-right: auto; }' +
            '.mc-headline-runs { font-size: 10px; color: var(--text-tertiary); margin-top: 8px; font-style: italic; }' +
            '.mc-headline-metrics { display: flex; justify-content: center; gap: 32px; margin-top: 16px; flex-wrap: wrap; }' +
            '.mc-headline-metric { text-align: center; }' +
            '.mc-headline-metric-label { font-size: 9px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }' +
            '.mc-headline-metric-value { font-size: 20px; font-weight: 800; }' +
            '.mc-insight-panel { padding: 16px 20px; background: var(--bg-card); border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border-dark); border-left: 3px solid #4DA6FF; }' +
            '.mc-insight-title { font-size: 12px; font-weight: 700; color: #4DA6FF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }' +
            '.mc-insight-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }' +
            '.mc-distribution-shape { padding: 12px 16px; background: var(--bg-card); border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--border-dark); }' +
            '.mc-distribution-shape-text { font-size: 11px; color: var(--text-tertiary); line-height: 1.6; font-style: italic; }' +
            '.mc-decision-panel { padding: 16px 20px; background: var(--bg-card); border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border-dark); }' +
            '.mc-decision-title { font-size: 12px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }' +
            '.mc-decision-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }' +
            '.mc-decision-highlight { color: #FFE600; font-weight: 700; }' +
            '.mc-intervention-table { width: 100%; border-collapse: collapse; margin-top: 12px; }' +
            '.mc-intervention-table th { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-tertiary); text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border-dark); }' +
            '.mc-intervention-table td { font-size: 11px; color: var(--text-secondary); padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }' +
            '.mc-hist-subtitle { text-align: center; font-size: 10px; color: var(--text-tertiary); margin-bottom: 4px; letter-spacing: 1px; }' +
            '.mc-integrated-interp { padding: 16px 20px; background: var(--bg-card); border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border-dark); border-left: 3px solid #FFE600; }' +
            '.mc-integrated-interp-title { font-size: 12px; font-weight: 700; color: #FFE600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }' +
            '.mc-integrated-interp-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }' +
            '.mc-scenario-table { width: 100%; border-collapse: collapse; }' +
            '.mc-scenario-table th { font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-tertiary); text-align: center; padding: 8px 10px; border-bottom: 1px solid var(--border-dark); }' +
            '.mc-scenario-table th:first-child { text-align: left; }' +
            '.mc-scenario-table td { font-size: 12px; padding: 8px 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.03); }' +
            '.mc-scenario-table td:first-child { text-align: left; font-weight: 600; color: var(--text-secondary); }' +
            '.mc-scenario-table tr:first-child td { font-weight: 800; font-size: 13px; }' +
            '.mc-severity-bar { display: flex; height: 24px; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }' +
            '.mc-severity-segment { display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #000; transition: width 0.4s; }' +
            '.mc-drivers-table { width: 100%; border-collapse: collapse; }' +
            '.mc-drivers-table th { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-tertiary); text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border-dark); }' +
            '.mc-drivers-table td { font-size: 11px; color: var(--text-secondary); padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }' +
            '.mc-confidence { letter-spacing: 2px; }' +
            '.mc-confidence-high { color: #00C48C; }' +
            '.mc-confidence-medium { color: #FFAA00; }' +
            '.mc-confidence-low { color: #FF5C5C; }' +
            '.mc-loading { text-align: center; padding: 60px 20px; color: var(--text-tertiary); }' +
            '.mc-loading-spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid var(--border-light); border-top-color: #4DA6FF; border-radius: 50%; animation: mc-spin 0.8s linear infinite; margin-bottom: 12px; }' +
            '@keyframes mc-spin { to { transform: rotate(360deg); } }' +
            '.mc-dep-table { width: 100%; border-collapse: collapse; }' +
            '.mc-dep-table th { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-tertiary); text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border-dark); }' +
            '.mc-dep-table td { font-size: 11px; color: var(--text-secondary); padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }' +
            '.mc-stats-row { display: flex; gap: 16px; flex-wrap: wrap; }' +
            '.mc-stat { flex: 1; min-width: 80px; text-align: center; }' +
            '.mc-stat-label { font-size: 9px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }' +
            '.mc-stat-value { font-size: 16px; font-weight: 800; }' +
            '.mc-tech-details { margin-bottom: 16px; }' +
            '.mc-tech-toggle { cursor: pointer; font-size: 11px; font-weight: 700; color: var(--text-tertiary); padding: 10px 16px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-dark); user-select: none; }' +
            '.mc-tech-toggle:hover { color: var(--text-secondary); }' +
            '.mc-tech-body { display: none; padding: 12px 16px; background: var(--bg-card); border-radius: 0 0 8px 8px; border: 1px solid var(--border-dark); border-top: none; font-size: 10px; color: var(--text-tertiary); line-height: 1.6; }' +
            '.mc-tech-body.open { display: block; }' +
        '</style>';
    }

    function confidenceIndicator(level) {
        if (level === 'high') return '<span class="mc-confidence mc-confidence-high" title="High confidence">&#9679;&#9679;&#9679;</span>';
        if (level === 'medium') return '<span class="mc-confidence mc-confidence-medium" title="Medium confidence">&#9679;&#9679;&#9675;</span>';
        return '<span class="mc-confidence mc-confidence-low" title="Low confidence">&#9679;&#9675;&#9675;</span>';
    }

    function probColor(pct) {
        if (pct >= 80) return '#00C48C';
        if (pct >= 60) return '#FFAA00';
        if (pct >= 40) return '#FF8C00';
        return '#FF5C5C';
    }

    function mcCacheKey(scenarioId, scope) {
        return state.selectedAsset + '|' + scenarioId + '|' + scope;
    }

    // ─── Integrated Monte Carlo Engine ────────────────────────────────

    function getScenarioOverrides(scenarioId) {
        if (scenarioId === 'baseline') return {};
        var sc = state.scenarios.find(function (s) { return String(s.slot) === String(scenarioId); });
        return sc ? JSON.parse(JSON.stringify(sc.assumptions)) : {};
    }

    function findAssumptionDef(varId, asset) {
        var streamIds = Object.keys(asset.streams);
        for (var i = 0; i < streamIds.length; i++) {
            var sd = asset.streams[streamIds[i]];
            if (sd.assumptions) {
                for (var j = 0; j < sd.assumptions.length; j++) {
                    if (sd.assumptions[j].id === varId) return sd.assumptions[j];
                }
            }
        }
        return null;
    }

    function getAssumptionRange(varId, allInputs) {
        var inp = allInputs.find(function (i) { return i.variable === varId; });
        if (!inp || !inp.params) return 1;
        if (inp.params.max !== undefined && inp.params.min !== undefined) return inp.params.max - inp.params.min;
        if (inp.params.stdDev !== undefined) return inp.params.stdDev * 6;
        return 1;
    }

    function generateCorrelatedSamples(allInputs) {
        var samples = {};
        var dependencies = SCENARIO_DATA.dependencies || [];

        allInputs.forEach(function (inp) {
            samples[inp.variable] = sampleDistribution(inp);
        });

        dependencies.forEach(function (dep) {
            var affected = dep.affectedVariables.filter(function (v) { return samples[v] !== undefined; });
            if (affected.length < 2) return;

            var sharedFactor = (Math.random() - 0.5) * 2;

            affected.forEach(function (varId) {
                var inp = allInputs.find(function (i) { return i.variable === varId; });
                if (!inp) return;

                var range = getAssumptionRange(varId, allInputs);
                var shift = sharedFactor * dep.correlationStrength * range * 0.3;

                if (dep.correlationType === 'causal') {
                    var idx = affected.indexOf(varId);
                    if (idx > 0) {
                        samples[varId] = samples[varId] + shift;
                    }
                } else {
                    samples[varId] = samples[varId] + shift;
                }

                if (inp.params) {
                    var lo = inp.params.min !== undefined ? inp.params.min : (inp.params.mean - 3 * (inp.params.stdDev || 0));
                    var hi = inp.params.max !== undefined ? inp.params.max : (inp.params.mean + 3 * (inp.params.stdDev || 0));
                    samples[varId] = Math.max(lo, Math.min(hi, samples[varId]));
                }
            });
        });

        return samples;
    }

    function pearsonCorrelation(x, y) {
        var n = x.length;
        if (n < 3) return 0;
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (var i = 0; i < n; i++) {
            sumX += x[i]; sumY += y[i]; sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i];
        }
        var num = n * sumXY - sumX * sumY;
        var den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return den === 0 ? 0 : num / den;
    }

    function classifyGap(gap) {
        if (gap <= 0) return 0;
        if (gap > 0 && gap <= 2000) return 1;
        if (gap > 2000 && gap <= 5000) return 2;
        return 3;
    }

    function runIntegratedMonteCarlo(asset, scenarioId, numRuns, scope) {
        numRuns = numRuns || SCENARIO_DATA.monteCarloConfig.defaultRuns;
        var streamIds = scope === 'all' ? Object.keys(asset.streams) : [scope];

        var allInputs = [];
        streamIds.forEach(function (sid) {
            var stream = asset.streams[sid];
            if (stream && stream.monteCarlo && stream.monteCarlo.inputs) {
                stream.monteCarlo.inputs.forEach(function (inp) {
                    allInputs.push({ variable: inp.variable, distributionType: inp.distributionType, params: inp.params, dataConfidence: inp.dataConfidence, source: inp.source, streamId: sid });
                });
            }
        });

        var scenarioOverrides = getScenarioOverrides(scenarioId);

        var streamResults = {};
        streamIds.forEach(function (sid) { streamResults[sid] = { gaps: [], severityCounts: [0, 0, 0, 0] }; });
        var allReadyCount = 0;
        var failureCounts = {};
        streamIds.forEach(function (sid) { failureCounts[sid] = 0; });

        var variableGapCorrelations = {};
        allInputs.forEach(function (inp) { variableGapCorrelations[inp.variable] = { values: [], gaps: [], streamId: inp.streamId }; });

        for (var run = 0; run < numRuns; run++) {
            var samples = generateCorrelatedSamples(allInputs);

            var allReady = true;
            streamIds.forEach(function (sid) {
                var stream = asset.streams[sid];
                var baseAssumptions = getStreamBaseAssumptions(stream);
                Object.keys(scenarioOverrides).forEach(function (k) {
                    if (baseAssumptions.hasOwnProperty(k)) baseAssumptions[k] = scenarioOverrides[k];
                });
                if (stream.monteCarlo && stream.monteCarlo.inputs) {
                    stream.monteCarlo.inputs.forEach(function (inp) {
                        baseAssumptions[inp.variable] = samples[inp.variable];
                    });
                }
                var gap = computeStreamGap(stream, baseAssumptions, asset.milestone);
                streamResults[sid].gaps.push(gap);
                streamResults[sid].severityCounts[classifyGap(gap)]++;
                if (gap > 0) { allReady = false; failureCounts[sid]++; }
            });
            if (allReady) allReadyCount++;

            allInputs.forEach(function (inp) {
                variableGapCorrelations[inp.variable].values.push(samples[inp.variable]);
                variableGapCorrelations[inp.variable].gaps.push(streamResults[inp.streamId].gaps[streamResults[inp.streamId].gaps.length - 1]);
            });
        }

        var bucketLabels = SCENARIO_DATA.monteCarloConfig.severityBuckets.map(function (b) { return b.label; });
        var processedStreams = {};
        streamIds.forEach(function (sid) {
            var r = streamResults[sid];
            r.gaps.sort(function (a, b) { return a - b; });
            var readyCount = r.gaps.filter(function (g) { return g <= 0; }).length;
            var mean = r.gaps.reduce(function (a, b) { return a + b; }, 0) / numRuns;

            var streamInputs = allInputs.filter(function (inp) { return inp.streamId === sid; });
            var confOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            var worstConf = 'high';
            streamInputs.forEach(function (inp) {
                if ((confOrder[inp.dataConfidence] || 3) < (confOrder[worstConf] || 3)) worstConf = inp.dataConfidence;
            });
            if (streamInputs.length === 0) worstConf = 'medium';

            processedStreams[sid] = {
                readinessProb: Math.round(readyCount / numRuns * 100),
                gaps: r.gaps,
                p50Gap: Math.round(r.gaps[Math.floor(numRuns * 0.5)]),
                p80Gap: Math.round(r.gaps[Math.floor(numRuns * 0.8)]),
                p90Gap: Math.round(r.gaps[Math.floor(numRuns * 0.9)]),
                meanGap: Math.round(mean),
                severityDistribution: bucketLabels.map(function (label, idx) {
                    return { label: label, percent: Math.round(r.severityCounts[idx] / numRuns * 100) };
                }),
                histogram: buildHistogram(r.gaps, 25),
                dataConfidence: worstConf
            };
        });

        var integrated = null;
        if (scope === 'all') {
            var failedRunCount = numRuns - allReadyCount;
            var failureContributors = [];
            streamIds.forEach(function (sid) {
                failureContributors.push({ stream: sid, failRate: Math.round(failureCounts[sid] / numRuns * 100) });
            });
            failureContributors.sort(function (a, b) { return b.failRate - a.failRate; });
            integrated = {
                allReadyProb: Math.round(allReadyCount / numRuns * 100),
                allReadyCount: allReadyCount,
                failureProb: Math.round(failedRunCount / numRuns * 100),
                failureContributors: failureContributors
            };
        }

        var riskDrivers = [];
        Object.keys(variableGapCorrelations).forEach(function (varId) {
            var data = variableGapCorrelations[varId];
            var correlation = Math.abs(pearsonCorrelation(data.values, data.gaps));
            var inp = allInputs.find(function (i) { return i.variable === varId; });
            var aDef = findAssumptionDef(varId, asset);
            riskDrivers.push({
                variable: varId,
                stream: data.streamId,
                name: aDef ? aDef.name : varId,
                correlation: correlation,
                dataConfidence: inp ? inp.dataConfidence : 'medium',
                contributionPercent: 0
            });
        });
        var totalCorr = riskDrivers.reduce(function (s, d) { return s + d.correlation; }, 0);
        if (totalCorr > 0) {
            riskDrivers.forEach(function (d) { d.contributionPercent = Math.round(d.correlation / totalCorr * 100); });
        }
        riskDrivers.sort(function (a, b) { return b.contributionPercent - a.contributionPercent; });
        riskDrivers = riskDrivers.slice(0, 10);

        var dependencyImpacts = [];
        (SCENARIO_DATA.dependencies || []).forEach(function (dep) {
            var affected = dep.affectedVariables.filter(function (v) { return variableGapCorrelations[v] !== undefined; });
            if (affected.length < 2) return;
            var totalContrib = 0;
            affected.forEach(function (v) {
                var d = riskDrivers.find(function (rd) { return rd.variable === v; });
                if (d) totalContrib += d.contributionPercent;
            });
            dependencyImpacts.push({ id: dep.id, name: dep.name, impactPercent: Math.round(totalContrib * dep.correlationStrength), confidence: dep.dataConfidence });
        });
        dependencyImpacts.sort(function (a, b) { return b.impactPercent - a.impactPercent; });

        return {
            numRuns: numRuns,
            scope: scope,
            scenarioId: scenarioId,
            streams: processedStreams,
            integrated: integrated,
            riskDrivers: riskDrivers,
            dependencyImpacts: dependencyImpacts
        };
    }

    function renderRiskSensitivity() {
        var mc = document.getElementById('main-content');
        var asset = getAsset(state.selectedAsset);
        if (!asset) { mc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">No asset selected</div>'; return; }

        // Initialize MC results cache
        if (!state.monteCarloResults || typeof state.monteCarloResults !== 'object' || Array.isArray(state.monteCarloResults)) {
            state.monteCarloResults = {};
        }

        var streams = getAssetStreams(state.selectedAsset);

        var currentScope = state.mcScope || 'all';
        var currentRuns = state.mcRuns || SCENARIO_DATA.monteCarloConfig.defaultRuns;
        var currentScenarioId = state.activeScenario;

        var scenarioName = 'Baseline';
        if (currentScenarioId !== 'baseline') {
            var sc = state.scenarios.find(function (s) { return String(s.slot) === String(currentScenarioId); });
            if (sc) scenarioName = (SLOT_LETTERS[sc.slot] || sc.slot) + ': ' + sc.name;
        }

        var streamOptions = '<option value="all"' + (currentScope === 'all' ? ' selected' : '') + '>All Infrastructure</option>';
        streams.forEach(function (s) {
            streamOptions += '<option value="' + s.def.id + '"' + (currentScope === s.def.id ? ' selected' : '') + '>' + s.def.name + '</option>';
        });

        var html = mcCSS() + streamGridCSS() + contextHeader();

        html += '<div class="mc-controls">' +
            '<div><label>Analysis Scope</label><select id="mc-scope">' + streamOptions + '</select></div>' +
            '<div><label>Simulations</label><select id="mc-runs">' +
                '<option value="5000"' + (currentRuns === 5000 ? ' selected' : '') + '>5,000</option>' +
                '<option value="10000"' + (currentRuns === 10000 ? ' selected' : '') + '>10,000</option>' +
                '<option value="25000"' + (currentRuns === 25000 ? ' selected' : '') + '>25,000</option>' +
            '</select></div>' +
            '<button class="btn-primary" id="mc-run-btn">&#9654; Run Simulation</button>' +
            '<div class="mc-scenario-info">Running against: <strong>' + scenarioName + '</strong></div>' +
        '</div>';

        var cacheKey = mcCacheKey(currentScenarioId, currentScope);
        var mcRes = state.monteCarloResults[cacheKey];

        if (!mcRes) {
            html += '<div class="mc-loading" id="mc-loading"><div class="mc-loading-spinner"></div><div>Running ' + fmt(currentRuns) + ' simulations...</div></div>';
            mc.innerHTML = html;
            wireMcControls();
            setTimeout(function () {
                var result = runIntegratedMonteCarlo(asset, currentScenarioId, currentRuns, currentScope);
                state.monteCarloResults[cacheKey] = result;
                renderMcResults(asset, streams, result);
            }, 50);
            return;
        }

        mc.innerHTML = html;
        wireMcControls();
        renderMcResults(asset, streams, mcRes);
    }

    function wireMcControls() {
        var runBtn = document.getElementById('mc-run-btn');
        var scopeSelect = document.getElementById('mc-scope');
        var runsSelect = document.getElementById('mc-runs');
        if (runBtn) {
            runBtn.addEventListener('click', function () {
                state.mcScope = scopeSelect ? scopeSelect.value : 'all';
                state.mcRuns = runsSelect ? parseInt(runsSelect.value) : 10000;
                var key = mcCacheKey(state.activeScenario, state.mcScope);
                if (state.monteCarloResults) delete state.monteCarloResults[key];
                renderRiskSensitivity();
            });
        }
    }

    // ─── Decision Intelligence Helper Functions ─────────────────────

    function generateMcInsight(streamDef, streamRes, numRuns, riskDrivers) {
        var readinessProb = streamRes.readinessProb;
        var shortfallProb = 100 - readinessProb;
        var p25 = Math.round(streamRes.gaps[Math.floor(numRuns * 0.25)]);
        var p75 = Math.round(streamRes.gaps[Math.floor(numRuns * 0.75)]);
        var p90 = streamRes.p90Gap;
        var unit = streamDef ? streamDef.unit : '';

        var riskStatus = readinessProb >= 80 ? 'on track' : (readinessProb >= 50 ? 'at risk' : 'at significant risk');

        var topDrivers = riskDrivers.filter(function (d) { return d.stream === streamDef.id; }).slice(0, 3);
        if (topDrivers.length === 0) topDrivers = riskDrivers.slice(0, 3);
        var driverNames = topDrivers.map(function (d) { return d.name; });

        var rangeText = '';
        if (p25 > 0 && p75 > 0) {
            rangeText = 'Most outcomes indicate a shortfall between ' + fmt(Math.abs(p25)) + ' and ' + fmt(Math.abs(p75)) + ' ' + unit;
        } else if (p25 <= 0 && p75 > 0) {
            rangeText = 'Outcomes range from a modest surplus to a shortfall of up to ' + fmt(Math.abs(p75)) + ' ' + unit;
        } else {
            rangeText = 'Most outcomes indicate a surplus between ' + fmt(Math.abs(p75)) + ' and ' + fmt(Math.abs(p25)) + ' ' + unit;
        }

        var downsideText = '';
        if (p90 > 0) {
            downsideText = ', while severe downside cases could exceed ' + fmt(Math.abs(p90)) + ' ' + unit;
        }

        var driverText = driverNames.length > 0 ? 'The result is primarily driven by uncertainty around ' + driverNames.join(', ') + '.' : '';

        return (streamDef ? streamDef.name : 'Infrastructure') + ' readiness is ' + riskStatus + '. ' +
            shortfallProb + '% of the ' + fmt(numRuns) + ' simulated futures result in a supply shortfall at T6 opening. ' +
            rangeText + downsideText + '. ' + driverText;
    }

    function describeDistributionShape(gaps, readinessProb) {
        var n = gaps.length;
        var mean = gaps.reduce(function (a, b) { return a + b; }, 0) / n;
        var variance = gaps.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / n;
        var stddev = Math.sqrt(variance);
        var absMean = Math.abs(mean);
        var cv = absMean > 0 ? stddev / absMean : 0;

        // Skewness
        var m3 = gaps.reduce(function (a, b) { return a + Math.pow(b - mean, 3); }, 0) / n;
        var skewness = stddev > 0 ? m3 / Math.pow(stddev, 3) : 0;

        var parts = [];
        if (cv > 1.5) {
            parts.push('The distribution is very widely spread, indicating extremely high uncertainty in outcomes.');
        } else if (cv > 0.8) {
            parts.push('The distribution is widely spread, indicating high uncertainty.');
        } else if (cv > 0.3) {
            parts.push('The distribution shows moderate spread around the central estimate.');
        } else {
            parts.push('The distribution is tightly concentrated, indicating relatively high confidence in the outcome.');
        }

        if (skewness > 0.8) {
            parts.push('It has a long upside tail, meaning severe shortfall scenarios are plausible even if not the most likely outcome.');
        } else if (skewness < -0.8) {
            parts.push('It has a long downside tail toward surplus, suggesting upside potential exists.');
        } else {
            parts.push('The distribution is roughly symmetric around its central value.');
        }

        if (readinessProb < 30) {
            parts.push('Most outcomes result in a shortage, indicating that supply shortfall is the dominant outcome.');
        } else if (readinessProb > 70) {
            parts.push('Most outcomes result in sufficient supply, though tail risks remain.');
        }

        return parts.join(' ');
    }

    function generateDecisionImplication(asset, streamRes, primaryStreamId, riskDrivers) {
        var readinessProb = streamRes.readinessProb;
        var streamDef = getStreamDef(primaryStreamId);
        var unit = streamDef ? streamDef.unit : '';
        var medianGap = streamRes.p50Gap;

        if (readinessProb >= 80) {
            return 'Current supply plans provide sufficient confidence for ' + asset.name + ' opening. ' +
                'The readiness probability of ' + readinessProb + '% exceeds the 80% threshold. ' +
                'Continue monitoring key risk drivers and maintain contingency plans for tail-risk scenarios.';
        }

        var additionalNeeded = medianGap > 0 ? medianGap : streamRes.p80Gap;
        if (additionalNeeded <= 0) additionalNeeded = Math.abs(streamRes.meanGap);

        var topRisks = riskDrivers.filter(function (d) { return d.stream === primaryStreamId; }).slice(0, 2);
        if (topRisks.length === 0) topRisks = riskDrivers.slice(0, 2);
        var riskText = topRisks.length > 0 ? ' Key uncertainties to address: ' + topRisks.map(function (d) { return d.name; }).join(', ') + '.' : '';

        return 'Current supply plans provide insufficient confidence for ' + asset.name + ' opening. ' +
            'Securing approximately <span class="mc-decision-highlight">' + fmt(Math.abs(additionalNeeded)) + ' ' + unit + '</span> of additional capacity ' +
            'would materially increase readiness probability toward the 80% target.' + riskText;
    }

    function estimateInterventionImpact(gaps, additionalCapacity) {
        var shifted = 0;
        var total = gaps.length;
        for (var i = 0; i < total; i++) {
            if (gaps[i] > 0 && (gaps[i] - additionalCapacity) <= 0) {
                shifted++;
            }
        }
        return shifted;
    }

    function renderMcResults(asset, streams, mcRes) {
        var mc = document.getElementById('main-content');
        var loadingEl = document.getElementById('mc-loading');
        if (loadingEl) loadingEl.remove();

        var resultsHtml = '';
        var scope = mcRes.scope;

        // Determine primary stream for detailed analysis
        var primaryStreamId = scope === 'all' ? 'potable-water' : Object.keys(mcRes.streams)[0];
        if (!mcRes.streams[primaryStreamId] && scope === 'all') {
            primaryStreamId = Object.keys(mcRes.streams)[0];
        }
        var primaryRes = mcRes.streams[primaryStreamId];
        var primaryDef = getStreamDef(primaryStreamId);

        // ── Section A: Executive Headline ──
        if (scope === 'all' && mcRes.integrated) {
            var prob = mcRes.integrated.allReadyProb;
            var shortfall = 100 - prob;
            // For integrated view, show overall + find dominant stream metrics
            var worstStream = null;
            var worstProb = 100;
            Object.keys(mcRes.streams).forEach(function (sid) {
                var sp = mcRes.streams[sid].readinessProb;
                if (sp < worstProb) { worstProb = sp; worstStream = sid; }
            });
            var worstDef = worstStream ? getStreamDef(worstStream) : null;
            var worstRes = worstStream ? mcRes.streams[worstStream] : null;

            resultsHtml += '<div class="mc-executive">' +
                '<div class="mc-headline-label">' + asset.name + ' Infrastructure Readiness</div>' +
                '<div class="mc-headline-prob" style="color:' + probColor(prob) + '">' + prob + '%</div>' +
                '<div class="mc-headline-sub">Overall Readiness Probability</div>' +
                '<div class="mc-headline-detail">Probability that ALL critical infrastructure is ready for ' + asset.name + ' opening (' + asset.milestone + ')</div>' +
                '<div class="mc-headline-metrics">' +
                    '<div class="mc-headline-metric"><div class="mc-headline-metric-label">Shortfall Probability</div><div class="mc-headline-metric-value" style="color:#FF5C5C">' + shortfall + '%</div></div>' +
                    (worstRes ? '<div class="mc-headline-metric"><div class="mc-headline-metric-label">Most Likely Gap (' + (worstDef ? worstDef.name : '') + ')</div><div class="mc-headline-metric-value" style="color:#FFAA00">' + fmt(worstRes.p50Gap) + '</div></div>' : '') +
                    (worstRes ? '<div class="mc-headline-metric"><div class="mc-headline-metric-label">P90 Downside</div><div class="mc-headline-metric-value" style="color:#FF5C5C">' + fmt(worstRes.p90Gap) + '</div></div>' : '') +
                '</div>' +
                '<div class="mc-headline-runs">Based on ' + fmt(mcRes.numRuns) + ' simulated futures</div>' +
            '</div>';
        } else if (primaryRes && primaryDef) {
            var sProb = primaryRes.readinessProb;
            var sShortfall = 100 - sProb;
            resultsHtml += '<div class="mc-executive">' +
                '<div class="mc-headline-label">' + primaryDef.name + ' Readiness \u2014 ' + asset.name + '</div>' +
                '<div class="mc-headline-prob" style="color:' + probColor(sProb) + '">' + sProb + '%</div>' +
                '<div class="mc-headline-sub">Readiness Probability at ' + asset.milestone + '</div>' +
                '<div class="mc-headline-metrics">' +
                    '<div class="mc-headline-metric"><div class="mc-headline-metric-label">Shortfall Probability</div><div class="mc-headline-metric-value" style="color:#FF5C5C">' + sShortfall + '%</div></div>' +
                    '<div class="mc-headline-metric"><div class="mc-headline-metric-label">Most Likely Gap (P50)</div><div class="mc-headline-metric-value" style="color:#FFAA00">' + fmt(primaryRes.p50Gap) + '</div></div>' +
                    '<div class="mc-headline-metric"><div class="mc-headline-metric-label">P90 Downside</div><div class="mc-headline-metric-value" style="color:#FF5C5C">' + fmt(primaryRes.p90Gap) + '</div></div>' +
                '</div>' +
                '<div class="mc-headline-runs">Based on ' + fmt(mcRes.numRuns) + ' simulated futures</div>' +
            '</div>';
        }

        // ── Section B: Monte Carlo Insight ──
        if (primaryRes && primaryDef) {
            var insightText = generateMcInsight(primaryDef, primaryRes, mcRes.numRuns, mcRes.riskDrivers || []);
            resultsHtml += '<div class="mc-insight-panel">' +
                '<div class="mc-insight-title">Monte Carlo Insight</div>' +
                '<div class="mc-insight-text">' + insightText + '</div>' +
            '</div>';
        }

        // ── Section: Outcome Severity ──
        if (primaryRes && primaryDef) {
            var severityColors = ['#00C48C', '#FFAA00', '#FF8C00', '#FF5C5C'];
            var severityBar = '<div class="mc-severity-bar">';
            primaryRes.severityDistribution.forEach(function (s, idx) {
                if (s.percent > 0) {
                    severityBar += '<div class="mc-severity-segment" style="width:' + Math.max(s.percent, 3) + '%;background:' + severityColors[idx] + '">' + (s.percent >= 5 ? s.percent + '%' : '') + '</div>';
                }
            });
            severityBar += '</div>';
            var severityLegend = '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:6px">';
            primaryRes.severityDistribution.forEach(function (s, idx) {
                severityLegend += '<div style="font-size:10px;color:var(--text-secondary);display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:' + severityColors[idx] + ';display:inline-block"></span>' + s.label + ': ' + s.percent + '%</div>';
            });
            severityLegend += '</div>';

            resultsHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128203;</span> Outcome Severity \u2014 ' + primaryDef.name + '</div>' +
                '<div class="panel-body">' + severityBar + severityLegend +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">' +
                    '<div style="background:var(--bg-panel);border-radius:var(--radius-sm);padding:10px;text-align:center"><div style="font-size:9px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px">P50 Gap</div><div style="font-size:16px;font-weight:800;color:#4DA6FF">' + fmt(primaryRes.p50Gap) + '</div></div>' +
                    '<div style="background:var(--bg-panel);border-radius:var(--radius-sm);padding:10px;text-align:center"><div style="font-size:9px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px">P80 Gap</div><div style="font-size:16px;font-weight:800;color:#FFAA00">' + fmt(primaryRes.p80Gap) + '</div></div>' +
                    '<div style="background:var(--bg-panel);border-radius:var(--radius-sm);padding:10px;text-align:center"><div style="font-size:9px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px">P90 Gap</div><div style="font-size:16px;font-weight:800;color:#FF5C5C">' + fmt(primaryRes.p90Gap) + '</div></div>' +
                    '<div style="background:var(--bg-panel);border-radius:var(--radius-sm);padding:10px;text-align:center"><div style="font-size:9px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px">Mean Gap</div><div style="font-size:16px;font-weight:800;color:var(--text-secondary)">' + fmt(primaryRes.meanGap) + '</div></div>' +
                '</div>' +
            '</div></div>';
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#127922;</span> Gap Distribution \u2014 ' + primaryDef.name + '</div>' +
                '<div class="panel-body">' +
                '<div class="mc-hist-subtitle">\u2190 SHORTFALL &nbsp;|&nbsp; 0 &nbsp;|&nbsp; SURPLUS \u2192</div>' +
                '<div class="chart-container" style="height:260px"><canvas id="chart-mc-hist"></canvas></div>' +
                '</div></div>';
            resultsHtml += '</div>';
        }

        // ── Section J: Stream Readiness + Scenario Comparison (scope=all, placed early) ──
        if (scope === 'all') {
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128202;</span> Stream Readiness Probability</div>' +
                '<div class="panel-body"><div class="chart-container" style="height:220px"><canvas id="chart-stream-readiness"></canvas></div></div></div>';

            // ── Section K: Integrated Infrastructure Interpretation ──
            if (mcRes.integrated) {
                var intProb = mcRes.integrated.allReadyProb;
                var sortedStreams = [];
                Object.keys(mcRes.streams).forEach(function (sid) {
                    sortedStreams.push({ id: sid, prob: mcRes.streams[sid].readinessProb });
                });
                sortedStreams.sort(function (a, b) { return a.prob - b.prob; });
                var lowestNames = sortedStreams.slice(0, 2).map(function (s) {
                    var d = getStreamDef(s.id);
                    return (d ? d.name : s.id) + ' (' + s.prob + '%)';
                });
                var dominantStream = sortedStreams[0];
                var dominantDef = getStreamDef(dominantStream.id);
                var dominantData = asset.streams[dominantStream.id];
                var dominantReason = dominantData ? dominantData.keyRisk : 'schedule and capacity uncertainty';

                resultsHtml += '<div class="mc-integrated-interp">' +
                    '<div class="mc-integrated-interp-title">Integrated Infrastructure Interpretation</div>' +
                    '<div class="mc-integrated-interp-text">' +
                    'Overall ' + asset.name + ' Infrastructure Readiness: <strong>' + intProb + '%</strong>. ' +
                    'The overall readiness probability is primarily constrained by ' + lowestNames.join(' and ') + '. ' +
                    (dominantDef ? dominantDef.name : dominantStream.id) + ' is the dominant risk driver due to ' + dominantReason + '.' +
                    '</div></div>';
            }
        }

        // Scenario Comparison
        resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#9878;</span> Scenario Readiness Comparison' +
            '<div class="panel-header-actions"><button class="panel-header-btn" id="mc-compare-btn">Compute All Scenarios</button></div></div>' +
            '<div class="panel-body" id="mc-scenario-comparison"><div style="text-align:center;padding:20px;color:var(--text-tertiary)">Click "Compute All Scenarios" to compare readiness across baseline and all scenarios.</div></div></div>';

        // ── Section D: Distribution Shape Interpretation ──
        if (primaryRes && primaryDef) {
            var shapeText = describeDistributionShape(primaryRes.gaps, primaryRes.readinessProb);
            resultsHtml += '<div class="mc-distribution-shape">' +
                '<div class="mc-distribution-shape-text">' + shapeText + '</div>' +
            '</div>';
        }

        // ── Section E: Key Risk Drivers ──
        if (mcRes.riskDrivers && mcRes.riskDrivers.length > 0) {
            var driverRows = mcRes.riskDrivers.map(function (d, idx) {
                var sDef = getStreamDef(d.stream);
                var sName = sDef ? sDef.name : d.stream;
                var impactDir = d.correlation > 0 ? 'Higher values increase gap (worsen readiness)' : 'Higher values decrease gap (improve readiness)';
                // Use raw correlation sign from the original data
                var rawData = mcRes._rawCorrelations ? mcRes._rawCorrelations[d.variable] : null;
                if (rawData && rawData < 0) impactDir = 'Higher values decrease gap (improve readiness)';
                return '<tr><td style="font-weight:600;color:var(--text-primary)">' + (idx + 1) + '</td><td>' + d.name + '</td><td>' + sName + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;background:var(--bg-panel);border-radius:3px;overflow:hidden"><div style="height:100%;width:' + d.contributionPercent + '%;background:#4DA6FF;border-radius:3px"></div></div><span style="font-weight:600;color:var(--text-primary)">' + d.contributionPercent + '%</span></div></td>' +
                    '<td>' + confidenceIndicator(d.dataConfidence) + '</td>' +
                    '<td style="font-size:10px;color:var(--text-tertiary)">' + impactDir + '</td></tr>';
            }).join('');
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#127919;</span> Key Risk Drivers</div>' +
                '<div class="panel-body"><table class="mc-drivers-table"><thead><tr><th>Rank</th><th>Variable</th><th>Stream</th><th>Contribution</th><th>Data Confidence</th><th>Impact Direction</th></tr></thead><tbody>' + driverRows + '</tbody></table></div></div>';
        }

        // ── Section F: Decision Implication ──
        if (primaryRes && primaryDef) {
            var decisionText = generateDecisionImplication(asset, primaryRes, primaryStreamId, mcRes.riskDrivers || []);
            resultsHtml += '<div class="mc-decision-panel">' +
                '<div class="mc-decision-title">Decision Implication</div>' +
                '<div class="mc-decision-text">' + decisionText + '</div>' +
            '</div>';
        }

        // ── Section G: Intervention Impact Table ──
        if (primaryRes && primaryDef) {
            var streamData = asset.streams[primaryStreamId];
            var interventions = (streamData && streamData.interventions) ? streamData.interventions : [];
            if (interventions.length > 0) {
                var baselineReadiness = primaryRes.readinessProb;
                var intvRows = interventions.map(function (intv) {
                    var shiftedCount = estimateInterventionImpact(primaryRes.gaps, intv.gapReduction);
                    var newReadiness = Math.min(100, Math.round((primaryRes.gaps.filter(function (g) { return g <= 0; }).length + shiftedCount) / mcRes.numRuns * 100));
                    var delta = newReadiness - baselineReadiness;
                    return '<tr><td style="font-weight:600">' + intv.name + '</td>' +
                        '<td>' + intv.type + '</td>' +
                        '<td>' + fmt(intv.gapReduction) + ' ' + (primaryDef ? primaryDef.unit : '') + '</td>' +
                        '<td style="color:' + probColor(newReadiness) + ';font-weight:700">' + newReadiness + '%</td>' +
                        '<td style="color:#00C48C;font-weight:600">+' + delta + ' pp</td></tr>';
                }).join('');

                resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128161;</span> Intervention Impact Estimate</div>' +
                    '<div class="panel-body">' +
                    '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px">Baseline readiness: <strong style="color:' + probColor(baselineReadiness) + '">' + baselineReadiness + '%</strong>. Estimates derived from shifting MC gap distribution by intervention capacity.</div>' +
                    '<table class="mc-intervention-table"><thead><tr><th>Intervention</th><th>Type</th><th>Capacity Added</th><th>Est. Readiness</th><th>Improvement</th></tr></thead><tbody>' + intvRows + '</tbody></table>' +
                    '</div></div>';
            }
        }

        // ── Section H: Data Confidence Summary ──
        var allStreamIds = Object.keys(mcRes.streams);
        var totalInputs = 0;
        var lowInputs = [];
        allStreamIds.forEach(function (sid) {
            var stream = asset.streams[sid];
            if (stream && stream.monteCarlo && stream.monteCarlo.inputs) {
                stream.monteCarlo.inputs.forEach(function (inp) {
                    totalInputs++;
                    if (inp.dataConfidence === 'low') {
                        var aDef = findAssumptionDef(inp.variable, asset);
                        lowInputs.push(aDef ? aDef.name : inp.variable);
                    }
                });
            }
        });
        var overallConf = lowInputs.length === 0 ? 'High' : 'Medium';
        if (lowInputs.length > totalInputs * 0.3) overallConf = 'Low';

        var confReason = overallConf === 'High' ? 'all input distributions are based on medium or high confidence data sources' :
            (overallConf === 'Low' ? lowInputs.length + ' of ' + totalInputs + ' inputs rely on low-confidence estimates' :
            'some inputs have limited calibration data');

        resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128203;</span> Data Confidence Summary</div>' +
            '<div class="panel-body">' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Simulation Result Confidence vs Model Confidence</div>' +
            '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px;font-style:italic">Note: Simulation results reflect the statistical output of ' + fmt(mcRes.numRuns) + ' runs. Model confidence reflects the quality of input data driving those simulations.</div>' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Model/Data Confidence: <strong style="color:' + (overallConf === 'High' ? '#00C48C' : (overallConf === 'Low' ? '#FF5C5C' : '#FFAA00')) + '">' + overallConf + '</strong></div>' +
            '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">Result confidence is <strong>' + overallConf + '</strong> because ' + confReason + '.</div>' +
            (lowInputs.length > 0 ? '<div style="font-size:11px;color:var(--text-tertiary)">' + lowInputs.length + ' of ' + totalInputs + ' inputs have low confidence \u2014 results should be treated as indicative</div>' +
                '<div style="font-size:10px;color:var(--text-tertiary);margin-top:4px">Low-confidence inputs: ' + lowInputs.join(', ') + '</div>' :
                '<div style="font-size:11px;color:var(--text-tertiary)">All ' + totalInputs + ' inputs have medium or high confidence</div>') +
        '</div></div>';

        // ── Section I: Sensitivity Analysis ──
        var targetStreamId = scope === 'all' ? (state.expandedStream || 'potable-water') : Object.keys(mcRes.streams)[0];
        var targetS = streams.find(function (s) { return s.def.id === targetStreamId; });

        if (targetS && targetS.data.sensitivityDrivers) {
            resultsHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#127919;</span> Sensitivity Analysis \u2014 ' + targetS.def.name + '</div>' +
                '<div class="panel-body"><div class="chart-container" style="height:280px"><canvas id="chart-tornado"></canvas></div></div></div>';

            if (targetS.data.thresholds) {
                var thresholdRows = targetS.data.thresholds.map(function (t) {
                    var aDef = targetS.data.assumptions.find(function (a) { return a.id === t.variable; });
                    return '<tr><td>' + (aDef ? aDef.name : t.variable) + '</td><td style="font-weight:600;color:var(--status-conditional)">' + t.threshold + '</td><td>' + t.description + '</td></tr>';
                }).join('');
                resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#9888;</span> Threshold Analysis</div>' +
                    '<div class="panel-body"><table class="data-table"><thead><tr><th>Variable</th><th>Threshold</th><th>Description</th></tr></thead><tbody>' + thresholdRows + '</tbody></table></div></div>';
            }
            resultsHtml += '</div>';
        }

        // ── Section 6: Cross-Stream Dependencies ──
        if (mcRes.dependencyImpacts && mcRes.dependencyImpacts.length > 0) {
            var depRows = mcRes.dependencyImpacts.map(function (d) {
                return '<tr><td style="font-weight:600">' + d.name + '</td><td style="font-weight:600;color:var(--text-primary)">' + d.impactPercent + '%</td><td>' + confidenceIndicator(d.confidence) + '</td></tr>';
            }).join('');
            resultsHtml += '<div class="panel"><div class="panel-header"><span class="panel-header-icon">&#128279;</span> Cross-Stream Dependencies</div>' +
                '<div class="panel-body"><table class="mc-dep-table"><thead><tr><th>Dependency</th><th>Impact</th><th>Confidence</th></tr></thead><tbody>' + depRows + '</tbody></table></div></div>';
        }

        // ── Technical Details (collapsible) ──
        var techInputsList = '';
        allStreamIds.forEach(function (sid) {
            var stream = asset.streams[sid];
            var sDef = getStreamDef(sid);
            if (stream && stream.monteCarlo && stream.monteCarlo.inputs) {
                techInputsList += '<div style="margin-top:6px;font-weight:600;color:var(--text-secondary)">' + (sDef ? sDef.name : sid) + '</div>';
                stream.monteCarlo.inputs.forEach(function (inp) {
                    var aDef = findAssumptionDef(inp.variable, asset);
                    var paramStr = '';
                    if (inp.distributionType === 'normal') paramStr = 'mean=' + inp.params.mean + ', stdDev=' + inp.params.stdDev;
                    else if (inp.distributionType === 'triangular') paramStr = 'min=' + inp.params.min + ', mode=' + inp.params.mode + ', max=' + inp.params.max;
                    else if (inp.distributionType === 'uniform') paramStr = 'min=' + inp.params.min + ', max=' + inp.params.max;
                    techInputsList += '<div>' + (aDef ? aDef.name : inp.variable) + ': ' + inp.distributionType + '(' + paramStr + ') [' + inp.dataConfidence + ']</div>';
                });
            }
        });

        resultsHtml += '<div class="mc-tech-details">' +
            '<div class="mc-tech-toggle" id="mc-tech-toggle">&#9660; Technical Details</div>' +
            '<div class="mc-tech-body" id="mc-tech-body">' +
            '<div><strong>Simulation runs:</strong> ' + fmt(mcRes.numRuns) + '</div>' +
            '<div><strong>Scope:</strong> ' + (scope === 'all' ? 'All infrastructure streams' : (primaryDef ? primaryDef.name : scope)) + '</div>' +
            '<div><strong>Milestone:</strong> ' + asset.milestone + ' (quarter index ' + quarterIndex(asset.milestone) + ')</div>' +
            '<div style="margin-top:8px"><strong>Input Distributions:</strong></div>' +
            techInputsList +
            (primaryRes ? '<div style="margin-top:8px"><strong>Raw Statistics (' + (primaryDef ? primaryDef.name : '') + '):</strong></div>' +
            '<div>Mean gap: ' + fmt(primaryRes.meanGap) + ' | P50: ' + fmt(primaryRes.p50Gap) + ' | P80: ' + fmt(primaryRes.p80Gap) + ' | P90: ' + fmt(primaryRes.p90Gap) + '</div>' +
            '<div>Min: ' + fmt(primaryRes.gaps[0]) + ' | Max: ' + fmt(primaryRes.gaps[primaryRes.gaps.length - 1]) + '</div>' : '') +
            '</div></div>';

        // ── Apply all results via innerHTML (fix scroll issue) ──
        // Get existing controls HTML from mc
        var controlsHtml = '';
        var existingStyle = mc.querySelector('style');
        var existingControls = mc.querySelector('.mc-controls');
        var existingContext = mc.querySelector('.context-header');
        if (existingStyle) controlsHtml += existingStyle.outerHTML;
        if (existingContext) controlsHtml += existingContext.outerHTML;
        if (existingControls) controlsHtml += existingControls.outerHTML;
        mc.innerHTML = controlsHtml + resultsHtml;
        wireMcControls();

        // ── Create Charts ──

        // Stream readiness bar chart (scope=all)
        if (scope === 'all') {
            var sLabels = [];
            var sProbs = [];
            var sColors = [];
            streams.forEach(function (s) {
                if (mcRes.streams[s.def.id]) {
                    sLabels.push(s.def.name);
                    var p = mcRes.streams[s.def.id].readinessProb;
                    sProbs.push(p);
                    sColors.push(probColor(p));
                }
            });
            createChart('chart-stream-readiness', {
                type: 'bar',
                data: { labels: sLabels, datasets: [{ label: 'Readiness %', data: sProbs, backgroundColor: sColors }] },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return v + '%'; } } },
                        y: { grid: { display: false }, ticks: { color: '#8585A0' } }
                    }
                }
            });
        }

        // Enhanced Histogram
        if (primaryRes) {
            var histData = primaryRes.histogram;
            var barColors = histData.binEdges.map(function (edge) {
                return edge >= 0 ? 'rgba(255,92,92,0.6)' : 'rgba(0,196,140,0.6)';
            });
            var probPct = histData.counts.map(function (c) {
                return Math.round(c / mcRes.numRuns * 10000) / 100;
            });

            // Find zero line position
            var zeroAnnotations = {};
            var zeroBinIdx = -1;
            for (var zi = 0; zi < histData.binEdges.length; zi++) {
                if (histData.binEdges[zi] >= 0) { zeroBinIdx = zi; break; }
            }
            if (zeroBinIdx >= 0) {
                zeroAnnotations.zeroLine = {
                    type: 'line',
                    xMin: zeroBinIdx - 0.5,
                    xMax: zeroBinIdx - 0.5,
                    borderColor: 'rgba(255,92,92,0.8)',
                    borderWidth: 2,
                    borderDash: [6, 4],
                    label: {
                        display: true,
                        content: 'Supply Meets Demand',
                        position: 'start',
                        backgroundColor: 'rgba(255,92,92,0.15)',
                        color: '#FF5C5C',
                        font: { size: 9, weight: 'bold' }
                    }
                };
            }

            // P50/P80/P90 annotation lines
            var pLines = [
                { key: 'p50', value: primaryRes.p50Gap, color: '#4DA6FF', label: 'P50 (Most Likely)' },
                { key: 'p80', value: primaryRes.p80Gap, color: '#FFAA00', label: 'P80 (Likely Worst)' },
                { key: 'p90', value: primaryRes.p90Gap, color: '#FF5C5C', label: 'P90 (Severe Downside)' }
            ];
            pLines.forEach(function (pl) {
                // Find bin index closest to the percentile value
                var bestIdx = 0;
                var bestDist = Infinity;
                for (var pi = 0; pi < histData.binEdges.length; pi++) {
                    var dist = Math.abs(histData.binEdges[pi] - pl.value);
                    if (dist < bestDist) { bestDist = dist; bestIdx = pi; }
                }
                zeroAnnotations[pl.key + 'Line'] = {
                    type: 'line',
                    xMin: bestIdx,
                    xMax: bestIdx,
                    borderColor: pl.color,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                    label: {
                        display: true,
                        content: pl.label + ': ' + fmt(pl.value),
                        position: 'end',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: pl.color,
                        font: { size: 8 }
                    }
                };
            });

            createChart('chart-mc-hist', {
                type: 'bar',
                data: {
                    labels: histData.labels,
                    datasets: [
                        {
                            type: 'bar', label: 'Probability %', data: probPct, backgroundColor: barColors, order: 2,
                            tooltip: {
                                callbacks: {
                                    label: function (ctx) {
                                        return 'Probability: ' + ctx.parsed.y.toFixed(1) + '% (Frequency: ' + histData.counts[ctx.dataIndex] + ')';
                                    }
                                }
                            }
                        },
                        {
                            type: 'line', label: 'Cumulative %', data: histData.cumulative, borderColor: '#FFE600', pointRadius: 0, yAxisID: 'y1', order: 1,
                            tooltip: {
                                callbacks: {
                                    label: function (ctx) {
                                        return 'At this point, ' + ctx.parsed.y + '% of simulated outcomes result in a supply gap equal to or below this value';
                                    }
                                }
                            }
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        annotation: { annotations: zeroAnnotations },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return v.toFixed(1) + '%'; } }, title: { display: true, text: 'Probability %', color: '#8585A0' } },
                        y1: { position: 'right', grid: { display: false }, ticks: { color: '#FFE600', callback: function (v) { return v + '%'; } }, min: 0, max: 100, title: { display: true, text: 'Cumulative %', color: '#FFE600' } },
                        x: { grid: { display: false }, ticks: { color: '#8585A0', maxRotation: 45, autoSkip: true, maxTicksLimit: 12 }, title: { display: true, text: 'Supply Gap (' + (primaryDef ? primaryDef.unit : '') + ')', color: '#8585A0' } }
                    }
                }
            });
        }

        // Tornado chart
        if (targetS && targetS.data.sensitivityDrivers) {
            var drivers = targetS.data.sensitivityDrivers.slice().sort(function (a, b) { return a.rank - b.rank; });
            createChart('chart-tornado', {
                type: 'bar',
                data: {
                    labels: drivers.map(function (d) { return d.name; }),
                    datasets: [
                        { label: 'Negative Impact', data: drivers.map(function (d) { return d.impact.negative; }), backgroundColor: '#FF5C5C' },
                        { label: 'Positive Impact', data: drivers.map(function (d) { return d.impact.positive; }), backgroundColor: '#00C48C' }
                    ]
                },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0', callback: function (v) { return fmt(v); } } },
                        y: { grid: { display: false }, ticks: { color: '#8585A0' } }
                    }
                }
            });
        }

        // Scenario comparison button
        var compareBtn = document.getElementById('mc-compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', function () {
                compareBtn.disabled = true;
                compareBtn.textContent = 'Computing...';
                setTimeout(function () {
                    renderScenarioComparisonTable(asset, streams, mcRes);
                }, 50);
            });
        }

        // Technical details toggle
        var techToggle = document.getElementById('mc-tech-toggle');
        var techBody = document.getElementById('mc-tech-body');
        if (techToggle && techBody) {
            techToggle.addEventListener('click', function () {
                var isOpen = techBody.classList.contains('open');
                techBody.classList.toggle('open');
                techToggle.innerHTML = (isOpen ? '&#9660;' : '&#9650;') + ' Technical Details';
            });
        }
    }

    function renderScenarioComparisonTable(asset, streams, currentRes) {
        var container = document.getElementById('mc-scenario-comparison');
        if (!container) return;

        var entries = [{ id: 'baseline', name: 'Baseline', color: '#4DA6FF' }];
        state.scenarios.forEach(function (sc) {
            entries.push({ id: String(sc.slot), name: (SLOT_LETTERS[sc.slot] || sc.slot) + ': ' + sc.name, color: sc.color });
        });

        var scope = currentRes.scope;
        var numRuns = currentRes.numRuns;

        var scenarioResults = {};
        entries.forEach(function (e) {
            var key = mcCacheKey(e.id, scope);
            if (state.monteCarloResults[key]) {
                scenarioResults[e.id] = state.monteCarloResults[key];
            } else {
                var result = runIntegratedMonteCarlo(asset, e.id, numRuns, scope);
                state.monteCarloResults[key] = result;
                scenarioResults[e.id] = result;
            }
        });

        var streamIds = scope === 'all' ? Object.keys(asset.streams) : [scope];

        var html = '<table class="mc-scenario-table"><thead><tr><th></th>';
        entries.forEach(function (e) {
            html += '<th style="color:' + e.color + '">' + e.name + '</th>';
        });
        html += '</tr></thead><tbody>';

        if (scope === 'all') {
            html += '<tr><td style="font-weight:800;color:var(--text-primary)">All Ready</td>';
            entries.forEach(function (e) {
                var res = scenarioResults[e.id];
                var p = res.integrated ? res.integrated.allReadyProb : 0;
                html += '<td style="color:' + probColor(p) + ';font-weight:800;font-size:14px">' + p + '%</td>';
            });
            html += '</tr>';
        }

        streamIds.forEach(function (sid) {
            var sDef = getStreamDef(sid);
            html += '<tr><td>' + (sDef ? sDef.icon + ' ' + sDef.name : sid) + '</td>';
            entries.forEach(function (e) {
                var res = scenarioResults[e.id];
                var sRes = res.streams[sid];
                var p = sRes ? sRes.readinessProb : 0;
                html += '<td style="color:' + probColor(p) + ';font-weight:600">' + p + '%</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ════════════════════════════════════════════════════════════════════
    // VIEW 4: Interventions & Decision
    // ════════════════════════════════════════════════════════════════════
    function renderInterventionsDecision() {
        var mc = document.getElementById('main-content');
        var asset = getAsset(state.selectedAsset);
        if (!asset) { mc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">No asset selected</div>'; return; }

        // Get interventions from T6 potable water (global interventions)
        var pwStream = asset.streams['potable-water'];
        var interventions = (pwStream && pwStream.interventions) ? pwStream.interventions : [];

        var maxReduction = interventions.length > 0 ? Math.max.apply(null, interventions.map(function (i) { return i.gapReduction; })) : 1;

        var typeColorMap = {
            'Alternative Supply': { bg: 'rgba(77,166,255,0.12)', color: '#4DA6FF' },
            'Capacity Expansion': { bg: 'rgba(255,170,0,0.12)', color: '#FFAA00' },
            'Acceleration': { bg: 'rgba(0,196,140,0.12)', color: '#00C48C' },
            'Combination': { bg: 'rgba(255,230,0,0.12)', color: '#FFE600' }
        };

        var cardsHtml = interventions.map(function (intv) {
            var tc = typeColorMap[intv.type] || { bg: 'rgba(255,255,255,0.08)', color: '#8585A0' };
            var feasColor = intv.feasibility === 'High' ? '#00C48C' : (intv.feasibility === 'Medium' ? '#FFAA00' : '#FF5C5C');
            var pct = Math.round(intv.gapReduction / maxReduction * 100);
            var unit = pwStream ? (getStreamDef('potable-water') || {}).unit || 'm\u00B3/day' : 'm\u00B3/day';

            return '<div class="intervention-card">' +
                '<div class="intervention-card-header">' +
                    '<div class="intervention-name">' + intv.name + '</div>' +
                    '<span class="intervention-type" style="background:' + tc.bg + ';color:' + tc.color + '">' + intv.type + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">' + (intv.description || '') + '</div>' +
                '<div class="intervention-metric"><span class="intervention-metric-label">Gap Reduction</span><span class="intervention-metric-value" style="color:#00C48C">' + fmt(intv.gapReduction) + ' ' + unit + '</span></div>' +
                '<div class="intervention-metric"><span class="intervention-metric-label">Cost</span><span class="intervention-metric-value">' + intv.cost + ' M SAR</span></div>' +
                '<div class="intervention-metric"><span class="intervention-metric-label">Timing</span><span class="intervention-metric-value">' + intv.timing + '</span></div>' +
                '<div class="intervention-metric"><span class="intervention-metric-label">Feasibility</span><span class="intervention-metric-value" style="color:' + feasColor + '">' + intv.feasibility + '</span></div>' +
                '<div class="intervention-metric"><span class="intervention-metric-label">Readiness Impact</span><span class="intervention-metric-value">' + intv.readinessImpact + '</span></div>' +
                '<div class="intervention-impact-bar"><div class="intervention-impact-fill" style="width:' + pct + '%;background:#00C48C"></div></div>' +
                '<div style="margin-top:10px"><button class="btn-secondary" style="width:100%;padding:6px;font-size:10px" data-intv="' + intv.id + '">Apply to Current Scenario</button></div>' +
            '</div>';
        }).join('');

        // Decision Brief
        var brief = SCENARIO_DATA.decisionBrief;

        var scenarioRows = brief.scenariosTested.map(function (s) {
            return '<tr><td style="font-weight:600">' + s.name + '</td><td>' + s.summary + '</td></tr>';
        }).join('');

        var actionRows = brief.actions.map(function (a) {
            var statusCls = a.status === 'Pending' ? 'at-risk' : (a.status === 'In Progress' ? 'in-progress' : 'ready');
            return '<tr><td>' + a.owner + '</td><td>' + a.action + '</td><td>' + a.deadline + '</td><td><span class="status-badge ' + statusCls + '">' + a.status + '</span></td></tr>';
        }).join('');

        var triggerItems = brief.monitoringTriggers.map(function (t) {
            return '<div style="margin-bottom:10px;padding:10px;background:var(--bg-panel);border-radius:var(--radius-sm);border:1px solid var(--border-dark)">' +
                '<div style="font-size:11px;font-weight:600;color:var(--status-conditional);margin-bottom:4px">If: ' + t.condition + '</div>' +
                '<div style="font-size:11px;color:var(--text-secondary)">Then: ' + t.response + '</div></div>';
        }).join('');

        mc.innerHTML = contextHeader() +
            // TOP: Interventions
            '<div style="margin-bottom:24px">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:12px">Interventions</div>' +
                (cardsHtml ? '<div class="intervention-cards">' + cardsHtml + '</div>' : '<div style="padding:20px;text-align:center;color:var(--text-tertiary)">No interventions defined for this asset.</div>') +
                (interventions.length > 0 ? '<div class="panel" style="margin-top:16px"><div class="panel-header"><span class="panel-header-icon">&#128202;</span> Intervention Comparison</div>' +
                '<div class="panel-body"><div class="chart-container" style="height:240px"><canvas id="chart-intv-compare"></canvas></div></div></div>' : '') +
            '</div>' +
            // BOTTOM: Decision Brief
            '<div class="decision-brief">' +
                '<div style="display:flex;justify-content:space-between;align-items:center">' +
                    '<div style="font-size:18px;font-weight:800">' + brief.title + '</div>' +
                    '<div style="display:flex;gap:8px"><button class="btn-secondary" id="brief-generate">Generate Decision Brief</button><button class="btn-primary" id="brief-export">Export PDF</button></div>' +
                '</div>' +
                '<div class="brief-section" style="border-left:3px solid var(--ey-yellow)">' +
                    '<div class="brief-section-title"><span class="section-icon">&#9888;&#65039;</span> Decision Required</div>' +
                    '<div class="brief-text" style="font-weight:600;font-size:14px">' + brief.decisionRequired + '</div>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#128205;</span> Current Position</div>' +
                    '<div style="margin-bottom:8px"><span class="status-badge ' + statusClass(brief.currentPosition.status) + '">' + brief.currentPosition.status + '</span></div>' +
                    '<div class="brief-text">' + brief.currentPosition.description + '</div>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#128202;</span> Scenarios Tested</div>' +
                    '<table class="data-table"><thead><tr><th>Scenario</th><th>Summary</th></tr></thead><tbody>' + scenarioRows + '</tbody></table>' +
                '</div>' +
                '<div class="brief-section" style="text-align:center">' +
                    '<div class="brief-section-title" style="justify-content:center"><span class="section-icon">&#127922;</span> Probability Assessment</div>' +
                    '<div style="font-size:48px;font-weight:800;color:#00C48C">' + brief.probabilityAssessment.probabilityOfReadiness + '%</div>' +
                    '<div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">Probability of Readiness at ' + asset.name + ' Opening</div>' +
                    '<div style="font-size:11px;color:var(--text-secondary);margin-top:8px">' + brief.probabilityAssessment.basis + '</div>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#128161;</span> Preferred Intervention</div>' +
                    '<div style="font-size:14px;font-weight:700;color:var(--ey-yellow);margin-bottom:8px">' + brief.preferredIntervention.name + '</div>' +
                    '<div class="brief-recommendation">' + brief.preferredIntervention.rationale + '</div>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#128737;</span> Residual Risk</div>' +
                    '<div style="margin-bottom:8px"><span class="status-badge ' + (brief.residualRisk.level === 'Low' ? 'ready' : 'at-risk') + '">' + brief.residualRisk.level + ' Risk</span></div>' +
                    '<div class="brief-text">' + brief.residualRisk.description + '</div>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#9989;</span> Required Actions</div>' +
                    '<table class="brief-action-table"><thead><tr><th>Owner</th><th>Action</th><th>Deadline</th><th>Status</th></tr></thead><tbody>' + actionRows + '</tbody></table>' +
                '</div>' +
                '<div class="brief-section">' +
                    '<div class="brief-section-title"><span class="section-icon">&#128680;</span> Monitoring Triggers</div>' +
                    triggerItems +
                '</div>' +
                '<div style="text-align:center;font-size:10px;color:var(--text-tertiary);padding:10px">' +
                    'Prepared by: ' + brief.preparedBy + ' | ' + brief.date +
                '</div>' +
            '</div>';

        // Intervention comparison chart
        if (interventions.length > 0) {
            createChart('chart-intv-compare', {
                type: 'bar',
                data: {
                    labels: interventions.map(function (i) { return i.name; }),
                    datasets: [
                        { label: 'Gap Reduction', data: interventions.map(function (i) { return i.gapReduction; }), backgroundColor: '#00C48C' },
                        { label: 'Cost (M SAR)', data: interventions.map(function (i) { return i.cost; }), backgroundColor: '#FFAA00' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8585A0' } },
                        x: { grid: { display: false }, ticks: { color: '#8585A0', font: { size: 10 } } }
                    }
                }
            });
        }

        // Apply intervention buttons
        mc.querySelectorAll('[data-intv]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (state.activeScenario === 'baseline') {
                    alert('Cannot modify baseline. Switch to a scenario slot first.');
                    return;
                }
                var intv = interventions.find(function (i) { return i.id === btn.getAttribute('data-intv'); });
                if (!intv) return;
                var sc = state.scenarios.find(function (s) { return String(s.slot) === String(state.activeScenario); });
                if (sc) {
                    Object.keys(intv.assumptions).forEach(function (k) {
                        sc.assumptions[k] = intv.assumptions[k];
                    });
                    alert('Applied "' + intv.name + '" to ' + sc.name);
                    renderTab(state.activeTab);
                }
            });
        });

        // Brief buttons
        document.getElementById('brief-export').addEventListener('click', function () {
            alert('PDF export is not available in this POC. In production, this would generate a formatted PDF of the decision brief.');
        });
        document.getElementById('brief-generate').addEventListener('click', function () {
            alert('Decision brief has been generated with current scenario data.');
        });
    }

    // ─── Monte Carlo Sampling Functions ──────────────────────────────
    function sampleTriangular(min, mode, max) {
        var u = Math.random();
        var fc = (mode - min) / (max - min);
        if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min));
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }

    function sampleNormal(mean, stdDev) {
        var u1 = Math.random(), u2 = Math.random();
        return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    function sampleDistribution(input) {
        switch (input.distributionType) {
            case 'triangular': return sampleTriangular(input.params.min, input.params.mode, input.params.max);
            case 'normal': return sampleNormal(input.params.mean, input.params.stdDev);
            case 'uniform': return input.params.min + Math.random() * (input.params.max - input.params.min);
            default: return 0;
        }
    }

    function buildHistogram(results, bins) {
        bins = bins || 25;
        var min = results[0], max = results[results.length - 1];
        if (min === max) { max = min + 1; }
        var binWidth = (max - min) / bins;
        var counts = new Array(bins).fill(0);
        var labels = [];
        var binEdges = [];
        for (var i = 0; i < bins; i++) {
            var lo = min + i * binWidth;
            binEdges.push(lo);
            labels.push(fmt(Math.round(lo)));
        }
        results.forEach(function (v) {
            var idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
            counts[idx]++;
        });
        var total = results.length;
        var cumulative = [];
        var running = 0;
        counts.forEach(function (c) {
            running += c;
            cumulative.push(Math.round(running / total * 100));
        });
        return { labels: labels, counts: counts, cumulative: cumulative, binEdges: binEdges };
    }

    // ─── AI Insights Sidebar ───────────────────────────────────────────
    function renderAIInsights() {
        var container = document.getElementById('ai-insights-content');
        if (!container) return;

        var typeColorMap = {
            'critical': { color: '#E63946', label: 'CRITICAL' },
            'warning': { color: '#FFAA00', label: 'WARNING' },
            'recommendation': { color: '#00C48C', label: 'RECOMMENDATION' },
            'info': { color: '#4DA6FF', label: 'INFO' }
        };

        container.innerHTML = SCENARIO_DATA.aiInsights.map(function (insight) {
            var tc = typeColorMap[insight.type] || { color: '#8585A0', label: insight.type };
            return '<div class="ai-insight-card">' +
                '<div class="ai-insight-type" style="color:' + tc.color + '">' + tc.label + '</div>' +
                '<div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:4px">' + insight.title + '</div>' +
                '<div class="ai-insight-text">' + insight.description + '</div>' +
                '<div style="margin-top:6px;font-size:9px;color:var(--text-tertiary)">Confidence: ' + insight.confidence + '</div>' +
                (insight.relatedScenario ? '<div class="ai-insight-action" onclick="document.querySelector(\'[data-scenario=\\x22' + insight.relatedScenario + '\\x22]\').click()">View Scenario &#8594;</div>' : '') +
            '</div>';
        }).join('');
    }

    // ─── Scenario Configuration Modal ──────────────────────────────────
    function initModal() {
        var manageBtn = document.getElementById('manage-scenarios-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', function () {
                var slot = state.activeScenario === 'baseline' ? 1 : parseInt(state.activeScenario);
                openConfigModal(slot);
            });
        }

        document.querySelectorAll('.scenario-tab:not(.baseline)').forEach(function (tab) {
            tab.addEventListener('dblclick', function () {
                openConfigModal(parseInt(tab.getAttribute('data-scenario')));
            });
        });

        document.getElementById('modal-close').addEventListener('click', closeConfigModal);
        document.getElementById('config-modal').addEventListener('click', function (e) {
            if (e.target === this) closeConfigModal();
        });
    }

    function openConfigModal(slot) {
        state.configModalSlot = slot;
        var modal = document.getElementById('config-modal');
        var sc = state.scenarios.find(function (s) { return s.slot === slot; });
        if (!sc) return;

        var asset = getAsset(state.selectedAsset);
        if (!asset) return;

        var letter = SLOT_LETTERS[sc.slot] || sc.slot;
        document.getElementById('modal-title').textContent = 'Configure Scenario ' + letter + ': ' + sc.name;
        document.getElementById('scenario-name').value = sc.name;
        document.getElementById('scenario-desc').value = sc.templateId || '';

        var templateSelect = document.getElementById('template-select');
        templateSelect.innerHTML = '<option value="">Select a template...</option>';
        SCENARIO_DATA.templates.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.icon + ' ' + t.name + ' \u2014 ' + t.description;
            if (t.id === sc.templateId) opt.selected = true;
            templateSelect.appendChild(opt);
        });

        // Build assumptions table grouped by stream
        var tbody = document.getElementById('assumptions-body');
        var rows = '';
        var streams = getAssetStreams(state.selectedAsset);
        streams.forEach(function (s) {
            // Stream header row
            rows += '<tr><td colspan="3" style="font-weight:700;color:var(--text-primary);padding-top:12px;border-bottom:2px solid var(--border-light)">' + s.def.icon + ' ' + s.def.name + '</td></tr>';
            if (s.data.assumptions) {
                s.data.assumptions.forEach(function (a) {
                    var scVal = sc.assumptions[a.id] !== undefined ? sc.assumptions[a.id] : a.baselineValue;
                    var changed = sc.assumptions[a.id] !== undefined && sc.assumptions[a.id] !== a.baselineValue;
                    rows += '<tr>' +
                        '<td>' + a.name + ' <span style="font-size:9px;color:var(--text-tertiary)">(' + a.unit + ')</span></td>' +
                        '<td>' + a.baselineValue + '</td>' +
                        '<td><input type="number" data-assumption="' + a.id + '" value="' + scVal + '" min="' + a.min + '" max="' + a.max + '" step="' + a.step + '" style="' + (changed ? 'border-color:#FFAA00;color:#FFE600' : '') + '"></td>' +
                    '</tr>';
                });
            }
        });
        tbody.innerHTML = rows;

        // Collect all assumptions for template application
        var allAssumptions = [];
        streams.forEach(function (s) {
            if (s.data.assumptions) {
                s.data.assumptions.forEach(function (a) { allAssumptions.push(a); });
            }
        });

        templateSelect.onchange = function () {
            var tmpl = SCENARIO_DATA.templates.find(function (t) { return t.id === templateSelect.value; });
            if (!tmpl) return;
            tbody.querySelectorAll('input[data-assumption]').forEach(function (inp) {
                var id = inp.getAttribute('data-assumption');
                var baseDef = allAssumptions.find(function (a) { return a.id === id; });
                if (!baseDef) return;
                var val = tmpl.changes[id] !== undefined ? tmpl.changes[id] : baseDef.baselineValue;
                inp.value = val;
                inp.style.borderColor = tmpl.changes[id] !== undefined ? '#FFAA00' : '';
                inp.style.color = tmpl.changes[id] !== undefined ? '#FFE600' : '';
            });
            document.getElementById('scenario-name').value = tmpl.name;
        };

        document.getElementById('reset-baseline').onclick = function () {
            tbody.querySelectorAll('input[data-assumption]').forEach(function (inp) {
                var id = inp.getAttribute('data-assumption');
                var baseDef = allAssumptions.find(function (a) { return a.id === id; });
                if (!baseDef) return;
                inp.value = baseDef.baselineValue;
                inp.style.borderColor = '';
                inp.style.color = '';
            });
        };

        function saveFromModal() {
            var overrides = {};
            tbody.querySelectorAll('input[data-assumption]').forEach(function (inp) {
                var id = inp.getAttribute('data-assumption');
                var val = parseFloat(inp.value);
                var baseDef = allAssumptions.find(function (a) { return a.id === id; });
                if (baseDef && val !== baseDef.baselineValue) overrides[id] = val;
            });
            sc.assumptions = overrides;
            sc.name = document.getElementById('scenario-name').value || sc.name;
            updateScenarioTabLabels();
        }

        document.getElementById('save-scenario').onclick = function () {
            saveFromModal();
            alert('Scenario saved.');
        };

        document.getElementById('apply-changes').onclick = function () {
            saveFromModal();
            closeConfigModal();
            renderTab(state.activeTab);
        };

        modal.classList.add('active');
    }

    function closeConfigModal() {
        document.getElementById('config-modal').classList.remove('active');
        state.configModalSlot = null;
    }

    // ─── Sidebar Toggle ────────────────────────────────────────────────
    function initSidebarToggle() {
        var toggle = document.getElementById('sidebar-toggle');
        var sidebar = document.getElementById('ai-sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', function () {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    // ─── Guided Tour ──────────────────────────────────────────────────
    var tourSteps = [
        {
            target: '.context-selectors',
            title: 'Set Your Analysis Context',
            body: 'Start here. Select the <strong>Asset / Milestone</strong> you want to analyse (e.g. Terminal 6, Airport City Phase 1). Optionally filter by <strong>Infrastructure Stream</strong> to focus on a specific stream.',
            position: 'bottom'
        },
        {
            target: '#scenario-tabs',
            title: 'Scenario Slots (A / B / C)',
            body: '<strong>Baseline</strong> is locked \u2014 it represents the current approved plan.<br>Scenarios A, B and C are your reusable slots. Click a tab to view its results. <strong>Double-click</strong> any scenario to edit its assumptions, or use <strong>Manage Scenarios</strong>.',
            position: 'bottom'
        },
        {
            target: '#analytics-tabs',
            title: 'Four Analysis Views',
            body: '<strong>Baseline & What-if</strong> \u2014 see a stream readiness grid for the selected asset. Click any stream row to expand it and see the supply-demand chart with interactive sliders.<br><strong>Scenario Comparison</strong> \u2014 compare all scenarios across all streams.<br><strong>Risk & Sensitivity</strong> \u2014 gap-by-stream chart, tornado analysis, and Monte Carlo simulation.<br><strong>Interventions & Decision</strong> \u2014 evaluate mitigation options and generate a committee decision brief.',
            position: 'bottom'
        },
        {
            target: '[data-tab="whatif"]',
            title: 'View 1: Stream Readiness Grid',
            body: 'The default view shows a <strong>stream readiness grid</strong> \u2014 one row per infrastructure stream showing demand, supply, gap and status. <strong>Click any row</strong> to expand it and see the detailed supply-demand timeline with interactive assumption sliders.',
            position: 'bottom'
        },
        {
            target: '[data-tab="scenario"]',
            title: 'View 2: Scenario Comparison',
            body: 'A <strong>comparison table</strong> shows how each scenario affects every stream. Click any stream row to see an <strong>overlaid timeline chart</strong> with all scenario supply lines against the demand curve.',
            position: 'bottom'
        },
        {
            target: '[data-tab="risk"]',
            title: 'View 3: Risk & Sensitivity',
            body: 'Top: a <strong>horizontal bar chart</strong> ranking which streams have the biggest gaps. Below: <strong>tornado chart</strong> and <strong>Monte Carlo simulation</strong> for streams with detailed uncertainty data.',
            position: 'bottom'
        },
        {
            target: '[data-tab="decision"]',
            title: 'View 4: Interventions & Decision',
            body: 'Top section: <strong>intervention cards</strong> with gap reduction, cost, feasibility, and timing. Click <strong>Apply</strong> to add an intervention to the active scenario.<br>Bottom section: a <strong>committee Decision Brief</strong> with the decision required, recommendation, residual risk, actions, and monitoring triggers.',
            position: 'bottom'
        },
        {
            target: '#ai-sidebar',
            title: 'AI Insights',
            body: 'The AI panel surfaces <strong>critical alerts</strong>, warnings, and recommendations based on current data. Each insight links to the relevant scenario. Click the <strong>X</strong> to collapse the sidebar when you need more chart space.',
            position: 'left'
        }
    ];

    var tourCurrent = 0;

    function startTour() {
        tourCurrent = 0;
        var overlay = document.getElementById('tour-overlay');
        overlay.classList.add('active');
        showTourStep(0);
    }

    function endTour() {
        document.getElementById('tour-overlay').classList.remove('active');
        sessionStorage.setItem('scenario-tour-done', '1');
    }

    function showTourStep(idx) {
        tourCurrent = idx;
        var step = tourSteps[idx];
        var el = document.querySelector(step.target);
        if (!el && step.fallback) el = document.querySelector(step.fallback);

        var highlight = document.getElementById('tour-highlight');
        if (el) {
            var rect = el.getBoundingClientRect();
            var pad = 6;
            highlight.style.display = 'block';
            highlight.style.top = (rect.top - pad) + 'px';
            highlight.style.left = (rect.left - pad) + 'px';
            highlight.style.width = (rect.width + pad * 2) + 'px';
            highlight.style.height = (rect.height + pad * 2) + 'px';
        } else {
            highlight.style.display = 'none';
        }

        document.getElementById('tour-step-label').textContent = 'Step ' + (idx + 1) + ' of ' + tourSteps.length;
        document.getElementById('tour-title').textContent = step.title;
        document.getElementById('tour-body').innerHTML = step.body;

        var dotsHtml = '';
        for (var i = 0; i < tourSteps.length; i++) {
            dotsHtml += '<div class="tour-dot' + (i === idx ? ' active' : '') + '"></div>';
        }
        document.getElementById('tour-dots').innerHTML = dotsHtml;

        var tooltip = document.getElementById('tour-tooltip');
        if (el) {
            var rect = el.getBoundingClientRect();
            var tw = 380;
            var pos = step.position || 'bottom';

            if (pos === 'bottom' || pos === 'bottom-left') {
                tooltip.style.top = (rect.bottom + 14) + 'px';
                tooltip.style.left = pos === 'bottom-left'
                    ? Math.max(16, rect.right - tw) + 'px'
                    : Math.min(window.innerWidth - tw - 16, Math.max(16, rect.left)) + 'px';
            } else if (pos === 'top') {
                tooltip.style.top = Math.max(16, rect.top - 220) + 'px';
                tooltip.style.left = Math.max(16, rect.left) + 'px';
            } else if (pos === 'right') {
                tooltip.style.top = Math.max(16, rect.top) + 'px';
                tooltip.style.left = Math.min(window.innerWidth - tw - 16, rect.right + 14) + 'px';
            } else if (pos === 'left') {
                tooltip.style.top = Math.max(16, rect.top) + 'px';
                tooltip.style.left = Math.max(16, rect.left - tw - 14) + 'px';
            }
        } else {
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%,-50%)';
        }

        document.getElementById('tour-prev').style.display = idx === 0 ? 'none' : '';
        document.getElementById('tour-next').textContent = idx === tourSteps.length - 1 ? 'Done' : 'Next';
    }

    function initTour() {
        var btn = document.getElementById('start-tour');
        if (btn) btn.addEventListener('click', startTour);
        document.getElementById('tour-skip').addEventListener('click', endTour);
        document.getElementById('tour-next').addEventListener('click', function () {
            if (tourCurrent >= tourSteps.length - 1) { endTour(); return; }
            showTourStep(tourCurrent + 1);
        });
        document.getElementById('tour-prev').addEventListener('click', function () {
            if (tourCurrent > 0) showTourStep(tourCurrent - 1);
        });
        document.getElementById('tour-overlay').addEventListener('click', function (e) {
            if (e.target.classList.contains('tour-backdrop')) endTour();
        });

        if (!sessionStorage.getItem('scenario-tour-done')) {
            setTimeout(startTour, 1500);
        }
    }

    // ─── Init ──────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        initContextSelectors();
        initScenarioTabs();
        initAnalyticsTabs();
        initModal();
        initSidebarToggle();
        renderAIInsights();
        renderTab('whatif');
        initTour();
    });

})();
