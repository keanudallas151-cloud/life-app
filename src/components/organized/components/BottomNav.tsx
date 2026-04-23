import { motion } from 'framer-motion'
import { CalendarBlank, ChartBar, Gear, ListBullets, Plus } from '@phosphor-icons/react'
import { ViewMode } from '../types'
import { cn } from '../lib/utils'

interface BottomNavProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAddTask: () => void
}

export function BottomNav({
  viewMode,
  onViewModeChange,
  onAddTask,
}: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        <motion.button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors min-h-[44px]',
            viewMode === 'list'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View task list"
          aria-current={viewMode === 'list' ? 'page' : undefined}
        >
          <motion.div
            animate={{
              scale: viewMode === 'list' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <ListBullets
              weight={viewMode === 'list' ? 'fill' : 'regular'}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </motion.div>
          <span className="text-xs font-medium">List</span>
        </motion.button>

        <motion.button
          onClick={() => onViewModeChange('calendar')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors min-h-[44px]',
            viewMode === 'calendar'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View calendar"
          aria-current={viewMode === 'calendar' ? 'page' : undefined}
        >
          <motion.div
            animate={{
              scale: viewMode === 'calendar' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <CalendarBlank
              weight={viewMode === 'calendar' ? 'fill' : 'regular'}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </motion.div>
          <span className="text-xs font-medium">Calendar</span>
        </motion.button>

        <div className="flex flex-1 justify-center">
          <motion.button
            onClick={onAddTask}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            aria-label="Add new task"
          >
            <Plus weight="bold" className="h-6 w-6" aria-hidden="true" />
          </motion.button>
        </div>

        <motion.button
          onClick={() => onViewModeChange('stats')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors min-h-[44px]',
            viewMode === 'stats'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View statistics"
          aria-current={viewMode === 'stats' ? 'page' : undefined}
        >
          <motion.div
            animate={{
              scale: viewMode === 'stats' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <ChartBar
              weight={viewMode === 'stats' ? 'fill' : 'regular'}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </motion.div>
          <span className="text-xs font-medium">Stats</span>
        </motion.button>

        <motion.button
          onClick={() => onViewModeChange('settings')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors min-h-[44px]',
            viewMode === 'settings'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="Open settings"
          aria-current={viewMode === 'settings' ? 'page' : undefined}
        >
          <motion.div
            animate={{
              scale: viewMode === 'settings' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Gear
              weight={viewMode === 'settings' ? 'fill' : 'regular'}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </motion.div>
          <span className="text-xs font-medium">Settings</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}