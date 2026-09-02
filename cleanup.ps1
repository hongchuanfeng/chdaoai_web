$file = 'd:\projects\Cursor\removeWaterFromPhoto\contexts\LanguageContext.tsx'
$lines = [System.IO.File]::ReadAllLines($file)
$keep = $lines[0..35]
$rest = $lines[30543..($lines.Length-1)]
$all = $keep + $rest
[System.IO.File]::WriteAllLines($file, $all)

