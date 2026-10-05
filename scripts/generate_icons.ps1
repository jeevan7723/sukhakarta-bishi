Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path 'assets\icons' | Out-Null

$srcPath = [System.IO.Path]::GetFullPath('assets\logo-emblem.png')
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Generate-PwaIcon($src, [int]$w, [int]$h, [string]$outPath, [double]$paddingPercent = 0.0, $bgColor = $null) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($bgColor -ne $null) {
        $brush = New-Object System.Drawing.SolidBrush $bgColor
        $g.FillRectangle($brush, 0, 0, $w, $h)
        $brush.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    $padX = [int]($w * $paddingPercent)
    $padY = [int]($h * $paddingPercent)
    $destW = $w - (2 * $padX)
    $destH = $h - (2 * $padY)

    $g.DrawImage($src, $padX, $padY, $destW, $destH)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $outPath ($($w)x$($h))"
}

# Standard transparent icons
Generate-PwaIcon $srcImg 192 192 'assets\icons\icon-192x192.png'
Generate-PwaIcon $srcImg 512 512 'assets\icons\icon-512x512.png'
Generate-PwaIcon $srcImg 180 180 'assets\icons\apple-touch-icon.png'
Generate-PwaIcon $srcImg 32 32 'assets\icons\icon-32x32.png'

# Maskable icons (padded with brand slate background #0f172a)
$brandBg = [System.Drawing.ColorTranslator]::FromHtml('#0f172a')
Generate-PwaIcon $srcImg 192 192 'assets\icons\icon-maskable-192x192.png' 0.12 $brandBg
Generate-PwaIcon $srcImg 512 512 'assets\icons\icon-maskable-512x512.png' 0.12 $brandBg

$srcImg.Dispose()
