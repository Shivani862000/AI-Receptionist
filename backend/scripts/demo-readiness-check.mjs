import { spawn } from "node:child_process";

const tasks = [
  {
    label: "API smoke",
    command: "node",
    args: ["scripts/api-smoke-test.mjs"]
  },
  {
    label: "Realtime smoke",
    command: "node",
    args: ["scripts/realtime-smoke-test.mjs"]
  }
];

async function runTask(task) {
  console.log(`\n[demo-check] Starting ${task.label}`);

  return new Promise((resolve, reject) => {
    const child = spawn(task.command, task.args, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env
    });

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`[demo-check] ${task.label} passed`);
        resolve();
        return;
      }

      reject(new Error(`${task.label} failed with exit code ${code}`));
    });
  });
}

async function main() {
  for (const task of tasks) {
    await runTask(task);
  }

  console.log("\n[demo-check] All Step 12 checks passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
