$files = @("supabase/functions/customer-intelligence/index.ts", "supabase/functions/customer-intelligence/tools.ts", "supabase/functions/customer-intelligence/persona.ts")
foreach ($f in $files) {
    $content = Get-Content $f
    $clean = $content | Where-Object { $_ -notmatch '^\s*//' -and $_ -notmatch '^\s*$' }
    $clean = $clean -join "`n"
    $clean = $clean -replace '/\*[\s\S]*?\*/', ''
    Set-Content "$f.clean" $clean
}
