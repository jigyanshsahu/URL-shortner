#!/usr/bin/env node

import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import figlet from "figlet";
import boxen from "boxen";
import crypto from "crypto";
import pool from "./db.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

function displayBanner() {
    console.log(
        chalk.cyan.bold(
            figlet.textSync("URL Shortener", {
                horizontalLayout: "fitted",
            })
        )
    );
    console.log(chalk.gray("  ⚡ Direct Database URL Shortener CLI\n"));
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
    const spinner = ora({
        text: "Connecting to database...",
        color: "cyan",
    }).start();

    let client;
    try {
        client = await pool.connect();

        spinner.text = "Checking database for existing URL...";

        // 1. Check if the URL already exists
        const existing = await client.query(
            "SELECT short_code, original_url FROM urls WHERE original_url = $1 LIMIT 1",
            [targetUrl]
        );

        if (existing.rows.length > 0) {
            const shortCode = existing.rows[0].short_code;
            const shortUrl = `${BASE_URL}/${shortCode}`;

            spinner.succeed(chalk.yellow("URL already shortened!"));

            const boxContent = [
                `${chalk.bold("Short URL:   ")} ${chalk.cyan.bold(shortUrl)}`,
                `${chalk.bold("Original:    ")} ${chalk.white(existing.rows[0].original_url)}`,
                `${chalk.bold("Redirects:   ")} ${chalk.green("Yes (HTTP 302 → Original)")}`,
            ].join("\n");

            console.log(
                boxen(boxContent, {
                    padding: 1,
                    margin: { top: 0, bottom: 1, left: 1, right: 1 },
                    borderStyle: "round",
                    borderColor: "yellow",
                    title: chalk.yellow.bold(" ⚡ Existing URL Found "),
                    titleAlignment: "center",
                })
            );
            return;
        }

        // 2. Generate unique code and insert
        spinner.text = "Creating short URL...";
        let shortCode;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            shortCode = generateCode(6);
            try {
                const result = await client.query(
                    `INSERT INTO urls (short_code, original_url)
                     VALUES ($1, $2)
                     RETURNING short_code, original_url`,
                    [shortCode, targetUrl]
                );

                const shortUrl = `${BASE_URL}/${result.rows[0].short_code}`;

                spinner.succeed(chalk.green("Short URL created successfully!"));

                const boxContent = [
                    `${chalk.bold("Short URL:   ")} ${chalk.cyan.bold(shortUrl)}`,
                    `${chalk.bold("Original:    ")} ${chalk.white(result.rows[0].original_url)}`,
                    `${chalk.bold("Redirects:   ")} ${chalk.green("Yes (HTTP 302 → Original)")}`,
                ].join("\n");

                console.log(
                    boxen(boxContent, {
                        padding: 1,
                        margin: { top: 0, bottom: 1, left: 1, right: 1 },
                        borderStyle: "round",
                        borderColor: "green",
                        title: chalk.green.bold(" ✓ Short URL Ready "),
                        titleAlignment: "center",
                    })
                );
                return;
            } catch (err) {
                if (err.code === "23505") {
                    attempts++;
                } else {
                    throw err;
                }
            }
        }

        throw new Error("Could not generate a unique short code after multiple attempts.");

    } catch (error) {
        spinner.fail(chalk.red("Failed to shorten URL"));
        console.error(chalk.red.bold("\n✗ Error: ") + chalk.red(error.message));

        if (error.code === "ECONNREFUSED" || error.message.includes("connect")) {
            console.error(
                chalk.yellow("\n💡 Could not connect to PostgreSQL database.") +
                chalk.gray("\n   Ensure the Docker database container is running:") +
                chalk.cyan("\n   docker compose -f backend/docker-compose.yml up -d\n")
            );
        }
    } finally {
        if (client) client.release();
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

    try {
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
    } finally {
        await pool.end();
    }
}

main();