const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Set delivery tracking info
 */
exports.setTrackingInfo = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { orderId, trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!orderId || !trackingNumber || !carrier) {
      return res.status(400).json({ error: 'orderId, trackingNumber, and carrier are required' });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.merchant_id !== merchantId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .insert([
        {
          id: uuidv4(),
          order_id: orderId,
          tracking_number: trackingNumber,
          carrier,
          estimated_delivery: estimatedDelivery || null,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Tracking info set successfully',
      delivery: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get delivery tracking info
 */
exports.getTrackingInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_id !== userId && order.merchant_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Delivery tracking not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update order delivery status
 */
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid delivery status' });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ delivery_status: status })
      .eq('id', orderId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      message: 'Delivery status updated',
      order: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
