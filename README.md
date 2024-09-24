![Infinit Logo](infinit.png)

# INFINIT CLI - Alpha

![NPM Version](https://img.shields.io/npm/v/@infinit-xyz/cli)
[![codecov](https://codecov.io/gh/infinit-xyz/infinit-cli/graph/badge.svg?token=OKQQJS6U4K)](https://codecov.io/gh/infinit-xyz/infinit-cli)

## Overview

Welcome to the **INFINIT CLI**, a powerful command-line tool designed to interact with the [INFINIT Library](https://github.com/infinit-xyz/infinit-library). This project is currently in **Alpha Release**, so features and interfaces are subject to change. We appreciate any feedback and contributions to help improve the project.

## Getting Started

To get started, follow the instructions below to install dependencies, build the CLI, and test it locally.

### Installation

To install the necessary dependencies, run the following command:

```bash
bun install
```

### Building the CLI

After installing dependencies, you can build the CLI by running:

```bash
bun run build
```

This will compile the project and make it ready for local testing and development.

## Local Testing

To test the CLI locally, follow these steps to create a new Node.js project and link the CLI package to your local environment.

### Step 1: Link the Local Package

First, link the local build of the CLI to your environment:

```bash
bun link
```

### Step 2: Create a New Project

Next, create a new project outside of the `@infinit-xyz/cli` directory:

```bash
bun init -y
```

### Step 3: Link the CLI Package

Once your new project is initialized, link the INFINIT CLI package to the project:

```bash
bun link @infinit-xyz/cli
```

You can now run the CLI commands from within your new project directory.

## Contributing

We welcome contributions! If you are interested in contributing to the INFINIT CLI, please refer to the guidelines in the [CONTRIBUTING.md](.github/CONTRIBUTING.md) file for instructions on how to get involved.

## Support & Feedback

If you encounter any issues or have feedback regarding the INFINIT CLI, feel free to open an issue on our GitHub repository or join the discussion with our community, [Discord](https://discord.com/invite/d24D5kjwj4) | [X](https://x.com/Infinit_Labs).


