import { ColorPicker } from "./ColorPicker";
import { LegalViewer } from "./LegalViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { triggerHaptic } from "../lib/haptics";
import { playButtonSound, setGlobalVolume } from "../lib/sounds";
import { AppSettings, Category } from "../types";
import {
  Bell,
  BellSlash,
  CaretRight,
  Desktop,
  FolderOpen,
  Moon,
  Palette,
  PencilSimple,
  PlayCircle,
  Plus,
  Scales,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  Tag,
  Trash,
  Vibrate,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SettingsViewProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (categoryId: string, name: string, color: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
  settings?: AppSettings;
  onSettingsChange?: (settings: AppSettings) => void;
}

type ExpandedSection =
  | "appearance"
  | "feedback"
  | "notifications"
  | "categories"
  | "tags"
  | "legal"
  | null;

export function SettingsView({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  tags,
  onAddTag,
  onDeleteTag,
  settings,
  onSettingsChange,
}: SettingsViewProps) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(
    "oklch(0.55 0.18 250)",
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryColor, setEditCategoryColor] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const [newTag, setNewTag] = useState("");
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [legalViewerOpen, setLegalViewerOpen] = useState(false);

  useEffect(() => {
    const currentTheme = settings?.theme || "light";
    const applyTheme = (isDark: boolean) => {
      document.documentElement.style.setProperty(
        "transition",
        "background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      );

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      setTimeout(() => {
        document.documentElement.style.removeProperty("transition");
      }, 500);
    };

    if (currentTheme === "dark") {
      applyTheme(true);
    } else if (currentTheme === "light") {
      applyTheme(false);
    } else if (currentTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const isDark = mediaQuery.matches;
      applyTheme(isDark);

      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, [settings?.theme]);

  const toggleSection = (section: ExpandedSection) => {
    if (settings?.hapticFeedback) triggerHaptic("light");
    if (settings?.buttonSounds) playButtonSound();
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    onAddCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName("");
    setNewCategoryColor("oklch(0.55 0.18 250)");
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    if (!editCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    onUpdateCategory(
      editingCategory.id,
      editCategoryName.trim(),
      editCategoryColor,
    );
    setEditingCategory(null);
    toast.success("Category updated");
  };

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;
    onDeleteCategory(deletingCategory.id);
    setDeletingCategory(null);
  };

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error("Please enter a tag name");
      return;
    }
    if (tags.includes(newTag.trim().toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }
    onAddTag(newTag.trim().toLowerCase());
    setNewTag("");
  };

  const handleDeleteTag = () => {
    if (!deletingTag) return;
    onDeleteTag(deletingTag);
    setDeletingTag(null);
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    if (!onSettingsChange || !settings) return;
    if (settings.hapticFeedback) triggerHaptic("medium");
    if (settings.buttonSounds) playButtonSound();
    onSettingsChange({ ...settings, theme });
    toast.success(`Theme changed to ${theme}`);
  };

  const handleHapticToggle = (checked: boolean) => {
    if (!onSettingsChange || !settings) return;
    if (checked) triggerHaptic("medium");
    if (settings.buttonSounds) playButtonSound();
    onSettingsChange({ ...settings, hapticFeedback: checked });
    toast.success(`Haptic feedback ${checked ? "enabled" : "disabled"}`);
  };

  const handleSoundToggle = (checked: boolean) => {
    if (!onSettingsChange || !settings) return;
    if (settings.hapticFeedback) triggerHaptic("light");
    if (checked) playButtonSound();
    onSettingsChange({ ...settings, buttonSounds: checked });
    toast.success(`Button sounds ${checked ? "enabled" : "disabled"}`);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!onSettingsChange || !settings) return;
    const newVolume = value[0];
    setGlobalVolume(newVolume);
    onSettingsChange({ ...settings, soundVolume: newVolume });
  };

  const handleVolumeCommit = () => {
    if (settings?.buttonSounds) {
      playButtonSound();
    }
  };

  const handleNotificationsToggle = (checked: boolean) => {
    if (!onSettingsChange || !settings) return;
    if (settings.hapticFeedback) triggerHaptic("light");
    if (settings.buttonSounds) playButtonSound();
    onSettingsChange({ ...settings, notificationsEnabled: checked });
    toast.success(`Notifications ${checked ? "enabled" : "disabled"}`);
  };

  const handleNotificationSoundChange = (
    sound: "chime" | "bell" | "ding" | "none",
  ) => {
    if (!onSettingsChange || !settings) return;
    if (settings.hapticFeedback) triggerHaptic("light");
    if (settings.buttonSounds) playButtonSound();
    onSettingsChange({ ...settings, notificationSound: sound });
  };

  const handleNotificationAdvanceChange = (value: number[]) => {
    if (!onSettingsChange || !settings) return;
    const newAdvance = value[0];
    onSettingsChange({ ...settings, notificationAdvance: newAdvance });
  };

  const handleNotificationVolumeChange = (value: number[]) => {
    if (!onSettingsChange || !settings) return;
    const newVolume = value[0];
    onSettingsChange({ ...settings, notificationVolume: newVolume });
  };

  const currentTheme = settings?.theme || "light";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Customize your experience
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-8">
          <Card className="overflow-hidden divide-y divide-border">
            <motion.button
              onClick={() => toggleSection("appearance")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-4 w-4 text-primary" weight="fill" />
                </div>
                <span className="font-medium text-[15px]">Appearance</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === "appearance" ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <CaretRight
                  className="h-5 w-5 text-muted-foreground"
                  weight="bold"
                />
              </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedSection === "appearance" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden bg-muted/20"
                >
                  <div className="px-4 py-4 space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Theme Mode
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={
                          currentTheme === "light" ? "default" : "outline"
                        }
                        size="sm"
                        className="flex flex-col items-center gap-1.5 h-auto py-3"
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="h-4 w-4" weight="fill" />
                        <span className="text-xs font-medium">Light</span>
                      </Button>
                      <Button
                        variant={
                          currentTheme === "dark" ? "default" : "outline"
                        }
                        size="sm"
                        className="flex flex-col items-center gap-1.5 h-auto py-3"
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="h-4 w-4" weight="fill" />
                        <span className="text-xs font-medium">Dark</span>
                      </Button>
                      <Button
                        variant={
                          currentTheme === "system" ? "default" : "outline"
                        }
                        size="sm"
                        className="flex flex-col items-center gap-1.5 h-auto py-3"
                        onClick={() => handleThemeChange("system")}
                      >
                        <Desktop className="h-4 w-4" weight="fill" />
                        <span className="text-xs font-medium">System</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Card className="overflow-hidden divide-y divide-border">
            <motion.button
              onClick={() => toggleSection("feedback")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                  <Vibrate className="h-4 w-4 text-accent" weight="fill" />
                </div>
                <span className="font-medium text-[15px]">
                  Feedback & Sounds
                </span>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === "feedback" ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <CaretRight
                  className="h-5 w-5 text-muted-foreground"
                  weight="bold"
                />
              </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedSection === "feedback" &&
                settings &&
                onSettingsChange && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden bg-muted/20"
                  >
                    <div className="px-4 py-3 divide-y divide-border/50">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                            <Vibrate
                              className="h-3.5 w-3.5 text-accent"
                              weight="fill"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="haptic-toggle"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Haptic Feedback
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Vibration on interactions
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="haptic-toggle"
                          checked={settings.hapticFeedback ?? true}
                          onCheckedChange={handleHapticToggle}
                        />
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                            <SpeakerHigh
                              className="h-3.5 w-3.5 text-primary"
                              weight="fill"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="sound-toggle"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Button Sounds
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Subtle audio feedback
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="sound-toggle"
                          checked={settings.buttonSounds ?? true}
                          onCheckedChange={handleSoundToggle}
                        />
                      </div>

                      {settings.buttonSounds && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="py-3 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                                {(settings.soundVolume ?? 0.5) === 0 ? (
                                  <SpeakerSlash
                                    className="h-3.5 w-3.5 text-primary"
                                    weight="fill"
                                  />
                                ) : (
                                  <SpeakerHigh
                                    className="h-3.5 w-3.5 text-primary"
                                    weight="fill"
                                  />
                                )}
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Sound Volume
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(
                                    (settings.soundVolume ?? 0.5) * 100,
                                  )}
                                  %
                                </p>
                              </div>
                            </div>
                          </div>
                          <Slider
                            value={[settings.soundVolume ?? 0.5]}
                            onValueChange={handleVolumeChange}
                            onValueCommit={handleVolumeCommit}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </Card>

          <Card className="overflow-hidden divide-y divide-border">
            <motion.button
              onClick={() => toggleSection("notifications")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                  <Bell className="h-4 w-4 text-accent" weight="fill" />
                </div>
                <span className="font-medium text-[15px]">Notifications</span>
              </div>
              <motion.div
                animate={{
                  rotate: expandedSection === "notifications" ? 90 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <CaretRight
                  className="h-5 w-5 text-muted-foreground"
                  weight="bold"
                />
              </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedSection === "notifications" &&
                settings &&
                onSettingsChange && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden bg-muted/20"
                  >
                    <div className="px-4 py-3 divide-y divide-border/50">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                            {settings.notificationsEnabled ? (
                              <Bell
                                className="h-3.5 w-3.5 text-accent"
                                weight="fill"
                              />
                            ) : (
                              <BellSlash
                                className="h-3.5 w-3.5 text-accent"
                                weight="fill"
                              />
                            )}
                          </div>
                          <div>
                            <Label
                              htmlFor="notifications-toggle"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Task Reminders
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Alert before due date
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="notifications-toggle"
                          checked={settings.notificationsEnabled ?? false}
                          onCheckedChange={handleNotificationsToggle}
                        />
                      </div>

                      {settings.notificationsEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="py-3 space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                                <PlayCircle
                                  className="h-3.5 w-3.5 text-primary"
                                  weight="fill"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-sm font-medium">
                                  Notification Sound
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Choose alert tone
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 pl-10">
                              {(["chime", "bell", "ding", "none"] as const).map(
                                (sound) => (
                                  <Button
                                    key={sound}
                                    variant={
                                      (settings.notificationSound ??
                                        "chime") === sound
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className="flex flex-col items-center gap-1 h-auto py-2.5 text-xs capitalize"
                                    onClick={() =>
                                      handleNotificationSoundChange(sound)
                                    }
                                  >
                                    {sound}
                                  </Button>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                                  <Bell
                                    className="h-3.5 w-3.5 text-primary"
                                    weight="fill"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Advance Notice
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {settings.notificationAdvance ?? 30} minutes
                                    before
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Slider
                              value={[settings.notificationAdvance ?? 30]}
                              onValueChange={handleNotificationAdvanceChange}
                              min={5}
                              max={120}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                              <span>5min</span>
                              <span>30min</span>
                              <span>60min</span>
                              <span>120min</span>
                            </div>
                          </div>

                          {settings.notificationSound !== "none" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                                    <SpeakerHigh
                                      className="h-3.5 w-3.5 text-primary"
                                      weight="fill"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Alert Volume
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {Math.round(
                                        (settings.notificationVolume ?? 0.7) *
                                          100,
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Slider
                                value={[settings.notificationVolume ?? 0.7]}
                                onValueChange={handleNotificationVolumeChange}
                                min={0}
                                max={1}
                                step={0.01}
                                className="w-full"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </Card>

          <Card className="overflow-hidden divide-y divide-border">
            <motion.button
              onClick={() => toggleSection("categories")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80">
                  <FolderOpen
                    className="h-4 w-4 text-secondary-foreground"
                    weight="fill"
                  />
                </div>
                <span className="font-medium text-[15px]">Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {categories.length}
                </span>
                <motion.div
                  animate={{
                    rotate: expandedSection === "categories" ? 90 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <CaretRight
                    className="h-5 w-5 text-muted-foreground"
                    weight="bold"
                  />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedSection === "categories" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden bg-muted/20"
                >
                  <div className="px-4 py-3 space-y-2 max-h-[500px] overflow-y-auto">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-card/50 border border-border/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="h-6 w-6 rounded-full border border-border flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-sm truncate">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditCategory(category)}
                            >
                              <PencilSimple
                                className="h-3.5 w-3.5"
                                weight="bold"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash
                                className="h-3.5 w-3.5 text-destructive"
                                weight="bold"
                              />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/50 space-y-3 sticky bottom-0 bg-muted/20">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Add Category
                      </Label>
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddCategory()
                        }
                        className="h-9 text-sm"
                      />
                      <ColorPicker
                        selectedColor={newCategoryColor}
                        onColorChange={setNewCategoryColor}
                        label="Color"
                      />
                      <Button
                        onClick={handleAddCategory}
                        className="w-full"
                        size="sm"
                      >
                        <Plus weight="bold" className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Card className="overflow-hidden divide-y divide-border">
            <motion.button
              onClick={() => toggleSection("tags")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                  <Tag className="h-4 w-4 text-accent" weight="fill" />
                </div>
                <span className="font-medium text-[15px]">Tags</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {tags.length}
                </span>
                <motion.div
                  animate={{ rotate: expandedSection === "tags" ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CaretRight
                    className="h-5 w-5 text-muted-foreground"
                    weight="bold"
                  />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedSection === "tags" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden bg-muted/20"
                >
                  <div className="px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No tags yet. Create your first tag below.
                        </p>
                      ) : (
                        tags.map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1.5 rounded-full bg-accent/20 pl-3 pr-2 py-1.5 text-xs font-medium"
                          >
                            <Tag className="h-3 w-3" weight="fill" />
                            {tag}
                            <motion.button
                              onClick={() => setDeletingTag(tag)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" weight="bold" />
                            </motion.button>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/50 space-y-2 sticky bottom-0 bg-muted/20">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Add Tag
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tag name"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button onClick={handleAddTag} size="sm">
                          <Plus weight="bold" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Dialog
            open={!!editingCategory}
            onOpenChange={(open) => !open && setEditingCategory(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the category name and color
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <ColorPicker
                  selectedColor={editCategoryColor}
                  onColorChange={setEditCategoryColor}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateCategory}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={!!deletingCategory}
            onOpenChange={(open) => !open && setDeletingCategory(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingCategory?.name}"?
                  Tasks in this category will be moved to the first available
                  category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCategory}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={!!deletingTag}
            onOpenChange={(open) => !open && setDeletingTag(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the tag "{deletingTag}"? This
                  will remove it from all tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTag}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Card className="overflow-hidden">
            <motion.button
              onClick={() => {
                if (settings?.hapticFeedback) triggerHaptic("light");
                if (settings?.buttonSounds) playButtonSound();
                setLegalViewerOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Scales className="h-4 w-4 text-primary" weight="fill" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-[15px] block">
                    Legal & Privacy
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Terms, policies & agreements
                  </span>
                </div>
              </div>
              <CaretRight
                className="h-5 w-5 text-muted-foreground"
                weight="bold"
              />
            </motion.button>
          </Card>
        </div>
      </ScrollArea>

      <LegalViewer open={legalViewerOpen} onOpenChange={setLegalViewerOpen} />
    </motion.div>
  );
}
