# UserPromptSubmit Hook — Life. App
# Runs on every user follow-up message during an active Cline task.
# Use this for mid-task guardrails and contextual reminders.

try {
    $rawInput = [Console]::In.ReadToEnd()
    $input = $null
    if ($rawInput) {
        $input = $rawInput | ConvertFrom-Json
    }
} catch {
    @{
        cancel              = $false
        contextModification = ""
        errorMessage        = ""
    } | ConvertTo-Json -Compress
    exit 0
}

# ── Extract the user's follow-up prompt ─────────────────────────
$prompt = ""
if ($input -and $input.PSObject.Properties["task"]) {
    $prompt = $input.task
} elseif ($input -and $input.PSObject.Properties["prompt"]) {
    $prompt = $input.prompt
} elseif ($input -and $input.PSObject.Properties["message"]) {
    $prompt = $input.message
}
$promptLower = $prompt.ToLower()

# ── Safety: block dangerous mid-task instructions ───────────────
$blocked = @(
    "delete app.jsx",
    "rewrite app.jsx from scratch",
    "rm -rf",
    "drop all tables",
    "delete the database",
    "remove node_modules and package",
    "reset the repo",
    "force push",
    "git push --force"
)

foreach ($phrase in $blocked) {
    if ($promptLower.Contains($phrase)) {
        @{
            cancel              = $true
            contextModification = ""
            errorMessage        = "BLOCKED: Your message contains a dangerous instruction ('$phrase'). Remove it and resubmit, or edit .clinerules/hooks/UserPromptSubmit.ps1 to allow it."
        } | ConvertTo-Json -Compress
        exit 0
    }
}

# ── Build contextual reminders based on what the user is asking ─
$context = ""

# Remind about validation when user says "done", "finish", "ship it", "commit", etc.
$finishWords = @("done", "finish", "ship it", "commit", "push", "deploy", "wrap up", "that's it", "looks good", "merge")
foreach ($word in $finishWords) {
    if ($promptLower.Contains($word)) {
        $context += @"
`nBEFORE FINISHING: Run these checks:
1. npm run lint — fix any errors
2. npm run build — confirm it succeeds
3. Verify no console errors in the browser
4. Test on 375px width (iPhone SE) for mobile layout
5. Test both light and dark mode
"@
        break
    }
}

# Remind about incremental changes when user asks for big rewrites
$rewriteWords = @("rewrite", "redo", "start over", "rebuild", "from scratch")
foreach ($word in $rewriteWords) {
    if ($promptLower.Contains($word)) {
        $context += "`n`nREMINDER: Do NOT rewrite src/App.jsx from scratch. Make incremental, targeted changes only. Extract pieces into new files if needed, but preserve existing working code."
        break
    }
}

# Add momentum bug warning if mentioned
if ($promptLower.Contains("momentum")) {
    $context += "`n`nKNOWN BUG: src/systems/momentumEngine.js has infinite recursion — withSuggestion() -> deriveMomentumSnapshot() -> normalizeMomentumState() -> withSuggestion(). Fix this circular chain before using any momentum functions."
}

# Add styling reminders
if ($promptLower.Contains("style") -or $promptLower.Contains("css") -or $promptLower.Contains("color") -or $promptLower.Contains("theme") -or $promptLower.Contains("dark mode")) {
    $context += "`n`nSTYLING REMINDER: Use t.* (theme-aware) values, not hardcoded C.* colors. Test both light and dark mode. Consolidate inline styles into src/index.css where possible."
}

# Add auth reminders
if ($promptLower.Contains("auth") -or $promptLower.Contains("login") -or $promptLower.Contains("sign in") -or $promptLower.Contains("register") -or $promptLower.Contains("password")) {
    $context += "`n`nAUTH REMINDER: Auth flows (doGoogleSignIn, doEmailSignIn, doRegister) live in src/App.jsx. Supabase client is in src/supabaseClient.js. Always handle errors with user-facing messages. Never silently fail."
}

# Add mobile reminders
if ($promptLower.Contains("mobile") -or $promptLower.Contains("responsive") -or $promptLower.Contains("phone") -or $promptLower.Contains("screen") -or $promptLower.Contains("layout")) {
    $context += "`n`nMOBILE REMINDER: Test 320px-430px widths. Minimum 44px touch targets. Respect iOS safe areas with env(safe-area-inset-*). The scroll container is .life-main-scroll — never add overflow to body/html."
}

# Add split/refactor reminders
if ($promptLower.Contains("split") -or $promptLower.Contains("extract") -or $promptLower.Contains("refactor") -or $promptLower.Contains("separate")) {
    $context += "`n`nREFACTOR REMINDER: Use React Context (src/context/AppContext.js) to share state between extracted components. Extract one piece at a time. Run npm run build between each extraction."
}

# Add dependency warning
if ($promptLower.Contains("install") -or $promptLower.Contains("npm add") -or $promptLower.Contains("npm i ") -or $promptLower.Contains("new package") -or $promptLower.Contains("dependency")) {
    $context += "`n`nDEPENDENCY WARNING: Do NOT add new npm dependencies unless absolutely necessary. The app uses React 19, Supabase, and Vite only. Solve problems with existing tools first."
}

# ── Return ──────────────────────────────────────────────────────
@{
    cancel              = $false
    contextModification = $context
    errorMessage        = ""
} | ConvertTo-Json -Compress
