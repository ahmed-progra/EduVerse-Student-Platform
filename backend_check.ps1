Write-Output "Checking backend..."
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:4000/api/courses' -TimeoutSec 10 -UseBasicParsing
  Write-Output ("Backend OK: " + $resp.StatusCode)
  Write-Output ("Response: " + $resp.Content.Substring(0, [Math]::Min(200, $resp.Content.Length)))
} catch {
  Write-Output ("Backend error: " + $_.Exception.Message)
}
