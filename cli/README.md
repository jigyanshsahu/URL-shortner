# ⚡ @jigyanshsahu/url-shortener-cli

[![npm version](https://img.shields.io/npm/v/@jigyanshsahu/url-shortener-cli.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@jigyanshsahu/url-shortener-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)

A lightweight, interactive command-line interface (CLI) to shorten URLs instantly using the **Scalable URL Shortener** service. Supports zero-install execution via `npx`, interactive prompt loops, and direct one-liner terminal workflows.

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
  - [Run with npx (Zero Install)](#1-run-with-npx-zero-install)
  - [Global Installation](#2-global-installation)
  - [Run from Source (Local Development)](#3-run-from-source-local-development)
- [Usage Guide](#-usage-guide)
  - [Interactive Mode](#interactive-mode)
  - [Direct Argument Mode](#direct-argument-mode)
  - [Subcommand Mode](#subcommand-mode)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Example Output](#-example-output)
- [Publishing to npm](#-publishing-to-npm)
- [Related Links](#-related-links)

---

## ✨ Features

- ⚡ **Zero-Install Execution**: Run on demand anywhere with `npx @jigyanshsahu/url-shortener-cli`.
- 💬 **Interactive Prompt Mode**: Step-by-step guided wizard powered by `inquirer` with multi-link looping.
- 🚀 **Direct Argument Mode**: Instant one-shot shortening ideal for shell scripts and terminal power users.
- 🛡️ **Intelligent URL Normalization**: Automatically handles protocol prefixing (`https://`) and strictly validates URL schemas.
- 🎨 **Rich Terminal Aesthetics**: Styled using `figlet`, `boxen`, `ora` loading spinners, and `chalk` color formatting.
- 🔌 **Configurable Endpoint**: Points to the live cloud API by default, with one-variable switching to a local backend instance.

---

## 🚀 Quick Start

### 1. Run with npx (Zero Install)

The fastest way to use the CLI without installing any packages globally:

```bash
# Launch interactive mode
npx @jigyanshsahu/url-shortener-cli

# Shorten directly in one command
npx @jigyanshsahu/url-shortener-cli https://example.com
```

---

### 2. Global Installation

Install the package globally to have the `urlshortener` binary always available in your system path:

```bash
npm install -g @jigyanshsahu/url-shortener-cli
```

Then invoke it anywhere:

```bash
# Interactive mode
urlshortener

# Direct mode
urlshortener https://example.com
```

---

### 3. Run from Source (Local Development)

If you are developing inside this repository:

```bash
# Navigate to the CLI directory
cd cli

# Install dependencies
npm install

# Start in interactive mode
npm start

# Or run directly with Node
node src/index.js https://example.com
```

---

## 📖 Usage Guide

### Interactive Mode

Run the CLI with no arguments to enter interactive mode:

```bash
urlshortener
```

1. Enter the URL you want to shorten (e.g. `github.com` or `https://example.com`).
2. The CLI validates and normalizes the URL, calls the shortener API, and displays the shortened URL inside a styled border box.
3. Confirm whether you want to shorten another link (`Y/n`) or exit cleanly (`Goodbye! 👋`).

---

### Direct Argument Mode

Pass the target URL directly as the first parameter:

```bash
urlshortener https://developer.mozilla.org/en-US/docs/Web/HTTP
```

---

### Subcommand Mode

The CLI also accepts an explicit `shorten` keyword:

```bash
urlshortener shorten https://nodejs.org
```

---

## ⚙️ Configuration & Environment Variables

By default, the CLI points to the live production deployment of the URL Shortener backend. You can override this to point to your local development server or custom deployment using `URL_SHORTENER_API_URL`.

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `URL_SHORTENER_API_URL` | `https://url-shortner-z8dx.onrender.com` | Base URL of the URL Shortener REST API |

### Targeting Local Backend

#### Linux / macOS / Git Bash:
```bash
URL_SHORTENER_API_URL="http://localhost:5000" npx @jigyanshsahu/url-shortener-cli https://example.com
```

#### Windows PowerShell:
```powershell
$env:URL_SHORTENER_API_URL="http://localhost:5000"; npx @jigyanshsahu/url-shortener-cli https://example.com
```

#### Windows Command Prompt (cmd.exe):
```cmd
set URL_SHORTENER_API_URL=http://localhost:5000
npx @jigyanshsahu/url-shortener-cli https://example.com
```

---

## 🖥️ Example Output

```text
  _   _ ____  _       ____  _                _                           
 | | | |  _ \| |     / ___|| |__   ___  _ __| |_ ___ _ __   ___ _ __     
 | | | | |_) | |     \___ \| '_ \ / _ \| '__| __/ _ \ '_ \ / _ \ '__|    
 | |_| |  _ <| |___   ___) | | | | (_) | |  | ||  __/ | | |  __/ |       
  \___/|_| \_\_____| |____/|_| |_|\___/|_|   \__\___|_| |_|\___|_|       
                                                                         
  ⚡ URL Shortener CLI

✔ Short URL created successfully!
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   Short URL:    https://url-shortner-z8dx.onrender.com/aB3x9Q│
│   Original:     https://example.com                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Publishing to npm

To release a new version of the CLI tool to npm:

1. **Update version** in `package.json`:
   ```bash
   npm version patch # or minor, major
   ```

2. **Login to npm** (if not authenticated):
   ```bash
   npm login
   ```

3. **Publish the package**:
   ```bash
   npm publish --access public
   ```

---

## 🔗 Related Links

- [Root Project Architecture & Documentation](../README.md)
- [Backend REST API Reference](../README.md#-rest-api-reference)
- [npm Package Registry](https://www.npmjs.com/package/@jigyanshsahu/url-shortener-cli)

---

## 📜 License

This project is licensed under the [MIT License](../LICENSE).
