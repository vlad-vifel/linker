# CLAUDE.md — Linker

## What It Is

Personal vault of links and short notes with tags. Data used to live in a Telegram chat (`<url> #tag #tag !`, `!` = favorite); it is migrated once by a script, after that the app is the only place the data is kept.

## Core Principle

**Privacy first.** Entries are sensitive. No data (URL, tags, notes) ever leaves the device: no analytics, no external APIs, no link-preview services, no CDN fonts/scripts. Never add a network call that carries user data. The only server is the local dev server on `localhost`.

## Stack

- Vue 3 + Vite + TypeScript, Pinia, vue-router
- Tailwind CSS v4 + shadcn-vue (reka-ui, lucide-vue-next)
- Vitest
- npm, single app
- Desktop: `npm run dev`, file I/O through a Vite dev-server middleware (Node `fs`), works in any browser (Firefox is the main one)
- Android (after MVP): Capacitor APK, jks signing, GitHub Releases, in-app updates. No PWA, no `vite-plugin-pwa`

## Reference Projects

- `C:\Users\vladv\Documents\github\ambient-motion` — Vue + shadcn-vue: design, components, mobile layout, eslint/prettier/husky setup
- `C:\Users\vladv\Documents\github\spotistorage` — React + shadcn: mobile layout, bottom nav, onboarding wizard, library cards in Settings, Android app, release flow

Copy design language, tokens and component structure from them; don't invent a new style. Dark theme only.

## Mobile First

Develop mobile layout first; user checks it in browser mobile emulation. Desktop layout is secondary.

## Storage

- A storage = one JSON file `<name>.linker.json` at a user-chosen path. The file is the single source of truth
- On open, the file is read fully into memory; filtering/search work in memory. Every change autosaves (debounced ~300 ms). Write failure → visible error bar with Retry, in-memory changes kept
- File is pretty-printed (2 spaces)
- `StorageAdapter` interface with two implementations: `local-server` (desktop, by path) and `android` (Capacitor, later)
- App settings (storage list, active storage) live in `localStorage`. Active storage is restored on start
- Missing file / no access / invalid JSON → storage error screen: Locate file, Restore from backup, Remove from list. A broken file is never overwritten
- On app focus: if file mtime is newer than loaded → reload
- Backups: folder `linker-backups/` next to the file, `<name>-YYYY-MM-DD_HH-mm.linker.json` (local time). Auto: first change of a day, skipped if any backup of that day exists (manual included). Manual: Settings → Backup → Make backup (confirm dialog shows the file name). Kept: all backups of the last 14 days that have backups; older days are deleted. Old `<name>-YYYY-MM-DD` files are still recognized
- `version`: file newer than app → refuse with "Update the app"; older → backup, migrate, save
- Removing a storage never deletes the file. The app never deletes storage files

## Data Format

```json
{
  "format": "linker",
  "version": 2,
  "name": "main",
  "createdAt": "2026-10-14T00:00:00Z",
  "tags": {
    "top": { "label": null }
  },
  "links": [
    {
      "id": "tg-1234",
      "url": "https://example.com/a",
      "tags": ["top"],
      "favorite": true,
      "note": null,
      "createdAt": "2023-05-12T14:03:11Z",
      "updatedAt": "2023-05-12T14:03:11Z"
    }
  ],
  "presets": [
    { "id": "uuid", "name": null, "tags": ["top"], "favorite": true }
  ]
}
```

- `url` and `note` are nullable, at least one must be set. Tags may be empty. No tag hierarchy
- Ids: `tg-<msgId>[-n]` from migration, uuid for new entries
- Tag key: lowercase, latin/cyrillic/digits/`_`, leading `#` stripped, no spaces, must contain at least one letter or digit, unique. `label` optional, shown instead of the key
- Tag key rename updates all entries and presets; renaming to an existing key merges into it (warning shown, no duplicate tags on an entry, target label kept)
- Tag delete: "Delete tag only" (removed from entries) or "Delete tag and entries"; presets lose the tag too
- Optional `noTagLabel` (default `no tag`): label of the virtual "no tag" option, editable in Settings → Tags
- URL input: trim, add `https://` if no scheme. Duplicate check ignores `http`/`https`, `www.`, trailing `/`; URL stored as entered
- Duplicates: latest wins, the older entry is replaced (no merge)
- Merge of storages: same URL → later `updatedAt` wins; tags added to dictionary, existing labels kept; presets with a taken name or tags+favorite combination are skipped
- Presets: optional `name`, `tags` (may be the virtual "no tag"), `favorite`. At least one tag or favorite. The tags+favorite combination and a non-empty name (case-insensitive) are unique. Version 1 files get empty `presets` on load

## Telegram Migration

One-time script `npm run migrate -- <result.json> [out] [name]` (`scripts/telegram-to-linker.ts`, logic in `src/core/telegram/`): `result.json` → `main.linker.json` + console report (messages, entries, tags, duplicates, skipped and why). No Telegram import in the UI. Tested with Vitest on the anonymized export and fake fixtures. Rules (from analysis of the real 5.7k-message chat):

