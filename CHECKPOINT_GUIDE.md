# Checkpoint Guide - CubeSolver

This project uses a checkpoint-based recovery system to handle session interruptions.

## Directory Structure

```
.checkpoint/
├── progress.json     # Phase and task completion status
└── decisions.json    # Key technical decisions log
```

## Recovery Process

### If session fails/exits:

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Check current progress:**
   ```bash
   cat .checkpoint/progress.json
   ```

3. **Find current phase:**
   Look for `"status": "in_progress"` under `phases`

4. **Check decisions if needed:**
   ```bash
   cat .checkpoint/decisions.json
   ```

## Progress Tracking

### Phase Status Values:
- `pending` - Not started
- `in_progress` - Currently working
- `completed` - Finished

### Manual Update:

Edit `.checkpoint/progress.json` to update status.

## Git Commit Strategy

Commits are tagged by phase:
- `[PHASE-1]` Project setup
- `[PHASE-2]` Cube data model
- `[PHASE-3]` Three.js renderer
- `[PHASE-4]` Animation system
- `[PHASE-5]` Solver implementation
- `[PHASE-6]` Large N optimization
- `[PHASE-7]` UI polish
- `[PHASE-8]` Finalization

## Quick Status Check

```bash
# Show last commit and phase
git log -1 --pretty=%B

# Show all phase commits
git log --grep="PHASE" --oneline
```