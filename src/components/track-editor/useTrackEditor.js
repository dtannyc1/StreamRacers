import { useState, useCallback } from 'react'

export const createDefaultTrack = (name = 'New Track') => ({
  name,
  road: {
    type: 'solid',
    color: '#888888',
    url: '',
    dim: [1920, 1080],
    scale: 1,
    x: 0,
    y: 0,
  },
  racingLine: {
    url: 'https://www.dropbox.com/scl/fi/sp4n0j6iqbnpnme05zhak/racing_line.png?rlkey=rf7wga3zfnrz52z57i258vi1y&st=ihj77zey&dl=0',
    dim: [200, 200],
    scale: 1,
    x: 1550,
    y: 974,
    p1: [1591, 1060],
    p2: [1497, 948],
    startModifiers: [
      {
        id: crypto.randomUUID(),
        name: 'Start Flag',
        url: 'https://www.dropbox.com/scl/fi/6sy2a7pvvuwkozk3tvbvq/start_flag.png?rlkey=ik03ay7yv17yv5bxk1lvhl39q&st=7juc9iog&dl=0',
        dim: [200, 200],
        scale: 1,
        x: 1550,
        y: 974,
      },
    ],
    finishModifiers: [
      {
        id: crypto.randomUUID(),
        name: 'Finish Flag',
        url: 'https://www.dropbox.com/scl/fi/elrpti7l28qro4soudskz/finish_flag.png?rlkey=q8jsg8bt2dqzhqpj2litbmcsf&st=3iu1dexx&dl=0',
        dim: [200, 200],
        scale: 1,
        x: 1550,
        y: 974,
      },
    ],
  },
  scrollingImage: {
    url: 'https://www.dropbox.com/scl/fi/hn1n4o8t737jxiqs5wse4/yellow_lines.png?rlkey=gxe6nyrkb66sblqoj1t8fnndr&st=83eyetrq&dl=0',
    dim: [1920, 1080],
    scale: 1,
    x: 0,
    y: -15,
  },
  backgroundAssets: [],
  foregroundAssets: [],
})

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