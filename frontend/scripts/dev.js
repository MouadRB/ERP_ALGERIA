const { spawn, spawnSync } = require("child_process");
const net = require("net");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "apps", "web");
const bffDir = path.join(rootDir, "apps", "bff");
const isWindows = process.platform === "win32";

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.once("error", () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;

  while (!(await checkPort(port))) {
    port += 1;
  }

  return port;
}

function pipeWithPrefix(stream, target, prefix) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      target.write(`${prefix} ${line}\n`);
    }
  });

  stream.on("end", () => {
    if (buffer) {
      target.write(`${prefix} ${buffer}\n`);
    }
  });
}

function spawnDevProcess(label, cwd, env) {
  const child = isWindows
    ? spawn("cmd.exe", ["/d", "/s", "/c", "npm run dev"], {
        cwd,
        env: { ...process.env, ...env },
        stdio: ["inherit", "pipe", "pipe"],
        windowsHide: true,
      })
    : spawn("npm", ["run", "dev"], {
        cwd,
        env: { ...process.env, ...env },
        stdio: ["inherit", "pipe", "pipe"],
        windowsHide: true,
      });

  pipeWithPrefix(child.stdout, process.stdout, label);
  pipeWithPrefix(child.stderr, process.stderr, label);

  return child;
}

function stopProcessTree(child) {
  if (!child || child.exitCode !== null || child.pid == null) {
    return;
  }

  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  child.kill("SIGTERM");
}

async function main() {
  const requestedWebPort = parsePort(process.env.WEB_PORT, 3000);
  const requestedBffPort = parsePort(process.env.BFF_PORT, 4000);
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK ?? "true";

  const webPort = await findAvailablePort(requestedWebPort);
  const bffPort = await findAvailablePort(requestedBffPort);

  if (webPort !== requestedWebPort || bffPort !== requestedBffPort) {
    console.log(
      `[dev] Default ports were busy. Using web:${webPort} and bff:${bffPort} instead.`,
    );
  } else {
    console.log(`[dev] Using web:${webPort} and bff:${bffPort}.`);
  }

  console.log(`[dev] Mock mode: ${useMock}`);

  const children = [];
  let shuttingDown = false;

  const shutdown = (exitCode) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const child of children) {
      stopProcessTree(child);
    }

    process.exit(exitCode);
  };

  const onExit = (name, child) => {
    child.on("exit", (code, signal) => {
      if (shuttingDown) {
        return;
      }

      if (code === 0) {
        console.log(`[dev] ${name} exited cleanly.`);
        shutdown(0);
        return;
      }

      const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
      console.error(`[dev] ${name} exited with ${reason}. Stopping the other process.`);
      shutdown(code ?? 1);
    });
  };

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  const bff = spawnDevProcess("[bff]", bffDir, {
    PORT: String(bffPort),
    USE_MOCK: process.env.USE_MOCK ?? useMock,
    CORS_ORIGIN:
      process.env.CORS_ORIGIN ??
      `http://localhost:${webPort},http://127.0.0.1:${webPort}`,
  });

  const web = spawnDevProcess("[web]", webDir, {
    PORT: String(webPort),
    NEXT_PUBLIC_BFF_BASE_URL:
      process.env.NEXT_PUBLIC_BFF_BASE_URL ?? `http://localhost:${bffPort}`,
    NEXT_PUBLIC_BFF_URL:
      process.env.NEXT_PUBLIC_BFF_URL ?? `http://localhost:${bffPort}/api`,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK ?? useMock,
  });

  children.push(bff, web);
  onExit("BFF", bff);
  onExit("Web", web);
}

main().catch((error) => {
  console.error("[dev] Failed to start the development stack.");
  console.error(error);
  process.exit(1);
});
