import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import {
  Warning,
  Lightbulb,
  CheckCircle,
  X,
  ListChecks,
  CalendarBlank,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Task, Priority } from "../types";
import { triggerHaptic } from "../lib/haptics";
import { playButtonSound } from "../lib/sounds";
import { toast } from "sonner";
import { addDays } from "date-fns";

type TaskUpdates = {
  [K in keyof Task]?: Task[K]
};

interface BlockerDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: TaskUpdates) => void;
  onBreakIntoSubtasks: (taskId: string) => void;
  hapticEnabled?: boolean;
  soundEnabled?: boolean;
}

export function BlockerDialog({
  task,
  open,
  onOpenChange,
  onUpdateTask,
  onBreakIntoSubtasks,
  hapticEnabled = true,
  soundEnabled = true,
}: BlockerDialogProps) {
  const [blockerNote, setBlockerNote] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (task && open) {
      setBlockerNote(task.blockerNote || "");
      generateSuggestions(task);
    }
  }, [task, open]);

  const generateSuggestions = async (currentTask: Task) => {
    setIsGeneratingSuggestions(true);

    try {
      const promptText = `You are a productivity coach helping someone overcome a task blocker.

Task: "${currentTask.title}"
Priority: ${currentTask.priority}
Notes: ${currentTask.notes || "None"}
Due date: ${currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "Not set"}
Existing blocker note: ${currentTask.blockerNote || "Not specified"}

Generate exactly 3 brief, actionable suggestions to help overcome this blocker. Each suggestion should be:
- Specific and practical
- Under 60 characters
- Action-oriented

Return as JSON with format: { "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"] }`;

      const response = await window.spark.llm(promptText, "gpt-4o-mini", true);
      const data = JSON.parse(response);

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.slice(0, 3));
      }
    } catch (error) {
      setSuggestions([
        "Break this task into smaller steps",
        "Set a shorter deadline to build momentum",
        "Lower priority and tackle easier tasks first",
      ]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSaveBlocker = async () => {
    if (!task) return;

    if (hapticEnabled) triggerHaptic("medium");
    if (soundEnabled) playButtonSound();

    onUpdateTask(task.id, {
      blockerNote: blockerNote.trim() || undefined,
    });

    toast.success("Blocker noted. You got this!");
    onOpenChange(false);
  };

  const handleApplySuggestion = async (suggestion: string) => {
    if (!task) return;

    if (hapticEnabled) triggerHaptic("light");
    if (soundEnabled) playButtonSound();

    if (
      suggestion.toLowerCase().includes("smaller") ||
      suggestion.toLowerCase().includes("break")
    ) {
      onBreakIntoSubtasks(task.id);
      toast.success("Ready to break it down!");
      onOpenChange(false);
    } else if (
      suggestion.toLowerCase().includes("deadline") ||
      suggestion.toLowerCase().includes("date")
    ) {
      const newDueDate = addDays(new Date(), 2).getTime();
      onUpdateTask(task.id, { dueDate: newDueDate });
      toast.success("New deadline set for momentum!");
      onOpenChange(false);
    } else if (
      suggestion.toLowerCase().includes("priority") ||
      suggestion.toLowerCase().includes("easier")
    ) {
      const newPriority: Priority = task.priority === "high" ? "medium" : "low";
      onUpdateTask(task.id, { priority: newPriority });
      toast.success("Priority adjusted!");
      onOpenChange(false);
    } else {
      setBlockerNote((prev) =>
        prev ? `${prev}\n\n${suggestion}` : suggestion,
      );
      toast.success("Added to blocker notes");
    }
  };

  const handleResolveBlocker = () => {
    if (!task) return;

    if (hapticEnabled) triggerHaptic("success");
    if (soundEnabled) playButtonSound();

    onUpdateTask(task.id, {
      blockerNote: undefined,
    });

    toast.success("Blocker resolved! Keep going! 🎉");
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
            >
              <Warning weight="bold" className="h-6 w-6 text-destructive" />
            </motion.div>
            <div className="flex-1">
              <DialogTitle className="text-left">
                What's blocking you?
              </DialogTitle>
              <DialogDescription className="text-left mt-1">
                Let's identify the obstacle and find a way forward.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            {task.notes && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {task.notes}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocker-note">What's stopping you?</Label>
            <Textarea
              id="blocker-note"
              placeholder="e.g., Waiting for feedback, unclear requirements, need more resources..."
              value={blockerNote}
              onChange={(e) => setBlockerNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb weight="fill" className="h-4 w-4 text-accent" />
              <Label>Suggested Actions</Label>
            </div>

            <AnimatePresence mode="wait">
              {isGeneratingSuggestions ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArrowsClockwise className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={`${suggestion}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="w-full rounded-lg border border-border bg-card p-3 text-left text-sm transition-all hover:bg-accent/10 hover:border-accent active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle
                          weight="bold"
                          className="h-4 w-4 mt-0.5 text-accent flex-shrink-0"
                        />
                        <span className="flex-1">{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {task.blockerNote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-accent bg-accent/5 p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="outline" className="border-accent text-accent">
                  <CheckCircle weight="fill" className="mr-1 h-3 w-3" />
                  Blocker tracked
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                You've already noted a blocker. Update it above or mark it
                resolved when you're ready to proceed.
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {task.blockerNote && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResolveBlocker}
              className="w-full sm:w-auto"
            >
              <CheckCircle weight="bold" className="mr-2 h-4 w-4" />
              Mark Resolved
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSaveBlocker}
            className="w-full sm:w-auto"
          >
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
