# Git Revert Guide — SVU Booking

Every session's work is committed to the `session-4` branch. You can safely roll back to any point in the history below.

---

## Commit history (newest → oldest)

| Hash | What's in it |
|------|-------------|
| `42ed9f5` | Public site — events, tickets, school groups, enquire, Humanitix support |
| `9ba3889` | Swinburne branding — red accent, logo, Open Sans |
| `1483094` | SVU photography, homepage redesign |
| `7331bc7` | All admin nav pages, fix /admin/events |
| `1365138` | Events table fix, bookings schema, conflict detection |
| `5731c44` | Apple-polish design, admin bookings/users/events pages |
| `1bc53ee` | Login, admin dashboard, staff booking flow |
| `65f7f8e` | Initial commit |

---

## How to revert

### Option 1 — Preview an old version (safe, nothing is lost)

This checks out an old commit to look at it. Your current work is untouched on your branch.

```bash
# Step into the old version
git checkout 1bc53ee

# When you're done looking, go back to the latest
git checkout session-4
```

---

### Option 2 — Undo the last commit (keep your file changes)

Use this if the last commit was a mistake but you want to keep your edits.

```bash
git reset --soft HEAD~1
```

Your files stay as they are — only the commit is removed. You can re-commit when ready.

---

### Option 3 — Undo the last commit and discard the changes

Use this to completely throw away the last commit and all its file changes.

```bash
git reset --hard HEAD~1
```

> ⚠️ This is permanent. The changes are gone.

---

### Option 4 — Roll back to a specific commit (keep everything after it too)

This is the safest way to undo a specific commit without rewriting history. It creates a new commit that reverses the changes.

```bash
# Revert a specific commit by hash
git revert 42ed9f5

# Follow the prompt to confirm the revert commit message
```

Your full history is preserved — this just adds an "undo" on top.

---

### Option 5 — Hard reset to a specific point (full rollback)

Use this to completely go back to an earlier state. Everything after that commit is gone.

```bash
# Replace HASH with the commit you want to go back to
git reset --hard 1bc53ee
```

> ⚠️ This is destructive. Only use it if you're certain.

---

## Quick reference

| Goal | Command |
|------|---------|
| See all commits | `git log --oneline` |
| Preview old version | `git checkout <hash>` |
| Go back to latest | `git checkout session-4` |
| Undo last commit (keep files) | `git reset --soft HEAD~1` |
| Undo last commit (discard files) | `git reset --hard HEAD~1` |
| Safely undo a specific commit | `git revert <hash>` |
| Full rollback to a point | `git reset --hard <hash>` |
| See what changed in a commit | `git show <hash>` |
| See uncommitted changes | `git diff` |

---

## If something goes wrong

Git keeps a log of everything — even resets. If you reset too far and need to get back, run:

```bash
git reflog
```

This shows every position HEAD has been at. Copy the hash you want and:

```bash
git checkout <hash>
```
