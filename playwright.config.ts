import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.WEB_PORT ?? 3007);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 60_000,
    expect: {
        timeout: 12_000,
    },
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 15_000,
        navigationTimeout: 45_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: [
        {
            command: "pnpm --filter @khanya/api dev",
            url: "http://localhost:4007/health",
            reuseExistingServer: true,
            timeout: 120_000,
            stdout: "ignore",
            stderr: "pipe",
        },
        {
            command: "pnpm --filter @khanya/web dev",
            url: baseURL,
            reuseExistingServer: true,
            timeout: 120_000,
            stdout: "ignore",
            stderr: "pipe",
        },
    ],
});
