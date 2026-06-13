$pages = @('/', '/dashboard', '/courses', '/leaderboard', '/shop', '/skill-tree', '/codelab', '/battle', '/placement-test', '/auth/login', '/auth/register', '/profile')
foreach ($page in $pages) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3000$page" -TimeoutSec 30 -UseBasicParsing
    Write-Output "$page -> $($resp.StatusCode) ($($resp.Content.Length) bytes)"
  } catch {
    Write-Output "$page -> ERROR: $($_.Exception.Message)"
  }
}
