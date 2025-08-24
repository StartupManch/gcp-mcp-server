# Conventional Commits Guide

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification for automatic versioning and changelog generation.

## Commit Message Template

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Components Explained

- **type**: The kind of change (required)
- **scope**: What part of the codebase is affected (optional)
- **description**: Brief summary of the change (required)
- **body**: Detailed explanation of what and why (optional)
- **footer**: Breaking changes, issue references (optional)

## Commit Types

| Type         | Description              | Version Bump | Example                                    |
| ------------ | ------------------------ | ------------ | ------------------------------------------ |
| **feat**     | New feature              | Minor        | `feat(auth): add OAuth2 support`           |
| **fix**      | Bug fix                  | Patch        | `fix(api): resolve timeout in GCP calls`   |
| **docs**     | Documentation only       | None         | `docs: update installation guide`          |
| **style**    | Code style changes       | None         | `style: fix linting errors`                |
| **refactor** | Code refactoring         | None         | `refactor(utils): simplify error handling` |
| **perf**     | Performance improvements | Patch        | `perf(cache): optimize state management`   |
| **test**     | Adding/updating tests    | None         | `test(auth): add integration tests`        |
| **chore**    | Build/tooling changes    | None         | `chore: update dependencies`               |
| **ci**       | CI/CD changes            | None         | `ci: simplify GitHub Actions workflow`     |
| **revert**   | Revert previous commit   | None         | `revert: "feat: add experimental feature"` |

## Scopes (Project-Specific)

Common scopes for this GCP MCP Server project:

- **auth**: Authentication and authorization
- **api**: API endpoints and handlers
- **gcp**: Google Cloud Platform integrations
- **tools**: MCP tool implementations
- **config**: Configuration management
- **docker**: Docker and containerization
- **ci**: Continuous Integration
- **docs**: Documentation
- **types**: TypeScript type definitions
- **utils**: Utility functions and helpers

## Examples with Context

### Feature Addition

```
feat(gcp): add Cloud Storage bucket management

- Implement create, list, and delete bucket operations
- Add proper error handling for bucket operations
- Include integration tests for storage service

Closes #123
```

### Bug Fix

```
fix(auth): resolve token refresh race condition

The authentication token was being refreshed multiple times
simultaneously, causing API rate limiting issues.

Fixed by implementing a mutex lock around token refresh logic.

Fixes #456
```

### Breaking Change

```
feat(api)!: restructure tool response format

BREAKING CHANGE: Tool responses now use a standardized format
with consistent error codes. Update client implementations to
handle the new response structure.

Migration guide: docs/MIGRATION.md

Closes #789
```

### Documentation Update

```
docs(readme): add GCP service account setup instructions

Include step-by-step guide for creating and configuring
service accounts for local development.
```

### Chore/Maintenance

```
chore(deps): update @google-cloud packages to latest

- @google-cloud/compute: 6.1.0 → 6.2.0
- @google-cloud/storage: 7.16.0 → 7.17.0
- @google-cloud/logging: 11.1.0 → 11.2.0

No breaking changes in these updates.
```

## Quick Reference Template

Copy and customize this template for your commits:

```
<type>(<scope>): <short description>

<Detailed description of what and why>

<Footer with issue references, breaking changes, etc.>
```

## Tools and Automation

### Git Commit Template

Set up a git commit template to remind you of the format:

```bash
# Create commit template
cat > ~/.gitmessage << 'EOF'
# <type>(<scope>): <description>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
# Scopes: auth, api, gcp, tools, config, docker, ci, docs, types, utils
EOF

# Configure git to use the template
git config --global commit.template ~/.gitmessage
```

### Validation

This project uses semantic-release which automatically:

- ✅ Generates version numbers based on commit types
- ✅ Creates changelogs from commit messages
- ✅ Creates GitHub releases
- ✅ Updates package.json version

### Version Bumping Rules

| Commit Type                 | Version Impact        | Example          |
| --------------------------- | --------------------- | ---------------- |
| `fix:`                      | Patch (1.0.0 → 1.0.1) | Bug fixes        |
| `feat:`                     | Minor (1.0.0 → 1.1.0) | New features     |
| `BREAKING CHANGE:`          | Major (1.0.0 → 2.0.0) | Breaking changes |
| `docs:`, `style:`, `chore:` | No version bump       | Maintenance      |

## Best Practices

1. **Keep descriptions concise** (50 characters or less)
2. **Use imperative mood** ("add" not "added" or "adds")
3. **Reference issues** in footer when applicable
4. **Explain the why** in the body for complex changes
5. **Use breaking change footer** for incompatible changes
6. **Be consistent** with scopes across the project

## Common Patterns

```bash
# New GCP service integration
feat(gcp): add BigQuery dataset management tools

# Fix authentication issue
fix(auth): handle expired service account tokens

# Update documentation
docs(api): add tool usage examples

# Performance optimization
perf(cache): implement Redis caching for API responses

# Breaking API change
feat(api)!: redesign tool response format

# CI/CD improvements
ci: add automated security scanning

# Dependency updates
chore(deps): bump typescript to 5.9.2
```
