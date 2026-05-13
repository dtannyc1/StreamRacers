import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'

const CarCard = ({ car, index, username }) => {
  const navigate = useNavigate()
  const { racers, updateRacers } = useKVStore()

  const handleDelete = async () => {
    if (!confirm(`Delete "${car.name}"?`)) return
    const updatedCars = racers[username].filter((_, i) => i !== index)
    const updatedRacers = { ...racers, [username]: updatedCars }
    await updateRacers(updatedRacers)
  }

  const toggleEnabled = async () => {
    const updatedCars = racers[username].map((c, i) => i === index ? { ...c, disabled: !c.disabled } : c)
    const updatedRacers = { ...racers, [username]: updatedCars }
    await updateRacers(updatedRacers)
  }

  return (
    <div className={`flex items-center justify-between rounded-lg ${car.disabled ? 'bg-gray-900 ring-inset ring-1 ring-gray-600' : 'bg-gray-700'} px-4 py-3`}>
      <div>
        <p className={`text-sm font-medium text-white`}>
          {car.name ?? `Car ${index + 1}`}
        </p>
        <p className="text-xs text-gray-400">
          {car.assets?.length ?? 0} asset{car.assets?.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={toggleEnabled}
          className={`text-xs cursor-pointer ${car.disabled ? 'text-green-400' : 'text-red-400'} hover:text-purple-300 transition-colors`}
        >
          {car.disabled ? 'Enable' : 'Disable'}
        </button>
        <button
          onClick={() => navigate(`/racer/${username}/car/${index}/edit`)}
          className="text-xs cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-xs cursor-pointer text-red-400 hover:text-red-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default CarCard