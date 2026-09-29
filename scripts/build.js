import { execSync } from 'node:child_process';

const isRender = process.env.RENDER === 'true' || process.env.RENDER === '1';
const buildTarget = process.env.BUILD_TARGET || (isRender ? 'server' : 'all');

console.log(`🔨 [Build Script] Running build pipeline (Target: '${buildTarget}', Render: ${isRender})...`);

try {
  if (buildTarget === 'server' || isRender) {
    console.log('⚡ [Build] Building Node.js Express server bundle (esbuild)...');
    execSync('npm run build:server', { stdio: 'inherit' });
    console.log('✅ [Build] Server bundle ready at dist-server/server.js');
  } else if (buildTarget === 'client') {
    console.log('🌐 [Build] Building Storefront Client bundle (vite)...');
    execSync('npm run build:client', { stdio: 'inherit' });
    console.log('✅ [Build] Client bundle ready at dist/');
  } else if (buildTarget === 'admin') {
    console.log('🛡️ [Build] Building Admin Dashboard bundle (vite)...');
    execSync('npm run build:admin', { stdio: 'inherit' });
    console.log('✅ [Build] Admin bundle ready at dist-admin/');
  } else {
    // Default 'all' for local verification or full CI pipelines
    console.log('📦 [Build] Building all targets (client, admin, server)...');
    execSync('npm run build:client', { stdio: 'inherit' });
    execSync('npm run build:admin', { stdio: 'inherit' });
    execSync('npm run build:server', { stdio: 'inherit' });
    console.log('🎉 [Build] All bundles (dist, dist-admin, dist-server) built successfully.');
  }
} catch (err) {
  console.error('❌ [Build] Build failed:', err.message || err);
  process.exit(1);
}
