const { supabaseAdmin } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate OTP for user authentication
 */
exports.generateOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Supabase using service role client so RLS policies do not block insert.
    const { data, error } = await supabaseAdmin
      .from('otp_requests')
      .upsert([{ phone, otp, expires_at: otpExpiry }], { onConflict: 'phone' });

    if (error) throw error;

    // In production, send OTP via SMS/WhatsApp
    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',
      phone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify OTP and create/authenticate user
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Retrieve OTP from Supabase using service role client for RLS-safe lookup.
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_requests')
      .select('*')
      .eq('phone', phone)
      .single();

    if (otpError || !otpData) {
      return res.status(400).json({ error: 'Invalid OTP request' });
    }

    // Check if OTP is valid and not expired
    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check if user exists
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    // If user doesn't exist, create one
    if (userError || !userData) {
      const newUser = {
        id: uuidv4(),
        phone,
        created_at: new Date(),
      };

      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([newUser])
        .select();

      if (createError) throw createError;
      userData = createdUser?.[0] || newUser;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userData.id, phone: userData.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Delete used OTP
    await supabaseAdmin.from('otp_requests').delete().eq('phone', phone);

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Logout user (invalidate token in DB if needed)
 */
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
