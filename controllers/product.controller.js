const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Create product
 */
exports.createProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { name, description, price, categoryId, stock, inventory, image } = req.body;
    const effectiveStock = stock ?? inventory;

    if (!name || price == null || effectiveStock == null) {
      return res.status(400).json({ error: 'name, price, and stock/inventory are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          id: uuidv4(),
          merchant_id: merchantId,
          name,
          description: description || null,
          price,
          category_id: categoryId || null,
          stock: effectiveStock,
          image: image || null,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Product created successfully',
      product: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all products for merchant
 */
exports.getMerchantProducts = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { productId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('merchant_id', merchantId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { productId } = req.params;
    const { name, description, price, stock, inventory, image } = req.body;

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (price !== undefined) payload.price = price;
    if (stock !== undefined) payload.stock = stock;
    if (inventory !== undefined) payload.stock = inventory;
    if (image !== undefined) payload.image = image;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(payload)
      .eq('id', productId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Soft delete product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { productId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ deleted_at: new Date() })
      .eq('id', productId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      product: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update product inventory
 */
exports.updateInventory = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ stock: quantity })
      .eq('id', productId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      message: 'Inventory updated successfully',
      product: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
