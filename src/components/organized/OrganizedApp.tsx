import './organized.css';

import {
    List,
    PencilSimpleLine,
    Plus,
} from '@phosphor-icons/react';
import { addDays, addMonths, addWeeks, addYears, differenceInDays, endOfWeek, isPast, isToday, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AddTaskForm } from './components/AddTaskForm';
import { BatchEditDialog } from './components/BatchEditDialog';
import { BlockerDialog } from './components/BlockerDialog';
import { BottomNav } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { EditTaskDialog } from './components/EditTaskDialog';
import { HistoryDialog } from './components/HistoryDialog';
import { SettingsView } from './components/SettingsView';
import { StatsView } from './components/StatsView';
import { TaskList } from './components/TaskList';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { useIsMobile } from './hooks/use-mobile';
import { useKV } from './hooks/useKV';
import {
    playAddTaskSound,
    playBulkActionSound,
    playButtonSound,
    playCategorySound,
    playCompleteSound,
    playDeleteSound,
    playEditSound,
    playExportSound,
    playFilterSound,
    playPopupOpenSound,
    playSearchSound,
    playUncompleteSound,
    setGlobalVolume
} from './lib/sounds';
import { AppSettings, Category, FilterType, HistoryEntry, Priority, RecurringType, Subtask, Task, TaskTemplate, ViewMode } from './types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'general', name: 'General', color: 'oklch(0.50 0.08 240)' },
  { id: 'work', name: 'Work', color: 'oklch(0.35 0.08 240)' },
  { id: 'personal', name: 'Personal', color: 'oklch(0.45 0.10 260)' },
  { id: 'health', name: 'Health', color: 'oklch(0.50 0.10 200)' },
]

type TaskUpdates = {
  [K in keyof Task]?: Task[K]
}

