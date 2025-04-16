import express from 'express';
import { authenticateCombined } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validator.js';
import { updateUserSettingsValidator } from './settingsValidators.js';
import Settings from '../../models/Settings.js';
import User from '../../models/User.js';

const router = express.Router();

router.get('/', authenticateCombined, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const settings = await Settings.findOne({ userId });
    
    if (!settings) {
      return res.status(404).json({ error: 'Không tìm thấy cài đặt người dùng' });
    }
    
    return res.json(settings);
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt người dùng:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

router.put('/', authenticateCombined, updateUserSettingsValidator, validateRequest, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let settings = await Settings.findOne({ userId });
    
    if (!settings) {
      return res.status(404).json({ error: 'Không tìm thấy cài đặt người dùng' });
    }
    
    const updateData = { ...req.body };
    
    if (req.body.notification_prefs) {
      updateData.notification_prefs = {
        ...settings.notification_prefs,
        ...req.body.notification_prefs
      };
    }
    
    settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );
    
    return res.json(settings);
  } catch (error) {
    console.error('Lỗi khi cập nhật cài đặt người dùng:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

router.post('/reset', authenticateCombined, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    const defaultSettings = {
      userId,
      theme: 'system',
      language: 'en',
      notification_prefs: {
        email: true,
        dashboard: true,
        proxy_expiry: true,
        balance_low: true
      }
    };
    
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: defaultSettings },
      { new: true, upsert: true }
    );
    
    return res.json(settings);
  } catch (error) {
    console.error('Lỗi khi đặt lại cài đặt người dùng:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

export default router; 