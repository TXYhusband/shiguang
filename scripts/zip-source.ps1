param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$Destination,
  [string]$VerifyAndExtractTo = ''
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination }
$studySource = (Resolve-Path -LiteralPath $Source).Path.TrimEnd('\')
$studyArchive = [System.IO.Compression.ZipFile]::Open($Destination,[System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($studyFile in Get-ChildItem -LiteralPath $studySource -File -Recurse) {
    $studyEntry = $studyFile.FullName.Substring($studySource.Length + 1).Replace('\','/')
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($studyArchive,$studyFile.FullName,$studyEntry,[System.IO.Compression.CompressionLevel]::Optimal)
  }
} finally { $studyArchive.Dispose() }
if ($VerifyAndExtractTo) {
  $studyRoot = [System.IO.Path]::GetFullPath($VerifyAndExtractTo).TrimEnd('\') + '\'
  $studyArchive = [System.IO.Compression.ZipFile]::OpenRead($Destination)
  try {
    foreach ($studyEntry in $studyArchive.Entries) {
      if ($studyEntry.FullName.Contains('\')) { throw 'ZIP paths must use forward slashes.' }
      $studyTarget = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($studyRoot,$studyEntry.FullName))
      if (-not $studyTarget.StartsWith($studyRoot,[System.StringComparison]::OrdinalIgnoreCase)) { throw 'ZIP entry escapes its extraction folder.' }
    }
  } finally { $studyArchive.Dispose() }
  [System.IO.Compression.ZipFile]::ExtractToDirectory($Destination,$VerifyAndExtractTo)
}
