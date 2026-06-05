import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createDefaultCar } from '../../lib/carDefaults'
import { resolveImageUrl } from '../../shared/gifLoader'
import { hydrateAsset, phaseCorrection } from '../../shared/assetRenderer'

export const useCarEditor = (initialCar = null) => {
  const [car, setCar] = useState(() => {
    let basicCar = initialCar ?? createDefaultCar()
    basicCar = {...basicCar, 
                XY: [0, 0], 
                vel: [200, 0],
                acc: [6,0],
                time: Date.now(),
                showBoost: false,
                lastBoost: null,
                initTime: performance.now(),
              }
    return basicCar
  })
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    for (let ii = 0; ii < car.assets.length; ii++) {
      let asset = car.assets[ii]
      if (asset.type === 'custom' && !asset.draw && !asset.error) { 
        car.assets[ii] = hydrateAsset(asset)
      }
      if (asset.theta_0 === undefined) {
        asset.theta_0 = asset.theta ?? 0
      }
      if (asset.theta_dot === undefined) {
        asset.theta_dot = 1
      }
      if (asset.initTime === undefined) {
        asset.initTime = car.initTime
        if (asset.type === 'oscillating') {
          const { correctedTheta, correctedThetaDot } = phaseCorrection(asset, performance.now() - (car.initTime ?? performance.now())  )
          asset.theta = correctedTheta
          asset.theta_dot = correctedThetaDot
        }
      }
      if (asset.animationEnabled === undefined) {
        asset.animationEnabled = true
      }
    }
  }, [car])

  const selectedAsset = useMemo(() => {
    let asset = car.assets.find(a => a.id === selectedId) ?? null
    return asset;
  }, [car, car.assets, selectedId]);

  const setCarName = (name) => setCar(prev => ({ ...prev, name }))

  const updateAsset = useCallback((id, patch) => {
    setCar(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }, [car])

  const addAsset = () => {
    const newAsset = {
      id: crypto.randomUUID(),
      name: 'New Asset',
      spriteUrl: '',
      type: 'static',
      tl: [0, 0],
      dim: [100, 100],
      colorRemap: { enabled: false, sourceColor: '#FF001A' },
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

  const onCanvasMouseDown = useCallback((clientX, clientY, canvasRect, scale, draggingCR, resizeCorner, draggingRadius, draggingStart, draggingEnd) => {
    if (!selectedAsset) return
    if (resizeCorner) {
      dragState.current = {
        mode: 'resize',
        corner: resizeCorner,
        startMouseX: clientX,
        startMouseY: clientY,
        startTL: [...selectedAsset.tl],
        startDIM: [...selectedAsset.dim],
        startCR: selectedAsset.cr ? [...selectedAsset.cr] : null,
        startRadius: selectedAsset.radius ?? null,
        aspectLocked: selectedAsset.type === 'avatar' || (selectedAsset.aspectLocked ?? false ),
        scale,
      }
    } else if (draggingRadius) {
      dragState.current = {
        mode: 'radius',
        startMouseX: clientX,
        startMouseY: clientY,
        startCR: [...(selectedAsset.cr ?? [0, 0])],
        scale,
      }
    } else if (draggingCR) {
      dragState.current = {
        mode: 'cr',
        startMouseX: clientX,
        startMouseY: clientY,
        startCR: [...(selectedAsset.cr ?? [0, 0])],
        scale,
      }
    } else if (draggingStart) {
      dragState.current = {
        mode: 'sliderStart',
        startMouseX: clientX,
        startMouseY: clientY,
        startStart: [...(selectedAsset.start ?? [0, 0])],
        scale,
      }
    } else if (draggingEnd) {
      dragState.current = {
        mode: 'sliderEnd',
        startMouseX: clientX,
        startMouseY: clientY,
        startEnd: [...(selectedAsset.end ?? [0, 0])],
        scale,
      }
    } else {
      dragState.current = {
        mode: 'asset',
        startMouseX: clientX,
        startMouseY: clientY,
        startTL: [...selectedAsset.tl],
        startCR: selectedAsset.cr ? [...selectedAsset.cr] : null,
        scale,
      }
    }
  }, [selectedAsset])

  const onCanvasMouseMove = useCallback((clientX, clientY, canvasX, canvasY) => {
    if (!dragState.current || !selectedId) return
    const { mode, startMouseX, startMouseY, scale } = dragState.current
    const dx = (clientX - startMouseX) * scale
    const dy = (clientY - startMouseY) * scale

    if (mode === 'cr') {
      const { startCR } = dragState.current
      updateAsset(selectedId, { cr: [startCR[0] + dx, startCR[1] + dy], theta: 0 })
    } else if (mode === 'asset') {
      const { startTL, startCR } = dragState.current
      const patch = { tl: [startTL[0] + dx, startTL[1] + dy] }
      if (startCR) patch.cr = [startCR[0] + dx, startCR[1] + dy]
      updateAsset(selectedId, patch)
    } else if (mode === 'radius') {
      const { startCR } = dragState.current
      const [cx, cy] = startCR
      const relX = canvasX - cx
      const relY = canvasY - cy
      const handleAngle = Math.atan2(relY, relX)
      const radius = Math.max(1, Math.sqrt(relX ** 2 + relY ** 2))
      updateAsset(selectedId, { radius, handleAngle })
    } else if (mode === 'resize') {
      const { corner, startTL, startDIM } = dragState.current
      let [x, y] = startTL
      let [w, h] = startDIM

      if (corner === 'tl') {
        x = startTL[0] + dx
        y = startTL[1] + dy
        w = startDIM[0] - dx
        h = startDIM[1] - dy
      } else if (corner === 'tr') {
        y = startTL[1] + dy
        w = startDIM[0] + dx
        h = startDIM[1] - dy
      } else if (corner === 'bl') {
        x = startTL[0] + dx
        w = startDIM[0] - dx
        h = startDIM[1] + dy
      } else if (corner === 'br') {
        w = startDIM[0] + dx
        h = startDIM[1] + dy
      }

      // enforce minimum size
      if (w < 10) w = 10
      if (h < 10) h = 10

      // lock aspect ratio for avatar type
      if (selectedAsset.type === 'avatar' || dragState.current.aspectLocked) {
        const aspect = startDIM[0] / startDIM[1]
        if (corner === 'tl' || corner === 'br') {
          // use average of both deltas to drive both dimensions
          const avg = (w + h * aspect) / 2
          w = avg
          h = avg / aspect
          if (corner === 'tl') {
            x = startTL[0] + (startDIM[0] - w)
            y = startTL[1] + (startDIM[1] - h)
          }
        } else if (corner === 'tr') {
          h = w / aspect
          y = startTL[1] + (startDIM[1] - h)
        } else if (corner === 'bl') {
          w = h * aspect
          x = startTL[0] + (startDIM[0] - w)
        }
      }


      const patch = { tl: [x, y], dim: [w, h] }

      if (selectedAsset.cr) {
        const startCR = dragState.current.startCR
        patch.cr = [
          startCR[0] * (w / startDIM[0]),
          startCR[1] * (h / startDIM[1]),
        ]
      }

      if (dragState.current.startRadius !== null) {
        const avgScale = (w / startDIM[0] + h / startDIM[1]) / 2
        patch.radius = dragState.current.startRadius * avgScale
      }

      updateAsset(selectedId, patch)
    } else if (mode === 'sliderStart') {
      const { startStart } = dragState.current
      updateAsset(selectedId, { start: [startStart[0] + dx, startStart[1] + dy] })
    } else if (mode === 'sliderEnd') {
      const { startEnd } = dragState.current
      updateAsset(selectedId, { end: [startEnd[0] + dx, startEnd[1] + dy] })
    }
  }, [selectedId, updateAsset])

  const onCanvasMouseUp = useCallback(() => {
    dragState.current = null
  }, [])

  const onSpriteUrlChange = useCallback((id, url) => {
    updateAsset(id, { spriteUrl: url })
    if (!url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const h = 200
      const w = (img.naturalWidth / img.naturalHeight) * h
      updateAsset(id, { dim: [w, h], tl: [-w, -h], baseDim: [w, h], aspectLocked: true })
    }
    img.src = resolveImageUrl(url)
  }, [updateAsset])

  const toggleAspectLock = useCallback((id) => {
    setCar(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, aspectLocked: !a.aspectLocked } : a),
    }))
  }, [])

  return {
    car,
    selectedId,
    selectedAsset,
    setCar,
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
  }
}