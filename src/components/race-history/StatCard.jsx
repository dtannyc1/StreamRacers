
export default function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
        {value}
      </p>
    </div>
  );
}
