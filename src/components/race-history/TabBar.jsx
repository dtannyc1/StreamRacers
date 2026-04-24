import { formatDateLabel, getAvailableDays, getDayKey } from "../../lib/leaderboardFilters";

function Label({ children }) {
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{children}</span>
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                 focus:outline-none focus:ring-2 focus:ring-red-400/50 cursor-pointer"
    >
      {children}
    </select>
  )
}

export default function TabBar({ tabs, active, onChange, races, refDate, setRefDate }) {

  const availableDays = getAvailableDays(races ?? [])
  const setDay   = (v) => setRefDate(new Date(`${v}T12:00:00`))

  return (
    <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150",
            active === t.id
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-black/5"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}

      {
        active === "lookup" && 
        <div className="absolute right-0 top-0 bottom-0 flex flex-wrap justify-center items-center gap-2">
          <Label>Reference date:</Label>
          <Select value={getDayKey(refDate)} onChange={setDay}>
            {availableDays.map((d) => (
              <option key={getDayKey(d)} value={getDayKey(d)}>{formatDateLabel(d)}</option>
            ))}
          </Select>
        </div>
      }
    </div>
  );
}
