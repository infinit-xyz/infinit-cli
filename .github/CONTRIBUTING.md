# Contribution Guide

This guide outlines the conventions for creating branches, writing commit messages, and submitting pull requests to ensure a clean and
consistent workflow.

## Table of Contents

1. [Branch Naming Convention](#branch-naming-convention)
2. [Pull Request Checklist](#pull-request-checklist)
3. [Versioning](#versioning)
4. [Code of Conduct](#code-of-conduct)

## Branch Naming Convention

Branches should be named using the following format to indicate the purpose of the changes:

### PR Types

- **feat**: New feature or functionality
- **fix**: Bug fix
- **chore**: Minor improvements, documentation updates, or non-functional changes
- **refactor**: Code restructuring without changing behavior
- **test**: Adding or updating tests

### Additional Details

- **Module**: Specify the module or area of the code affected.
- **Breaking Changes**: Add `!` after the type if the changes are breaking and affect backward compatibility.

### Examples

- `feat(core): callback for transaction event`
- `fix(test): correct fork chain bug`
- `chore(docs): update schema example documentation`
- `refactor(core)!: restructure service layer for improved performance`
- `test(core): add tests for callback`

## Pull Request Checklist

Before submitting a pull request, please ensure:

- [ ] The code compiles without errors.
- [ ] All tests pass.
- [ ] The code follows the project's style guidelines.
- [ ] Documentation has been updated if necessary.
- [ ] A changeset has been created if the changes affect the package version.

## Merging Process

- Always use **Squash and Merge** when merging PRs to maintain a clean and streamlined commit history.

## Versioning

We use [Changesets](https://github.com/changesets/changesets) to help manage versioning and release.

Run the following command to create a changeset.

```
bun changeset
```

Select the packages: Choose the packages affected by your changes.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment.

## Summary

Following these guidelines helps maintain a consistent and organized codebase, making collaboration smoother for everyone. Thank you for
your contributions and commitment to improving the project!

Happy coding! 🚀
