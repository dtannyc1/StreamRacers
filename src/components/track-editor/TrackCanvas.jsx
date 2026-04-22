import { useRef, useEffect, useCallback, useState } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import { drawRacer } from '../../lib/racerRenderer'
import { incrementCarAssetAngles } from '../../shared/racerLogic'
import "./TrackCanvas.css"
import { convertToStyleSheet } from '../../shared/assetRenderer'

const CANVAS_W = 1920
const CANVAS_H = 1080
const HANDLE_RADIUS = 10
const HANDLE_HIT = 16
const DRAG_THRESHOLD = 4

const getRoadBounds = (racingLine) => {
  const top = Math.min(racingLine.p1[1], racingLine.p2[1])
  const bottom = Math.max(racingLine.p1[1], racingLine.p2[1])
  return { top, bottom, height: bottom - top }
}

const drawRoad = (ctx, road, racingLine, imageCache) => {
  const { top, height } = getRoadBounds(racingLine)

  if (road.type === 'rainbow') {
    const numDiv = 10
    ctx.fillStyle = 'black'
    ctx.fillRect(0, top - height * 2 / numDiv, CANVAS_W, height + height * 4 / numDiv)
    for (let i = 0; i < numDiv; i++) {
      ctx.fillStyle = `hsl(${Math.floor(i * 360 / numDiv)},100%,50%)`
      ctx.fillRect(0, top + height * (numDiv - i - 1) / numDiv, CANVAS_W, height / numDiv)
    }
  } else if (road.type === 'solid') {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, top - height * 0.2, CANVAS_W, height * 1.4)
    ctx.fillStyle = road.color ?? '#888888'
    ctx.fillRect(0, top, CANVAS_W, height)
  } else if (road.type === 'image') {
    const img = road.url ? imageCache.current[resolveImageUrl(road.url)] : null
    if (img?.naturalWidth) {
      ctx.drawImage(img, road.x ?? 0, road.y ?? 0,
        road.dim[0] * (road.scale ?? 1),
        road.dim[1] * (road.scale ?? 1))
    }
  }
}

const drawScrollingImage = (ctx, img, slot) => {
  if (!img?.naturalWidth || !slot) return
  const w = slot.dim ? slot.dim[0] * (slot.scale ?? 1) : CANVAS_W
  const h = slot.dim ? slot.dim[1] * (slot.scale ?? 1) : CANVAS_H
  ctx.drawImage(img, slot.x ?? 0, slot.y ?? 0, w, h)
}

const drawRacingLineImage = (ctx, img, racingLine, isSelected) => {
  if (!img?.naturalWidth && !isSelected) return
  const w = racingLine.dim[0] * racingLine.scale
  const h = racingLine.dim[1] * racingLine.scale
  const x = racingLine.x - w / 2
  const y = racingLine.y - h / 2
  if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)
  if (isSelected) {
    ctx.save()
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
    ctx.restore()
  }
}

const drawModifier = (ctx, img, mod, isSelected) => {
  if (!img?.naturalWidth && !isSelected) return
  const w = mod.dim[0] * mod.scale
  const h = mod.dim[1] * mod.scale
  const x = mod.x - w / 2
  const y = mod.y - h / 2
  if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)
  if (isSelected) {
    ctx.save()
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
    ctx.restore()
  }
}

const drawLineEditor = (ctx, racingLine) => {
  const { p1, p2 } = racingLine
  const crossX = (p1[0] + p2[0]) / 2
  const { top, height } = getRoadBounds(racingLine)

  ctx.save()

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(crossX, 0)
  ctx.lineTo(crossX, CANVAS_H)
  ctx.stroke()

  ctx.strokeStyle = '#facc15'
  ctx.lineWidth = 3
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(...p1)
  ctx.lineTo(...p2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.2)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 8])
  ctx.strokeRect(0, top, CANVAS_W, height)

  ;[p1, p2].forEach(p => {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.2)'
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(p[0], p[1], HANDLE_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })

  ctx.fillStyle = '#facc15'
  ctx.font = 'bold 24px monospace'
  ctx.fillText(`crossing X: ${Math.round(crossX)}`, crossX + 12, 40)
  ctx.fillText(`road height: ${Math.round(height)}px`, crossX + 12, 72)

  ctx.restore()
}

