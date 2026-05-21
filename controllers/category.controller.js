const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a custom category for merchant
 */
exports.createCategory = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([
        {
          id: uuidv4(),
          merchant_id: merchantId,
          name,
          description: description || null,
          icon: icon || null,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Category created successfully',
      category: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all categories for merchant
 */
exports.getCategories = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { categoryId } = req.params;
    const { name, description, icon } = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: name || undefined,
        description: description || undefined,
        icon: icon || undefined,
      })
      .eq('id', categoryId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({
      message: 'Category updated successfully',
      category: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { categoryId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('merchant_id', merchantId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
