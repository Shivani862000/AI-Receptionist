import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const repoRoot = path.resolve(__dirname, "..");
export const demoDir = path.join(repoRoot, ".demo");
export const logsDir = path.join(demoDir, "logs");
export const pidsDir = path.join(demoDir, "pids");

export const services = {
  backend: {
    name: "backend",
    cwd: path.join(repoRoot, "backend"),
    command: "corepack",
    args: ["pnpm", "start:dev"],
    url: "http://127.0.0.1:4000/health",
    pidFile: path.join(pidsDir, "backend.pid"),
    logFile: path.join(logsDir, "backend.log"),
    env: {},
    processHints: ["nest start", "dist/main.js", "ai-receptionist-backend"],
  },
  frontend: {
    name: "frontend",
    cwd: path.join(repoRoot, "frontend"),
    command: "corepack",
    args: ["pnpm", "dev"],
    url: "http://127.0.0.1:3001",
    pidFile: path.join(pidsDir, "frontend.pid"),
    logFile: path.join(logsDir, "frontend.log"),
    env: {
      PORT: "3001",
      HOSTNAME: "0.0.0.0",
    },
    processHints: ["next dev", "next start", "next-server", "server.js", "ai-receptionist-frontend"],
  },
};

export function ensureDemoDirs() {
  fs.mkdirSync(logsDir, { recursive: true });
  fs.mkdirSync(pidsDir, { recursive: true });
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readPid(pidFile) {
  if (!fs.existsSync(pidFile)) {
    return null;
  }

  const value = fs.readFileSync(pidFile, "utf8").trim();
  return value ? Number(value) : null;
}

export function isPidRunning(pid) {
  if (!pid || Number.isNaN(pid)) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function removePidFile(pidFile) {
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

export function ensureFreshPid(service) {
  const pid = readPid(service.pidFile);

  if (pid && !isPidRunning(pid)) {
    removePidFile(service.pidFile);
    return null;
  }

  return pid;
}

export async function waitForHttp(url, label, timeoutMs = 120000) {
  const startedAt = Date.now();
  let lastError = "unknown";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        headers: {
          "cache-control": "no-cache",
        },
      });

      if (response.ok) {
        return;
      }

      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }

    await sleep(2000);
  }

  throw new Error(`${label} did not become ready in time (${lastError})`);
}

export async function isHttpReachable(url, timeoutMs = 3000) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "cache-control": "no-cache",
      },
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export function spawnDetachedService(service) {
  ensureDemoDirs();

  const logStream = fs.openSync(service.logFile, "a");
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: {
      ...process.env,
      ...service.env,
    },
    detached: true,
    stdio: ["ignore", logStream, logStream],
  });

  child.unref();
  fs.writeFileSync(service.pidFile, String(child.pid));

  return child.pid;
}

export async function startService(service) {
  const existingPid = ensureFreshPid(service);

  if (existingPid) {
    console.log(`[demo] ${service.name} already running on pid ${existingPid}`);
    await waitForHttp(service.url, service.name);
    return existingPid;
  }

  if (await isHttpReachable(service.url)) {
    console.log(`[demo] ${service.name} already reachable at ${service.url}`);
    return null;
  }

  reclaimPortIfSafe(service);
  await sleep(1000);

  const pid = spawnDetachedService(service);
  console.log(`[demo] Started ${service.name} on pid ${pid}`);
  await waitForHttp(service.url, service.name);
  console.log(`[demo] ${service.name} ready at ${service.url}`);
  return pid;
}

export function stopService(service) {
  const pid = ensureFreshPid(service);

  if (!pid) {
    console.log(`[demo] ${service.name} is not running`);
    return;
  }

  process.kill(pid, "SIGTERM");
  removePidFile(service.pidFile);
  console.log(`[demo] Stopped ${service.name} pid ${pid}`);
}

export function runCommand(label, command, args, cwd = repoRoot, extraEnv = {}) {
  console.log(`[demo] ${label}`);

  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

export function printLogsHint() {
  console.log(`[demo] Backend log: ${services.backend.logFile}`);
  console.log(`[demo] Frontend log: ${services.frontend.logFile}`);
}

function getPortFromUrl(url) {
  return Number(new URL(url).port);
}

function runQuiet(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function listPortPids(port) {
  const result = runQuiet("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);

  if (result.status !== 0 || !result.stdout.trim()) {
    return [];
  }

  return result.stdout
    .trim()
    .split("\n")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}

function readPidCommand(pid) {
  const result = runQuiet("ps", ["-p", String(pid), "-o", "command="]);
  return result.status === 0 ? result.stdout.trim() : "";
}

function canTakeOverPort(service, command) {
  return service.processHints.some((hint) => command.includes(hint));
}

export function reclaimPortIfSafe(service) {
  const port = getPortFromUrl(service.url);
  const pids = listPortPids(port);

  if (pids.length === 0) {
    return;
  }

  const unknown = [];

  for (const pid of pids) {
    const command = readPidCommand(pid);

    if (!canTakeOverPort(service, command)) {
      unknown.push({ pid, command });
      continue;
    }

    process.kill(pid, "SIGTERM");
    console.log(`[demo] Freed ${service.name} port ${port} by stopping pid ${pid}`);
  }

  if (unknown.length > 0) {
    const details = unknown.map((item) => `${item.pid}: ${item.command || "unknown process"}`).join(", ");
    throw new Error(
      `${service.name} port ${port} is occupied by a non-demo process. Stop it manually first (${details})`,
    );
  }
}
