# 定义语言和它们的起始行（起始行是 "  语言: {" 所在的行）
$languages = @{
    'en' = @{Start=37; End=3130}
    'zh' = @{Start=3131; End=6223}
    'ru' = @{Start=6224; End=9259}
    'ar' = @{Start=9260; End=12285}
    'de' = @{Start=12286; End=15314}
    'ja' = @{Start=15315; End=18371}
    'fr' = @{Start=18372; End=21438}
    'es' = @{Start=21439; End=24505}
    'pt' = @{Start=24506; End=27523}
    'ko' = @{Start=27524; End=30541}
}

$sourceFile = 'd:\projects\Cursor\removeWaterFromPhoto\contexts\LanguageContext.tsx'
$outputDir = 'd:\projects\Cursor\removeWaterFromPhoto\contexts\languages'

# 读取源文件的所有行
$lines = Get-Content -Path $sourceFile -Encoding UTF8

# 遍历每种语言
foreach ($lang in $languages.Keys) {
    $start = $languages[$lang].Start - 1  # PowerShell 数组索引从0开始
    $end = $languages[$lang].End - 1
    
    # 提取语言定义
    $langLines = $lines[$start..$end]
    
    # 去掉第一行（"  en: {"）和最后一行（"  }"）
    $contentLines = $langLines[1..($langLines.Length - 2)]
    
    # 添加导出语句并格式化
    $content = $contentLines -join "`n"
    $exportContent = "export default {$content`n}"
    
    # 写入文件（使用 UTF-8 with BOM 避免乱码）
    $outputFile = Join-Path $outputDir "$lang.ts"
    [System.IO.File]::WriteAllText($outputFile, $exportContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "Created $outputFile with $($contentLines.Count) lines"
}

Write-Host "All language files created successfully!"
