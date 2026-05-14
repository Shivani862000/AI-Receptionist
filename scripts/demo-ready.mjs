import { repoRoot, runCommand } from "./demo-lib.mjs";
import { startDemoServices } from "./demo-start.mjs";

async function main() {
  await startDemoServices();

  runCommand(
    "Running demo-day start and verify flow",
    "node",
    ["scripts/demo-verify.mjs"],
    repoRoot,
  );
}

main().catch((error) => {
  console.error(`[demo] ${error.message}`);
  process.exit(1);
});
