import { useKVStore } from "../../context/KVStoreContext"
import { parseDate, calcPoints, formatShortDate } from "../../shared/leaderboardFilters"

export default function RaceLogRow({ race, username }) {
  const { raceSettings } = useKVStore()
  const pos = race.racers.findIndex((n) => n.toLowerCase() === username.toLowerCase()) + 1
  const pts = calcPoints(pos, race.racers.length, (raceSettings?.pointsConfig ?? {}))
  const d   = parseDate(race.date)

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 border-t 
                    border-gray-100 dark:border-gray-800 text-xs tabular-nums"
    >
      <span className="text-gray-400 dark:text-gray-500 w-20 shrink-0">
        {formatShortDate(d)}
      </span>
      <span className="font-medium text-gray-800 dark:text-gray-200 w-7 shrink-0">
        P{pos}
      </span>
      <span className="text-gray-400 dark:text-gray-500">
        {race.racers.length} racers
      </span>
      <span className="ml-auto text-gray-500 dark:text-gray-400">
        {pts} pts
      </span>
    </div>
  );
}