- Only `link` entities exist (no `text_link`), but support both
- Tags: `#hashtag` entities plus old-style plain words that match the hashtag dictionary (`lol`, `top`, `fut top`); other plain text → `note`. Tags in parentheses count (`#top (#fut)`)
- `!` in plain text → `favorite`
- Multi-link message: tags right after a link belong to it; tags only at the start or only at the end apply to every link
- Messages without links become text-only entries (text → `note`)
- Skip `service` messages and messages without text (files only)
- Date from `date_unixtime`, ISO UTC; `updatedAt` = `createdAt`
- Ignore `from`, `reply_to_message_id`, `edited`, `reactions`

## UI

App language: English. Bottom nav (icons only) with four full pages: **Links**, **Presets**, **Add**, **Settings**.

- Controls (buttons, inputs, selects) are `h-12` with `size-5` icons; small icon buttons (star, ⋯) stay small. Text scale is shifted two steps up in `src/style.css`
- Dialogs (`AppDialog`): fullscreen on mobile, title + X in one header row, actions in footer. Small confirm dialogs stay centered
- Tags are white chips showing label, or key if no label. Tag lists (picker, Settings → Tags): `label [key chip] (count)`
- Buttons next to inputs have the same height; outline buttons share the input background/border; text and icons white, only placeholders gray. Inactive states use solid gray tokens, no opacity. Destructive actions = outline with red text and icon
- Paths are chosen with Browse (native folder/file dialog via the local server); the input stays editable

### Links (home)
- Page title "Links" above the sticky toolbar. Random button (dice) next to search: picks a random entry from the filtered feed, scrolls to it, then highlights the row (0.5 s fade-in to the tap color, 3 s hold, 0.5 s fade-out)
- Toasts appear at the bottom above the nav
- Tags are always shown by usage (desc); in the picker selected tags go right after "no tag"
- Always shows the feed (no filter required), newest first
- Header: tag multiselect + favorite toggle + sort toggle (outline icon buttons, same height as inputs); search input below (URL and note, case-insensitive)
- Tag multiselect: trigger shows selected tags as white chips, X clears them (chevron when empty); picker dialog with search, rows `label [key chip] (count)` + plain check icon on the right when selected; AND logic only; sorted by usage; virtual "no tag" option clears other tags and vice versa
- Counter `1,234 entries` above the feed; empty state "No entries match" + Clear filters
- Filters reset on restart; saved filters live on the Presets page
- All entries in memory, feed renders in chunks of 50 on scroll
- Row: left column vertically centered, 1–3 single-line rows of equal height: domain + path, tag chips (not clickable) + gray note-icon chip if the entry has a note; the note text itself is shown only for entries without URL (one line, `…`). Divider below the sticky header. Right column: star + gray ⋯, date below (`dd.mm.yy`)
- Tap: URL → open in new tab (`noopener noreferrer`; on Android via system intent); text-only → View dialog. No long press
- Tag chips in a row and in the tag select trigger never wrap: one line, horizontal scroll
- ⋯ menu: View, Edit, Copy link, Delete (confirm dialog)

### View (dialog)
Read-only, same order as the form: favorite indicator (filled star, only if favorite), full URL, tags (clickable → feed filtered by tag), note, dates `dd.mm.yy, HH:MM`. Footer, full-width buttons: Edit, Save preset (becomes "Go to preset" if the tags+favorite combination exists; hidden without tags and favorite), Delete entry.

### Presets (`/presets`; add/edit in a dialog)
- Order = array order in `presets`. Pencil button next to "Add preset" enters edit mode: ⋯ becomes a drag handle, fixed Save button at the bottom. "Go to preset" highlights the card like the random entry
- Cards: name (if any), star, tag chips (no count), ⋯ (Edit, Delete with confirm). Full-width "Add preset" button under the title. Tap → Links with tags + favorite set, search cleared, sort kept
- Add/Edit dialog: name (optional) + outline star, tag multiselect (with "no tag", creatable). Save disabled with an error when empty, name taken ("Name already used. Change the name") or combination taken (with Open existing)
- "Save preset" on View opens the add dialog prefilled with the entry's tags and favorite. No such button on Links
- Tag rename/merge/delete updates presets; presets left empty or duplicated are dropped

### Add / Edit (same form; Add is a page `/add`, Edit is a dialog)
- URL, note (auto-growing textarea), tag multiselect with search; typing a non-existing key shows "Create tag "<key>"", favorite star icon button
- Duplicate URL warning: yellow callout at the end of the form, "Already saved. date, time", tags, note, no buttons. The footer Save splits into Open existing + Save anyway (replaces old)
- After Add: form clears, toast "Saved". After Edit: dialog closes

### Settings (collapsible sections; only Storages expanded by default; collapse state not saved)
1. **Storages**: storage cards (name, green `Active` chip, entry count, path in gray), tap = make active, ⋯ = Export, Rename, Remove from list (confirm "File stays on disk"). "Add storage" below the cards:
   - Create new: name + folder (file `<name>.linker.json` created there)
   - Import file: pick `.linker.json` (checked automatically), then "Use as storage" (default; name field only if the file has no name) or "Merge into" + storage select (file not added to list). A file already in the list → "Already added"
