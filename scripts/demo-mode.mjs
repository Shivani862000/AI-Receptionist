import { repoRoot, runCommand } from "./demo-lib.mjs";
import { startDemoServices } from "./demo-start.mjs";

async function main() {
  runCommand(
    "Seeding backend demo data",
    "corepack",
    ["pnpm", "prisma:seed"],
    `${repoRoot}/backend`,
  );

  await startDemoServices();

  runCommand(
    "Running full demo mode verification",
    "npm",
    ["run", "qa:demo"],
    `${repoRoot}/backend`,
    {
      FRONTEND_URL: "http://localhost:3001",
      REALTIME_BASE_URL: "http://localhost:4000",
      SMOKE_TEST_ALLOW_FRONTEND_FAILURE: "false",
    },
  );

  console.log("[demo] Demo mode is ready for the client walkthrough");
}

main().catch((error) => {
  console.error(`[demo] ${error.message}`);
  process.exit(1);
});
