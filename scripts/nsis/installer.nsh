; This marker is created only by the installed NSIS build, never in portable/unpacked builds.
; The application routes installed data and its profile to %APPDATA%\StudyCompanion.
!macro customInstall
  FileOpen $0 "$INSTDIR\.study-installed" w
  FileWrite $0 "nsis-v1$\r$\n"
  FileClose $0
!macroend
