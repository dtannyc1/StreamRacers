import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarCard from './CarCard'

const RacerRow = ({ username, cars = [] }) => {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between cursor-pointer px-4 py-3 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">{username}</span>
          <span className="text-xs text-gray-500">{cars.length} car{cars.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 px-4 py-3 flex flex-col gap-2">
          {cars.length === 0 && (
            <p className="text-sm text-gray-500">No cars yet.</p>
          )}
          {cars.map((car, index) => (
            <CarCard
              key={index}
              car={car}
              index={index}
              username={username}
            />
          ))}
          <button
            onClick={() => navigate(`/racer/${username}/car/new`)}
            className="mt-1 cursor-pointer text-sm text-purple-400 hover:text-purple-300 transition-colors text-left"
          >
            + Add vehicle
          </button>
        </div>
      )}
    </div>
  )
}

export default RacerRow