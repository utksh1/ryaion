import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const router = Router();

// POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password, risk_profile, trading_style } = req.body;

    try {
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.user) {
            // 2. Create user profile in 'users' table
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: data.user.id,
                    email: email,
                    risk_profile: risk_profile || 'medium', // Default
                    trading_style: trading_style || 'swing'  // Default
                });

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                // Continue anyway as auth succeeded
            }
        }

        res.json({ message: "User registered successfully", user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({ token: data.session?.access_token, user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
