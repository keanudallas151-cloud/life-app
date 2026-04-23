import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { CaretUp } from '@phosphor-icons/react'
import { TaskItem } from './TaskItem'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Task, Category, AppSettings } from '../types'

interface TaskListProps {
  tasks: Task[]
  category: Category
  categories: Category[]
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (task: Task) => void
  onShowBlocker?: (task: Task) => void
  selectionMode?: boolean
  selectedTasks?: Set<string>
  onTaskSelect?: (taskId: string) => void
  settings?: AppSettings
  onReorderTasks?: (tasks: Task[]) => void
}

export function TaskList({
  tasks,
  category,
  categories,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onShowBlocker,
  selectionMode = false,
  selectedTasks = new Set(),
  onTaskSelect,
  settings,
  onReorderTasks,
}: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [localTasks, setLocalTasks] = useState(tasks)

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  if (localTasks.length === 0) {
    return null
  }

  const animationSpeed = settings?.animationSpeed || 0.3
  const swipeThreshold = settings?.swipeThreshold || 100
  const hapticEnabled = settings?.hapticFeedback ?? true
  const soundEnabled = settings?.buttonSounds ?? true

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleReorder = (reorderedTasks: Task[]) => {
    setLocalTasks(reorderedTasks)
    onReorderTasks?.(reorderedTasks)
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <button
        onClick={handleToggleExpand}
        className="flex w-full min-h-[52px] items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-muted/50 transition-colors"
      >
        <div
          className="h-4 w-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <h2 className="flex-1 text-left text-lg font-semibold">{category.name}</h2>
        <Badge variant="secondary" className="font-medium">{localTasks.length}</Badge>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : 180 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <CaretUp weight="bold" className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
        }}
        className="overflow-hidden"
      >
        <Reorder.Group
          axis="y"
          values={localTasks}
          onReorder={handleReorder}
          className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5"
        >
          {localTasks.map((task) => {
            const taskCategory = categories.find((c) => c.id === task.categoryId)

            return (
              <Reorder.Item
                key={task.id}
                value={task}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <TaskItem
                  task={task}
                  categoryColor={taskCategory?.color || category.color}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                  onShowBlocker={onShowBlocker}
                  selectionMode={selectionMode}
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={onTaskSelect}
                  swipeThreshold={swipeThreshold}
                  animationSpeed={animationSpeed}
                  hapticEnabled={hapticEnabled}
                  soundEnabled={soundEnabled}
                />
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </motion.div>
    </Card>
  )
}