function App() {
  const isMobile = useIsMobile()
  const [tasks, setTasks] = useKV<Task[]>('tasks-v2', [])
  const [categories, setCategories] = useKV<Category[]>('categories-v2', DEFAULT_CATEGORIES)
  const [tags, setTags] = useKV<string[]>('tags-v2', [])
  const [templates, setTemplates] = useKV<TaskTemplate[]>('task-templates', [])
  const [history, setHistory] = useKV<HistoryEntry[]>('task-history', [])
  const [settings, setSettings] = useKV<AppSettings>('app-settings', {
    showCompletedTasks: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    swipeThreshold: 100,
    animationSpeed: 0.3,
    hapticFeedback: true,
    buttonSounds: true,
    soundVolume: 0.5,
    theme: 'light',
    notificationsEnabled: false,
    notificationSound: 'chime',
    notificationAdvance: 30,
    notificationVolume: 0.7,
  })

  useEffect(() => {
    const volume = settings?.soundVolume ?? 0.5
    setGlobalVolume(volume)
  }, [settings?.soundVolume])

  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [addTaskFormOpen, setAddTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTasks, setSelectedTasks] = useState(() => new Set<string>())
  const [selectionMode, setSelectionMode] = useState(false)
  const [batchEditDialogOpen, setBatchEditDialogOpen] = useState(false)
  const [blockerTask, setBlockerTask] = useState<Task | null>(null)
  const [blockerDialogOpen, setBlockerDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [viewDirection, setViewDirection] = useState<'left' | 'right'>(  'right')
  const [clearedHistory, setClearedHistory] = useState<HistoryEntry[] | null>(null)

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setCategories(DEFAULT_CATEGORIES)
    }
  }, [categories, setCategories])

  useEffect(() => {
    const nextCategories = categories || []
    if (nextCategories.length === 0) return

    const nextCategoryIds = new Set(nextCategories.map((cat) => cat.id))

    setTasks((current) => {
      const currentTasks = current || []
      const hasOrphans = currentTasks.some((task) => !nextCategoryIds.has(task.categoryId))
      if (!hasOrphans) return current

      return currentTasks.map((task) =>
        !nextCategoryIds.has(task.categoryId)
          ? { ...task, categoryId: nextCategories[0].id }
          : task
      )
    })
  }, [categories, setTasks])

  const addTask = (
    title: string,
    categoryId: string,
    priority: Priority,
    notes?: string,
    dueDate?: number,
    recurring?: RecurringType,
    tags?: string[],
    subtasks?: Subtask[]
  ) => {
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      categoryId,
      createdAt: Date.now(),
      priority,
      notes,
      dueDate,
      recurring,
      tags: tags || [],
      subtasks: subtasks || [],
    }
    setTasks((current) => [...(current || []), newTask])
    playAddTaskSound(settings?.buttonSounds)
    toast.success('Task added')
  }

  const calculateNextDueDate = (currentDueDate: number | undefined, recurringType: RecurringType): number | undefined => {
    if (!currentDueDate || !recurringType) return undefined

    const currentDate = new Date(currentDueDate)

    switch (recurringType) {
      case 'daily':
        return addDays(currentDate, 1).getTime()
      case 'weekly':
        return addWeeks(currentDate, 1).getTime()
      case 'monthly':
        return addMonths(currentDate, 1).getTime()
      case 'yearly':
        return addYears(currentDate, 1).getTime()
      default:
        return undefined
    }
  }

  const updateTask = (taskId: string, updates: TaskUpdates) => {
    setTasks((current) =>
      (current || []).map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
    playEditSound(settings?.buttonSounds)
  }

  const toggleTask = (taskId: string) => {
    setTasks((current) => {
      const task = (current || []).find((t) => t.id === taskId)
      if (!task) return current || []

      const isBeingCompleted = !task.completed

      if (isBeingCompleted) {
        playCompleteSound(settings?.buttonSounds)

        const historyEntry: HistoryEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          task: { ...task, completed: true, completedAt: Date.now() },
          action: 'completed',
          timestamp: Date.now()
        }
        setHistory((histCurrent) => {
          const newHistory = [...(histCurrent || []), historyEntry]
          const completedCount = newHistory.filter(h => h.action === 'completed').length
          const deletedCount = newHistory.filter(h => h.action === 'deleted').length

          if (completedCount >= 10 && deletedCount >= 10) {
            return []
          }
          return newHistory
        })
      } else {
        playUncompleteSound(settings?.buttonSounds)
      }

      if (isBeingCompleted && task.recurring) {
        const nextDueDate = calculateNextDueDate(task.dueDate, task.recurring)

        const newRecurringTask: Task = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: task.title,
          completed: false,
          categoryId: task.categoryId,
          createdAt: Date.now(),
          priority: task.priority,
          notes: task.notes,
          dueDate: nextDueDate,
          recurring: task.recurring,
          recurringSourceId: task.recurringSourceId || task.id,
          tags: task.tags,
          subtasks: task.subtasks?.map(st => ({ ...st, completed: false })),
        }

        toast.success('Task completed! Next instance created.')

        return [
          ...(current || []).map((t) =>
            t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t
          ),
          newRecurringTask,
        ]
      }

      return (current || []).map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t
      )
    })
  }

  const deleteTask = (taskId: string) => {
    const taskToDelete = (tasks || []).find(task => task.id === taskId)
    if (taskToDelete) {
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        task: taskToDelete,
        action: 'deleted',
        timestamp: Date.now()
      }
      setHistory((current) => {
        const newHistory = [...(current || []), historyEntry]
        const completedCount = newHistory.filter(h => h.action === 'completed').length
        const deletedCount = newHistory.filter(h => h.action === 'deleted').length

        if (completedCount >= 10 && deletedCount >= 10) {
          return []
        }
        return newHistory
      })
    }
    setTasks((current) => (current || []).filter((task) => task.id !== taskId))
    playDeleteSound(settings?.buttonSounds)
    toast.success('Task deleted')
  }

  const bulkComplete = () => {
    if (selectedTasks.size === 0) return
    setTasks((current) =>
      (current || []).map(task =>
        selectedTasks.has(task.id) ? { ...task, completed: true, completedAt: Date.now() } : task
      )
    )
    playBulkActionSound(settings?.buttonSounds)
    toast.success(`Completed ${selectedTasks.size} tasks`)
    setSelectedTasks(new Set())
    setSelectionMode(false)
  }

  const bulkDelete = () => {
    if (selectedTasks.size === 0) return
    const tasksToDelete = (tasks || []).filter(task => selectedTasks.has(task.id))
    tasksToDelete.forEach(task => {
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        task,
        action: 'deleted',
        timestamp: Date.now()
      }
      setHistory((current) => [...(current || []), historyEntry])
    })
    setTasks((current) =>
      (current || []).filter(task => !selectedTasks.has(task.id))
    )
    playBulkActionSound(settings?.buttonSounds)
    toast.success(`Deleted ${selectedTasks.size} tasks`)
    setSelectedTasks(new Set())
    setSelectionMode(false)
  }

  const handleBatchEdit = (changes: TaskUpdates) => {
    setTasks((current) =>
      (current || []).map(task =>
        selectedTasks.has(task.id)
          ? { ...task, ...changes }
          : task
      )
    )
    playBulkActionSound(settings?.buttonSounds)
    toast.success(`Updated ${selectedTasks.size} tasks`)
    setSelectedTasks(new Set())
    setSelectionMode(false)
  }

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      color,
    }
    setCategories((current) => [...(current || []), newCategory])
    playCategorySound(settings?.buttonSounds)
    toast.success('Category created')
  }

  const updateCategory = (categoryId: string, name: string, color: string) => {
    setCategories((current) =>
      (current || []).map((cat) =>
        cat.id === categoryId ? { ...cat, name, color } : cat
      )
    )
    playEditSound(settings?.buttonSounds)
  }

  const deleteCategory = (categoryId: string) => {
    const remainingCategories = (categories || []).filter(cat => cat.id !== categoryId)
    if (remainingCategories.length === 0) {
      toast.error('Cannot delete the last category')
      return
    }

    setTasks((current) =>
      (current || []).map(task =>
        task.categoryId === categoryId
          ? { ...task, categoryId: remainingCategories[0].id }
          : task
      )
    )

    setCategories((current) => (current || []).filter(cat => cat.id !== categoryId))
    playDeleteSound(settings?.buttonSounds)
    toast.success('Category deleted')
  }

  const addTag = (tag: string) => {
    setTags((current) => [...(current || []), tag])
    toast.success('Tag created')
  }

  const deleteTag = (tag: string) => {
    setTags((current) => (current || []).filter(t => t !== tag))
    setTasks((current) =>
      (current || []).map(task => ({
        ...task,
        tags: task.tags?.filter(t => t !== tag) || []
      }))
    )
    toast.success('Tag deleted')
  }

  const handleShowBlocker = (task: Task) => {
    setBlockerTask(task)
    setBlockerDialogOpen(true)
  }

  const handleBreakIntoSubtasks = (taskId: string) => {
    setEditingTask(tasks?.find(t => t.id === taskId) || null)
    setBlockerDialogOpen(false)
  }

  useEffect(() => {
    const checkForBlockers = () => {
      const now = Date.now()
      ;(tasks || []).forEach(task => {
        if (task.completed || task.blockerNote) return

        const isOverdueByTwoDays = task.dueDate && differenceInDays(now, task.dueDate) >= 2
        const editCount = task.editCount || 0
        const hasMultipleEdits = editCount >= 3

        if ((isOverdueByTwoDays || hasMultipleEdits) && !task.blockerNote) {
          console.log(`Task "${task.title}" might be blocked`)
        }
      })
    }

    const interval = setInterval(checkForBlockers, 60000)
    checkForBlockers()

    return () => clearInterval(interval)
  }, [tasks])

  const safeCategories = useMemo(() => categories || [], [categories])

  const validCategories = useMemo(
    () =>
      safeCategories.filter(
        (cat) => cat && cat.id && cat.name && cat.color
      ),
    [safeCategories]
  )
  const validCategoryIds = new Set(validCategories.map(cat => cat.id))

  const filteredAndSearchedTasks = useMemo(() => {
    let result = (tasks || []).filter((task) => {
      if (!task || !task.categoryId || !validCategoryIds.has(task.categoryId)) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesNotes = task.notes?.toLowerCase().includes(query) || false
        const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query)) || false
        const categoryName = validCategories.find(c => c.id === task.categoryId)?.name.toLowerCase() || ''
        const matchesCategory = categoryName.includes(query)

        if (!matchesTitle && !matchesNotes && !matchesTags && !matchesCategory) {
          return false
        }
      }

      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      if (filter === 'priority') return task.priority === 'high' && !task.completed
      if (filter === 'today') return task.dueDate && isToday(new Date(task.dueDate))
      if (filter === 'week') {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        const weekStart = startOfWeek(new Date())
        const weekEnd = endOfWeek(new Date())
        return taskDate >= weekStart && taskDate <= weekEnd
      }
      if (filter === 'overdue') {
        return task.dueDate && isPast(new Date(task.dueDate)) && !task.completed && !isToday(new Date(task.dueDate))
      }
      return true
    })

    const sortBy = settings?.sortBy || 'createdAt'
    const sortOrder = settings?.sortOrder || 'desc'

    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'dueDate':
          comparison = (a.dueDate || Infinity) - (b.dueDate || Infinity)
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'createdAt':
        default:
          comparison = a.createdAt - b.createdAt
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [tasks, filter, searchQuery, settings, validCategoryIds, validCategories])

  const tasksByCategory = useMemo(() =>
    validCategories
      .filter((category) => category && category.id && category.name && category.color)
      .map((category) => ({
        category,
        tasks: filteredAndSearchedTasks.filter((task) => task && task.categoryId === category.id),
      }))
      .filter(({ tasks }) => tasks.length > 0),
    [validCategories, filteredAndSearchedTasks]
  )

  const totalTasks = (tasks || []).length
  const completedTasks = (tasks || []).filter((t) => t.completed).length
  const activeTasks = totalTasks - completedTasks
  const highPriorityTasks = (tasks || []).filter((t) => t.priority === 'high' && !t.completed).length
  const highPriorityActive = highPriorityTasks
  const mediumPriorityActive = (tasks || []).filter((t) => t.priority === 'medium' && !t.completed).length
  const lowPriorityActive = (tasks || []).filter((t) => t.priority === 'low' && !t.completed).length
  const overdueTasks = (tasks || []).filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !t.completed && !isToday(new Date(t.dueDate))).length

  const exportData = () => {
    const data = {
      tasks: tasks || [],
      categories: categories || [],
      templates: templates || [],
      settings: settings || {},
      exportedAt: new Date().toISOString(),
      version: '2.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-tasks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    playExportSound(settings?.buttonSounds)
    toast.success('Data exported')
  }

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleViewModeChange = (newMode: ViewMode) => {
    const viewOrder: ViewMode[] = ['list', 'calendar', 'stats', 'settings']
    const currentIndex = viewOrder.indexOf(viewMode || 'list')
    const newIndex = viewOrder.indexOf(newMode)

    setViewDirection(newIndex > currentIndex ? 'right' : 'left')
    setViewMode(newMode)
  }

  const handleNavigateFromStats = (newFilter: FilterType, newViewMode: ViewMode) => {
    setFilter(newFilter)
    handleViewModeChange(newViewMode)
    playFilterSound(settings?.buttonSounds)
  }

  const handleRestoreTask = (entry: HistoryEntry) => {
    const restoredTask: Task = {
      ...entry.task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
      completedAt: undefined,
      createdAt: Date.now()
    }
    setTasks((current) => [...(current || []), restoredTask])
    setHistory((current) => (current || []).filter(h => h.id !== entry.id))
    playAddTaskSound(settings?.buttonSounds)
    toast.success('Task restored')
  }

  const handleClearHistory = () => {
    const currentHistory = history || []
    setClearedHistory(currentHistory)
    setHistory([])
    playBulkActionSound(settings?.buttonSounds)
    toast.success('History cleared', {
      action: {
        label: 'Undo',
        onClick: () => handleUndoClearHistory()
      },
      duration: 10000
    })
  }

  const handleUndoClearHistory = () => {
    if (clearedHistory) {
      setHistory(clearedHistory)
      setClearedHistory(null)
      playBulkActionSound(settings?.buttonSounds)
      toast.success('History restored')
    }
  }

  const handleReorderTasks = (reorderedTasks: Task[], categoryId: string) => {
    setTasks((current) => {
      const otherTasks = (current || []).filter(t => t.categoryId !== categoryId)
      return [...otherTasks, ...reorderedTasks]
    })
  }

  const toggleTheme = () => {
    const currentTheme = settings?.theme || (typeof document !== 'undefined' && document.body.classList.contains('life-dark') ? 'dark' : 'light')
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setSettings((current) => ({
      showCompletedTasks: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      swipeThreshold: 100,
      animationSpeed: 0.3,
      hapticFeedback: true,
      buttonSounds: true,
      soundVolume: 0.5,
      notificationsEnabled: false,
      notificationSound: 'chime',
      notificationAdvance: 30,
      notificationVolume: 0.7,
      ...(current || {}),
      theme: newTheme
    }))
    // Integrate with life-app global theme.
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('life-dark', newTheme === 'dark')
    }
    playButtonSound(settings?.buttonSounds)
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`)
  }

  // Sync Organized's stored theme with life-app's body.life-dark on mount
  // and whenever settings.theme changes.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const bodyIsDark = document.body.classList.contains('life-dark')
    const storedTheme = settings?.theme
    if (!storedTheme) {
      // Initial: adopt whatever life-app is showing.
      setSettings((current) => ({
        showCompletedTasks: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        swipeThreshold: 100,
        animationSpeed: 0.3,
        hapticFeedback: true,
        buttonSounds: true,
        soundVolume: 0.5,
        notificationsEnabled: false,
        notificationSound: 'chime',
        notificationAdvance: 30,
        notificationVolume: 0.7,
        ...(current || {}),
        theme: bodyIsDark ? 'dark' : 'light',
      }))
      return
    }
    const shouldBeDark = storedTheme === 'dark'
    if (shouldBeDark !== bodyIsDark) {
      document.body.classList.toggle('life-dark', shouldBeDark)
    }
  }, [settings?.theme])

  return (
    <div className="organized-feature flex min-h-screen flex-col bg-background pb-safe">
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-4xl px-4 sm:px-5 pt-20 sm:pt-14 pb-32"
        >
          <header className="mb-5 sm:mb-6">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                    {viewMode === 'calendar' && 'Calendar'}
                    {viewMode === 'stats' && 'Statistics'}
                    {viewMode === 'settings' && 'Settings'}
                    {viewMode === 'list' && 'To-Do List'}
                  </h1>
                  {viewMode === 'list' && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {/* Triple "active" breakdown by priority (high / medium / low) to match
                          the Spark task-manager reference page. Each span filters when clicked. */}
                      <motion.span
                        key={`high-${highPriorityActive}`}
                        initial={{ scale: 1.2, color: 'var(--primary)' }}
                        animate={{ scale: 1, color: 'var(--muted-foreground)' }}
                        onClick={() => {
                          setFilter('priority')
                          setViewMode('list')
                        }}
                        className="organized-stat-chip font-medium cursor-pointer hover:text-primary transition-colors"
                      >
                        {highPriorityActive} high
                      </motion.span>
                      <motion.span
                        key={`med-${mediumPriorityActive}`}
                        initial={{ scale: 1.2, color: 'var(--primary)' }}
                        animate={{ scale: 1, color: 'var(--muted-foreground)' }}
                        onClick={() => {
                          setFilter('active')
                          setViewMode('list')
                        }}
                        className="organized-stat-chip font-medium cursor-pointer hover:text-primary transition-colors"
                      >
                        {mediumPriorityActive} medium
                      </motion.span>
                      <motion.span
                        key={`low-${lowPriorityActive}`}
                        initial={{ scale: 1.2, color: 'var(--primary)' }}
                        animate={{ scale: 1, color: 'var(--muted-foreground)' }}
                        onClick={() => {
                          setFilter('active')
                          setViewMode('list')
                        }}
                        className="organized-stat-chip font-medium cursor-pointer hover:text-primary transition-colors"
                      >
                        {lowPriorityActive} low
                      </motion.span>
                      <motion.span
                        key={completedTasks}
                        initial={{ scale: 1.2, color: 'var(--accent)' }}
                        animate={{ scale: 1, color: 'var(--muted-foreground)' }}
                        onClick={() => {
                          setFilter('completed')
                          setViewMode('list')
                        }}
                        className="organized-stat-chip font-medium cursor-pointer hover:text-accent transition-colors"
                      >
                        {completedTasks} done
                      </motion.span>
                      <motion.span
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        onClick={() => {
                          setFilter('overdue')
                          setViewMode('list')
                        }}
                        className="organized-stat-chip text-destructive font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {overdueTasks} overdue
                      </motion.span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Header toolbar is intentionally empty to match the Spark
                  task-manager reference. Actions are available via the
                  bottom nav (mobile) and floating "+" FAB (desktop). */}
              <div className="flex items-center gap-2"></div>
            </div>
            {/* Desktop filter-pill row removed to match the Spark reference page.
                Filtering is still available via the overdue/done/active counts in
                the header, the FilterSheet, and the bottom-nav views. */}

            {selectionMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl bg-primary/10 p-3.5"
              >
                <span className="flex-1 text-sm font-medium">
                  {selectedTasks.size} selected
                </span>
                <Button size="sm" variant="outline" onClick={() => setBatchEditDialogOpen(true)}>
                  <PencilSimpleLine weight="bold" className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={bulkComplete}>
                  Complete
                </Button>
                <Button size="sm" variant="destructive" onClick={bulkDelete}>
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectionMode(false)
                    setSelectedTasks(new Set())
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </header>

          <AnimatePresence mode="wait">
            {viewMode === 'settings' ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, x: viewDirection === 'right' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewDirection === 'right' ? -100 : 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <SettingsView
                  categories={validCategories}
                  onAddCategory={addCategory}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                  tags={tags || []}
                  onAddTag={addTag}
                  onDeleteTag={deleteTag}
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </motion.div>
            ) : viewMode === 'stats' ? (
              <motion.div
                key="stats-view"
                initial={{ opacity: 0, x: viewDirection === 'right' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewDirection === 'right' ? -100 : 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <StatsView
                  tasks={tasks || []}
                  categories={validCategories}
                  history={history || []}
                  onNavigate={handleNavigateFromStats}
                  onShowHistory={() => {
                    playPopupOpenSound(settings?.buttonSounds)
                    setHistoryDialogOpen(true)
                  }}
                />
              </motion.div>
            ) : viewMode === 'calendar' ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, x: viewDirection === 'right' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewDirection === 'right' ? -100 : 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <CalendarView
                  tasks={tasks || []}
                  categories={validCategories}
                  settings={settings}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onEditTask={setEditingTask}
                  onAddTask={addTask}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: viewDirection === 'right' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: viewDirection === 'right' ? -100 : 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                {tasksByCategory.length === 0 && filteredAndSearchedTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <List className="h-10 w-10 text-muted-foreground" weight="bold" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {searchQuery ? 'No results found' : 'No tasks yet'}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Add your first task to get started'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setAddTaskFormOpen(true)} size="lg">
                        <Plus weight="bold" className="mr-2" />
                        Add Task
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  tasksByCategory.map(({ category, tasks }, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <TaskList
                        tasks={tasks}
                        category={category}
                        categories={validCategories}
                        onToggleTask={toggleTask}
                        onDeleteTask={deleteTask}
                        onEditTask={setEditingTask}
                        onShowBlocker={handleShowBlocker}
                        selectionMode={selectionMode}
                        selectedTasks={selectedTasks}
                        onTaskSelect={handleTaskSelect}
                        settings={settings}
                        onReorderTasks={(reorderedTasks) => handleReorderTasks(reorderedTasks, category.id)}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <BottomNav
        viewMode={viewMode || 'list'}
        onViewModeChange={handleViewModeChange}
        onAddTask={() => setAddTaskFormOpen(true)}
      />
      <AddTaskForm
        open={addTaskFormOpen}
        onOpenChange={setAddTaskFormOpen}
        categories={safeCategories}
        settings={settings}
        onAddTask={addTask}
      />
      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        categories={safeCategories}
        onUpdateTask={updateTask}
      />
      <BatchEditDialog
        open={batchEditDialogOpen}
        onOpenChange={setBatchEditDialogOpen}
        selectedTasks={(tasks || []).filter(t => selectedTasks.has(t.id))}
        categories={validCategories}
        availableTags={tags || []}
        onApplyChanges={handleBatchEdit}
        hapticEnabled={settings?.hapticFeedback}
        soundEnabled={settings?.buttonSounds}
      />
      <BlockerDialog
        task={blockerTask}
        open={blockerDialogOpen}
        onOpenChange={setBlockerDialogOpen}
        onUpdateTask={updateTask}
        onBreakIntoSubtasks={handleBreakIntoSubtasks}
        hapticEnabled={settings?.hapticFeedback}
        soundEnabled={settings?.buttonSounds}
      />
      <HistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        history={history || []}
        categories={validCategories}
        onRestoreTask={handleRestoreTask}
        onClearHistory={handleClearHistory}
        onUndoClearHistory={clearedHistory ? handleUndoClearHistory : undefined}
        soundEnabled={settings?.buttonSounds}
      />
      <Toaster position={isMobile ? "top-center" : "bottom-right"} />
    </div>
  );
}

export default App
