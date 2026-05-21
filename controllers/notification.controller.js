const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Send SMS notification (mocked)
 */
exports.sendSMSNotification = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    // Mock SMS dispatch - in production, integrate with SMS provider
    console.log(`SMS to ${phone}: ${message}`);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          id: uuidv4(),
          type: 'sms',
          recipient: phone,
          message,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'SMS notification sent',
      notification: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send WhatsApp notification (mocked)
 */
exports.sendWhatsAppNotification = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    // Mock WhatsApp dispatch - in production, integrate with WhatsApp provider
    console.log(`WhatsApp to ${phone}: ${message}`);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          id: uuidv4(),
          type: 'whatsapp',
          recipient: phone,
          message,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'WhatsApp notification sent',
      notification: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get notification history
 */
exports.getNotificationHistory = async (req, res) => {
  try {
    const recipientPhone = req.user?.phone;
    const limit = Number(req.query.limit || 50);

    if (!recipientPhone) {
      return res.status(400).json({ error: 'Authenticated user phone is required to retrieve notifications' });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient', recipientPhone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
