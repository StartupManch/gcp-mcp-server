# Git Commit Template Setup

## Quick Setup

Run this command to set up the commit message template:

```bash
npm run setup-git
```

This configures git to use the `.gitmessage` template file for commit messages.

## Manual Setup

If you prefer to set it up manually:

```bash
git config commit.template .gitmessage
```

## Usage

After setup, when you run `git commit` (without `-m`), your editor will open with the template:

```
# <type>(<scope>): <description>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
# Scopes: auth, api, gcp, tools, config, docker, ci, docs, types, utils
```

Replace the placeholders with your actual commit information.

## Examples

### Simple feature commit:

```
feat(auth): add OAuth2 support
```

### Bug fix with details:

```
fix(api): resolve timeout in GCP calls

The timeout was occurring due to insufficient retry logic
when GCP services were temporarily unavailable.

Fixes #123
```

### Breaking change:

```
feat(api)!: restructure tool response format

BREAKING CHANGE: Tool responses now use standardized format.
See MIGRATION.md for upgrade instructions.

Closes #456
```

## See Also

- [CONVENTIONAL_COMMITS.md](./CONVENTIONAL_COMMITS.md) - Complete guide
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
