import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Palette, Check } from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { playColorPickSound } from '../lib/sounds'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  label?: string
  soundEnabled?: boolean
}

const PRESET_COLORS = [
  { name: 'Purple', value: 'oklch(0.55 0.18 250)' },
  { name: 'Blue', value: 'oklch(0.55 0.18 230)' },
  { name: 'Cyan', value: 'oklch(0.60 0.18 200)' },
  { name: 'Teal', value: 'oklch(0.62 0.20 180)' },
  { name: 'Green', value: 'oklch(0.62 0.20 150)' },
  { name: 'Lime', value: 'oklch(0.70 0.18 120)' },
  { name: 'Yellow', value: 'oklch(0.70 0.18 90)' },
  { name: 'Orange', value: 'oklch(0.65 0.20 30)' },
  { name: 'Red', value: 'oklch(0.60 0.22 15)' },
  { name: 'Pink', value: 'oklch(0.65 0.20 350)' },
  { name: 'Magenta', value: 'oklch(0.60 0.22 320)' },
  { name: 'Indigo', value: 'oklch(0.50 0.20 270)' },
]

export function ColorPicker({ selectedColor, onColorChange, label = 'Color', soundEnabled = true }: ColorPickerProps) {
  const [showWheel, setShowWheel] = useState(false)
  const [wheelHue, setWheelHue] = useState(250)
  const [wheelLightness, setWheelLightness] = useState(0.60)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!showWheel || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 200
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    ctx.clearRect(0, 0, size, size)

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 0.5) * (Math.PI / 180)
      const endAngle = (angle + 0.5) * (Math.PI / 180)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      const hue = angle
      ctx.fillStyle = `oklch(${wheelLightness} 0.20 ${hue})`
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [showWheel, wheelLightness])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const innerRadius = (canvas.width / 2 - 10) * 0.3
    const outerRadius = canvas.width / 2 - 10

    if (distance < innerRadius || distance > outerRadius) return

    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    const hue = (angle + 360) % 360

    const color = `oklch(${wheelLightness} 0.20 ${Math.round(hue)})`
    onColorChange(color)
    playColorPickSound(soundEnabled)
    setWheelHue(Math.round(hue))
  }

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    playColorPickSound(soundEnabled)
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color, index) => (
          <motion.button
            key={color.value}
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: index * 0.02,
              type: 'spring',
              stiffness: 500,
              damping: 25
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleColorSelect(color.value)}
            className={cn(
              'relative h-9 w-9 rounded-full border-2 transition-all flex-shrink-0 shadow-sm',
              selectedColor === color.value
                ? 'border-foreground ring-2 ring-ring ring-offset-2'
                : 'border-border hover:border-muted-foreground'
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          >
            {selectedColor === color.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check 
                  weight="bold" 
                  className="h-5 w-5 drop-shadow-md"
                  style={{ 
                    color: 'white',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }} 
                />
              </motion.div>
            )}
          </motion.button>
        ))}
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowWheel(!showWheel)}
          className={cn(
            'h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center',
            showWheel 
              ? 'border-foreground bg-muted' 
              : 'border-dashed border-muted-foreground hover:border-foreground hover:bg-muted/50'
          )}
          title="Color wheel"
          aria-label="Open color wheel"
        >
          <Palette weight="bold" className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showWheel && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden rounded-lg border border-border bg-card p-4"
          >
            <div className="text-center">
              <Label className="text-xs font-medium text-muted-foreground">
                Click on the color wheel to pick a color
              </Label>
            </div>

            <div className="flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                onClick={handleCanvasClick}
                className="cursor-crosshair rounded-full shadow-lg"
                style={{ width: '200px', height: '200px' }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Brightness</Label>
              <input
                type="range"
                min="0.35"
                max="0.80"
                step="0.05"
                value={wheelLightness}
                onChange={(e) => setWheelLightness(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    oklch(0.35 0.20 ${wheelHue}), 
                    oklch(0.50 0.20 ${wheelHue}), 
                    oklch(0.65 0.20 ${wheelHue}), 
                    oklch(0.80 0.20 ${wheelHue}))`
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="text-xs">
                  <div className="font-medium text-foreground">Current Color</div>
                  <div className="font-mono text-muted-foreground">{selectedColor}</div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowWheel(false)}
              className="w-full"
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
