import { useRef, useEffect, useCallback } from 'react'

export const CANVAS_W = 600
export const CANVAS_H = 400
export const ORIGIN = [CANVAS_W - 50, CANVAS_H - 50]

const BOTTOM_EDGE_Y = 0
const FRONT_EDGE_X = 0
const DRAG_THRESHOLD = 4
const CR_HANDLE_RADIUS = 7
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

const drawAsset = (ctx, asset, img, t, isSelected) => {
  if (!img) return
  const [x, y] = asset.tl
  const [w, h] = asset.dim

  ctx.save()

  if (asset.isAvatar) {
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
    ctx.clip()
    if (img.naturalWidth) ctx.drawImage(img, x, y, w, h)
  } else if (asset.type === 'static') {
    if (img.naturalWidth) ctx.drawImage(img, x, y, w, h)
  } else if (asset.type === 'rotating') {
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    const angle = 2 * Math.PI * t * 2
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.translate(-cx, -cy)
    if (img.naturalWidth) ctx.drawImage(img, x, y, w, h)
  } else if (asset.type === 'oscillating') {
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    const min = asset.minTheta ?? -Math.PI / 6
    const max = asset.maxTheta ?? Math.PI / 6
    const angle = ((max - min) / 2) * Math.sin(t * 3) + (max + min) / 2
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.translate(-cx, -cy)
    if (img.naturalWidth) ctx.drawImage(img, x, y, w, h)
  }

  if (isSelected) {
    ctx.restore()
    ctx.save()
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
  }

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
      console.log('hit corner', corner)
      return corner
    }
  }
  return null
}

const CarCanvas = ({
  assets,
  selectedId,
  selectedAsset,
  onSelectAsset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const tRef = useRef(0)
  const imagesRef = useRef({})
  const dragStartPos = useRef(null)
  const didDrag = useRef(false)
  const draggingCR = useRef(false)

  useEffect(() => {
    assets.forEach(asset => {
      if (asset.spriteUrl && !imagesRef.current[asset.spriteUrl]) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = asset.spriteUrl
        imagesRef.current[asset.spriteUrl] = img
      }
    })
  }, [assets])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const draw = (timestamp) => {
      tRef.current = timestamp / 1000
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
        const img = imagesRef.current[asset.spriteUrl]
        const t = (draggingCR.current && asset.id === selectedId) ? 0 : tRef.current
        drawAsset(ctx, asset, img, t, asset.id === selectedId)
      })

      if (selectedAsset) {
        const [x, y] = selectedAsset.tl
        const [w, h] = selectedAsset.dim
        drawCornerHandles(ctx, x, y, w, h)
      }

      // draw CR handle on top of everything
      if (selectedAsset?.cr && (selectedAsset.type === 'rotating' || selectedAsset.type === 'oscillating')) {
        drawCRHandle(ctx, selectedAsset.cr[0], selectedAsset.cr[1])
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [assets, selectedId, selectedAsset])

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
    const { x, y, scale } = getCanvasPos(e)
    const mx = x - ORIGIN[0]
    const my = y - ORIGIN[1]

    dragStartPos.current = { x, y }
    didDrag.current = false

    const corner = hitTestCorner(mx, my, selectedAsset)
    const isCR = !corner && hitTestCR(mx, my, selectedAsset)

    draggingCR.current = isCR
    onMouseDown(e, canvasRef.current.getBoundingClientRect(), scale, isCR, corner)
  }, [onMouseDown, getCanvasPos, selectedAsset])

  const handleMouseMove = useCallback((e) => {
    if (dragStartPos.current) {
      const { x, y } = getCanvasPos(e)
      const dx = x - dragStartPos.current.x
      const dy = y - dragStartPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        didDrag.current = true
      }
    }
    onMouseMove(e)
  }, [onMouseMove, getCanvasPos])

  const handleMouseUp = useCallback((e) => {
    if (!didDrag.current) {
      const { x, y } = getCanvasPos(e)
      const mx = x - ORIGIN[0]
      const my = y - ORIGIN[1]

      const onCorner = hitTestCorner(mx, my, selectedAsset)
      const onCR = hitTestCR(mx, my, selectedAsset)

      if (!onCorner && !onCR) {
        const hit = [...assets].reverse().find(asset => {
          const [ax, ay] = asset.tl
          const [aw, ah] = asset.dim
          return mx >= ax && mx <= ax + aw && my >= ay && my <= ay + ah
        })
        onSelectAsset(hit?.id ?? null)
      }
    }

    dragStartPos.current = null
    didDrag.current = false
    draggingCR.current = false
    onMouseUp(e)
  }, [assets, selectedAsset, onSelectAsset, onMouseUp, getCanvasPos])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full rounded-lg border border-gray-700 cursor-crosshair bg-sky-300"
    />
  )
}

export default CarCanvas