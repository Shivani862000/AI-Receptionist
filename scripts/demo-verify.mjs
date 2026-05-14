import { repoRoot, runCommand } from "./demo-lib.mjs";

function main() {
  runCommand(
    "Running Step 12 demo verification",
    "npm",
    ["run", "qa:demo"],
    `${repoRoot}/backend`,
    {
      FRONTEND_URL: "http://localhost:3001",
      REALTIME_BASE_URL: "http://localhost:4000",
      SMOKE_TEST_ALLOW_FRONTEND_FAILURE: "false",
    },
  );

  console.log("[demo] Verification passed");
}

try {
  main();
} catch (error) {
  console.error(`[demo] ${error.message}`);
  process.exit(1);
}
