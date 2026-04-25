import { motion } from 'framer-motion'
import { CalendarBlank, ChartBar, Gear, ListBullets, Plus } from '@phosphor-icons/react'
import { ViewMode } from '../types'
import { cn } from '../lib/utils'

interface BottomNavProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAddTask: () => void
}

const NAV_ITEMS = [
  { mode: 'list' as const, label: 'List', icon: ListBullets, ariaLabel: 'View task list' },
  { mode: 'calendar' as const, label: 'Calendar', icon: CalendarBlank, ariaLabel: 'View calendar' },
  { mode: 'stats' as const, label: 'Stats', icon: ChartBar, ariaLabel: 'View statistics' },
  { mode: 'settings' as const, label: 'Settings', icon: Gear, ariaLabel: 'Open settings' },
]

export function BottomNav({
  viewMode,
  onViewModeChange,
  onAddTask,
}: BottomNavProps) {
  const renderNavItem = (item: (typeof NAV_ITEMS)[number]) => {
    const isActive = viewMode === item.mode
    const Icon = item.icon

    return (
      <motion.button
        key={item.mode}
        onClick={() => onViewModeChange(item.mode)}
        className={cn(
          'organized-nav-item flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 transition-colors min-h-[56px]',
          isActive
            ? 'is-active text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        aria-label={item.ariaLabel}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon
          weight={isActive ? 'fill' : 'regular'}
          className="h-6 w-6"
          aria-hidden="true"
        />
        <span className="text-[12px] font-semibold leading-none">{item.label}</span>
      </motion.button>
    )
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="organized-bottom-nav fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg pb-safe"
      style={{ zIndex: 9100 }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1 px-3 py-2.5 sm:px-4">
        {renderNavItem(NAV_ITEMS[0])}
        {renderNavItem(NAV_ITEMS[1])}

        <div className="flex flex-1 justify-center">
          <motion.button
            onClick={onAddTask}
            whileTap={{ scale: 0.92, y: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="organized-fab flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground"
            aria-label="Add new task"
          >
            <Plus weight="bold" className="h-7 w-7" aria-hidden="true" />
          </motion.button>
        </div>

        {renderNavItem(NAV_ITEMS[2])}
        {renderNavItem(NAV_ITEMS[3])}
      </div>
    </motion.nav>
  )
}