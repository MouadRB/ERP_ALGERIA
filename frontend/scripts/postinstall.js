const { spawnSync } = require("child_process");

const userAgent = process.env.npm_config_user_agent || "";
const isPnpm = userAgent.includes("pnpm");

if (isPnpm) {
  console.log("Postinstall: detected pnpm, skipping nested install.");
  process.exit(0);
}

const result = spawnSync(
  "corepack",
  ["pnpm", "install", "--frozen-lockfile"],
  { stdio: "inherit", shell: true }
);

process.exit(result.status ?? 1);
