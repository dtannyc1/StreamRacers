import { useState, useMemo, useEffect, useCallback } from "react"
import {
  filterRaces,
  formatDateLabel,
  formatMonthLabel,
  getMostRecentDay,
  getDayKey,
} from "../../shared/leaderboardFilters"
import TabBar from "./TabBar"
import PeriodControls from "./PeriodControls"
import LeaderPanel from "./LeaderPanel"
import PlayerLookup from "./PlayerLookup"
import { useKVStore } from "../../context/KVStoreContext"

const VIEW_TABS = [
  { id: "split",   label: "Split view" },
  { id: "day",     label: "Day" },
  { id: "month",   label: "Month" },
  { id: "year",    label: "Year" },
  { id: "alltime", label: "All time" },
  { id: "lookup",  label: "Player lookup" },
]

function usePanelProps(mode, races, refDate, onNameClick) {
  return useMemo(() => {
    const raceSet = filterRaces(races, mode, refDate)
    if (mode === "day") {
      return { raceSet, label: `${formatDateLabel(refDate)}`, sub: `${raceSet.length} races`, onNameClick, mode }
    }
    if (mode === "month") {
      return { raceSet, label: formatMonthLabel(refDate), sub: `${raceSet.length} races this month`, onNameClick, mode }
    }
    if (mode === "year") {
      return { raceSet, label: `${refDate.getFullYear()} Season`, sub: `${raceSet.length} total races`, onNameClick, mode }
    }
    return { raceSet: races, label: "All Time", sub: `${races.length} total races`, onNameClick, mode }
  }, [mode, races, refDate])
}

function SplitView({ splitLeft, splitRight, races, refDate, onNameClick }) {
  const left  = usePanelProps(splitLeft,  races, refDate, onNameClick)
  const right = usePanelProps(splitRight, races, refDate, onNameClick)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <LeaderPanel {...left} />
      <LeaderPanel {...right} />
    </div>
  )
}

function SingleView({ mode, races, refDate, onNameClick }) {
  const props = usePanelProps(mode, races, refDate, onNameClick)
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
  const [lookupQuery, setLookupQuery] = useState("")
  const [lookupPeriod,setLookupPeriod]= useState("month")

  const { updateRaceHistoryOverlaySettings } = useKVStore();

  useEffect(() => {
    setRefDate(getMostRecentDay(raceHistory))
  }, [raceHistory])

  const pushOverlaySettings = useCallback(() => {
    if (viewMode === "lookup") return;         // player lookup has no overlay equivalent
    let diff = (refDate - getMostRecentDay(raceHistory)) / (1000 * 60 * 60 * 24)

    const payload = {
      viewMode,
      splitLeft,
      splitRight,
      // Store refDate as YYYY-MM-DD so the overlay can reconstruct it without timezone issues
      refDate: (!diff) ? null : getDayKey(refDate),
    };

    updateRaceHistoryOverlaySettings(payload)
  }, [viewMode, splitLeft, splitRight, refDate]);

  useEffect(() => {
    pushOverlaySettings();
  }, [pushOverlaySettings]);

  function openPlayerLookup(name, period) {
    setLookupQuery(name);
    setLookupPeriod(period ?? "month");
    setViewMode("lookup");
  }

  return (
    <div className="font-sans">

      <div className="flex relative flex-wrap justify-center items-center gap-3 mb-4">
        <TabBar 
          tabs={VIEW_TABS} 
          active={viewMode} 
          onChange={setViewMode} 
          races={raceHistory}
          refDate={refDate}
          setRefDate={setRefDate}
        />
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
          onNameClick={openPlayerLookup}
        />
      )}

      {(viewMode === "day" || viewMode === "month" || viewMode === "year" || viewMode === "alltime") && (
        <SingleView 
          mode={viewMode} 
          races={raceHistory} 
          refDate={refDate} 
          onNameClick={openPlayerLookup}
        />
      )}

      {viewMode === "lookup" && (
        <PlayerLookup 
          races={raceHistory} 
          refDate={refDate} 
          initialQuery={lookupQuery}
          initialPeriod={lookupPeriod}
        />
      )}
    </div>
  )
}
