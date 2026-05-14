import { printLogsHint, services, startService } from "./demo-lib.mjs";
import { pathToFileURL } from "node:url";

export async function startDemoServices() {
  console.log("[demo] Starting backend and frontend on fixed ports");
  await startService(services.backend);
  await startService(services.frontend);

  console.log("[demo] Demo services are ready");
  console.log("[demo] Backend:  http://localhost:4000");
  console.log("[demo] Frontend: http://localhost:3001");
  console.log("[demo] Swagger:  http://localhost:4000/api/docs");
  printLogsHint();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startDemoServices().catch((error) => {
    console.error(`[demo] ${error.message}`);
    process.exit(1);
  });
}
