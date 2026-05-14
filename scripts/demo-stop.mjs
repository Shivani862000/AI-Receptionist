import { services, stopService } from "./demo-lib.mjs";

function main() {
  stopService(services.frontend);
  stopService(services.backend);
}

try {
  main();
} catch (error) {
  console.error(`[demo] ${error.message}`);
  process.exit(1);
}
