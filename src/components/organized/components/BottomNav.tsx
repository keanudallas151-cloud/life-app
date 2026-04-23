import { motion } from 'framer-motion'
import { CalendarBlank, ChartBar, Gear, ListBullets, Plus } from '@phosphor-icons/react'
import { ViewMode } from '../types'
import { cn } from '../lib/utils'

function NavPill() {
  return (
    <motion.span
      layoutId="organized-nav-pill"
      className="organized-nav-pill"
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      aria-hidden="true"
    />
  )
}

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
      className="organized-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-3 py-2.5 sm:px-4">
        <motion.button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'organized-nav-item flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5 transition-colors min-h-[48px]',
            viewMode === 'list'
              ? 'is-active text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View task list"
          aria-current={viewMode === 'list' ? 'page' : undefined}
        >
          {viewMode === 'list' && <NavPill />}
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
          <span className="text-[11px] font-medium leading-none">List</span>
        </motion.button>

        <motion.button
          onClick={() => onViewModeChange('calendar')}
          className={cn(
            'organized-nav-item flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5 transition-colors min-h-[48px]',
            viewMode === 'calendar'
              ? 'is-active text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View calendar"
          aria-current={viewMode === 'calendar' ? 'page' : undefined}
        >
          {viewMode === 'calendar' && <NavPill />}
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
          <span className="text-[11px] font-medium leading-none">Calendar</span>
        </motion.button>

        <div className="flex flex-1 justify-center">
          <motion.button
            onClick={onAddTask}
            whileTap={{ scale: 0.92, y: 1 }}
            whileHover={{ scale: 1.06, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="organized-fab flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground"
            aria-label="Add new task"
          >
            <span className="organized-fab-glow" aria-hidden="true" />
            <Plus weight="bold" className="h-6 w-6" aria-hidden="true" />
          </motion.button>
        </div>

        <motion.button
          onClick={() => onViewModeChange('stats')}
          className={cn(
            'organized-nav-item flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5 transition-colors min-h-[48px]',
            viewMode === 'stats'
              ? 'is-active text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="View statistics"
          aria-current={viewMode === 'stats' ? 'page' : undefined}
        >
          {viewMode === 'stats' && <NavPill />}
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
          <span className="text-[11px] font-medium leading-none">Stats</span>
        </motion.button>

        <motion.button
          onClick={() => onViewModeChange('settings')}
          className={cn(
            'organized-nav-item flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5 transition-colors min-h-[48px]',
            viewMode === 'settings'
              ? 'is-active text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="Open settings"
          aria-current={viewMode === 'settings' ? 'page' : undefined}
        >
          {viewMode === 'settings' && <NavPill />}
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
          <span className="text-[11px] font-medium leading-none">Settings</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}