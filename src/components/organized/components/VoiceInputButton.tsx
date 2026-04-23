import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { playButtonSound } from '../lib/sounds'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  className?: string
  hapticEnabled?: boolean
  soundEnabled?: boolean
}

export function VoiceInputButton({
  onTranscript,
  className,
  hapticEnabled = true,
  soundEnabled = true,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()

      if (transcript) {
        onTranscript(transcript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {
        // ignore cleanup errors
      }
    }
  }, [onTranscript])

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticEnabled || typeof window === 'undefined') return

    if ('vibrate' in navigator) {
      const pattern =
        style === 'light' ? 10 : style === 'medium' ? 20 : 30
      navigator.vibrate(pattern)
    }
  }

  const handleClick = async () => {
    if (!isSupported || !recognitionRef.current) return

    await playButtonSound(soundEnabled)

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore stop errors
      }
      triggerHaptic('light')
      return
    }

    try {
      recognitionRef.current.start()
      triggerHaptic('medium')
    } catch {
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        className={cn('opacity-50', className)}
        aria-label="Voice input not supported"
      >
        <MicrophoneSlash size={18} />
      </Button>
    )
  }

  return (
    <motion.div className={cn('relative', className)}>
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-md bg-red-500/20"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-md bg-red-500/30"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.2,
              }}
            />
          </>
        )}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        className={cn(isListening && 'border-red-500 bg-red-50')}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isListening ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {isListening ? (
            <Microphone size={18} weight="fill" className="text-red-500" />
          ) : (
            <Microphone size={18} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  )
}
