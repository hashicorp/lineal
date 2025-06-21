# Release Process

This project uses [release-plan](https://github.com/release-plan/release-plan) for automated releases.

## How it works

1. **Label your PRs** - When creating or reviewing PRs, add one of these labels:
   - `breaking` - Major version bump (breaking changes)
   - `enhancement` - Minor version bump (new features)
   - `bug` - Patch version bump (bug fixes)
   - `documentation` - Patch version bump (docs changes)
   - `internal` - Patch version bump (internal changes, refactoring)

2. **Merge to main** - When PRs are merged to `main`, the `plan-release` workflow runs automatically.

3. **Review the Release PR** - `release-plan` creates a "Release Preview" PR with:
   - Updated `CHANGELOG.md`
   - Version bumps in `package.json`
   - A `.release-plan.json` file

4. **Merge to publish** - When the Release Preview PR is merged, the `publish` workflow:
   - Publishes to npm
   - Creates a GitHub release
   - Tags the release

## Manual release (if needed)

```bash
# Check what will be released
npx release-plan explain-plan

# Prepare the release (creates .release-plan.json, updates changelog)
npx release-plan prepare

# Publish (after merging the prepare PR)
npx release-plan publish
```

## Requirements

- `NPM_TOKEN` secret must be configured in GitHub repository settings for publishing
- PRs must be labeled before the release can be planned
