import {
  getDayKey,
  getMonthKey,
  formatDateLabel,
  formatMonthLabel,
  getAvailableDays,
  getAvailableMonths,
  getAvailableYears,
} from "../../shared/leaderboardFilters"

const SPLIT_OPTS = ["day", "month", "year", "alltime"]
const optLabel   = (o) => o === "alltime" ? "All time" : o.charAt(0).toUpperCase() + o.slice(1)

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

export default function PeriodControls({
  viewMode,
  refDate,
  setRefDate,
  splitLeft,
  setSplitLeft,
  splitRight,
  setSplitRight,
  races,
}) {
  if (viewMode === "alltime" || viewMode === "lookup") return null

  const availableDays   = getAvailableDays(races)
  const availableMonths = getAvailableMonths(races)
  const availableYears  = getAvailableYears(races)

  const setDay   = (v) => setRefDate(new Date(`${v}T12:00:00`))
  const setMonth = (v) => setRefDate(new Date(`${v}-01T12:00:00`))
  const setYear  = (v) => setRefDate(new Date(`${v}-07-01T12:00:00`))

  if (viewMode === "split") {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Label>Left:</Label>
        <Select value={splitLeft} onChange={setSplitLeft}>
          {SPLIT_OPTS.map((o) => <option key={o} value={o}>{optLabel(o)}</option>)}
        </Select>

        <Label>Right:</Label>
        <Select value={splitRight} onChange={setSplitRight}>
          {SPLIT_OPTS.map((o) => <option key={o} value={o}>{optLabel(o)}</option>)}
        </Select>

        <Label>Reference date:</Label>
        <Select value={getDayKey(refDate)} onChange={setDay}>
          {availableDays.map((d) => (
            <option key={getDayKey(d)} value={getDayKey(d)}>{formatDateLabel(d)}</option>
          ))}
        </Select>
      </div>
    )
  }

  if (viewMode === "day") {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Label>Day:</Label>
        <Select value={getDayKey(refDate)} onChange={setDay}>
          {availableDays.map((d) => (
            <option key={getDayKey(d)} value={getDayKey(d)}>{formatDateLabel(d)}</option>
          ))}
        </Select>
      </div>
    )
  }

  if (viewMode === "month") {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Label>Month:</Label>
        <Select value={getMonthKey(refDate)} onChange={setMonth}>
          {availableMonths.map((d) => (
            <option key={getMonthKey(d)} value={getMonthKey(d)}>{formatMonthLabel(d)}</option>
          ))}
        </Select>
      </div>
    )
  }

  if (viewMode === "year") {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Label>Year:</Label>
        <Select value={refDate.getFullYear()} onChange={setYear}>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
      </div>
    )
  }

  return null
}
