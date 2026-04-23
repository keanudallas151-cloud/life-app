import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Calendar as CalendarComponent } from './ui/calendar'
import { ScrollArea } from './ui/scroll-area'
import { CheckCircle, Trash, Calendar, Tag, ArrowCounterClockwise, TrashSimple, ArrowUUpLeft, MagnifyingGlass, X, FunnelSimple, SortAscending, SortDescending, CalendarBlank } from '@phosphor-icons/react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, subDays, subMonths } from 'date-fns'
import { HistoryEntry, Category } from '../types'
import { cn } from '../lib/utils'

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: HistoryEntry[]
  categories: Category[]
  onRestoreTask?: (entry: HistoryEntry) => void
  onClearHistory?: () => void
  onUndoClearHistory?: () => void
  soundEnabled?: boolean
}

export function HistoryDialog({
  open,
  onOpenChange,
  history,
  categories,
  onRestoreTask,
  onClearHistory,
  onUndoClearHistory,
  soundEnabled
}: HistoryDialogProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'deleted'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>()
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())

  const completedHistory = history.filter(h => h.action === 'completed')
  const deletedHistory = history.filter(h => h.action === 'deleted')

  const filteredHistory = useMemo(() => {
    let result = history

    if (activeTab === 'completed') {
      result = result.filter(entry => entry.action === 'completed')
    } else if (activeTab === 'deleted') {
      result = result.filter(entry => entry.action === 'deleted')
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(entry => {
        const matchesTitle = entry.task.title.toLowerCase().includes(query)
        const matchesNotes = entry.task.notes?.toLowerCase().includes(query) || false
        const matchesTags = entry.task.tags?.some(tag => tag.toLowerCase().includes(query)) || false
        const categoryName = getCategoryName(entry.task.categoryId).toLowerCase()
        const matchesCategory = categoryName.includes(query)
        return matchesTitle || matchesNotes || matchesTags || matchesCategory
      })
    }

    result = result.filter(entry => {
      if (categoryFilter !== 'all' && entry.task.categoryId !== categoryFilter) {
        return false
      }
      if (priorityFilter !== 'all' && entry.task.priority !== priorityFilter) {
        return false
      }
      return true
    })

    result = result.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      const now = new Date()

      switch (dateFilter) {
        case 'today':
          return isToday(entryDate)
        case 'yesterday':
          return isYesterday(entryDate)
        case 'week':
          return isThisWeek(entryDate)
        case 'month':
          return isThisMonth(entryDate)
        case 'last7days':
          const last7Days = subDays(now, 7)
          return entryDate >= last7Days && entryDate <= now
        case 'last30days':
          const last30Days = subDays(now, 30)
          return entryDate >= last30Days && entryDate <= now
        case 'last3months':
          const lastQuarter = subMonths(now, 3)
          return entryDate >= lastQuarter && entryDate <= now
        case 'custom':
          if (dateRange?.from) {
            if (dateRange.to) {
              return entryDate >= dateRange.from && entryDate <= dateRange.to
            }
            return entryDate >= dateRange.from
          }
          return true
        default:
          return true
      }
    })

    return result
  }, [history, activeTab, searchQuery, categoryFilter, priorityFilter, dateFilter, dateRange])

  const sortedHistory = useMemo(() => {
    const result = [...filteredHistory]
    
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.task.title.localeCompare(b.task.title)
          break
        case 'category':
          const catNameA = getCategoryName(a.task.categoryId)
          const catNameB = getCategoryName(b.task.categoryId)
          comparison = catNameA.localeCompare(catNameB)
          break
        case 'date':
        default:
          comparison = a.timestamp - b.timestamp
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return result
  }, [filteredHistory, sortBy, sortOrder])

  const clearAllFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setPriorityFilter('all')
    setDateFilter('all')
    setDateRange(undefined)
  }

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all' || dateRange !== undefined

  const toggleSelection = (entryId: string) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    const deletedEntries = sortedHistory.filter(e => e.action === 'deleted').map(e => e.id)
    setSelectedEntries(new Set(deletedEntries))
  }

  const clearSelection = () => {
    setSelectedEntries(new Set())
  }

  const restoreSelected = () => {
    if (!onRestoreTask) return
    selectedEntries.forEach(entryId => {
      const entry = history.find(h => h.id === entryId)
      if (entry) {
        onRestoreTask(entry)
      }
    })
    clearSelection()
  }

  const deletedEntriesCount = sortedHistory.filter(e => e.action === 'deleted').length

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'oklch(0.50 0.08 240)'
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-muted text-muted-foreground border-muted-foreground/20'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-5 border-b shrink-0">
            <DialogTitle className="text-2xl font-semibold">Task History</DialogTitle>
            <DialogDescription className="text-sm mt-1.5">
              View and restore completed and deleted tasks
            </DialogDescription>

            <div className="mt-5 space-y-3">
              <div className="relative">
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" weight="bold" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={(value) => {
                  setDateFilter(value)
                  if (value !== 'custom') {
                    setDateRange(undefined)
                  }
                }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {dateFilter === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 justify-start text-left font-normal">
                        <CalendarBlank className="mr-2 h-4 w-4" weight="bold" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                            </>
                          ) : (
                            format(dateRange.from, 'MMM d, yyyy')
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range as { from: Date; to?: Date } | undefined)}
                        numberOfMonths={2}
                      />
                      <div className="p-3 border-t flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setDateFilter('all')
                            setDateRange(undefined)
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                    <SelectItem value="category">Sort by Category</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAscending className="h-4 w-4" weight="bold" /> : <SortDescending className="h-4 w-4" weight="bold" />}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-9"
                  >
                    <X className="h-4 w-4 mr-1.5" weight="bold" />
                    <span className="hidden sm:inline">Clear Filters</span>
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-wrap items-center gap-2"
                >
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1.5 pr-1 h-6">
                      <MagnifyingGlass className="h-3 w-3" weight="bold" />
                      {searchQuery}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1.5 pr-1 h-6">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categories.find(c => c.id === categoryFilter)?.color }} />
                      {categories.find(c => c.id === categoryFilter)?.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setCategoryFilter('all')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {priorityFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1.5 pr-1 h-6 capitalize">
                      {priorityFilter}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setPriorityFilter('all')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {dateFilter !== 'all' && !dateRange && (
                    <Badge variant="secondary" className="gap-1.5 pr-1 h-6">
                      <Calendar className="h-3 w-3" weight="bold" />
                      {dateFilter === 'today' ? 'Today' : 
                       dateFilter === 'yesterday' ? 'Yesterday' :
                       dateFilter === 'week' ? 'This Week' :
                       dateFilter === 'month' ? 'This Month' :
                       dateFilter === 'last7days' ? 'Last 7 Days' :
                       dateFilter === 'last30days' ? 'Last 30 Days' :
                       dateFilter}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setDateFilter('all')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {dateRange && (
                    <Badge variant="secondary" className="gap-1.5 pr-1 h-6">
                      <Calendar className="h-3 w-3" weight="bold" />
                      {dateRange.from && format(dateRange.from, 'MMM d')}
                      {dateRange.to && ` - ${format(dateRange.to, 'MMM d')}`}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => {
                          setDateRange(undefined)
                          setDateFilter('all')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {sortBy !== 'date' && (
                    <Badge variant="outline" className="gap-1.5 pr-1 capitalize h-6">
                      Sort: {sortBy}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSortBy('date')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {sortOrder === 'asc' && (
                    <Badge variant="outline" className="gap-1.5 pr-1 h-6">
                      Ascending
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSortOrder('desc')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </motion.div>
              )}
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-3 shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-10">
                <TabsTrigger value="all" className="gap-2 text-sm">
                  All <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">{history.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 text-sm">
                  Completed <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">{completedHistory.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="deleted" className="gap-2 text-sm">
                  Deleted <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">{deletedHistory.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="flex-1 min-h-0 mt-0 px-6 pt-3 pb-0">
              {deletedEntriesCount > 0 && onRestoreTask && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5 border">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={selectedEntries.size > 0 && selectedEntries.size === deletedEntriesCount}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAll()
                        } else {
                          clearSelection()
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedEntries.size > 0 ? `${selectedEntries.size} selected` : 'Select all'}
                    </span>
                  </div>
                  {selectedEntries.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={restoreSelected}
                        className="h-8 text-sm"
                      >
                        <ArrowCounterClockwise className="h-3.5 w-3.5 mr-1.5" weight="bold" />
                        Restore ({selectedEntries.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSelection}
                        className="h-8 text-sm"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <ScrollArea className="h-full">
                {sortedHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      {hasActiveFilters ? (
                        <FunnelSimple className="h-8 w-8 text-muted-foreground" weight="bold" />
                      ) : activeTab === 'completed' ? (
                        <CheckCircle className="h-8 w-8 text-muted-foreground" weight="bold" />
                      ) : activeTab === 'deleted' ? (
                        <Trash className="h-8 w-8 text-muted-foreground" weight="bold" />
                      ) : (
                        <Calendar className="h-8 w-8 text-muted-foreground" weight="bold" />
                      )}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {hasActiveFilters ? 'No results found' : 'No history yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                      {hasActiveFilters 
                        ? 'Try adjusting your search or filters'
                        : activeTab === 'all' 
                        ? 'Your task history will appear here'
                        : activeTab === 'completed' 
                        ? 'Completed tasks will appear here'
                        : 'Deleted tasks will appear here'
                      }
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearAllFilters} size="sm">
                        <X className="h-4 w-4 mr-2" weight="bold" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pb-4 pr-4">
                    <AnimatePresence mode="popLayout">
                      {sortedHistory.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.01 }}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 bg-card transition-all",
                            entry.action === 'completed' ? "border-primary/20" : "border-destructive/20",
                            selectedEntries.has(entry.id) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {onRestoreTask && entry.action === 'deleted' && (
                              <Checkbox
                                checked={selectedEntries.has(entry.id)}
                                onCheckedChange={() => toggleSelection(entry.id)}
                                className="mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  {entry.action === 'completed' ? (
                                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" weight="fill" />
                                  ) : (
                                    <Trash className="h-4 w-4 text-destructive shrink-0 mt-0.5" weight="fill" />
                                  )}
                                  <h4 className="font-semibold text-sm leading-snug flex-1">{entry.task.title}</h4>
                                </div>
                                {onRestoreTask && entry.action === 'deleted' && !selectedEntries.has(entry.id) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onRestoreTask(entry)}
                                    className="shrink-0 h-7 w-7 p-0"
                                  >
                                    <ArrowCounterClockwise className="h-3.5 w-3.5" weight="bold" />
                                  </Button>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-0.5">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: getCategoryColor(entry.task.categoryId) }}
                                  />
                                  <span className="font-medium">{getCategoryName(entry.task.categoryId)}</span>
                                </div>
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", priorityColors[entry.task.priority])}>
                                  {entry.task.priority}
                                </Badge>
                                {entry.task.tags && entry.task.tags.length > 0 && (
                                  <div className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                                    <Tag className="h-2.5 w-2.5" weight="bold" />
                                    <span className="font-medium">{entry.task.tags.join(', ')}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                                  <Calendar className="h-3 w-3" weight="bold" />
                                  <span>
                                    {format(entry.timestamp, 'MMM d, yyyy • h:mm a')}
                                  </span>
                                </div>
                              </div>

                              {entry.task.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-6">
                                  {entry.task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="px-6 pb-5 pt-3 border-t shrink-0 relative z-10 bg-background">
            {history.length > 0 && onClearHistory && (
              <Button
                variant="outline"
                className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowClearConfirm(true)}
              >
                <TrashSimple className="h-4 w-4 mr-2" weight="bold" />
                Clear All History
              </Button>
            )}
            {history.length === 0 && onUndoClearHistory && (
              <Button
                variant="outline"
                className="w-full h-10 text-primary hover:text-primary hover:bg-primary/10"
                onClick={onUndoClearHistory}
              >
                <ArrowUUpLeft className="h-4 w-4 mr-2" weight="bold" />
                Undo Clear History
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {history.length} history {history.length === 1 ? 'entry' : 'entries'}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onClearHistory?.()
                setShowClearConfirm(false)
              }}
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
