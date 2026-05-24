const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Add item to cart
 */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid productId and quantity are required' });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .is('deleted_at', null)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    let cartItem;

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select();

      if (error) throw error;
      cartItem = data[0];
    } else {
      // Create new cart item
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            product_id: productId,
            quantity,
            created_at: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      cartItem = data[0];
    }

    res.status(200).json({
      message: 'Item added to cart',
      cartItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({ items: [], total: 0 });
    }

    const productIds = [...new Set(cartItems.map((item) => item.product_id))];

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds)
      .is('deleted_at', null);

    if (productsError) throw productsError;

    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    const items = cartItems.map((item) => ({
      ...item,
      product: productMap[item.product_id] || null,
    }));

    const total = items.reduce(
      (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
      0
    );

    res.status(200).json({
      items,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json({
      message: 'Cart item updated',
      cartItem: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove item from cart
 */
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear entire cart
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
