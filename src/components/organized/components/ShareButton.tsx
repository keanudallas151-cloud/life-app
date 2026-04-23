import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShareNetwork, Check } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { triggerHaptic } from '../lib/haptics'
import { playButtonSound, playSuccessSound } from '../lib/sounds'

interface ShareButtonProps {
  targetElementId?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  hapticEnabled?: boolean
  soundEnabled?: boolean
}

export function ShareButton({
  targetElementId = 'root',
  variant = 'ghost',
  size = 'icon',
  hapticEnabled = true,
  soundEnabled = true,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shared, setShared] = useState(false)

  const captureAndShare = async () => {
    try {
      setIsSharing(true)
      if (hapticEnabled) triggerHaptic('medium')
      if (soundEnabled) playButtonSound()

      const shareData = {
        title: 'To-Do Life',
        text: 'Check out my task management app!',
        url: window.location.href,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
          
          if (hapticEnabled) triggerHaptic('success')
          if (soundEnabled) playSuccessSound()
          setShared(true)
          setTimeout(() => setShared(false), 2000)
          toast.success('Shared successfully!')
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            await navigator.clipboard.writeText(window.location.href)
            if (hapticEnabled) triggerHaptic('success')
            if (soundEnabled) playSuccessSound()
            setShared(true)
            setTimeout(() => setShared(false), 2000)
            toast.success('Link copied to clipboard!')
          }
        }
      } else {
        await navigator.clipboard.writeText(window.location.href)
        if (hapticEnabled) triggerHaptic('success')
        if (soundEnabled) playSuccessSound()
        setShared(true)
        setTimeout(() => setShared(false), 2000)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share')
      if (hapticEnabled) triggerHaptic('error')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={captureAndShare}
      disabled={isSharing}
      className="relative overflow-hidden"
    >
      <motion.div
        animate={isSharing ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.6, repeat: isSharing ? Infinity : 0, ease: 'linear' }}
      >
        {shared ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check weight="bold" className="h-5 w-5 text-accent" />
          </motion.div>
        ) : (
          <ShareNetwork weight="bold" className="h-5 w-5" />
        )}
      </motion.div>
    </Button>
  )
}
