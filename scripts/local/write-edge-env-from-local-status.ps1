$ErrorActionPreference = 'Stop'

$localSupabaseUrl = 'http://127.0.0.1:54321'
$outputPath = Join-Path $env:TEMP 'vsm-store-local-edge.env'

function Get-FirstEnvironmentValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $processValue = [Environment]::GetEnvironmentVariable($Name, 'Process')
  if (-not [string]::IsNullOrWhiteSpace($processValue)) {
    return $processValue
  }

  $userValue = [Environment]::GetEnvironmentVariable($Name, 'User')
  if (-not [string]::IsNullOrWhiteSpace($userValue)) {
    return $userValue
  }

  return $null
}

function ConvertTo-YesNo {
  param([bool]$Value)
  if ($Value) { return 'YES' }
  return 'NO'
}

$geminiApiKey = Get-FirstEnvironmentValue -Name 'GEMINI_API_KEY'
if ([string]::IsNullOrWhiteSpace($geminiApiKey)) {
  Write-Host 'GEMINI_API_KEY: NO'
  Write-Error 'GEMINI_API_KEY is missing from process/user environment. Set it first, then open a new terminal.'
  exit 1
}

$anthropicApiKey = Get-FirstEnvironmentValue -Name 'ANTHROPIC_API_KEY'

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$statusOutput = & npx supabase status -o env 2>&1
$statusExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

$statusText = ($statusOutput | Out-String)
$vars = @{}
foreach ($line in ($statusText -split "`r?`n")) {
  if ($line -match '^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$') {
    $name = $matches[1]
    $value = $matches[2].Trim().Trim('"').Trim("'")
    $vars[$name] = $value
  }
}

$anonKey = $null
if ($vars.ContainsKey('SUPABASE_ANON_KEY')) {
  $anonKey = $vars['SUPABASE_ANON_KEY']
} elseif ($vars.ContainsKey('ANON_KEY')) {
  $anonKey = $vars['ANON_KEY']
} elseif ($vars.ContainsKey('PUBLISHABLE_KEY')) {
  $anonKey = $vars['PUBLISHABLE_KEY']
}

$serviceRoleKey = $null
if ($vars.ContainsKey('SUPABASE_SERVICE_ROLE_KEY')) {
  $serviceRoleKey = $vars['SUPABASE_SERVICE_ROLE_KEY']
} elseif ($vars.ContainsKey('SERVICE_ROLE_KEY')) {
  $serviceRoleKey = $vars['SERVICE_ROLE_KEY']
} elseif ($vars.ContainsKey('SECRET_KEY')) {
  $serviceRoleKey = $vars['SECRET_KEY']
}

$missing = @()
if ([string]::IsNullOrWhiteSpace($anonKey)) { $missing += 'SUPABASE_ANON_KEY' }
if ([string]::IsNullOrWhiteSpace($serviceRoleKey)) { $missing += 'SUPABASE_SERVICE_ROLE_KEY' }

if ($missing.Count -gt 0) {
  Write-Host "GEMINI_API_KEY: $(ConvertTo-YesNo -Value $true)"
  Write-Host "ANTHROPIC_API_KEY: $(ConvertTo-YesNo -Value (-not [string]::IsNullOrWhiteSpace($anthropicApiKey)))"
  Write-Host "SUPABASE_URL: $(ConvertTo-YesNo -Value $true)"
  Write-Host "SUPABASE_ANON_KEY: $(ConvertTo-YesNo -Value (-not [string]::IsNullOrWhiteSpace($anonKey)))"
  Write-Host "SUPABASE_SERVICE_ROLE_KEY: $(ConvertTo-YesNo -Value (-not [string]::IsNullOrWhiteSpace($serviceRoleKey)))"
  Write-Host "VITE_SUPABASE_URL: $(ConvertTo-YesNo -Value $true)"
  Write-Host "VITE_SUPABASE_ANON_KEY: $(ConvertTo-YesNo -Value (-not [string]::IsNullOrWhiteSpace($anonKey)))"
  Write-Error "Missing required local Supabase values from 'npx supabase status -o env': $($missing -join ', ')"
  exit 1
}

$contentArray = @(
  "GEMINI_API_KEY=$geminiApiKey",
  "SUPABASE_URL=$localSupabaseUrl",
  "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey",
  "VITE_SUPABASE_URL=$localSupabaseUrl",
  "VITE_SUPABASE_ANON_KEY=$anonKey"
)

if (-not [string]::IsNullOrWhiteSpace($anthropicApiKey)) {
  $contentArray += "ANTHROPIC_API_KEY=$anthropicApiKey"
}

$content = $contentArray -join "`n"
$content = "$content`n"

[System.IO.File]::WriteAllText($outputPath, $content, [System.Text.UTF8Encoding]::new($false))

$bytes = [System.IO.File]::ReadAllBytes($outputPath)
$hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF

Write-Host "GEMINI_API_KEY: $(ConvertTo-YesNo -Value (-not [string]::IsNullOrWhiteSpace($geminiApiKey)))"
Write-Host "SUPABASE_URL: YES"
Write-Host "SUPABASE_SERVICE_ROLE_KEY: YES"
Write-Host "VITE_SUPABASE_URL: YES"
Write-Host "VITE_SUPABASE_ANON_KEY: YES"
Write-Host "LOCAL_SUPABASE_URL_FORCED: YES"
Write-Host "UTF8_BOM_PRESENT: $(ConvertTo-YesNo -Value $hasBom)"
Write-Host "OUTPUT_FILE: $outputPath"
Write-Host "SUPABASE_STATUS_EXIT_CODE: $statusExitCode"
Write-Host 'SECRET_VALUES_PRINTED: NO'
