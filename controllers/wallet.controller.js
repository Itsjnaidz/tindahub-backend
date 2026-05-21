const { supabaseAdmin } = require('../config/supabase');

/**
 * Get merchant wallet balance
 */
exports.getWalletBalance = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('merchant_id', merchantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({
      merchantId,
      balance: data?.balance || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get wallet transaction history
 */
exports.getWalletTransactions = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const limit = Number(req.query.limit) || 50;

    const { data, error } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Withdraw from wallet
 */
exports.withdrawFunds = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { amount, bankAccount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get current balance
    const { data: walletData, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('merchant_id', merchantId)
      .single();

    if (walletError) throw walletError;

    if (!walletData || walletData.balance == null || walletData.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance or wallet not found' });
    }

    // Update wallet balance
    const newBalance = walletData.balance - amount;
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Withdrawal processed',
      newBalance,
      amount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
