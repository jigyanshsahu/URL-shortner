#!/usr/bin/env node

import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import figlet from "figlet";
import boxen from "boxen";
const rawApiUrl = process.env.URL_SHORTENER_API_URL || "https://url-shortner-z8dx.onrender.com";
const API_URL = rawApiUrl.trim().replace(/\/+$/, "");


function displayBanner() {
    console.log(
        chalk.cyan.bold(
            figlet.textSync("URL Shortener", {
                horizontalLayout: "fitted",
            })
        )
    );
    console.log(chalk.gray("  ⚡ URL Shortener CLI\n"));
}

function generateCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

function normalizeUrl(input) {
    if (!input) return null;
    let trimmed = input.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = "https://" + trimmed;
    }
    try {
        const parsed = new URL(trimmed);
        return parsed.href;
    } catch {
        return null;
    }
}


async function shortenUrl(targetUrl) {
    const spinner = ora("Creating short URL...").start();
    try {
        const response = await fetch(`${API_URL}/api/urls/public`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl }),
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errData = await response.json();
                throw new Error(errData.error || `Server responded with status ${response.status}`);
            }
            throw new Error(`Server returned HTTP ${response.status} (${response.statusText}). Could not reach API at ${API_URL}`);
        }

        const data = await response.json();
        spinner.succeed(chalk.green("Short URL created successfully!"));
        console.log(boxen(
            `${chalk.bold("Short URL:   ")} ${chalk.cyan.bold(data.shortUrl)}\n` +
            `${chalk.bold("Original:    ")} ${chalk.white(data.originalUrl)}`,
            { padding: 1, borderStyle: "round", borderColor: "green" }
        ));
    } catch (error) {
        spinner.fail(chalk.red("Failed to shorten URL"));
        console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    }
}

async function runInteractivePrompt() {
    let continueLoop = true;

    while (continueLoop) {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "url",
                message: "Enter URL to shorten:",
                validate: (input) => {
                    if (!input || !input.trim()) {
                        return "Please provide a valid URL.";
                    }
                    const normalized = normalizeUrl(input);
                    if (!normalized) {
                        return "Invalid URL format. Please enter a valid address (e.g. google.com or https://example.com).";
                    }
                    return true;
                },
            },
        ]);

        const targetUrl = normalizeUrl(answers.url);
        await shortenUrl(targetUrl);

        const { again } = await inquirer.prompt([
            {
                type: "confirm",
                name: "again",
                message: "Do you want to shorten another URL?",
                default: false,
            },
        ]);

        continueLoop = again;
        if (continueLoop) {
            console.log();
        }
    }

    console.log(chalk.gray("\nGoodbye! 👋\n"));
}

async function main() {
    displayBanner();

    const args = process.argv.slice(2);
    const rawUrl = args[0] === "shorten" ? args[1] : args[0];

    if (rawUrl) {
        // Direct argument mode
        const validatedUrl = normalizeUrl(rawUrl);
        if (!validatedUrl) {
            console.error(chalk.red.bold("✗ Error: ") + chalk.red(`"${rawUrl}" is not a valid URL.\n`));
            process.exitCode = 1;
            return;
        }
        await shortenUrl(validatedUrl);
    } else {
        // Interactive prompt mode
        await runInteractivePrompt();
    }
}

main();