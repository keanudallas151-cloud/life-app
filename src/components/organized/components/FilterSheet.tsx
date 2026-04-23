import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { FilterType, AppSettings } from '../types'
import { Download } from '@phosphor-icons/react'

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  onExport: () => void
  settings?: AppSettings
  onSettingsChange?: (settings: AppSettings) => void
}

export function FilterSheet({
  open,
  onOpenChange,
  currentFilter,
  onFilterChange,
  onExport,
  settings,
  onSettingsChange,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters & Settings</SheetTitle>
        </SheetHeader>

        {/* your filter/settings UI goes here */}
      </SheetContent>
    </Sheet>
  )
}