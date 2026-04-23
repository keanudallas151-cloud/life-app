import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Tag, FolderSimple, Flag, X } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Button } from './ui/button'
import { Calendar as CalendarComponent } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Task, Category, Priority } from '../types'
import { format } from 'date-fns'
import { cn } from '../lib/utils'
import { triggerHaptic } from '../lib/haptics'
import { playButtonSound } from '../lib/sounds'

interface BatchEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTasks: Task[]
  categories: Category[]
  availableTags: string[]
  onApplyChanges: (changes: Partial<Task>) => void
  hapticEnabled?: boolean
  soundEnabled?: boolean
}

export function BatchEditDialog({
  open,
  onOpenChange,
  selectedTasks,
  categories,
  availableTags,
  onApplyChanges,
  hapticEnabled = true,
  soundEnabled = true,
}: BatchEditDialogProps) {
  const [categoryId, setCategoryId] = useState<string>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [dueDate, setDueDate] = useState<Date>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleApply = () => {
    const changes: Partial<Task> = {}
    
    if (categoryId) changes.categoryId = categoryId
    if (priority) changes.priority = priority as Priority
    if (dueDate) changes.dueDate = dueDate.getTime()
    if (selectedTags.length > 0) changes.tags = selectedTags

    if (Object.keys(changes).length > 0) {
      onApplyChanges(changes)
      if (hapticEnabled) triggerHaptic('success')
      if (soundEnabled) playButtonSound()
      onOpenChange(false)
      
      setCategoryId('')
      setPriority('')
      setDueDate(undefined)
      setSelectedTags([])
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    if (hapticEnabled) triggerHaptic('light')
    if (soundEnabled) playButtonSound()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Batch Edit Tasks</DialogTitle>
          <DialogDescription>
            Edit {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''} at once
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FolderSimple weight="bold" className="h-4 w-4" />
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Keep existing categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Flag weight="bold" className="h-4 w-4" />
              Priority
            </Label>
            <Select value={priority} onValueChange={(val) => setPriority(val as Priority | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Keep existing priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge className="bg-[oklch(0.55_0.18_230)] text-white">Low</Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge className="bg-[oklch(0.70_0.18_90)] text-white">Medium</Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge className="bg-[oklch(0.60_0.22_15)] text-white">High</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar weight="bold" className="h-4 w-4" />
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar weight="bold" className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Keep existing due dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Tag weight="bold" className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3 min-h-[50px]">
                {availableTags.map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected tags will be added to all tasks
              </p>
            </div>
          )}
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={!categoryId && !priority && !dueDate && selectedTags.length === 0}
          >
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
