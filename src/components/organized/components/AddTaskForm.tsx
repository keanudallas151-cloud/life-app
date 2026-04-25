import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { CalendarBlank, X, Plus, Trash } from '@phosphor-icons/react'
import { Priority, Category, RecurringType, Subtask, AppSettings } from '../types'
import { VoiceInputButton } from './VoiceInputButton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

interface AddTaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  settings?: AppSettings
  onAddTask: (
    title: string,
    categoryId: string,
    priority: Priority,
    notes?: string,
    dueDate?: number,
    recurring?: RecurringType,
    tags?: string[],
    subtasks?: Subtask[]
  ) => void
}

type KeyDownLikeEvent = {
  key: string
}

const isUsableCategory = (category: Category) =>
  Boolean(category.id && category.name && category.color)

export function AddTaskForm({
  open,
  onOpenChange,
  categories,
  settings,
  onAddTask,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [recurring, setRecurring] = useState<RecurringType | undefined>(undefined)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false)
  const validCategories = useMemo(
    () => categories.filter(isUsableCategory),
    [categories]
  )

  useEffect(() => {
    if (validCategories.length > 0 && !categoryId) {
      setCategoryId(validCategories[0].id)
    }
    if (categoryId && !validCategories.some((cat) => cat.id === categoryId)) {
      setCategoryId(validCategories[0]?.id || '')
    }
  }, [validCategories, categoryId])

  const handleVoiceTranscript = (transcript: string) => {
    if (title) {
      setNotes(prev => prev ? `${prev}\n${transcript}` : transcript)
      toast.success('Added to notes')
    } else {
      setTitle(transcript)
      toast.success('Task title captured')
    }
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false
    }

    setSubtasks([...subtasks, newSubtask])
    setNewSubtaskTitle('')
  }

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    if (!categoryId || !validCategories.some((cat) => cat.id === categoryId)) {
      toast.error('Please create a category first')
      return
    }

    onAddTask(
      title.trim(),
      categoryId,
      priority,
      notes.trim() || undefined,
      dueDate ? dueDate.getTime() : undefined,
      recurring,
      undefined,
      subtasks.length > 0 ? subtasks : undefined
    )

    setTitle('')
    setCategoryId(validCategories[0]?.id || '')
    setPriority('medium')
    setNotes('')
    setDueDate(undefined)
    setRecurring(undefined)
    setSubtasks([])
    setNewSubtaskTitle('')
    onOpenChange(false)
    toast.success('Task added successfully')
  }

  const handleKeyDown = (e: KeyDownLikeEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleSubtaskKeyDown = (e: KeyDownLikeEvent) => {
    if (e.key === 'Enter') {
      addSubtask()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[68dvh] overflow-y-auto sm:max-h-[82vh]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a category
          </DialogDescription>
        </DialogHeader>

        {validCategories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You need to create at least one category before adding tasks
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-title">Task Title</Label>
                  <VoiceInputButton
                    onTranscript={handleVoiceTranscript}
                    hapticEnabled={settings?.hapticFeedback}
                    soundEnabled={settings?.buttonSounds}
                  />
                </div>
                <Input
                  id="task-title"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="task-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validCategories
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Priority)}
                  >
                    <SelectTrigger id="task-priority">
                      <SelectValue />
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
                <Label htmlFor="task-due-date">Due Date (optional)</Label>
                <div className="flex gap-2">
                  <Popover
                    open={dueDatePopoverOpen}
                    onOpenChange={setDueDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarBlank className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          if (date) {
                            setDueDatePopoverOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDueDate(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {dueDate && (
                <div className="space-y-2">
                  <Label htmlFor="task-recurring">Recurring (optional)</Label>
                  <Select
                    value={recurring || "none"}
                    onValueChange={(v) =>
                      setRecurring(
                        v === "none" ? undefined : (v as RecurringType),
                      )
                    }
                  >
                    <SelectTrigger id="task-recurring">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="task-notes">Notes (optional)</Label>
                <Textarea
                  id="task-notes"
                  placeholder="Add any additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label>Subtasks (optional)</Label>
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
                          <span className="text-sm flex-1">
                            {subtask.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeSubtask(subtask.id)}
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
                    <Plus weight="bold" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Add Task
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
