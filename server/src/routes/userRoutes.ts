import { Router } from 'express';
import { userController } from '../controllers/userController';
import { requireCustomerAuth } from '../middleware/customerAuth';

const router = Router();

// All customer user routes require verified Firebase Token
router.use(requireCustomerAuth);

// 1. User Sync & Profile Management
router.post('/sync', userController.syncUser);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// 2. Orders History (Scoped to Authenticated Customer)
router.get('/orders', userController.getOrders);

// 3. Multi-Address Book Management in MongoDB
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// 4. Wishlist Sync
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.syncWishlist);

export default router;
