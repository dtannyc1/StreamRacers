
export function PosBadge({ pos }) {
  const base = "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0";

  switch (pos) {
    case 1:
      return (
        <div className={`${base} bg-amber-100 text-amber-800`}>
          {pos}
        </div>
      )
      break
    case 2:
      return (
        <div className={`${base} bg-slate-100 text-slate-600`}>
          {pos}
        </div>
      )
      break
    case 3:
      return (
        <div className={`${base} bg-orange-100 text-orange-800`}>
          {pos}
        </div>
      )
      break 
    default:
      return (
        <div className={`${base} bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}>
          {pos}
        </div>
      )
  }
}

export function RacerRow({ rank, name, stats, onNameClick }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b 
                    border-gray-100 dark:border-gray-800 last:border-b-0 
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors 
                    duration-100">
      <PosBadge pos={rank} />
      {onNameClick ? (
        <button
          onClick={() => onNameClick(name)}
          className="flex-1 text-sm text-left text-gray-800 dark:text-gray-200 truncate
                     hover:text-red-600 dark:hover:text-red-400 hover:underline
                     underline-offset-2 transition-colors duration-100 cursor-pointer"
        >
          {name}
        </button>
      ) : (
        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
          {name}
        </span>
      )}
      <span className="text-xs text-gray-500 dark:text-gray-400 text-right tabular-nums shrink-0">
        <span className="font-medium text-gray-800 dark:text-gray-200">{stats.points}pts</span>
        &nbsp; {stats.wins} Win{stats.wins !== 1 ? 's' : ''} 
        &nbsp;{stats.races} Race{stats.races !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
