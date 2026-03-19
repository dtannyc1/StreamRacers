import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import { useCarEditor } from './useCarEditor'
import CarCanvas from './CarCanvas'
import AssetPanel from './AssetPanel'
import AssetForm from './AssetForm'

const CarEditorInner = ({ mode, username, carIndex, initialCar }) => {
  const { racers, updateRacers } = useKVStore()
  const navigate = useNavigate()

  const {
    car,
    selectedId,
    selectedAsset,
    setSelectedId,
    setCarName,
    updateAsset,
    addAsset,
    removeAsset,
    moveAssetUp,
    moveAssetDown,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
  } = useCarEditor(initialCar)

  const handleSave = async () => {
    const updated = { ...racers }
    if (mode === 'new-user' || mode === 'new-car') {
      updated[username] = [...(racers[username] ?? []), car]
    } else if (mode === 'edit') {
      const cars = [...racers[username]]
      cars[parseInt(carIndex)] = car
      updated[username] = cars
    }
    await updateRacers(updated)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <input
              type="text"
              value={car.name}
              onChange={(e) => setCarName(e.target.value)}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-lg font-semibold text-white focus:outline-none focus:border-purple-500"
            />
            {username && (
              <span className="text-sm text-gray-400">for <span className="text-purple-400">{username}</span></span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            Save Car
          </button>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-6">
          <CarCanvas
            assets={car.assets}
            selectedId={selectedId}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedId}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
          />
          <div className="flex flex-col gap-6 overflow-y-auto max-h-[600px] pr-1">
            <AssetPanel
              assets={car.assets}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={addAsset}
              onRemove={removeAsset}
              onMoveUp={moveAssetUp}
              onMoveDown={moveAssetDown}
            />
            <div className="border-t border-gray-700 pt-4">
              <AssetForm asset={selectedAsset} onUpdate={updateAsset} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CarEditorInner