# Script para ejecutar MakerCycle en Android
$env:ANDROID_HOME = "D:\Android_SDK"
$env:ANDROID_SDK_ROOT = "D:\Android_SDK"
$env:JAVA_HOME = "D:\Android_Studio\jbr"
$env:Path = "$env:Path;D:\Android_SDK\platform-tools;D:\Android_SDK\emulator;D:\Android_Studio\jbr\bin"

Write-Host "Iniciando MakerCycle para Android..." -ForegroundColor Cyan

# Verificar si el emulador esta corriendo
$devices = & D:\Android_SDK\platform-tools\adb.exe devices
if ($devices -notmatch "emulator") {
    Write-Host "Iniciando emulador..." -ForegroundColor Yellow
    Start-Process -FilePath "D:\Android_SDK\emulator\emulator.exe" -ArgumentList "-avd Small_Phone" -WindowStyle Normal
    Write-Host "Esperando a que el emulador arranque..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
}

Write-Host "Compilando e instalando app..." -ForegroundColor Yellow

# Obtener el primer dispositivo conectado
$deviceList = & D:\Android_SDK\platform-tools\adb.exe devices
$deviceLine = ($deviceList -split "`n" | Where-Object { $_ -match "device$" } | Select-Object -First 1)
if ($deviceLine) {
    $deviceId = ($deviceLine -split "`t")[0].Trim()
    Write-Host "Usando dispositivo: $deviceId" -ForegroundColor Green
    npx cap run android --target $deviceId
} else {
    Write-Host "No se encontro ningun dispositivo. Ejecutando selector..." -ForegroundColor Yellow
    npx cap run android
}

Write-Host "Listo!" -ForegroundColor Green
