module.exports = {
  apps: [
    {
      name: "ai-receptionist-backend",
      cwd: "/opt/ai-receptionist/backend",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env_file: ".env.production"
    },
    {
      name: "ai-receptionist-frontend",
      cwd: "/opt/ai-receptionist/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001 -H 0.0.0.0",
      instances: 1,
      exec_mode: "fork",
      env_file: ".env.production"
    }
  ]
};
