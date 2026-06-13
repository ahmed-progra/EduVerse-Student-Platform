Write-Output "=== Server Health Check ==="
$urls = @(
  "http://localhost:3000",
  "http://localhost:3000/dashboard",
  "http://localhost:3000/auth/login"
)
foreach ($url in $urls) {
  try {
    $resp = Invoke-WebRequest -Uri $url -TimeoutSec 20 -UseBasicParsing
    Write-Output ("OK " + $url + " -> " + $resp.StatusCode)
  } catch {
    Write-Output ("FAIL " + $url + " -> " + $_.Exception.Message)
  }
}
