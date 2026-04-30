$tailscale = if ($env:MOBILE_CODEX_TAILSCALE) {
  $env:MOBILE_CODEX_TAILSCALE
} else {
  $c = 'C:\Program Files\Tailscale\tailscale.exe'
  $d = 'D:\Program Files\Tailscale\tailscale.exe'
  if (Test-Path $c) { $c } elseif (Test-Path $d) { $d } else { $c }
}

if (-not (Test-Path $tailscale)) {
  throw "Tailscale CLI not found: $tailscale. Set MOBILE_CODEX_TAILSCALE env var."
}

$status = & $tailscale status --json | ConvertFrom-Json

[PSCustomObject]@{
  BackendState = $status.BackendState
  LoggedIn = ($status.BackendState -eq 'Running')
  AuthURL = $status.AuthURL
  HostName = $status.Self.HostName
  DNSName = $status.Self.DNSName
  Health = ($status.Health -join '; ')
} | Format-List