const drawAlignmentImage = (ctx, url, imageCache) => {
  if (!imageCache.current[resolveImageUrl(url)]) return
  const img = imageCache.current[resolveImageUrl(url)]

  ctx.save()
  ctx.globalAlpha = 0.25;
  if (img?.naturalWidth) ctx.drawImage(img, 0, 0, 1920, 1080)
  ctx.globalAlpha = 1;
  ctx.restore()
}

const hitTestHandle = (mx, my, racingLine) => {
  for (const key of ['p1', 'p2']) {
    const p = racingLine[key]
    const dx = mx - p[0]
    const dy = my - p[1]
    if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_HIT) return key
  }
  return null
}

const hitTestImage = (mx, my, item) => {
  if (!item) return false
  const w = item.dim[0] * item.scale
  const h = item.dim[1] * item.scale
  const x = item.x - w / 2
  const y = item.y - h / 2
  return mx >= x && mx <= x + w && my >= y && my <= y + h
}

const TrackCanvas = ({
  track,
  selection,
  onUpdateRacingLine,
  onUpdateModifier,
  onSelectAsset,
  activeRacers,
  racerAvatars,
  visibleModifierKey,
  alignmentImageURL,
}) => {
  const [scale, setScale] = useState([1, 1])

  const canvasRef = useRef(null)
  const imageCache = useRef({})
  const animRef = useRef(null)
  const trackRef = useRef(track)
  const selectionRef = useRef(selection)
  const activeRacersRef = useRef(activeRacers)
  const racerAvatarsRef = useRef(racerAvatars)
  const dragState = useRef(null)
  const dragStartPos = useRef(null)
  const didDrag = useRef(false)
  const tRef = useRef(0)
  const scatterPositions = useRef({})
  const visibleModifierKeyRef = useRef(visibleModifierKey)

  useEffect(() => { trackRef.current = track }, [track])
  useEffect(() => { selectionRef.current = selection }, [selection])
  useEffect(() => { activeRacersRef.current = activeRacers }, [activeRacers])
  useEffect(() => { racerAvatarsRef.current = racerAvatars }, [racerAvatars])
  useEffect(() => { visibleModifierKeyRef.current = visibleModifierKey }, [visibleModifierKey])

  // preload track images
  useEffect(() => {
    const urls = [
      track.scrollingImage?.url,
      track.racingLine?.url,
      track.road?.url,
      ...track.racingLine.startModifiers.map(m => m.url),
      ...track.racingLine.finishModifiers.map(m => m.url),
      ...track.backgroundAssets.map(a => a.url),
      ...track.foregroundAssets.map(a => a.url),
      alignmentImageURL,
    ].filter(Boolean).map(resolveImageUrl)

    urls.forEach(url => {
      if (!imageCache.current[url]) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = url
        imageCache.current[url] = img
      }
    })
  }, [
    track.scrollingImage?.url,
    track.racingLine?.url,
    track.road?.url,
    track.racingLine.startModifiers.map(m => m.url).join(','),
    track.racingLine.finishModifiers.map(m => m.url).join(','),
    track.backgroundAssets.map(a => a.url).join(','),
    track.foregroundAssets.map(a => a.url).join(','),
  ])

  useEffect(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(convertToStyleSheet(track.styleSheet))

    document.adoptedStyleSheets = [sheet]
  }, [track.styleSheet])

  // draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.contentRect
        
        let scaleX = rect.width / 1920.0
        let scaleY = rect.height / 1080.0

        setScale([scaleX, scaleY])
      }
    })

    const draw = (timestamp) => {
      const dt = (timestamp / 1000) - tRef.current
      const t = trackRef.current
      const sel = selectionRef.current

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      drawAlignmentImage(ctx, alignmentImageURL, imageCache)

      drawRoad(ctx, t.road, t.racingLine, imageCache)

      drawScattered(ctx, t.backgroundAssets, imageCache, 42,
        sel?.type === 'asset' && sel.listKey === 'backgroundAssets' ? sel.id : null,
        'background', t.racingLine)

      if (t.scrollingImage?.url) {
        const img = imageCache.current[resolveImageUrl(t.scrollingImage.url)]
        drawScrollingImage(ctx, img, t.scrollingImage)
      }

      // draw racing line image
      const rlImg = t.racingLine?.url
        ? imageCache.current[resolveImageUrl(t.racingLine.url)]
        : null
      const isRacingLineSelected = (visibleModifierKeyRef.current === 'Image' || visibleModifierKeyRef.current === 'Line Segment')
      const rlW = t.racingLine.dim[0] * t.racingLine.scale
      const rlH = t.racingLine.dim[1] * t.racingLine.scale
      if (rlImg?.naturalWidth) {
        ctx.drawImage(rlImg, t.racingLine.x - rlW / 2, t.racingLine.y - rlH / 2, rlW, rlH)
      }

      // start modifiers — only draw if startModifiers is the visible key or neither is expanded
      if (visibleModifierKeyRef.current === 'startModifiers' || visibleModifierKeyRef.current === null) {
        t.racingLine.startModifiers.forEach(mod => {
          const img = mod.url ? imageCache.current[resolveImageUrl(mod.url)] : null
          drawModifier(ctx, img, mod, sel?.type === 'modifier' && sel.id === mod.id && sel.modifierKey === 'startModifiers')
        })
      }

      // finish modifiers — only draw if finishModifiers is the visible key or neither is expanded
      if (visibleModifierKeyRef.current === 'finishModifiers') {
        t.racingLine.finishModifiers.forEach(mod => {
          const img = mod.url ? imageCache.current[resolveImageUrl(mod.url)] : null
          drawModifier(ctx, img, mod, sel?.type === 'modifier' && sel.id === mod.id && sel.modifierKey === 'finishModifiers')
        })
      }

      // update + draw active racers
      activeRacersRef.current.forEach(racer => {
        drawRacer(ctx, racer, timestamp)
      })

      drawScattered(ctx, t.foregroundAssets, imageCache, 99,
        sel?.type === 'asset' && sel.listKey === 'foregroundAssets' ? sel.id : null,
        'foreground', t.racingLine)

      if (sel?.type === 'asset') {
        const listKey = sel.listKey
        const asset = t[listKey]?.find(a => a.id === sel.id)
        if (asset) {
          const img = imageCache.current[resolveImageUrl(asset.url)]
          if (img?.naturalWidth) {
            const key = `${listKey === 'backgroundAssets' ? 42 : 99}-${asset.id}`
            const pos = scatterPositions.current[key]
            if (pos) {
              const { top, bottom } = getRoadBounds(t.racingLine)
              const w = asset.dim[0] * asset.scale
              const h = asset.dim[1] * asset.scale
              const anchorY = listKey === 'foregroundAssets' ? bottom : top
              const y = anchorY - h
              ctx.drawImage(img, pos.x, y, w, h)

              // selection outline
              ctx.save()
              ctx.strokeStyle = '#a855f7'
              ctx.lineWidth = 2
              ctx.setLineDash([4, 4])
              ctx.strokeRect(pos.x - 2, y - 2, w + 4, h + 4)
              ctx.restore()
            }
          }
        }
      }

      if (isRacingLineSelected) {
        drawRacingLineImage(ctx, rlImg, t.racingLine, true)
        drawLineEditor(ctx, t.racingLine)
      }
      tRef.current = timestamp / 1000

      animRef.current = requestAnimationFrame(draw)
    }

    resizeObserver.observe(canvas)

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      resizeObserver.disconnect()
    }
  }, [])

  const drawScattered = (ctx, assets, imageCache, seed, selectedAssetId, layer, racingLine) => {
    const { top, bottom } = getRoadBounds(racingLine)

    assets.forEach((asset, i) => {
        const img = imageCache.current[resolveImageUrl(asset.url)]
        const isSelected = asset.id === selectedAssetId
        if (!img?.naturalWidth && !isSelected) return

        const key = `${seed}-${asset.id}`
        if (!scatterPositions.current[key]) {
        scatterPositions.current[key] = { x: Math.random() * CANVAS_W }
        }

        const { x } = scatterPositions.current[key]
        const w = asset.dim[0] * asset.scale
        const h = asset.dim[1] * asset.scale

        // anchor bottom edge to road top for background, road bottom for foreground
        const anchorY = layer === 'foreground' ? bottom : top
        const y = anchorY - h

        if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)
        if (isSelected) {
        if (!img?.naturalWidth) {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'
            ctx.fillRect(x, y, w, h)
        }
        ctx.save()
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
        ctx.restore()
        }
    })
    }

  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const handleMouseDown = useCallback((e) => {
    const { x, y } = getCanvasPos(e)
    dragStartPos.current = { x, y }
    didDrag.current = false
    const sel = selectionRef.current
    const t = trackRef.current
      
    if (visibleModifierKeyRef.current === 'Image' || visibleModifierKeyRef.current === 'Line Segment') {
      const handle = hitTestHandle(x, y, t.racingLine)
      if (handle) {
        dragState.current = { mode: 'lineHandle', handle }
        return
      }
      if (hitTestImage(x, y, t.racingLine)) {
        dragState.current = {
          mode: 'racingLineImage',
          startX: t.racingLine.x,
          startY: t.racingLine.y,
          mouseX: x,
          mouseY: y,
        }
        return
      }
    }

    if (sel?.type === 'modifier') {
      const mod = t.racingLine[sel.modifierKey]?.find(m => m.id === sel.id)
      if (mod && hitTestImage(x, y, mod)) {
        dragState.current = {
          mode: 'modifier',
          modifierKey: sel.modifierKey,
          id: sel.id,
          startX: mod.x,
          startY: mod.y,
          mouseX: x,
          mouseY: y,
        }
      }
    }
  }, [getCanvasPos])

  const handleMouseMove = useCallback((e) => {
    if (!dragState.current) return
    const { x, y } = getCanvasPos(e)

    if (dragStartPos.current) {
      const dx = x - dragStartPos.current.x
      const dy = y - dragStartPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) didDrag.current = true
    }

    const ds = dragState.current
    if (ds.mode === 'lineHandle') {
      onUpdateRacingLine({ [ds.handle]: [Math.round(x), Math.round(y)] })
    } else if (ds.mode === 'racingLineImage') {
      onUpdateRacingLine({
        x: Math.round(ds.startX + x - ds.mouseX),
        y: Math.round(ds.startY + y - ds.mouseY),
      })
    } else if (ds.mode === 'modifier') {
      onUpdateModifier(ds.modifierKey, ds.id, {
        x: Math.round(ds.startX + x - ds.mouseX),
        y: Math.round(ds.startY + y - ds.mouseY),
      })
    }
  }, [getCanvasPos, onUpdateRacingLine, onUpdateModifier])

  const handleMouseUp = useCallback(() => {
    dragState.current = null
    dragStartPos.current = null
    didDrag.current = false
  }, [])

  const isLineEditing = (visibleModifierKeyRef.current === 'Image' || visibleModifierKeyRef.current === 'Line Segment')

  const leaderboardList = [
    'pencils45',
    'heyIcameInFirstplace',
    'waitbutIcameInFirstplace',
    'ThisGameIsRiggedForSure',
    'StreamElements',
    'Nightbot',
    'SonglistBot',
    'StreamLabs',
    'Twitch',
    'WWWWWWWWWWWWWWWWWWWWWWWWW',
  ]

  return (
    <div className="overflow-auto rounded-lg border border-gray-700 bg-gray-950 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`block ${isLineEditing ? 'cursor-crosshair' : ''}`}
      />

      {
        selection?.type === "leaderboard" &&
        <div className='absolute origin-top-left top-0 left-0 w-[1920px] h-[1080px]'
          style={{
              'transform': `scale(${scale[0]}, ${scale[1]})`,
          }}
        >
          <div 
            className={`leaderboard !opacity-100 `}
            style={{
              marginTop: 0,
            }}
          >
            <div className="leaderboard-item">
              Leaderboard
            </div>
            {
              leaderboardList.map((name, ind) => (
                <div 
                  key={`${name}-${ind}`} 
                  className={`leaderboard-item ${(ind < 4) ? 'finished' : ''}`}>
                  {ind + 1}. {name}
                </div>
              ))
            }
          </div>
        </div>
      }
    </div>
  )
}

export default TrackCanvas