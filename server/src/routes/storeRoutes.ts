import { Router, type Request, type Response } from 'express';
import { db } from '../db/memoryDb';
import { calculateOrderTotals } from '../services/orderService';

const router = Router();

/**
 * Public catalog for storefront (active products from single source of truth)
 */
router.get('/products', (_req: Request, res: Response) => {
  const products = Array.from(db.products.values());
  res.json({ success: true, products });
});

/**
 * Public categories
 */
router.get('/categories', (_req: Request, res: Response) => {
  const categories = Array.from(db.categories.values()).filter((c) => c.active);
  res.json({ success: true, categories });
});

/**
 * Public CMS homepage content
 */
router.get('/cms', (_req: Request, res: Response) => {
  res.json({ success: true, cms: db.cms });
});

/**
 * Public delivery zones
 */
router.get('/delivery-zones', (_req: Request, res: Response) => {
  const zones = Array.from(db.deliveryZones.values()).filter((z) => z.active);
  res.json({ success: true, zones });
});

/**
 * Authoritative server-side discount validation
 */
router.post('/discounts/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code required.' });
    }

    const normalized = code.trim().toUpperCase();
    const discount = Array.from(db.discounts.values()).find(
      (d) => d.code === normalized && d.status === 'ACTIVE'
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive promotional coupon code.',
      });
    }

    const now = new Date().toISOString();
    if (discount.startDate > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet.' });
    }
    if (discount.endDate < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }
    if (discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' });
    }

    const currentSubtotal = parseFloat(subtotal || '0');
    if (currentSubtotal < discount.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for code ${discount.code} is $${discount.minOrderValue}.`,
      });
    }

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = Math.round((currentSubtotal * discount.value) / 100);
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      discountAmount = Math.min(discount.value, currentSubtotal);
    }

    return res.status(200).json({
      success: true,
      valid: true,
      code: discount.code,
      name: discount.name,
      type: discount.type,
      value: discount.value,
      discountAmount,
      message: `Promo code ${discount.code} applied successfully!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to validate discount.' });
  }
});

export default router;
