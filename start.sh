#!/bin/sh
# Recompila do source mais recente antes de iniciar
# Garante que mudanças de código sejam aplicadas mesmo com cache de build
echo "[startup] Recompilando server/_core/index.ts..."
npx esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
echo "[startup] Build ok. Iniciando servidor..."
exec node dist/index.js
