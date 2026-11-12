# Privacy

Study Companion stores routines, checkins, temporary todos, interval records, daily accumulation entries, countdowns and preferences in a SQLite database on your computer. JSON backups contain the same personal information. Imported local theme images are copied into the selected data directory. Background music files are selected locally.

The application does not provide accounts, cloud synchronization, advertising, analytics or telemetry. It does not upload records or imported themes. Notifications and optional launch at login use Windows features; the global quick-add shortcut works only while the app is running.

Opening a source or documentation link launches your normal browser, whose own privacy policy applies. Downloading dependencies and installing or building the application contacts package hosts; this is separate from normal offline use.

Use Settings to open your data folder, export a backup, restore a validated backup, or relocate data to a new empty folder. Relocation retains the original folder. Returning to the original artwork retains imported theme files. To erase personal records, exit the application and remove the chosen data folder and any separately saved backup copies yourself.

NSIS-installed builds keep their default data in `%APPDATA%\StudyCompanion\data` and their durable location profile in `%APPDATA%\StudyCompanion\study-profile.json`, outside the installation directory. Upgrades and uninstalling leave this data and profile in place. Portable and unpacked builds keep data and the profile next to the launcher unless relocated. Relocated data and exported backups also remain after uninstalling. Keep a backup before uninstalling or upgrading. The source-export script and public application builds exclude user data and user-imported artwork. Built-in Chiikawa theme assets are part of the selected distribution and carry separate rights notices.
