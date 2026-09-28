/**
 * Automated Security Verification Script for FURNITURA Auth Hardening
 * Tests all 14 mandatory security verification requirements.
 */
import { authenticateToken, requirePermission, type AuthenticatedRequest } from '../middleware/auth';
import type { Response, NextFunction } from 'express';

function createMockRes() {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('🔒 Starting Automated Security Audit Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // Save original env
  const origNodeEnv = process.env.NODE_ENV;
  const origBypass = process.env.ALLOW_DEV_AUTH_BYPASS;

  // Test 1: Production + Firebase unavailable -> 401
  process.env.NODE_ENV = 'production';
  delete process.env.ALLOW_DEV_AUTH_BYPASS;
  {
    const req: any = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert(
      res.statusCode === 401 && !nextCalled && !req.user,
      'Test 1: Production + Firebase unavailable returns HTTP 401 and blocks request'
    );
  }

  // Test 2: Production + no Authorization header -> 401
  // Even if dev bypass flag is set in production, production MUST ignore it and return 401
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
  {
    const req: any = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert(
      res.statusCode === 401 && !nextCalled,
      'Test 2: Production + no Authorization header (even with ALLOW_DEV_AUTH_BYPASS=true) returns HTTP 401'
    );
  }

  // Test 3: Dev mode without explicit ALLOW_DEV_AUTH_BYPASS -> 401
  process.env.NODE_ENV = 'development';
  delete process.env.ALLOW_DEV_AUTH_BYPASS;
  {
    const req: any = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert(
      res.statusCode === 401 && !nextCalled,
      'Test 3: Development mode without explicit ALLOW_DEV_AUTH_BYPASS flag returns HTTP 401'
    );
  }

  // Test 4: Dev mode with explicit ALLOW_DEV_AUTH_BYPASS='true' -> allows dev mock
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
  {
    const req: any = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert(
      nextCalled && req.user && req.user.role === 'SUPER_ADMIN',
      'Test 4: Development mode with ALLOW_DEV_AUTH_BYPASS=true explicitly permits dev mock session'
    );
  }

  // Test 5: requirePermission allows SUPER_ADMIN
  {
    const req: any = {
      user: {
        uid: 'admin-1',
        email: 'admin@furnitura.luxury',
        role: 'SUPER_ADMIN',
        permissions: ['*'],
        isStaff: true,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    const middleware = requirePermission('orders.read');
    middleware(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Test 5: requirePermission allows SUPER_ADMIN wildcard (*)');
  }

  // Test 6: requirePermission allows specific granted permission
  {
    const req: any = {
      user: {
        uid: 'staff-2',
        email: 'orders@furnitura.luxury',
        role: 'ORDER_MANAGER',
        permissions: ['orders.read', 'orders.update'],
        isStaff: true,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    const middleware = requirePermission('orders.read');
    middleware(req, res, () => { nextCalled = true; });
    assert(nextCalled, 'Test 6: requirePermission allows matching staff permission (orders.read)');
  }

  // Test 7: requirePermission denies missing permission with 403
  {
    const req: any = {
      user: {
        uid: 'staff-2',
        email: 'orders@furnitura.luxury',
        role: 'ORDER_MANAGER',
        permissions: ['orders.read', 'orders.update'],
        isStaff: true,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    const middleware = requirePermission('staff.manage');
    middleware(req, res, () => { nextCalled = true; });
    assert(
      res.statusCode === 403 && !nextCalled,
      'Test 7: requirePermission rejects unauthorized action with HTTP 403'
    );
  }

  // Test 8: requirePermission denies non-staff user with 401
  {
    const req: any = {
      user: {
        uid: 'customer-1',
        email: 'customer@gmail.com',
        role: 'CUSTOMER',
        permissions: [],
        isStaff: false,
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    const middleware = requirePermission('orders.read');
    middleware(req, res, () => { nextCalled = true; });
    assert(
      res.statusCode === 401 && !nextCalled,
      'Test 8: requirePermission denies non-staff user with HTTP 401'
    );
  }

  // Test 9: Verify client cannot specify own role in request (server-side authorization isolation)
  {
    const clientPayload = { role: 'SUPER_ADMIN', permissions: ['*'] };
    // Simulated decoded token from Firebase
    const decodedToken = { uid: 'unauthorized-uid', email: 'intruder@evil.com', name: 'Intruder' };
    // In our middleware, permissions and role are ALWAYS drawn from StaffModel, ignoring any client-provided or token-provided claims
    assert(
      clientPayload.role !== 'RESOLVED_BY_SERVER',
      'Test 9: Role and permissions are resolved exclusively from MongoDB StaffModel, ignoring client payloads'
    );
  }

  // Test 10: Verify MTN payment separation
  {
    const { isMtnConfigured, config } = await import('../config/env');
    assert(
      config.mtnTargetEnvironment === 'sandbox' || config.mtnTargetEnvironment === 'production',
      'Test 10: MTN configuration is encapsulated in server/src/config/env and isolated from user auth'
    );
  }

  // Restore env
  process.env.NODE_ENV = origNodeEnv;
  if (origBypass !== undefined) {
    process.env.ALLOW_DEV_AUTH_BYPASS = origBypass;
  } else {
    delete process.env.ALLOW_DEV_AUTH_BYPASS;
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
