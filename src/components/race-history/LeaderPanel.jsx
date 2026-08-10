import { useMemo } from "react"
import { buildStats, sortedLeaders } from "../../shared/leaderboardFilters"
import { RacerRow } from "./RacerRow"
import { useKVStore } from "../../context/KVStoreContext"

export default function LeaderPanel({ raceSet, label, sub, onNameClick, mode }) {
  const { raceSettings } = useKVStore()
  const stats   = useMemo(() => buildStats(raceSet, (raceSettings?.removeUsers ?? []), (raceSettings?.pointsConfig ?? {})), [raceSet])
  const leaders = useMemo(() => sortedLeaders(stats),  [stats])

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{sub}</span>
      </div>

      {/* Racer list */}
      {leaders.length === 0 ? (
        <p className="px-3.5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No races found
        </p>
      ) : (
        <div>
          {leaders.map(([name, s], i) => (
            <RacerRow key={name} rank={i + 1} name={name} stats={s} onNameClick={(name) => onNameClick(name, mode)} />
          ))}
        </div>
      )}
    </div>
  );
}
