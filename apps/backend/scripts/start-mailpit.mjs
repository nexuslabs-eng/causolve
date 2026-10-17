import { spawn } from "node:child_process";
import { resolve } from "node:path";

process.loadEnvFile(resolve(process.cwd(), ".env.test"));

const mailpitBin = process.env.MAILPIT_BIN;

if (!mailpitBin)
    throw new Error("MAILPIT_BIN is missing from apps/backend/.env.test");

const mailpit = spawn(mailpitBin, [], {
    stdio: "inherit",
    windowsHide: false,
});

mailpit.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code ?? 0);
});