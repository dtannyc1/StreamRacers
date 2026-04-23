
export default function TabBar({ tabs, active, onChange }) {
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
    </div>
  );
}
