
export const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
]

export function parseDate(str) {
  const [month, day, year] = str.split("/").map(Number)
  return new Date(year, month - 1, day)
}
export const getDayKey   = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
export const getMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
export const getYearKey  = (d) => d.getFullYear().toString()

export function formatDateLabel(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatMonthLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatShortDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function calcPoints(pos, totalRacers, config = {}) {
  const { 
    maxPointsCap = 10, 
    specialPositions = {
      1:  { base: "max", modifier: 0 },  
      2:  { base: "max", modifier: -1 },  
      3:  { base: "max", modifier: -2 },  
      4:  { base: "max", modifier: -3 },  
      5:  { base: "max", modifier: -4 },
      6:  { base: "max", modifier: -5 },
      7:  { base: "max", modifier: -6 },
      8:  { base: "max", modifier: -7 },
      9:  { base: "max", modifier: -8 },
      10: { base: "max", modifier: -9 }
    }, 
    minPointsCap = 0,
    defaultPoints = 0 
  } = config;

  const dynamicMax = Math.min(totalRacers, maxPointsCap);

  let rule = specialPositions[pos];
  if (pos === totalRacers && specialPositions["last"] !== undefined) {
    rule = specialPositions["last"];
  }

  if (rule !== undefined) {
    if (typeof rule === 'number') return rule;

    if (rule.base === 'max') {
      return Math.max(minPointsCap, dynamicMax + (rule.modifier || 0));
    }
    if (rule.base === 'flat') {
      return rule.value;
    }
  }

  return defaultPoints;
}

export function filterRaces(races, mode, refDate) {
  return races.filter((r) => {
    const d = parseDate(r.date)
    if (mode === "day")   return getDayKey(d)   === getDayKey(refDate)
    if (mode === "month") return getMonthKey(d) === getMonthKey(refDate)
    if (mode === "year")  return getYearKey(d)  === getYearKey(refDate)
    return true // alltime
  })
}

export function removeUsersFromStats(racers, removeUsers) {
  return racers.filter((r) => !removeUsers.includes(r))
}

export function buildStats(raceSet, removeUsers = []) {
  const stats = {}
  raceSet.forEach((race) => {
    const filteredRacers = removeUsersFromStats(race.racers, removeUsers)
    filteredRacers.forEach((name, idx) => {
      if (!stats[name]) {
        stats[name] = { wins: 0, podiums: 0, races: 0, points: 0, bestPos: Infinity }
      }
      const pos = idx + 1
      stats[name].races++
      if (pos < stats[name].bestPos) stats[name].bestPos = pos
      if (pos === 1) stats[name].wins++
      if (pos <= 3)  stats[name].podiums++
      stats[name].points += calcPoints(pos, filteredRacers.length)
    })
  })
  return stats
}

export function sortedLeaders(stats, limit = 15) {
  return Object.entries(stats)
    .sort(([, a], [, b]) => 
      (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums) || (b.races - a.races)
    ).slice(0, limit)
}

export function getAvailableDays(races) {
  const keys = [...new Set(races.map((r) => getDayKey(parseDate(r.date))))].sort()
  return keys.map((k) => new Date(`${k}T12:00:00`))
}

export function getAvailableMonths(races) {
  const keys = [...new Set(races.map((r) => getMonthKey(parseDate(r.date))))].sort()
  return keys.map((k) => new Date(`${k}-01T12:00:00`))
}

export function getAvailableYears(races) {
  return [...new Set(races.map((r) => parseDate(r.date).getFullYear()))].sort()
}

export function getMostRecentDay(races) {
  const days = getAvailableDays(races)
  return days.length > 0 ? days[days.length - 1] : new Date()
}
