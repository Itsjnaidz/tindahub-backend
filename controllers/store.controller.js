const { supabase, supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a new store/merchant
 */
exports.registerStore = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { name, description, address, contactPhone, email } = req.body;

    if (!name || !address || !contactPhone) {
      return res.status(400).json({ error: 'name, address, and contactPhone are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('stores')
      .insert([
        {
          id: uuidv4(),
          merchant_id: merchantId,
          name,
          description: description || null,
          address,
          contact_phone: contactPhone,
          email: email || null,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Store registered successfully', store: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get store information
 */
exports.getStoreInfo = async (req, res) => {
  try {
    const { storeId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update store information
 */
exports.updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, description, address, contactPhone, email } = req.body;

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (address !== undefined) payload.address = address;
    if (contactPhone !== undefined) payload.contact_phone = contactPhone;
    if (email !== undefined) payload.email = email;
    payload.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from('stores')
      .update(payload)
      .eq('id', storeId)
      .select();

    if (error) throw error;

    res.status(200).json({ message: 'Store updated successfully', store: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
