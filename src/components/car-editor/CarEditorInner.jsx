import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useKVStore } from '../../context/KVStoreContext'
import { useCarEditor } from './useCarEditor'
import CarCanvas from './CarCanvas'
import AssetPanel from './AssetPanel'
import { sanitizeCarData, sanitizeDeep, validateCar } from '../../lib/sanitize'
import { getComplementaryColor, remapImageColor } from '../../shared/assetRenderer'
import { loadAssetImage } from '../../shared/gifLoader'

const CarEditorInner = ({ mode, username, carIndex, initialCar, avatarUrl, isDefaultCar, onSaveDefault }) => {
  const { racers, updateRacers } = useKVStore()
  const [eyedropperAssetId, setEyedropperAssetId] = useState(null)
  const [ drawerOpen, setDrawerOpen ] = useState(false)
  const [saveError, setSaveError] = useState(null)
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
    onSpriteUrlChange,
    toggleAspectLock,
  } = useCarEditor(initialCar)

  const handleSave = async () => {
    const avatarCount = car.assets.filter(a => a.type === 'avatar').length
    if (avatarCount === 0) {
      setSaveError('This car must have exactly one avatar asset before saving.')
      return
    }
    if (avatarCount > 1) {
      setSaveError('This car has more than one avatar asset. Please remove the extras before saving.')
      return
    }

    const carError = validateCar(car)
    if (carError) {
      setSaveError(carError)
      return
    }

    setSaveError(null)
    const sanitizedCar = sanitizeCarData(sanitizeDeep(car))

    if (isDefaultCar) {
      await onSaveDefault(sanitizedCar)
      navigate('/dashboard')
      return
    }

    const updated = { ...racers }

    if (mode === 'new-user' || mode === 'new-car') {
      updated[username] = [...(racers[username] ?? []), sanitizedCar]
    } else if (mode === 'edit') {
      const cars = [...racers[username]]
      cars[parseInt(carIndex)] = sanitizedCar
      updated[username] = cars
    }

    await updateRacers(updated)
    navigate('/dashboard')
  }

  const handleEyedropperActivate = (assetId) => {
    setEyedropperAssetId(assetId)
  }

  const handleEyedropperPick = async (assetId, hex) => {
    const asset = car.assets.find(a => a.id === assetId);
    const {img: loadedImg, frames} = await loadAssetImage(asset, null)

    if (asset) {
      updateAsset(assetId, {
        colorRemap: {
          ...asset.colorRemap,
          sourceColor: hex,
        },
        img: loadedImg,
        remappedImg: remapImageColor(loadedImg, hex, getComplementaryColor(hex), asset.colorRemap.remapTolerance ?? 10)
      })
    }
    setEyedropperAssetId(null)
  }

  const handleSelectAsset = (assetId) => {
    if (!assetId) {
      setSelectedId(null)
      setDrawerOpen(false)
      return
    }
    setSelectedId(assetId)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setSelectedId(null)
    setDrawerOpen(false)
  }

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white xl:p-8 sm:p-4 p-2 touch-none"
      onPointerDown={() => handleDrawerClose()}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between max-w-[100dvw] gap-x-4">
          <button
            onPointerDown={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-x-4 shrink grow flex-wrap">
            <input
              type="text"
              value={car.name}
              onChange={(e) => setCarName(e.target.value)}
              className="shrink min-w-0 w-fit rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-lg font-semibold text-white focus:outline-none focus:border-purple-500"
            />
            {username && (
              <span className="text-sm text-gray-400">for <span className="text-purple-400">{username}</span></span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {saveError && (
                <p className="text-sm text-red-400">{saveError}</p>
            )}
            <button
                onPointerDown={handleSave}
                className="rounded-lg cursor-pointer bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
                Save Car
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 touch-none">
          <div
            className="h-fit touch-none"
          >
            <CarCanvas
              assets={car.assets}
              selectedId={selectedId}
              selectedAsset={selectedAsset}
              avatarUrl={avatarUrl}
              onSelectAsset={handleSelectAsset}
              onDeselectAsset={handleDrawerClose}
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              isDefaultCar={isDefaultCar}
              eyedropperAssetId={eyedropperAssetId}
              onEyedropperPick={handleEyedropperPick}
            />
          </div>
          <div 
            className="flex flex-col gap-6 -mr-2 relative touch-none"
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onPointerMove={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <AssetPanel
              assets={car.assets}
              selectedId={selectedId}
              onSelect={handleSelectAsset}
              onDeselect={handleDrawerClose}
              drawerOpen={drawerOpen}
              onAdd={addAsset}
              onRemove={removeAsset}
              onMoveUp={moveAssetUp}
              onMoveDown={moveAssetDown}
              asset={selectedAsset} 
              onUpdate={updateAsset} 
              onSpriteUrlChange={onSpriteUrlChange}
              toggleAspectLock={toggleAspectLock}
              isDefaultCar={isDefaultCar}
              onEyedropperActivate={handleEyedropperActivate}
            />
            {/*
            <div className="border-t border-gray-700 pt-4">
              <AssetForm 
                asset={selectedAsset} 
                onUpdate={updateAsset} 
                onSpriteUrlChange={onSpriteUrlChange}
                toggleAspectLock={toggleAspectLock}
              />
            </div>
            */}
          </div>
        </div>

      </div>
    </div>
  )
}

export default CarEditorInner