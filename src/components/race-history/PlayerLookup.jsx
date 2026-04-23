import { useState, useMemo } from "react"
import { filterRaces, calcPoints, parseDate } from "../../lib/leaderboardFilters"
import StatCard from "./StatCard"
import RaceLogRow from "./RaceLogRow"
import TabBar from "./TabBar"

const PERIOD_TABS = [
  { id: "day",     label: "Today" },
  { id: "month",   label: "This month" },
  { id: "year",    label: "This year" },
  { id: "alltime", label: "All time" },
]

export default function PlayerLookup({ races, refDate }) {
  const [query,  setQuery]  = useState("")
  const [period, setPeriod] = useState("month")

  const raceSet = useMemo(
    () => filterRaces(races, period, refDate),
    [races, period, refDate]
  )

  const foundName = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return (
      raceSet.flatMap((r) => r.racers).find((n) => n.toLowerCase() === q) ?? null
    )
  }, [query, raceSet])

  const userRaces = useMemo(() => {
    if (!foundName) return []
    return raceSet.filter((r) =>
      r.racers.some((n) => n.toLowerCase() === foundName.toLowerCase())
    )
  }, [foundName, raceSet])

  const userStats = useMemo(() => {
    if (!foundName || userRaces.length === 0) return null
    const lc = foundName.toLowerCase()

    const wins    = userRaces.filter((r) => r.racers[0].toLowerCase() === lc).length
    const podiums = userRaces.filter((r) =>
      r.racers.slice(0, 3).some((n) => n.toLowerCase() === lc)
    ).length
    const positions = userRaces.map((r) =>
      r.racers.findIndex((n) => n.toLowerCase() === lc) + 1
    )
    const avgPos = (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
    const points = userRaces.reduce((sum, r) => {
      const pos = r.racers.findIndex((n) => n.toLowerCase() === lc) + 1
      return sum + calcPoints(pos, r.racers.length)
    }, 0)

    return { wins, podiums, points, races: userRaces.length, avgPos }
  }, [foundName, userRaces])

  const sortedRaces = useMemo(
    () => [...userRaces].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [userRaces]
  )

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Enter username…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-28 text-sm px-3 py-1.5 rounded-md
                     border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900
                     text-gray-800 dark:text-gray-200
                     placeholder:text-gray-400 dark:placeholder:text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-red-400/50"
        />
        <TabBar tabs={PERIOD_TABS} active={period} onChange={setPeriod} />
      </div>

      {!query.trim() && (
        <p className="px-3.5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Enter a username to view their stats
        </p>
      )}

      {query.trim() && !foundName && (
        <p className="px-3.5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No races found for &ldquo{query}&rdquo in this period.
        </p>
      )}

      {foundName && userStats && (
        <>
          <p className="px-3.5 pt-3 pb-0 text-sm font-medium text-gray-900 dark:text-gray-100">
            {foundName}
          </p>

          {/* Stat grid */}
          <div className="grid grid-cols-5 gap-2 px-3.5 py-3">
            <StatCard label="Points"  value={userStats.points} />
            <StatCard label="Races"   value={userStats.races} />
            <StatCard label="Wins"    value={userStats.wins} />
            <StatCard label="Podiums" value={userStats.podiums} />
            <StatCard label="Avg pos" value={userStats.avgPos} />
          </div>

          <div>
            {sortedRaces.slice(0, 20).map((race, i) => (
              <RaceLogRow key={i} race={race} username={foundName} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
