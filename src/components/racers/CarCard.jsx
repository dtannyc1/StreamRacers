import { useNavigate } from 'react-router-dom'
import { useKVStore } from '../../context/KVStoreContext'
import { useRef, useEffect, useState } from 'react'
import { drawRacer, preloadCarImages } from '../../lib/racerRenderer'
import { resolveImageUrl } from '../../shared/gifLoader'

const CarCard = ({ car, index, username, onDuplicateCar }) => {
  const canvasRef = useRef(null)
  const assetsRef = useRef({})
  const assets = car?.assets || []
  const [ loadedAssets, setLoadedAssets ] = useState([])

  useEffect(() => {
    async function loadCarImages() {
      let avatarUrl = assets.find(a => a.type === 'avatar')?.spriteUrl
      await preloadCarImages({ assets }, avatarUrl, assetsRef)
      let loaded = []
      for (const oldAsset of assets) {
        let id = oldAsset.id
        let asset = assetsRef.current[id]
        loaded.push({
          ...asset,
          theta: asset.theta_0 + ((asset.minTheta ?? 0) + (asset.maxTheta ?? 0)) / 2,
        })
      }
      setLoadedAssets(loaded)
    }
    loadCarImages()
  }, [car.assets])

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

  useEffect(() => { 
    if (!canvasRef.current || !loadedAssets.length) return

    let maxWidth = 0, maxHeight = 0
    for (const asset of loadedAssets) {
      maxWidth = Math.max(maxWidth, Math.abs(asset.tl[0]))
      maxHeight = Math.max(maxHeight, Math.abs(asset.tl[1]))
    }
    maxWidth ||= 50
    maxHeight ||= 50
    let scale = 50 / Math.max(maxWidth, maxHeight)
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.save()
    ctx.translate(canvasRef.current.width, canvasRef.current.height)
    ctx.scale(scale, scale)
    drawRacer(ctx, {
      assets: loadedAssets, 
      XY: [0, 0],
      vel: [200, 0],
      time: performance.now(),
    }, performance.now())
    ctx.restore()
  }, [loadedAssets])

  return (
    <div className={`flex items-center justify-between rounded-lg ${car.disabled ? 'bg-gray-900 ring-inset ring-1 ring-gray-600' : 'bg-gray-700'} px-4 py-3`}>
      <div className="flex items-center gap-3">
        <canvas
          ref={canvasRef}
          width={50}
          height={50}
          className="rounded object-contain bg-gray-800"
        />
        <div>
          <p className={`text-sm font-medium text-white`}>
            {car.name ?? `Car ${index + 1}`}
          </p>
          <p className="text-xs text-gray-400">
            {car.assets?.length ?? 0} asset{car.assets?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={toggleEnabled}
          className={`text-xs cursor-pointer ${car.disabled ? 'text-green-400' : 'text-red-400'} hover:text-purple-300 transition-colors`}
        >
          {car.disabled ? 'Enable' : 'Disable'}
        </button>
        <button
          onClick={() => onDuplicateCar(car)}
          className="text-xs cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
        >
          Duplicate
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