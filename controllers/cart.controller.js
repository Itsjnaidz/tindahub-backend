const { supabase } = require('../config/supabase');
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
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('deleted_at', null)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    let cartItem;

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select();

      if (error) throw error;
      cartItem = data[0];
    } else {
      // Create new cart item
      const { data, error } = await supabase
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

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    res.status(200).json({
      items: data,
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
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select();

    if (error) throw error;

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
    const { cartItemId } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

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

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
