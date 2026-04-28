import { useRef, useEffect, useCallback } from 'react'
import { resolveImageUrl } from '../../lib/utils'
import { drawAsset, resolveDrawable } from '../../shared/assetRenderer'
import { preloadCarImages, resetAssetAngles } from '../../lib/racerRenderer'

export const CANVAS_W = 600
export const CANVAS_H = 400
export const ORIGIN = [CANVAS_W - 50, CANVAS_H - 50]

const BOTTOM_EDGE_Y = 0
const FRONT_EDGE_X = 0
const DRAG_THRESHOLD = 4
const CR_HANDLE_RADIUS = 7
const RADIUS_HANDLE_RADIUS = 6
const HANDLE_SIZE = 8
const HANDLE_HIT = 12

const drawCRHandle = (ctx, cx, cy) => {
  ctx.save()
  ctx.strokeStyle = '#f97316'
  ctx.fillStyle = 'rgba(249, 115, 22, 0.2)'
  ctx.lineWidth = 2
  ctx.setLineDash([])

  // circle
  ctx.beginPath()
  ctx.arc(cx, cy, CR_HANDLE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // crosshair
  ctx.beginPath()
  ctx.moveTo(cx - CR_HANDLE_RADIUS - 4, cy)
  ctx.lineTo(cx + CR_HANDLE_RADIUS + 4, cy)
  ctx.moveTo(cx, cy - CR_HANDLE_RADIUS - 4)
  ctx.lineTo(cx, cy + CR_HANDLE_RADIUS + 4)
  ctx.stroke()

  ctx.restore()
}

const drawRadiusHandle = (ctx, cr, handleAngle, radius) => {
  const [cx, cy] = cr
  const hx = cx + Math.cos(handleAngle) * radius
  const hy = cy + Math.sin(handleAngle) * radius

  ctx.save()
  ctx.setLineDash([])

  // line from CR to handle
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(hx, hy)
  ctx.stroke()

  // handle circle
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(hx, hy, RADIUS_HANDLE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

const drawCornerHandles = (ctx, x, y, w, h) => {
  const corners = [
    { x: x - 2, y: y - 2 },           // tl
    { x: x + w - HANDLE_SIZE + 2, y: y - 2 },       // tr
    { x: x - 2, y: y + h - HANDLE_SIZE + 2 },       // bl
    { x: x + w - HANDLE_SIZE + 2, y: y + h - HANDLE_SIZE + 2 }, // br
  ]
  ctx.save()
  ctx.fillStyle = '#a855f7'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.setLineDash([])
  corners.forEach(({ x, y }) => {
    ctx.beginPath()
    ctx.rect(x, y, HANDLE_SIZE, HANDLE_SIZE)
    ctx.fill()
    ctx.stroke()
  })
  ctx.restore()
}

const drawAlignmentLines = (ctx) => {
  ctx.save()
  ctx.strokeStyle = '#facc15'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(-CANVAS_W, BOTTOM_EDGE_Y)
  ctx.lineTo(CANVAS_W, BOTTOM_EDGE_Y)
  ctx.stroke()
  ctx.fillStyle = '#facc15'
  ctx.font = '10px monospace'
  ctx.fillText('bottom edge', -ORIGIN[0] + 4, BOTTOM_EDGE_Y - 4)

  ctx.strokeStyle = '#34d399'
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(FRONT_EDGE_X, -CANVAS_H)
  ctx.lineTo(FRONT_EDGE_X, CANVAS_H)
  ctx.stroke()
  ctx.fillStyle = '#34d399'
  ctx.fillText('front edge', FRONT_EDGE_X - 60, -ORIGIN[1] + 14)
  ctx.restore()
}

const hitTestCR = (mx, my, asset) => {
  if (!asset?.cr || (asset.type !== 'rotating' && asset.type !== 'oscillating')) return false
  const [cx, cy] = asset.cr
  const dx = mx - cx
  const dy = my - cy
  return Math.sqrt(dx * dx + dy * dy) <= CR_HANDLE_RADIUS + 4
}

const hitTestRadius = (mx, my, asset) => {
  if (!asset?.cr || (asset.type !== 'rotating' && asset.type !== 'oscillating')) return false
  const [cx, cy] = asset.cr
  const handleAngle = asset.handleAngle ?? 0
  const radius = asset.radius ?? 20
  const hx = cx + Math.cos(handleAngle) * radius
  const hy = cy + Math.sin(handleAngle) * radius
  const dx = mx - hx
  const dy = my - hy
  return Math.sqrt(dx * dx + dy * dy) <= RADIUS_HANDLE_RADIUS + 4
}

const hitTestCorner = (mx, my, asset) => {
  if (!asset) return null
  const [x, y] = asset.tl
  const [w, h] = asset.dim
  const corners = {
    tl: { x: x - 2, y: y - 2 },
    tr: { x: x + w - HANDLE_SIZE + 2, y: y - 2 },
    bl: { x: x - 2, y: y + h - HANDLE_SIZE + 2 },
    br: { x: x + w - HANDLE_SIZE + 2, y: y + h - HANDLE_SIZE + 2 },
  }
  for (const [corner, pos] of Object.entries(corners)) {
    if (
      mx >= pos.x - HANDLE_HIT / 2 &&
      mx <= pos.x + HANDLE_SIZE + HANDLE_HIT / 2 &&
      my >= pos.y - HANDLE_HIT / 2 &&
      my <= pos.y + HANDLE_SIZE + HANDLE_HIT / 2
    ) {
      return corner
    }
  }
  return null
}

const CarCanvas = ({
  assets,
  selectedId,
  selectedAsset,
  avatarUrl,
  onSelectAsset,
  onDeselectAsset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  isDefaultCar,
  eyedropperAssetId,
  onEyedropperPick,
}) => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const assetsRef = useRef({})
  const dragStartPos = useRef(null)
  const didDrag = useRef(false)
  const draggingCR = useRef(false)
  const draggingRadius = useRef(false)
  const prevSelectedAsset = useRef(null)

  useEffect(() => {
    async function loadCarImages() {
      await preloadCarImages({ assets }, avatarUrl, assetsRef)
    }
    loadCarImages()
  }, [assets.map(a => resolveImageUrl(a.type === 'avatar' ? avatarUrl : a.spriteUrl)).join(','), avatarUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      ctx.strokeStyle = '#1f2937'
      ctx.lineWidth = 1
      for (let x = 0; x < CANVAS_W; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke()
      }
      for (let y = 0; y < CANVAS_H; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke()
      }

      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(ORIGIN[0], 0); ctx.lineTo(ORIGIN[0], CANVAS_H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, ORIGIN[1]); ctx.lineTo(CANVAS_W, ORIGIN[1]); ctx.stroke()
      ctx.setLineDash([])

      ctx.save()
      ctx.translate(...ORIGIN)

      drawAlignmentLines(ctx)

      assets.forEach(asset => {
        if (!assetsRef.current[asset.id]) return // image not loaded yet
        const isSelected = asset.id === selectedId
        resetAssetAngles(asset, assetsRef.current[asset.id].initialLoadTime, timestamp)
        const curAsset = assetsRef.current[asset.id]
        const drawable = resolveDrawable(
          {...curAsset, 
            remappedImg: (asset.remapEnabled && !eyedropperAssetId) ? asset.remappedImg : null
          }, timestamp)
        drawAsset(ctx, {...asset, cur_theta: (isSelected && !asset.animationEnabled) ? 0 : (asset.cur_theta ?? 0)}, drawable)

        if (isSelected) {
          // draw selection outline
          ctx.save()
          ctx.strokeStyle = '#a855f7'
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          const [x, y] = asset.tl
          const [w, h] = asset.dim
          ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
          ctx.restore()
        }
      })

      if (selectedAsset) {
        const [x, y] = selectedAsset.tl
        const [w, h] = selectedAsset.dim
        drawCornerHandles(ctx, x, y, w, h)
      }

      // draw CR handle on top of everything
      if (selectedAsset?.cr && (selectedAsset.type === 'rotating' || selectedAsset.type === 'oscillating')) {
        drawRadiusHandle(ctx, selectedAsset.cr, selectedAsset.handleAngle ?? 0, selectedAsset.radius ?? 20)
        drawCRHandle(ctx, selectedAsset.cr[0], selectedAsset.cr[1])
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    prevSelectedAsset.current = selectedAsset

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [assets, selectedId, selectedAsset, eyedropperAssetId])

  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = CANVAS_W / rect.width
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
      scale,
    }
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (!eyedropperAssetId) {
      const { x, y, scale } = getCanvasPos(e)
      const mx = x - ORIGIN[0]
      const my = y - ORIGIN[1]

      dragStartPos.current = { x, y }
      didDrag.current = false

      const corner = hitTestCorner(mx, my, selectedAsset)
      const isCR = !corner && hitTestCR(mx, my, selectedAsset)
      const isRadius = !corner && !isCR && hitTestRadius(mx, my, selectedAsset)

      draggingCR.current = isCR
      draggingRadius.current = isRadius

      onMouseDown(e, canvasRef.current.getBoundingClientRect(), scale, isCR, corner, isRadius)
    }
  }, [onMouseDown, getCanvasPos, selectedAsset, eyedropperAssetId])

  const handleMouseMove = useCallback((e) => {
    if (!eyedropperAssetId) {
      const { x, y } = getCanvasPos(e)
      if (dragStartPos.current) {
        const dx = x - dragStartPos.current.x
        const dy = y - dragStartPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          didDrag.current = true
        }
      }
    // pass canvas-space position relative to origin
      onMouseMove(e, x - ORIGIN[0], y - ORIGIN[1])
    }
  }, [onMouseMove, getCanvasPos, eyedropperAssetId])

  const handleMouseUp = useCallback((e) => {
    if (eyedropperAssetId) {
      const { x, y } = getCanvasPos(e)
      const ctx = canvasRef.current.getContext('2d')
      const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data
      const hex = '#' + [pixel[0], pixel[1], pixel[2]]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
      onEyedropperPick(eyedropperAssetId, hex)
      dragStartPos.current = null
      didDrag.current = false
      draggingCR.current = false
      draggingRadius.current = false
      return
    }
    if (!didDrag.current) {
      const { x, y } = getCanvasPos(e)
      const mx = x - ORIGIN[0]
      const my = y - ORIGIN[1]

      const onCorner = hitTestCorner(mx, my, selectedAsset)
      const onCR = hitTestCR(mx, my, selectedAsset)
      const onRadius = hitTestRadius(mx, my, selectedAsset)

      if (!onCorner && !onCR && !onRadius) {
        const hit = [...assets].reverse().find(asset => {
          const [ax, ay] = asset.tl
          const [aw, ah] = asset.dim
          return mx >= ax && mx <= ax + aw && my >= ay && my <= ay + ah
        })
        
        if (!selectedId) {
          onSelectAsset(hit?.id ?? null)
        } else if (!hit) {
          onDeselectAsset()
        }
      }
    }

    dragStartPos.current = null
    didDrag.current = false
    draggingCR.current = false
    draggingRadius.current = false
    onMouseUp(e)
  }, [eyedropperAssetId, onEyedropperPick, assets, selectedAsset, onSelectAsset, onMouseUp, getCanvasPos])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`w-full h-auto rounded-lg border border-gray-700
                  max-w-full object-contain
                  max-h-[calc(100dvh-1rem-42px-1.5rem)]
                  sm:max-h-[calc(100dvh-2rem-42px-1.5rem)] 
                  xl:max-h-[calc(100dvh-4rem-42px-1.5rem)]
                  ${eyedropperAssetId ? 'cursor-crosshair' : ''}`}
    />
  )
}

export default CarCanvas