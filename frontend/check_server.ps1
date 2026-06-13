Write-Output "Checking server..."
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 15 -UseBasicParsing
  Write-Output "Status: $($resp.StatusCode)"
  Write-Output "Content length: $($resp.Content.Length)"
} catch {
  Write-Output "Error: $($_.Exception.Message)"
}
