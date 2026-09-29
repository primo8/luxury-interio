/**
 * FURNITURA Keep-Alive Self-Ping Service
 * Prevents Render container instances from sleeping due to inactivity.
 */

let keepAliveTimer: NodeJS.Timeout | null = null;
let isServiceRunning = false;

interface KeepAliveConfig {
  enabled: boolean;
  targetUrl: string;
  intervalMinutes: number;
  appName: string;
}

/**
 * Resolves the public server URL for self-pinging.
 */
function resolveTargetUrl(): string {
  // 1. Explicit environment variable overrides
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.SERVER_URL) return process.env.SERVER_URL.replace(/\/$/, '');
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');

  // 2. Default production URL on Render
  return 'https://luxury-interio.onrender.com';
}

/**
 * Formats current UTC/Local timestamp for clean log output.
 */
function getLogTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function startKeepAliveService(): void {
  if (isServiceRunning) return;

  const rawEnabled = process.env.ENABLE_SELF_PING;
  const isProduction = process.env.NODE_ENV === 'production';

  // Enable by default in production, or if explicitly enabled
  const isEnabled = rawEnabled !== undefined ? rawEnabled === 'true' : isProduction;

  const baseUrl = resolveTargetUrl();
  const targetUrl = `${baseUrl}/health`;
  const intervalMinutes = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '10', 10);
  const appName = process.env.APP_NAME || 'luxury-interio';

  const config: KeepAliveConfig = {
    enabled: isEnabled,
    targetUrl,
    intervalMinutes: Math.max(2, Math.min(14, intervalMinutes)), // Keep between 2 and 14 minutes
    appName,
  };

  if (!config.enabled) {
    console.log(
      `💤 [Keep-Alive] Self-ping disabled in current environment (NODE_ENV=${process.env.NODE_ENV || 'development'}).`
    );
    return;
  }

  isServiceRunning = true;
  console.log(
    `🛰️  [Keep-Alive] Initialized self-ping service: Target [${config.targetUrl}] every ${config.intervalMinutes}m.`
  );

  const executePing = async () => {
    try {
      const startTime = Date.now();
      const res = await fetch(config.targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'FURNITURA-KeepAlive-Bot/1.0',
          'Accept': 'application/json',
          'X-Self-Ping': 'true',
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      const latency = Date.now() - startTime;
      const timestamp = getLogTimestamp();

      if (res.ok) {
        console.log(
          `${timestamp} | INFO | ${config.appName} | ✅ Self-ping successful [${config.targetUrl}] (${res.status} OK - ${latency}ms)`
        );
      } else {
        console.warn(
          `${timestamp} | WARN | ${config.appName} | ⚠️ Self-ping returned status ${res.status} [${config.targetUrl}]`
        );
      }
    } catch (err: any) {
      const timestamp = getLogTimestamp();
      console.error(
        `${timestamp} | ERROR | ${config.appName} | ❌ Self-ping error [${config.targetUrl}]: ${err.message || err}`
      );
    }
  };

  // Initial delayed warm-up ping after 45 seconds to let server start up
  setTimeout(() => {
    executePing();
  }, 45000);

  // Staggered interval (intervalMinutes +/- random jitter of 20 seconds)
  const baseIntervalMs = config.intervalMinutes * 60 * 1000;

  const scheduleNextPing = () => {
    // Add random stagger jitter between -15s and +15s
    const jitter = Math.floor(Math.random() * 30000) - 15000;
    const nextInterval = Math.max(60000, baseIntervalMs + jitter);

    keepAliveTimer = setTimeout(async () => {
      await executePing();
      if (isServiceRunning) {
        scheduleNextPing();
      }
    }, nextInterval);
  };

  scheduleNextPing();
}

export function stopKeepAliveService(): void {
  if (keepAliveTimer) {
    clearTimeout(keepAliveTimer);
    keepAliveTimer = null;
  }
  isServiceRunning = false;
  console.log('🛑 [Keep-Alive] Stopped self-ping service.');
}
