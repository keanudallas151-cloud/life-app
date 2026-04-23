import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Textarea } from './ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { CalendarBlank, X, Plus, Trash } from '@phosphor-icons/react'
import { Checkbox } from './ui/checkbox'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '../lib/utils'
import type {
  Task,
  Category,
  Priority,
  RecurringType,
  Subtask,
} from '../types'

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onUpdateTask: (
    taskId: string,
    updates: Partial<Task>
  ) => void
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  categories,
  onUpdateTask,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [recurring, setRecurring] = useState<RecurringType | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  useEffect(() => {
    if (!task) {
      setTitle('')
      setCategoryId('')
      setPriority('medium')
      setNotes('')
      setDueDate(undefined)
      setRecurring(null)
      setSubtasks([])
      setNewSubtaskTitle('')
      return
    }

    setTitle(task.title ?? '')
    setCategoryId(task.categoryId ?? '')
    setPriority((task.priority as Priority) ?? 'medium')
    setNotes(task.notes ?? '')
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    setRecurring((task.recurring as RecurringType | null) ?? null)
    setSubtasks(task.subtasks ?? [])
    setNewSubtaskTitle('')
  }, [task, open])

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    }

    setSubtasks((prev) => [...prev, newSubtask])
    setNewSubtaskTitle('')
  }

  const removeSubtask = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId))
  }

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    )
  }

  const handleSubmit = () => {
    if (!task) return

    if (!title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    onUpdateTask(task.id, {
      title: title.trim(),
      categoryId,
      priority,
      notes: notes.trim() || undefined,
      dueDate: dueDate ? dueDate.getTime() : undefined,
      recurring: recurring || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    })

    onOpenChange(false)
    toast.success('Task updated successfully')
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubtask()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details and settings
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No categories available
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Task Title</Label>
              <Input
                id="edit-task-title"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="edit-task-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat && cat.id && cat.name && cat.color)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  <SelectTrigger id="edit-task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        High
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-due-date">Due Date (optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarBlank className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {dueDate && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDueDate(undefined)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-recurring">Recurring (optional)</Label>
              <Select
                value={recurring || 'none'}
                onValueChange={(value) =>
                  setRecurring(value === 'none' ? null : (value as RecurringType))
                }
              >
                <SelectTrigger id="edit-task-recurring">
                  <SelectValue placeholder="Select recurring type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              {recurring && (
                <p className="text-xs text-muted-foreground">
                  This task will automatically create a new instance when completed.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-notes">Notes</Label>
              <Textarea
                id="edit-task-notes"
                placeholder="Add any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Subtasks</Label>

              {subtasks.length > 0 && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <AnimatePresence>
                    {subtasks.map((subtask) => (
                      <motion.div
                        key={subtask.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between gap-2 rounded-md bg-background p-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtask(subtask.id)}
                          />
                          <span
                            className={cn(
                              'text-sm',
                              subtask.completed && 'line-through opacity-60'
                            )}
                          >
                            {subtask.title}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeSubtask(subtask.id)}
                          type="button"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSubtask}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                type="button"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}