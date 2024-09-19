# @infinit-xyz/cli

![Statements](https://img.shields.io/badge/statements-51.64%25-red.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-35.54%25-red.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-54.5%25-red.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-51.59%25-red.svg?style=flat)


To install dependencies:

```bash
bun install
```

To build CLI:

```bash
bun run dev
```

To run CLI:
```bash
bunx infinit
```

This project was created using `bun init` in bun v1.1.4.


## Contribution Guide

This guide outlines the conventions for creating branches, writing commit messages, and submitting pull requests to ensure a clean and consistent workflow.

## Branch Naming Convention

Branches should be named using the following format to indicate the purpose of the changes:


### PR Types

- **feat**: New feature or functionality
- **fix**: Bug fix
- **chore**: Minor improvements, documentation updates, or non-functional changes
- **refactor**: Code restructuring without changing behavior
- **test**: Adding or updating tests
- **style**: Code style improvements

### Additional Details

- **Module**: Specify the module or area of the code affected.
- **Breaking Changes**: Add `!` after the type if the changes are breaking and affect backward compatibility.

### Examples

- `feat(auth): add user login functionality`
- `fix(api): correct data fetching bug`
- `chore(docs): update API documentation`
- `refactor(core)!: restructure service layer for improved performance`
- `test(auth): add tests for login feature`
- `style(ui): enhance button styling`

## Merging Process

- Always use **Squash and Merge** when merging PRs to maintain a clean and streamlined commit history.

## Summary

Following these guidelines helps maintain a consistent and organized codebase, making collaboration smoother for everyone. Thank you for your contributions and commitment to improving the project!

Happy coding! 🚀

