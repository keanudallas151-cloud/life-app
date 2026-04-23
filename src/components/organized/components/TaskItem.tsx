import { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Check, Trash, PencilSimple, Clock, Repeat, CheckCircle, Warning, CaretDown } from '@phosphor-icons/react'
import { format, isPast, isToday } from 'date-fns'
import { cn } from '../lib/utils'
import { triggerHaptic } from '../lib/haptics'
import { playButtonSound, playSuccessSound, playDeleteSound } from '../lib/sounds'
import { Task } from '../types'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'

interface TaskItemProps {
  task: Task
  categoryColor: string
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  onShowBlocker?: (task: Task) => void
  selectionMode?: boolean
  isSelected?: boolean
  onSelect?: (taskId: string) => void
  focusMode?: boolean
  onFocusModeChange?: (focused: boolean) => void
  swipeThreshold?: number
  animationSpeed?: number
  hapticEnabled?: boolean
  soundEnabled?: boolean
}

export function TaskItem({
  task,
  categoryColor,
  onToggle,
  onDelete,
  onEdit,
  onShowBlocker,
  selectionMode = false,
  isSelected = false,
  onSelect,
  focusMode = false,
  onFocusModeChange,
  swipeThreshold = 100,
  animationSpeed = 0.3,
  hapticEnabled = true,
  soundEnabled = true,
}: TaskItemProps) {
  const [isLongPress, setIsLongPress] = useState(false)
  const [isFocused, setIsFocused] = useState(focusMode)
  const [isExpanded, setIsExpanded] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const x = useMotionValue(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const leftActionOpacity = useTransform(x, [0, swipeThreshold], [0, 1])
  const rightActionOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0])

  const scale = useTransform(
    x,
    [-swipeThreshold * 1.5, -swipeThreshold, 0, swipeThreshold, swipeThreshold * 1.5],
    [1, 1, 1, 1, 1]
  )

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handlePanStart = () => {
    if (hapticEnabled) triggerHaptic('light')
  }

  const handlePan = (_: any, info: PanInfo) => {
    if (info.offset.x > swipeThreshold / 2) {
      if (swipeDirection !== 'right') {
        setSwipeDirection('right')
        if (hapticEnabled) triggerHaptic('light')
      }
    } else if (info.offset.x < -swipeThreshold / 2) {
      if (swipeDirection !== 'left') {
        setSwipeDirection('left')
        if (hapticEnabled) triggerHaptic('light')
      }
    } else {
      setSwipeDirection(null)
    }
  }

  const handlePanEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > swipeThreshold) {
      if (hapticEnabled) triggerHaptic('success')
      if (soundEnabled) playSuccessSound()
      onToggle(task.id)
      x.set(0)
    } else if (info.offset.x < -swipeThreshold) {
      if (hapticEnabled) triggerHaptic('warning')
      if (soundEnabled) playDeleteSound()
      onDelete(task.id)
    } else {
      x.set(0)
    }
    setSwipeDirection(null)
  }

  const handleTouchStart = () => {
    if (selectionMode || !onSelect) return
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true)
      if (hapticEnabled) triggerHaptic('medium')
      if (soundEnabled) playButtonSound()
      onSelect?.(task.id)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setTimeout(() => setIsLongPress(false), 100)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPress) return
    
    const target = e.target as HTMLElement
    const isCheckboxClick = target.closest('[role="checkbox"]') || target.closest('button')
    
    if (isCheckboxClick) {
      return
    }
    
    if (selectionMode) {
      if (hapticEnabled) triggerHaptic('light')
      if (soundEnabled) playButtonSound()
      onSelect?.(task.id)
    } else {
      if (hapticEnabled) triggerHaptic('light')
      if (soundEnabled) playButtonSound()
      setIsExpanded(!isExpanded)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    if (hapticEnabled) triggerHaptic(checked ? 'success' : 'light')
    if (soundEnabled && checked) playSuccessSound()
    if (soundEnabled && !checked) playButtonSound()
    onToggle(task.id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hapticEnabled) triggerHaptic('light')
    if (soundEnabled) playButtonSound()
    onEdit(task)
  }

  const priorityColors = {
    low: 'oklch(0.55 0.18 230)',
    medium: 'oklch(0.70 0.18 90)',
    high: 'oklch(0.60 0.22 15)',
  }

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed && !isToday(new Date(task.dueDate))
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const hasSubtasks = totalSubtasks > 0
  const hasExpandableContent = !!(task.notes || hasSubtasks)

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <motion.div
          style={{ opacity: leftActionOpacity }}
          className="flex items-center gap-2 text-accent"
        >
          <CheckCircle weight="fill" className="h-6 w-6" />
          <span className="text-sm font-semibold">Complete</span>
        </motion.div>

        <motion.div
          style={{ opacity: rightActionOpacity }}
          className="flex items-center gap-2 text-destructive"
        >
          <span className="text-sm font-semibold">Delete</span>
          <Trash weight="fill" className="h-6 w-6" />
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ x, scale }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          duration: animationSpeed,
        }}
        layout
        className={cn(
          'relative flex items-start gap-3.5 rounded-xl border bg-card px-4 py-3.5 sm:px-5 sm:py-4 transition-all',
          'touch-pan-y active:cursor-grabbing',
          task.completed && 'opacity-60',
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isOverdue && !task.completed && 'border-destructive/50 bg-destructive/5'
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className="mt-0.5 h-5 w-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleCheckboxChange}
              className="mt-0.5 flex-shrink-0"
              id={`task-${task.id}`}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1 cursor-pointer min-w-0">
              <h3
                className={cn(
                  'text-base font-medium leading-tight break-words',
                  task.completed && 'line-through opacity-60'
                )}
              >
                {task.title}
              </h3>
            </div>

            {hasExpandableContent && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground"
                aria-label={isExpanded ? 'Collapse task' : 'Expand task'}
              >
                <CaretDown className="h-4 w-4" weight="bold" />
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEditClick}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full hover:bg-accent/20 transition-colors"
              aria-label="Edit task"
            >
              <PencilSimple className="h-4 w-4 text-muted-foreground" weight="bold" />
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{
              height: { duration: 0.3, ease: 'easeInOut' },
              opacity: { duration: 0.2, ease: 'easeInOut' },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2.5 pt-2">
              {task.notes && (
                <p className="pl-7 text-sm text-muted-foreground sm:pl-8">
                  {task.notes}
                </p>
              )}

              {hasSubtasks && (
                <div className="pl-7 space-y-2.5 sm:pl-8">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {task.subtasks?.map((subtask) => (
                      <div key={subtask.id} className="flex min-h-[32px] items-center gap-2.5">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => {
                            const updatedSubtasks = task.subtasks?.map(st =>
                              st.id === subtask.id ? { ...st, completed: !!checked } : st
                            )
                            onEdit({ ...task, subtasks: updatedSubtasks })
                          }}
                          className="h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={cn(
                          'text-sm',
                          subtask.completed && 'line-through opacity-60'
                        )}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center gap-2.5 pl-7 sm:pl-8">
            {task.blockerNote && (
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (hapticEnabled) triggerHaptic('medium')
                  if (soundEnabled) playButtonSound()
                  onShowBlocker?.(task)
                }}
                className="flex min-h-[28px] items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Warning weight="fill" className="h-3 w-3" />
                Blocked
              </motion.button>
            )}

            <Badge
              variant="secondary"
              className="px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: priorityColors[task.priority],
                color: 'white',
              }}
            >
              {task.priority}
            </Badge>

            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  'flex min-h-[28px] items-center gap-1 px-2.5 py-1 text-xs font-medium',
                  isOverdue && 'border-destructive text-destructive',
                  isDueToday && 'border-accent text-accent'
                )}
              >
                <Clock weight="bold" className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </Badge>
            )}

            {task.recurring && (
              <Badge variant="outline" className="flex min-h-[28px] items-center gap-1 px-2.5 py-1 text-xs font-medium">
                <Repeat weight="bold" className="h-3 w-3" />
                {task.recurring}
              </Badge>
            )}

            {task.tags && task.tags.length > 0 && (
              <AnimatePresence>
                {task.tags.slice(0, 3).map((tag, idx) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
