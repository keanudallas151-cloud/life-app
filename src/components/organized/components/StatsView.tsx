import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Task, Category, FilterType, ViewMode, HistoryEntry } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { CheckCircle, Fire, Clock, Warning, Target, Lightning, ClockCounterClockwise } from '@phosphor-icons/react'
import { isPast, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '../lib/utils'

interface StatsViewProps {
  tasks: Task[]
  categories: Category[]
  history: HistoryEntry[]
  onNavigate: (filter: FilterType, viewMode: ViewMode) => void
  onShowHistory: () => void
}

export function StatsView({ tasks, categories, history, onNavigate, onShowHistory }: StatsViewProps) {
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const highPriority = tasks.filter((t) => t.priority === 'high' && !t.completed).length
    const mediumPriority = tasks.filter((t) => t.priority === 'medium' && !t.completed).length
    const lowPriority = tasks.filter((t) => t.priority === 'low' && !t.completed).length

    const overdue = tasks.filter(
      (t) => t.dueDate && isPast(new Date(t.dueDate)) && !t.completed && !isToday(new Date(t.dueDate)),
    ).length

    const dueToday = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)) && !t.completed).length

    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    const dueThisWeek = tasks.filter((t) => {
      if (!t.dueDate || t.completed) return false
      const taskDate = new Date(t.dueDate)
      return taskDate >= weekStart && taskDate <= weekEnd
    }).length

    const completedToday = tasks.filter((t) => {
      if (!t.completed || !t.completedAt) return false
      return isToday(new Date(t.completedAt))
    }).length

    const completedThisWeek = tasks.filter((t) => {
      if (!t.completed || !t.completedAt) return false
      const completedDate = new Date(t.completedAt)
      return completedDate >= weekStart && completedDate <= weekEnd
    }).length

    const tasksWithSubtasks = tasks.filter((t) => t.subtasks && t.subtasks.length > 0).length
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0)
    const completedSubtasks = tasks.reduce(
      (acc, t) => acc + (t.subtasks?.filter((st) => st.completed).length || 0),
      0,
    )

    const categoryStats = categories
      .map((category) => {
        const categoryTasks = tasks.filter((t) => t.categoryId === category.id)
        const categoryCompleted = categoryTasks.filter((t) => t.completed).length
        return {
          category,
          total: categoryTasks.length,
          completed: categoryCompleted,
          active: categoryTasks.length - categoryCompleted,
          rate: categoryTasks.length > 0 ? Math.round((categoryCompleted / categoryTasks.length) * 100) : 0,
        }
      })
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total)

    return {
      total,
      completed,
      active,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue,
      dueToday,
      dueThisWeek,
      completedToday,
      completedThisWeek,
      tasksWithSubtasks,
      totalSubtasks,
      completedSubtasks,
      categoryStats,
    }
  }, [tasks, categories])

  const summaryCards = [
    {
      key: 'completed',
      label: 'Completed Tasks',
      value: stats.completed,
      badge: `${stats.completionRate}%`,
      icon: CheckCircle,
      iconClassName: 'text-primary',
      iconWeight: 'fill' as const,
      chipClassName: 'bg-primary/10',
      cardClassName: 'border-primary/20',
      onClick: () => onNavigate('completed', 'list'),
    },
    {
      key: 'active',
      label: 'Active Tasks',
      value: stats.active,
      icon: Target,
      iconClassName: 'text-accent',
      iconWeight: 'bold' as const,
      chipClassName: 'bg-accent/10',
      cardClassName: 'border-accent/20',
      onClick: () => onNavigate('active', 'list'),
    },
    {
      key: 'today',
      label: 'Done Today',
      value: stats.completedToday,
      icon: Lightning,
      iconClassName: 'text-chart-2',
      iconWeight: 'fill' as const,
      chipClassName: 'bg-chart-2/10',
      cardClassName: 'border-chart-2/20',
      onClick: () => onNavigate('today', 'list'),
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: stats.overdue,
      icon: Warning,
      iconClassName: stats.overdue > 0 ? 'text-destructive' : 'text-muted-foreground',
      iconWeight: 'fill' as const,
      chipClassName: stats.overdue > 0 ? 'bg-destructive/10' : 'bg-muted',
      cardClassName: stats.overdue > 0 ? 'border-destructive/20' : 'border-muted',
      onClick: () => onNavigate('overdue', 'list'),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] leading-6 text-muted-foreground">Overview of your tasks and productivity</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={onShowHistory}
          className="w-full max-w-md rounded-full border-2 border-primary/20 bg-card hover:border-primary/40 hover:bg-primary/5"
        >
          <ClockCounterClockwise className="mr-2 h-5 w-5" weight="bold" />
          History Tasks
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-2 font-semibold">
              {history.length}
            </Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.key}
              type="button"
              onClick={card.onClick}
              className="w-full text-left"
            >
              <Card className={cn('h-full rounded-[24px] border-2 bg-card shadow-none transition-colors duration-150', card.cardClassName)}>
                <CardContent className="relative flex min-h-[170px] flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', card.chipClassName)}>
                    <Icon className={cn('h-5 w-5', card.iconClassName)} weight={card.iconWeight} />
                  </div>

                  {card.badge ? (
                    <Badge variant="secondary" className="absolute right-4 top-4 font-semibold">
                      {card.badge}
                    </Badge>
                  ) : null}

                  <p className="text-[3.1rem] font-bold leading-none tracking-[-0.06em] text-foreground">
                    {card.value}
                  </p>
                  <p className="max-w-[9ch] text-[1.05rem] font-semibold leading-[1.05] text-foreground">
                    {card.label}
                  </p>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Priority Breakdown</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('priority', 'list')}
              className="flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <Badge variant="secondary" className="font-semibold">{stats.highPriority}</Badge>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('active', 'list')}
              className="flex w-full items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-sm font-medium">Medium Priority</span>
              </div>
              <Badge variant="secondary" className="font-semibold">{stats.mediumPriority}</Badge>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('active', 'list')}
              className="flex w-full items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Low Priority</span>
              </div>
              <Badge variant="secondary" className="font-semibold">{stats.lowPriority}</Badge>
            </button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming & Timeline</CardTitle>
            <CardDescription>Due dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.dueToday > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('today', 'list')}
                className="flex w-full items-center justify-between rounded-2xl border border-accent/20 bg-accent/10 p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" weight="fill" />
                  <span className="text-sm font-medium">Due Today</span>
                </div>
                <Badge className="bg-accent font-semibold text-accent-foreground">{stats.dueToday}</Badge>
              </button>
            )}

            {stats.dueThisWeek > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('week', 'list')}
                className="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" weight="bold" />
                  <span className="text-sm font-medium">Due This Week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.dueThisWeek}</Badge>
              </button>
            )}

            {stats.completedThisWeek > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('completed', 'list')}
                className="flex w-full items-center justify-between rounded-2xl border border-chart-2/20 bg-chart-2/10 p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Fire className="h-5 w-5 text-chart-2" weight="fill" />
                  <span className="text-sm font-medium">Completed This Week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.completedThisWeek}</Badge>
              </button>
            )}

            {stats.dueToday === 0 && stats.dueThisWeek === 0 && stats.completedThisWeek === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming deadlines or recent completions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalSubtasks > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Subtasks Progress</CardTitle>
            <CardDescription>Track progress on broken-down tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">
                {stats.completedSubtasks} of {stats.totalSubtasks} subtasks completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.completedSubtasks / stats.totalSubtasks) * 100)}%
              </span>
            </div>
            <Progress value={(stats.completedSubtasks / stats.totalSubtasks) * 100} className="h-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              Across {stats.tasksWithSubtasks} {stats.tasksWithSubtasks === 1 ? 'task' : 'tasks'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Category Progress</CardTitle>
          <CardDescription>Completion rate by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {stats.categoryStats.map(({ category, total, completed, rate }) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              type="button"
              onClick={() => onNavigate('all', 'list')}
              className="w-full space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {completed}/{total}
                  </span>
                  <Badge variant="secondary" className="min-w-[50px] justify-center font-semibold">
                    {rate}%
                  </Badge>
                </div>
              </div>
              <Progress value={rate} className="h-2.5" />
            </motion.button>
          ))}

          {stats.categoryStats.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tasks to display stats for
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
