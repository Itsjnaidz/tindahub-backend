const { supabaseAdmin } = require('../config/supabase');

/**
 * Get analytics data for merchant
 */
exports.getMerchantAnalytics = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // Get total sales
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('merchant_id', merchantId)
      .eq('status', 'completed');

    if (salesError) throw salesError;

    const totalSales = salesData.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    // Get total orders
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('merchant_id', merchantId);

    if (ordersError) throw ordersError;

    const totalOrders = ordersData.length;

    // Get total products
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('merchant_id', merchantId)
      .is('deleted_at', null);

    if (productsError) throw productsError;

    const totalProducts = productsData.length;

    // Get total customers
    const { data: customersData, error: customersError } = await supabaseAdmin
      .from('orders')
      .select('customer_id')
      .eq('merchant_id', merchantId);

    if (customersError) throw customersError;

    const uniqueCustomers = new Set(customersData.map(o => o.customer_id)).size;

    res.status(200).json({
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers: uniqueCustomers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get detailed order analytics
 */
exports.getOrderAnalytics = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId);

    if (error) throw error;

    const analytics = {
      pending: data.filter(o => o.status === 'pending').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
