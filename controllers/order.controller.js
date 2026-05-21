const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new order
 */
exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { merchantId, items, shippingAddress, totalAmount } = req.body;

    if (!merchantId || !items || !shippingAddress || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          id: uuidv4(),
          customer_id: customerId,
          merchant_id: merchantId,
          items,
          shipping_address: shippingAddress,
          total_amount: totalAmount,
          status: 'pending',
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Order created successfully',
      order: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user orders
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (data.customer_id !== userId && data.merchant_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update order status (state machine)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', orderId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated',
      order: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

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
      .from('orders')
      .update({ status: 'cancelled', cancellation_reason: reason || null })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Order cancelled',
      order: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
