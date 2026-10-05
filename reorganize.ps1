# Moves the frontend files into grouped folders. Run once, from the repo root
# (the folder that contains package.json and src\):
#
#     powershell -ExecutionPolicy Bypass -File .\reorganize.ps1
#
# It creates folders, moves files, and removes three files that are replaced by
# smaller ones. Afterwards, copy in the new and changed files, then run: npm run build

$ErrorActionPreference = "Stop"
if (-not (Test-Path "src\App.tsx")) { throw "Run this from the frontend repo root (src\App.tsx not found)." }

$folders = @(
    "src\core",
    "src\layout",
    "src\agent",
    "src\evaluation",
    "src\evaluation\rule_based",
    "src\evaluation\llm_judge"
)
foreach ($folder in $folders) { New-Item -ItemType Directory -Force -Path $folder | Out-Null }

# Old location -> new location.
$moves = [ordered]@{
    "src\config.ts"                        = "src\core\config.ts"
    "src\lib\format.ts"                    = "src\core\format.ts"
    "src\api\sse.ts"                       = "src\agent\sse.ts"
    "src\hooks\useAgentRuns.ts"            = "src\agent\useAgentRuns.ts"
    "src\components\AskPanel.tsx"          = "src\agent\AskPanel.tsx"
    "src\components\AnswerText.tsx"        = "src\agent\AnswerText.tsx"
    "src\components\RunCard.tsx"           = "src\agent\RunCard.tsx"
    "src\components\StepsPanel.tsx"        = "src\agent\StepsPanel.tsx"
    "src\components\EvidencePanel.tsx"     = "src\agent\EvidencePanel.tsx"
    "src\components\EvaluationPanel.tsx"   = "src\evaluation\EvaluationPanel.tsx"
    "src\components\EvaluationSummary.tsx" = "src\evaluation\EvaluationSummary.tsx"
    "src\components\Verdict.tsx"           = "src\evaluation\Verdict.tsx"
    "src\components\Header.tsx"            = "src\layout\Header.tsx"
    "src\components\Intro.tsx"             = "src\layout\Intro.tsx"
    "src\components\Inspector.tsx"         = "src\layout\Inspector.tsx"
}
foreach ($move in $moves.GetEnumerator()) {
    if (Test-Path $move.Key) {
        Move-Item -Path $move.Key -Destination $move.Value
        Write-Host "moved    $($move.Key) -> $($move.Value)"
    } elseif (Test-Path $move.Value) {
        Write-Host "in place $($move.Value)"
    } else {
        Write-Host "MISSING  $($move.Key)"
    }
}

# These three are split into smaller files that arrive with the new files:
#   api\client.ts            -> core\http.ts, agent\api.ts, evaluation\api.ts
#   types.ts                 -> agent\types.ts, evaluation\types.ts
#   hooks\useBackendStatus.ts -> core\backendStatus.ts
$replaced = @("src\api\client.ts", "src\types.ts", "src\hooks\useBackendStatus.ts")
foreach ($file in $replaced) {
    if (Test-Path $file) { Remove-Item $file; Write-Host "removed  $file" }
}

# Old folders, removed only if they are now empty.
foreach ($folder in @("src\api", "src\hooks", "src\lib", "src\components")) {
    if ((Test-Path $folder) -and -not (Get-ChildItem -Path $folder -Force)) {
        Remove-Item $folder
        Write-Host "removed  $folder"
    } elseif (Test-Path $folder) {
        Write-Host "KEPT     $folder (it still has files in it)"
    }
}

Write-Host "`nDone. Now copy in the new and changed files, then run: npm run build"
