const { supabase, supabaseAdmin } = require('../config/supabase');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Process GCash payment
 */
exports.processGCashPayment = async (req, res) => {
  try {
    const { orderId, amount, gcashNumber } = req.body;

    if (!orderId || !amount || !gcashNumber) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // Mock GCash API call - replace with actual GCash integration
    console.log(`Processing GCash payment: ${amount} from ${gcashNumber}`);

    const transactionId = uuidv4();

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          id: transactionId,
          order_id: orderId,
          amount,
          payment_method: 'gcash',
          status: 'completed',
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'GCash payment processed',
      transaction: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process Maya payment
 */
exports.processMayaPayment = async (req, res) => {
  try {
    const { orderId, amount, cardToken } = req.body;

    if (!orderId || !amount || !cardToken) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // Mock Maya API call - replace with actual Maya integration
    console.log(`Processing Maya payment: ${amount} with token ${cardToken}`);

    const transactionId = uuidv4();

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          id: transactionId,
          order_id: orderId,
          amount,
          payment_method: 'maya',
          status: 'completed',
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Maya payment processed',
      transaction: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get transaction history
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
