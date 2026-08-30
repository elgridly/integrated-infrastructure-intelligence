# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KSIA Regional Infrastructure Decision Intelligence Platform** — an interactive web POC for EY that gives the Regional Infrastructure Committee an integrated view of infrastructure readiness across King Salman International Airport (KSIA). This is **committee decision intelligence, not project reporting**.

The platform connects airport assets and milestone dates to demand, supply, external-entity projects, interim/permanent solutions, funding, land, approvals, dependencies and required committee actions.

**Tech stack**: Vanilla HTML/CSS/JS with Node.js (matching the user's prior projects). Data from central JSON/JS data files — no backend database. Runs locally.

## Architecture

- All data must come from a central configurable data model (JSON files), never hard-coded in UI components (requirement CP-11, AC-08)
- Global filters (Major Development, KSIA Area, Infrastructure Stream, External Entity, Time Horizon) persist across all screens (CP-02, CP-04)
- The primary demonstration storyline is **Terminal 6 potable-water readiness** end-to-end

## Screens (in order)

| # | Screen | Purpose |
|---|--------|---------|
| 0 | Landing Page | Executive enablement overview, hero image, readiness indicators, 4 dark intelligence panels, 8 module cards, Ask KSIA Assistant |
| A | Executive Overview | Interactive airport-city view with regional infrastructure networks and asset readiness markers |
| 1 | Master Plan Readiness Cockpit | Asset/milestone/stream readiness assessment |
| 2 | Scenario Planning | Compare 5 scenarios (Baseline, Accelerated Growth, Delayed Infrastructure, Funding Constrained, High Airport City Uptake) |
| 3 | Supply, Demand & Gap Management | Time-phased demand vs supply, gap periods, closure actions |
| 4 | Infrastructure Solutions & Gap Closure | Permanent/interim/alternative solutions for gaps |
| 5 | Funding, Budget Requests & Cash Flow | Funding lifecycle: required → requested → approved → released → spent |
| 6 | Land, Corridors, Approvals & Prerequisites | Non-construction prerequisites tracking |
| 7 | Integrated Dependencies & Critical Path | Critical path from enabling infra to KSIA milestones |
| 8 | AI Insights & Recommendations | Prioritized findings, root causes, interventions |
| Utility | Ask KSIA Assistant | Conversational AI access to platform data |

**Build order**: Landing Page first, then Executive Overview, then remaining modules.

## Visual Design Requirements

- Mixed EY light-and-dark theme: white/light-grey canvas, dark charcoal header, selected dark intelligence panels
- EY yellow (#FFE600) for emphasis only
- Crisp high-contrast typography
- Approved KSIA airport-city image as spatial reference

## Status Systems

**Readiness statuses**: Ready, Conditional, At Risk, Blocked, Not Assessed
**Project statuses**: On Track, At Risk, Delayed, Blocked, Completed, Not Started
**Committee action statuses**: Pending, In Progress, Overdue, Closed, Superseded
**Data types to distinguish visually**: actual, forecast, committed, planned permanent, interim, simulated

## Readiness Calculation Logic

- **Supply gap** = required demand − total available supply (existing + committed + planned available by date + active interim)
- **Ready**: sufficient operational supply forecast before required date, critical prerequisites complete/on track
- **Conditional**: sufficient supply forecast but material prerequisites or limited contingency remain
- **At Risk**: supply, project forecast, or critical prerequisites may miss required date
- **Blocked**: confirmed critical dependency prevents progression or no credible gap-closure solution

## Core Data Model Entities

Asset/Milestone, Infrastructure Requirement, Supply Source, External Project, Gap, Solution, Funding Request, Prerequisite, Dependency, Committee Action, Scenario, AI Insight

## Infrastructure Streams

All Infrastructure, Mobility & Roads, Public Transport, Potable Water, Wastewater, Power & Energy, District Cooling, Digital & Telecommunications, Stormwater & Drainage, Waste & Environmental Services, Natural Gas

## Representative POC Data

- **Assets**: Terminal 6, Private Aviation, Airport City Phase 1, Iconic Terminal, Cargo Village Phase 1, runways, MRO, commercial/retail, hospitality
- **External entities**: RCRC, NWC, SWA, SEC, CST, MOT, Riyadh Municipality
- **Projects**: 20+ external projects with baseline/forecast dates, capacity contributions
- **Committee actions**: 10+ covering funding, land, approvals, acceleration, corridors, interim solutions
- **Primary use case**: Terminal 6 water — demand by Q3 2028, existing/committed supply, delayed permanent pipeline, interim treatment, prerequisites

## Landing Page Specifics

- Dark EY header with platform title, global filters, notifications, help, user controls
- Large KSIA airport-city hero image with Executive Overview action (upper-left)
- Executive indicators: Overall Readiness, Assets Enabled, Assets at Risk, Assets Blocked, Critical Decisions Requiring Action, Funding Gap
- Ask KSIA Assistant placed beside Funding Gap indicator (NOT as a module card)
- Upcoming Key Milestones with year/date, asset name, readiness status
- 4 dark intelligence panels: Infrastructure Readiness by Stream, Committee Action Center, Prerequisite Readiness Overview, External Entity Performance
- 8 sequential module cards (numbered 1-8), each with number, title, purpose, representative visual, and Explore action
- NO implementation phases, Quick Access, separate GIS card, or external-project-progress card

## Specs

- BRD: `specs/cop_KSIA_Regional_Infrastructure_Decision_Intelligence_Platform_BRD.docx`
- Mockup images: `specs/KSIA POC - *.png/jpg`
