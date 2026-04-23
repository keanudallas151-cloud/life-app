import { useState } from 'react'
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
import { ColorPicker } from './ColorPicker'
import { toast } from 'sonner'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCategory: (name: string, color: string) => void
  soundEnabled?: boolean
}

export function CategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
  soundEnabled = true,
}: CategoryDialogProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('oklch(0.55 0.18 250)')

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    onAddCategory(name.trim(), selectedColor)
    setName('')
    setSelectedColor('oklch(0.55 0.18 250)')
    onOpenChange(false)
    toast.success('Category created successfully')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your tasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Enter category name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              soundEnabled={soundEnabled}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
