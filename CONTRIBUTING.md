# Contributing

Use Node.js 24 on Windows. Run `npm ci`, `npm test`, `npm run build` and relevant isolated Electron tests before proposing a change. Test data belongs in `.cache`; set `STUDY_DATA_DIR` to an isolated folder. Never run tests against your normal application data.

Preserve version-1 SQLite/JSON compatibility. Changes to routine templates must keep dated history; pending todos must keep their original source date. Imports must validate before replacement, keep a recovery backup and never overwrite invalid state. Add focused behavioral tests for data changes.

Keep the default app independent of private artwork and accounts. Do not commit personal databases, backups, profile paths, copyrighted theme packs, generated releases or cache files. Theme roles must be allowlisted and served through the restricted local protocol; do not expose arbitrary local file URLs to renderers.

Run `npm run source:verify` to test an export without private art. Distribute only the source-export ZIP or reviewed tracked files, not the entire working directory. The project uses MIT for original code and art; keep third-party notices and identify the source and license of any new dependency or asset.
