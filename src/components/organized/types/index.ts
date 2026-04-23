export type Priority = 'low' | 'medium' | 'high'

export type ViewMode = 'list' | 'calendar' | 'stats' | 'settings'

export type FilterType = 'all' | 'active' | 'completed' | 'priority' | 'today' | 'week' | 'overdue'

export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  completedAt?: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: number
  categoryId: string
  createdAt: number
  priority: Priority
  notes?: string
  dueDate?: number
  recurring?: RecurringType
  recurringSourceId?: string
  tags?: string[]
  subtasks?: Subtask[]
  editCount?: number
  blockerNote?: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface TaskTemplate {
  id: string
  title: string
  categoryId: string
  priority: Priority
  notes?: string
  tags?: string[]
  subtasks?: Subtask[]
}

export interface AppSettings {
  showCompletedTasks: boolean
  sortBy: 'createdAt' | 'title' | 'dueDate' | 'priority'
  sortOrder: 'asc' | 'desc'
  swipeThreshold: number
  animationSpeed: number
  hapticFeedback: boolean
  buttonSounds: boolean
  soundVolume: number
  theme: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  notificationSound: 'chime' | 'bell' | 'ding' | 'none'
  notificationAdvance: number
  notificationVolume: number
}

export interface HistoryEntry {
  id: string
  task: Task
  action: 'completed' | 'deleted'
  timestamp: number
}
