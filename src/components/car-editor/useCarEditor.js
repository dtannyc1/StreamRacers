import { useState, useRef, useCallback } from 'react'
import { createDefaultCar } from '../../lib/carDefaults'

export const useCarEditor = (initialCar = null) => {
  const [car, setCar] = useState(() => initialCar ?? createDefaultCar())
  const [selectedId, setSelectedId] = useState(null)

  const selectedAsset = car.assets.find(a => a.id === selectedId) ?? null

  const setCarName = (name) => setCar(prev => ({ ...prev, name }))

  const updateAsset = useCallback((id, patch) => {
    setCar(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }, [])

  const addAsset = () => {
    const newAsset = {
      id: crypto.randomUUID(),
      name: 'New Asset',
      spriteUrl: '',
      type: 'static',
      tl: [0, 0],
      dim: [100, 100],
    }
    setCar(prev => ({ ...prev, assets: [...prev.assets, newAsset] }))
    setSelectedId(newAsset.id)
  }

  const removeAsset = (id) => {
    setCar(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }))
    setSelectedId(prev => prev === id ? null : prev)
  }

  const moveAssetUp = (id) => {
    setCar(prev => {
      const idx = prev.assets.findIndex(a => a.id === id)
      if (idx <= 0) return prev
      const next = [...prev.assets]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return { ...prev, assets: next }
    })
  }

  const moveAssetDown = (id) => {
    setCar(prev => {
      const idx = prev.assets.findIndex(a => a.id === id)
      if (idx >= prev.assets.length - 1) return prev
      const next = [...prev.assets]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return { ...prev, assets: next }
    })
  }

  // 'asset' | 'cr'
  const dragState = useRef(null)

  const onCanvasMouseDown = useCallback((e, canvasRect, scale, draggingCR) => {
    if (!selectedAsset) return
    if (draggingCR) {
      dragState.current = {
        mode: 'cr',
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startCR: [...(selectedAsset.cr ?? [0, 0])],
        scale,
      }
    } else {
      dragState.current = {
        mode: 'asset',
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startTL: [...selectedAsset.tl],
        startCR: selectedAsset.cr ? [...selectedAsset.cr] : null,
        scale,
      }
    }
  }, [selectedAsset])

  const onCanvasMouseMove = useCallback((e) => {
    if (!dragState.current || !selectedId) return
    const { mode, startMouseX, startMouseY, scale } = dragState.current
    const dx = (e.clientX - startMouseX) * scale
    const dy = (e.clientY - startMouseY) * scale

    if (mode === 'cr') {
      const { startCR } = dragState.current
      updateAsset(selectedId, { cr: [startCR[0] + dx, startCR[1] + dy] })
    } else {
      const { startTL, startCR } = dragState.current
      const patch = { tl: [startTL[0] + dx, startTL[1] + dy] }
      // move CR along with the asset
      if (startCR) patch.cr = [startCR[0] + dx, startCR[1] + dy]
      updateAsset(selectedId, patch)
    }
  }, [selectedId, updateAsset])

  const onCanvasMouseUp = useCallback(() => {
    dragState.current = null
  }, [])

  return {
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
  }
}