import { type Response } from 'express';
import { type CustomerAuthenticatedRequest } from '../middleware/customerAuth';
import { CustomerModel, type ICustomerAddress } from '../models/Customer';
import { OrderModel } from '../models/Order';
import { isDatabaseConnected } from '../config/database';
import { db } from '../db/memoryDb';

export const userController = {
  /**
   * Sync user immediately after Firebase Auth sign-in or signup.
   * Ensures MongoDB document exists, updates metadata, and returns the unified profile.
   */
  async syncUser(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const { displayName, photoURL, phone } = req.body || {};

      let profileData = { ...req.customer };

      if (isDatabaseConnected()) {
        const doc = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid });
        if (doc) {
          if (displayName && doc.fullName !== displayName) doc.fullName = displayName;
          if (photoURL && doc.photoURL !== photoURL) doc.photoURL = photoURL;
          if (phone && (!doc.phone || doc.phone === '')) doc.phone = phone;
          doc.lastLoginAt = new Date();
          await doc.save();

          profileData = {
            id: doc.id,
            firebaseUid: doc.firebaseUid || req.customer.firebaseUid,
            email: doc.email,
            fullName: doc.fullName,
            phone: doc.phone,
            photoURL: doc.photoURL,
            authProvider: doc.authProvider,
            emailVerified: doc.emailVerified,
            addresses: doc.addresses || [],
            wishlist: doc.wishlist || [],
            totalOrders: doc.totalOrders || 0,
            totalSpent: doc.totalSpent || 0,
            status: doc.status || 'NEW',
          };
        }
      }

      return res.status(200).json({
        success: true,
        message: 'User account synchronized with MongoDB Atlas.',
        user: profileData,
      });
    } catch (err: any) {
      console.error('❌ [UserController] Sync user error:', err.message || err);
      return res.status(500).json({ success: false, message: 'Failed to sync user data.' });
    }
  },

  /**
   * Get complete user profile
   */
  async getProfile(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid }).lean();
        if (customer) {
          return res.status(200).json({
            success: true,
            user: {
              id: customer.id,
              firebaseUid: customer.firebaseUid,
              email: customer.email,
              fullName: customer.fullName,
              phone: customer.phone,
              photoURL: customer.photoURL,
              authProvider: customer.authProvider,
              emailVerified: customer.emailVerified,
              address: customer.address,
              province: customer.province,
              district: customer.district,
              addresses: customer.addresses || [],
              wishlist: customer.wishlist || [],
              totalOrders: customer.totalOrders || 0,
              totalSpent: customer.totalSpent || 0,
              status: customer.status || 'NEW',
              lastOrderDate: customer.lastOrderDate,
              createdAt: customer.createdAt,
            },
          });
        }
      }

      return res.status(200).json({ success: true, user: req.customer });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
  },

  /**
   * Update personal information (name, phone, default delivery province/district)
   */
  async updateProfile(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const { fullName, phone, address, province, district } = req.body;

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid });
        if (!customer) {
          return res.status(404).json({ success: false, message: 'Customer record not found.' });
        }

        if (fullName) customer.fullName = fullName.trim();
        if (phone !== undefined) customer.phone = phone.trim();
        if (address !== undefined) customer.address = address.trim();
        if (province !== undefined) customer.province = province.trim();
        if (district !== undefined) customer.district = district.trim();

        await customer.save();

        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully in MongoDB Atlas.',
          user: customer,
        });
      } else {
        const cust = db.customers.get(req.customer.id);
        if (cust) {
          if (fullName) cust.fullName = fullName.trim();
          if (phone !== undefined) cust.phone = phone.trim();
          if (address !== undefined) cust.address = address.trim();
          db.customers.set(req.customer.id, cust);
        }
        return res.status(200).json({ success: true, message: 'Profile updated.', user: cust });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  },

  /**
   * Get all past orders placed by this user (strictly scoped to their account)
   */
  async getOrders(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const firebaseUid = req.customer.firebaseUid;
      const email = (req.customer.email || '').toLowerCase().trim();
      const phone = (req.customer.phone || '').trim();

      if (isDatabaseConnected()) {
        const query: any = {
          $or: [
            { firebaseUid },
            ...(email ? [{ customerEmail: email }] : []),
            ...(phone ? [{ customerPhone: phone }] : []),
          ],
        };

        const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
          success: true,
          orders,
          count: orders.length,
        });
      } else {
        const orders = Array.from(db.orders.values())
          .filter(
            (o) =>
              (o as any).firebaseUid === firebaseUid ||
              (email && o.customer?.email?.toLowerCase() === email) ||
              (phone && o.customer?.phone === phone)
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return res.status(200).json({
          success: true,
          orders,
          count: orders.length,
        });
      }
    } catch (err: any) {
      console.error('❌ [UserController] Get orders error:', err.message || err);
      return res.status(500).json({ success: false, message: 'Failed to fetch user orders.' });
    }
  },

  /**
   * Address Book: Get saved addresses
   */
  async getAddresses(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid }).lean();
        return res.status(200).json({
          success: true,
          addresses: customer?.addresses || [],
        });
      }

      return res.status(200).json({
        success: true,
        addresses: req.customer.addresses || [],
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
    }
  },

  /**
   * Address Book: Add new delivery address
   */
  async addAddress(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const { label, fullName, phone, streetAddress, province, district, sector, isDefault, notes } = req.body;

      if (!fullName || !phone || !streetAddress) {
        return res.status(400).json({
          success: false,
          message: 'Full name, phone number, and delivery street address are required.',
        });
      }

      const newAddress: ICustomerAddress = {
        id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        label: label || 'Home',
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        province: province || '',
        district: district || '',
        sector: sector || '',
        isDefault: Boolean(isDefault),
        notes: notes || '',
        createdAt: new Date(),
      };

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid });
        if (!customer) {
          return res.status(404).json({ success: false, message: 'Customer record not found.' });
        }

        if (!customer.addresses) customer.addresses = [];

        // If marked default or this is the first address, reset other defaults
        if (newAddress.isDefault || customer.addresses.length === 0) {
          customer.addresses.forEach((a) => (a.isDefault = false));
          newAddress.isDefault = true;
        }

        customer.addresses.push(newAddress);
        await customer.save();

        return res.status(201).json({
          success: true,
          message: 'Delivery address saved to MongoDB Atlas.',
          addresses: customer.addresses,
          address: newAddress,
        });
      } else {
        const cust = db.customers.get(req.customer.id);
        if (cust) {
          if (!cust.addresses) cust.addresses = [];
          if (newAddress.isDefault || cust.addresses.length === 0) {
            cust.addresses.forEach((a: any) => (a.isDefault = false));
            newAddress.isDefault = true;
          }
          cust.addresses.push(newAddress);
          db.customers.set(req.customer.id, cust);
        }
        return res.status(201).json({
          success: true,
          message: 'Address saved.',
          addresses: cust?.addresses || [newAddress],
          address: newAddress,
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to add address.' });
    }
  },

  /**
   * Address Book: Delete address
   */
  async deleteAddress(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const { addressId } = req.params;

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid });
        if (!customer) {
          return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        customer.addresses = (customer.addresses || []).filter((a) => a.id !== addressId);
        // If remaining addresses exist and none is default, set first as default
        if (customer.addresses.length > 0 && !customer.addresses.some((a) => a.isDefault)) {
          customer.addresses[0].isDefault = true;
        }

        await customer.save();

        return res.status(200).json({
          success: true,
          message: 'Address removed.',
          addresses: customer.addresses,
        });
      } else {
        const cust = db.customers.get(req.customer.id);
        if (cust) {
          cust.addresses = (cust.addresses || []).filter((a: any) => a.id !== addressId);
          db.customers.set(req.customer.id, cust);
        }
        return res.status(200).json({
          success: true,
          message: 'Address removed.',
          addresses: cust?.addresses || [],
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to delete address.' });
    }
  },

  /**
   * Wishlist: Get synced wishlist
   */
  async getWishlist(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid }).lean();
        return res.status(200).json({
          success: true,
          wishlist: customer?.wishlist || [],
        });
      }

      return res.status(200).json({
        success: true,
        wishlist: req.customer.wishlist || [],
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
    }
  },

  /**
   * Wishlist: Update or sync complete wishlist array with MongoDB
   */
  async syncWishlist(req: CustomerAuthenticatedRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, message: 'Customer authentication missing.' });
      }

      const { wishlist } = req.body;
      if (!Array.isArray(wishlist)) {
        return res.status(400).json({ success: false, message: 'Wishlist must be an array of product IDs.' });
      }

      if (isDatabaseConnected()) {
        const customer = await CustomerModel.findOne({ firebaseUid: req.customer.firebaseUid });
        if (customer) {
          customer.wishlist = wishlist;
          await customer.save();
        }
      } else {
        const cust = db.customers.get(req.customer.id);
        if (cust) {
          cust.wishlist = wishlist;
          db.customers.set(req.customer.id, cust);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Wishlist synchronized with MongoDB Atlas.',
        wishlist,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to sync wishlist.' });
    }
  },
};
