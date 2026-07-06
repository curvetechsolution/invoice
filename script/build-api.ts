import { build as esbuild } from "esbuild";
import { readFile, rm, mkdir } from "fs/promises";

async function buildApi() {
  await rm("api/index.js", { force: true });
  await rm("api/index.cjs", { force: true });
  await mkdir("api", { recursive: true });

  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const externals = Object.keys(pkg.dependencies || {});

  await esbuild({
    entryPoints: ["api-src/index.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    outfile: "api/index.js",
    tsconfig: "tsconfig.json",
    external: externals,
    logLevel: "info",
  });

  console.log("✅ api/index.js built");
}

buildApi().catch((err) => {
  console.error(err);
  process.exit(1);
});