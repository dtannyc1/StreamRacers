import { useState, useMemo, useEffect } from "react"
import {
  filterRaces,
  formatDateLabel,
  formatMonthLabel,
  getMostRecentDay,
} from "../../lib/leaderboardFilters"
import TabBar from "./TabBar"
import PeriodControls from "./PeriodControls"
import LeaderPanel from "./LeaderPanel"
import PlayerLookup from "./PlayerLookup"

const VIEW_TABS = [
  { id: "split",   label: "Split view" },
  { id: "day",     label: "Day" },
  { id: "month",   label: "Month" },
  { id: "year",    label: "Year" },
  { id: "alltime", label: "All time" },
  { id: "lookup",  label: "Player lookup" },
]

function usePanelProps(mode, races, refDate) {
  return useMemo(() => {
    const raceSet = filterRaces(races, mode, refDate)
    if (mode === "day") {
      return { raceSet, label: `${formatDateLabel(refDate)}`, sub: `${raceSet.length} races` }
    }
    if (mode === "month") {
      return { raceSet, label: formatMonthLabel(refDate), sub: `${raceSet.length} races this month` }
    }
    if (mode === "year") {
      return { raceSet, label: `${refDate.getFullYear()} Season`, sub: `${raceSet.length} total races` }
    }
    return { raceSet: races, label: "All Time", sub: `${races.length} total races` }
  }, [mode, races, refDate])
}

function SplitView({ splitLeft, splitRight, races, refDate }) {
  const left  = usePanelProps(splitLeft,  races, refDate)
  const right = usePanelProps(splitRight, races, refDate)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <LeaderPanel {...left} />
      <LeaderPanel {...right} />
    </div>
  )
}

function SingleView({ mode, races, refDate }) {
  const props = usePanelProps(mode, races, refDate)
  return (
    <div className="grid grid-cols-1 gap-3">
      <LeaderPanel {...props} />
    </div>
  )
}

export default function RaceLeaderboard({ raceHistory = [] }) {
  const [viewMode,    setViewMode]    = useState("split")
  const [splitLeft,   setSplitLeft]   = useState("day")
  const [splitRight,  setSplitRight]  = useState("month")
  const [refDate,     setRefDate]     = useState(() => getMostRecentDay(raceHistory))

  useEffect(() => {
    setRefDate(getMostRecentDay(raceHistory))
  }, [raceHistory])

  return (
    <div className="font-sans">

      <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
        <TabBar tabs={VIEW_TABS} active={viewMode} onChange={setViewMode} />
      </div>

      {viewMode !== "alltime" && viewMode !== "lookup" && (
        <div className="mb-4">
          <PeriodControls
            viewMode={viewMode}
            refDate={refDate}
            setRefDate={setRefDate}
            splitLeft={splitLeft}
            setSplitLeft={setSplitLeft}
            splitRight={splitRight}
            setSplitRight={setSplitRight}
            races={raceHistory}
          />
        </div>
      )}

      {viewMode === "split" && (
        <SplitView
          splitLeft={splitLeft}
          splitRight={splitRight}
          races={raceHistory}
          refDate={refDate}
        />
      )}

      {(viewMode === "day" || viewMode === "month" || viewMode === "year" || viewMode === "alltime") && (
        <SingleView mode={viewMode} races={raceHistory} refDate={refDate} />
      )}

      {viewMode === "lookup" && (
        <PlayerLookup races={raceHistory} refDate={refDate} />
      )}
    </div>
  )
}
