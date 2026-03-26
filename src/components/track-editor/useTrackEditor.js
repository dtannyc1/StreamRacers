import { useState, useCallback } from 'react'
import { createDefaultTrack } from '../../lib/trackDefaults'

export const useTrackEditor = (initialTrack = null) => {
  const [track, setTrack] = useState(() => initialTrack ?? createDefaultTrack())

  const setName = (name) => setTrack(prev => ({ ...prev, name }))

  const setRoad = (patch) =>
    setTrack(prev => ({ ...prev, road: { ...prev.road, ...patch } }))

  const setSlot = (key, value) =>
    setTrack(prev => ({ ...prev, [key]: value }))

  const clearSlot = (key) =>
    setTrack(prev => ({ ...prev, [key]: null }))

  // ── Racing line ───────────────────────────────────────────────────────────

  const updateRacingLine = useCallback((patch) =>
    setTrack(prev => ({
      ...prev,
      racingLine: { ...prev.racingLine, ...patch },
    })), [])

  const addModifier = (modifierKey) => {
    const newMod = {
      id: crypto.randomUUID(),
      name: 'New Modifier',
      url: '',
      dim: [200, 200],
      scale: 1,
      x: 960,
      y: 540,
    }
    setTrack(prev => ({
      ...prev,
      racingLine: {
        ...prev.racingLine,
        [modifierKey]: [...prev.racingLine[modifierKey], newMod],
      },
    }))
    return newMod.id
  }

  const updateModifier = useCallback((modifierKey, id, patch) =>
    setTrack(prev => ({
      ...prev,
      racingLine: {
        ...prev.racingLine,
        [modifierKey]: prev.racingLine[modifierKey].map(m =>
          m.id === id ? { ...m, ...patch } : m
        ),
      },
    })), [])

  const removeModifier = (modifierKey, id) =>
    setTrack(prev => ({
      ...prev,
      racingLine: {
        ...prev.racingLine,
        [modifierKey]: prev.racingLine[modifierKey].filter(m => m.id !== id),
      },
    }))

  // ── Background/foreground assets ──────────────────────────────────────────

  const addAsset = (listKey) => {
    const newAsset = {
      id: crypto.randomUUID(),
      name: '',
      url: '',
      dim: [500, 500],
      scale: 0.25,
    }
    setTrack(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], newAsset],
    }))
    return newAsset.id
  }

  const updateAsset = useCallback((listKey, id, patch) =>
    setTrack(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(a => a.id === id ? { ...a, ...patch } : a),
    })), [])

  const removeAsset = (listKey, id) =>
    setTrack(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter(a => a.id !== id),
    }))

  return {
    track,
    setName,
    setRoad,
    setSlot,
    clearSlot,
    updateRacingLine,
    addModifier,
    updateModifier,
    removeModifier,
    addAsset,
    updateAsset,
    removeAsset,
  }
}