2. **Backup**: last backup date and time, Make backup, Restore from backup (dialog: backup cards → `Selected` chip + warning → Cancel / Restore)
3. **Tags**: "Add tag" (dialog: key, label), search + sort toggle (usage desc/asc), "no tag" row always first (label only), rows `label [key chip] count`, tap → edit dialog (title with count; key, label, merge, delete)
4. **PIN** (Off by default): Set PIN (enter + repeat) / Remove PIN (current PIN required)
5. **About**: version

### Onboarding (no storages yet)
Welcome (local-only data) → Create new / Import file → optional PIN step (Skip) → feed.

### Security
- Optional 4-digit PIN, asked on every cold start (lock screen with on-screen keypad, keyboard digits work too). Stored in `localStorage` as PBKDF2-SHA256 hash + salt (`src/core/security`), never the PIN itself. 5 wrong attempts → 30 s wait, counter persisted. Forgotten PIN → clear app data (storage files stay)
- Android: app preview in Recents is hidden (`setRecentsScreenshotEnabled(false)`, API 33+); screenshots inside the app still work

## After MVP

Capacitor APK (file via SAF, jks, releases, updates), Android share target "Save to Linker", blur on app switch + PIN, encryption (WebCrypto AES-GCM + PBKDF2), folder picker dialog, link previews (no third-party services).

## Code Rules

1. **No comments** unless the WHY is truly non-obvious (workaround, hidden constraint)
2. Everything super brief: short code, short answers, no speculative features
3. Prefer simple solutions and incremental changes; read existing code before modifying
4. Component approach to the maximum: no long pages, compose from small components
5. Per component group (same directory): types in `types.ts`, functions in `utils.ts`, constants in `const.ts`. `src/types` only for cross-domain types
6. Prefer an existing shared component / shadcn-vue primitive over hand-rolled native elements
7. `<script setup>` order: imports and contracts → state/computed → functions → lifecycle; watchers next to the state they coordinate
8. Tailwind scale text sizes (`text-sm`, …), no arbitrary sizes unless strictly necessary; use design tokens, no hardcoded hex
9. Prettier: 4 spaces, single quotes, printWidth 100, trailing commas, LF (same as ambient-motion)
10. Don't launch a browser for verification unless asked — user tests UI themselves
11. Before each stage: short plan; after: short summary of what was done
12. Real data is never committed. `.gitignore` excludes `data/`, `exports/`, `*.telegram.json`, `result.json`, `*.linker.json`, `linker-backups/`. Only fake fixtures in `fixtures/`

## Git Commits

**Never commit, push, merge, tag or rewrite history unless the user explicitly asks.**

Only `feat:` or `fix:` prefix. English, ~10 words max, no body, no AI attribution (no Co-Authored-By, no "Generated with").

```
feat: add telegram import
fix: keep manual edits on reimport
```

## Release Notes

Each release has `.github/release-notes/v{version}.md`, the body of the GitHub Release (`.github/workflows/release.yml`, on `v*` tag, builds the signed APK). Bump `version` in `package.json` and `package-lock.json` in the same change; Android `versionName`/`versionCode` derive from it.

Rules: English, no heading, start with a bold section label, then a short bullet list. One line per change, user-facing wording, no implementation details or file names. Sections in order: `**Features**`, `**Fixes & improvements**`. En-dash (–), not em-dash.

## Project Structure

```
server/fsApi.ts          # Vite dev middleware: POST /api/fs/{read,stat,write,backup,backups}, only *.linker.json
scripts/                 # telegram-to-linker.ts, anonymize-telegram.mjs
fixtures/                # fake test data (+ local anonymized storage, git-ignored)
src/core/format/         # pure TS, import from `@/core/format`: store (parse), url, tags, presets, transforms (rename/delete/merge)
src/core/telegram/       # Telegram export parser + tests — pure TS
src/core/security/        # PIN hashing (WebCrypto PBKDF2) and attempt lockout, pure TS
src/core/storage/        # StorageAdapter + local-server implementation
src/stores/              # storages (list in localStorage), vault (file lifecycle, autosave), entries, tags, presets, feed (filters)
src/composables/         # useStorageActions, useAsyncAction, useLongPress, useRouteEntry, useGoBack
src/components/<domain>/ # layout, links, entry, tags, presets, storage, settings, common, ui (shadcn-vue)
src/views/               # thin pages
```

## Work Order

1. ✅ Project skeleton
2. ✅ Data types, validation, `local-server` storage adapter + middleware, backups
3. ✅ Telegram migration script + tests
4. ✅ MVP UI: onboarding, Links, View, Add/Edit, Settings (user testing)
5. ✅ Presets page
6. Capacitor APK (debug via USB first); ✅ release pipeline (CI, signed APK, notes); in-app updates later
