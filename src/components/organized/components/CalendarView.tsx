import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretLeft, CaretRight, CalendarBlank, Plus } from '@phosphor-icons/react'
import { Task, Category } from '../types'
import { Button } from './ui/button'
import { TaskItem } from './TaskItem'
import { AddTaskForm } from './AddTaskForm'
import { cn } from '../lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'

interface CalendarViewProps {
  tasks: Task[]
  categories: Category[]
  settings?: any
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (task: Task) => void
  onAddTask: (title: string, categoryId: string, priority: any, notes?: string, dueDate?: number, recurring?: any, tags?: string[], subtasks?: any[]) => void
}

export function CalendarView({
  tasks,
  categories,
  settings,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const tasksWithDueDates = useMemo(
    () => tasks.filter((task) => task.dueDate),
    [tasks]
  )

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter((task) => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), date)
    })
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || 'oklch(0.65 0.15 240)'
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const handleAddTaskForDate = () => {
    setShowAddTaskForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <CaretLeft weight="bold" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <CaretRight weight="bold" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dayTasks = getTasksForDate(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center justify-center aspect-square rounded-lg border p-2 transition-all',
                !isCurrentMonth && 'opacity-40',
                isSelected && 'border-[oklch(0.25_0.10_240)] bg-[oklch(0.25_0.10_240)]/20 shadow-md',
                !isSelected && 'border-border hover:border-[oklch(0.25_0.10_240)]/50 hover:bg-muted/50',
                isTodayDate && !isSelected && 'border-[oklch(0.55_0.15_145)] border-2'
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                    isTodayDate && 'bg-[oklch(0.55_0.15_145)] text-white',
                    isSelected && 'bg-[oklch(0.25_0.10_240)] text-white scale-110',
                    !isTodayDate && !isSelected && 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center max-w-full px-1">
                    {dayTasks.slice(0, 3).map((task) => {
                      const categoryColor = getCategoryColor(task.categoryId)
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            task.completed && 'opacity-40'
                          )}
                          style={{ backgroundColor: categoryColor }}
                        />
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="text-[oklch(0.55_0.20_25)] hover:text-[oklch(0.50_0.20_25)] hover:bg-[oklch(0.55_0.20_25)]/10"
              >
                Close
              </Button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CalendarBlank className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  No tasks due on this date
                </p>
                <Button
                  onClick={handleAddTaskForDate}
                  className="bg-[oklch(0.55_0.15_145)] hover:bg-[oklch(0.50_0.15_145)] text-white"
                >
                  <Plus weight="bold" className="mr-1.5 h-4 w-4" />
                  Add Task for This Day
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    categoryColor={getCategoryColor(task.categoryId)}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskForm
        open={showAddTaskForm}
        onOpenChange={setShowAddTaskForm}
        categories={categories}
        settings={settings}
        onAddTask={(title, categoryId, priority, notes, dueDate, recurring, tags, subtasks) => {
          const taskDueDate = selectedDate ? selectedDate.setHours(23, 59, 59, 999) : dueDate
          onAddTask(title, categoryId, priority, notes, taskDueDate, recurring, tags, subtasks)
          setShowAddTaskForm(false)
        }}
      />
    </div>
  )
}
