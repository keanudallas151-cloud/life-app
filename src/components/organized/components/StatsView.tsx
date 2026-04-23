import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Task, Category, FilterType, ViewMode, HistoryEntry } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { CheckCircle, Circle, Fire, TrendUp, Clock, Warning, Target, Lightning, ClockCounterClockwise } from '@phosphor-icons/react'
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
    const completed = tasks.filter(t => t.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length
    const mediumPriority = tasks.filter(t => t.priority === 'medium' && !t.completed).length
    const lowPriority = tasks.filter(t => t.priority === 'low' && !t.completed).length

    const overdue = tasks.filter(t => 
      t.dueDate && isPast(new Date(t.dueDate)) && !t.completed && !isToday(new Date(t.dueDate))
    ).length

    const dueToday = tasks.filter(t => 
      t.dueDate && isToday(new Date(t.dueDate)) && !t.completed
    ).length

    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    const dueThisWeek = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false
      const taskDate = new Date(t.dueDate)
      return taskDate >= weekStart && taskDate <= weekEnd
    }).length

    const completedToday = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false
      return isToday(new Date(t.completedAt))
    }).length

    const completedThisWeek = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false
      const completedDate = new Date(t.completedAt)
      return completedDate >= weekStart && completedDate <= weekEnd
    }).length

    const tasksWithSubtasks = tasks.filter(t => t.subtasks && t.subtasks.length > 0).length
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0)
    const completedSubtasks = tasks.reduce((acc, t) => 
      acc + (t.subtasks?.filter(st => st.completed).length || 0), 0
    )

    const categoryStats = categories.map(category => {
      const categoryTasks = tasks.filter(t => t.categoryId === category.id)
      const categoryCompleted = categoryTasks.filter(t => t.completed).length
      return {
        category,
        total: categoryTasks.length,
        completed: categoryCompleted,
        active: categoryTasks.length - categoryCompleted,
        rate: categoryTasks.length > 0 ? Math.round((categoryCompleted / categoryTasks.length) * 100) : 0
      }
    }).filter(s => s.total > 0).sort((a, b) => b.total - a.total)

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
      categoryStats
    }
  }, [tasks, categories])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Overview of your tasks and productivity</p>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex justify-center"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={onShowHistory}
          className="w-full max-w-md border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
        >
          <ClockCounterClockwise className="h-5 w-5 mr-2" weight="bold" />
          History Tasks
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-2 font-semibold">
              {history.length}
            </Badge>
          )}
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onNavigate('completed', 'list')}
          className="cursor-pointer"
        >
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {stats.completionRate}%
                </Badge>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onNavigate('active', 'list')}
          className="cursor-pointer"
        >
          <Card className="border-2 border-accent/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <Target className="h-5 w-5 text-accent" weight="bold" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active Tasks</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onNavigate('today', 'list')}
          className="cursor-pointer"
        >
          <Card className="border-2 border-chart-2/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
                  <Lightning className="h-5 w-5 text-chart-2" weight="fill" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.completedToday}</p>
              <p className="text-xs text-muted-foreground">Done Today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onNavigate('overdue', 'list')}
          className="cursor-pointer"
        >
          <Card className={cn("border-2", stats.overdue > 0 ? "border-destructive/20" : "border-muted")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  stats.overdue > 0 ? "bg-destructive/10" : "bg-muted"
                )}>
                  <Warning className={cn("h-5 w-5", stats.overdue > 0 ? "text-destructive" : "text-muted-foreground")} weight="fill" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Breakdown</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('priority', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">High Priority</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.highPriority}</Badge>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('active', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Medium Priority</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.mediumPriority}</Badge>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('active', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Low Priority</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.lowPriority}</Badge>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming & Timeline</CardTitle>
            <CardDescription>Due dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.dueToday > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('today', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" weight="fill" />
                  <span className="text-sm font-medium">Due Today</span>
                </div>
                <Badge className="bg-accent text-accent-foreground font-semibold">{stats.dueToday}</Badge>
              </motion.div>
            )}

            {stats.dueThisWeek > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('week', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" weight="bold" />
                  <span className="text-sm font-medium">Due This Week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.dueThisWeek}</Badge>
              </motion.div>
            )}

            {stats.completedThisWeek > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('completed', 'list')}
                className="flex items-center justify-between p-3 rounded-lg bg-chart-2/10 border border-chart-2/20 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Fire className="h-5 w-5 text-chart-2" weight="fill" />
                  <span className="text-sm font-medium">Completed This Week</span>
                </div>
                <Badge variant="secondary" className="font-semibold">{stats.completedThisWeek}</Badge>
              </motion.div>
            )}

            {stats.dueToday === 0 && stats.dueThisWeek === 0 && stats.completedThisWeek === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No upcoming deadlines or recent completions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalSubtasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subtasks Progress</CardTitle>
            <CardDescription>Track progress on broken-down tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {stats.completedSubtasks} of {stats.totalSubtasks} subtasks completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.completedSubtasks / stats.totalSubtasks) * 100)}%
              </span>
            </div>
            <Progress value={(stats.completedSubtasks / stats.totalSubtasks) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Across {stats.tasksWithSubtasks} {stats.tasksWithSubtasks === 1 ? 'task' : 'tasks'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Progress</CardTitle>
          <CardDescription>Completion rate by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {stats.categoryStats.map(({ category, total, completed, active, rate }) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('all', 'list')}
              className="space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full shadow-sm"
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
            </motion.div>
          ))}
          
          {stats.categoryStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No tasks to display stats for
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
