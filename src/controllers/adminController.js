const bcrypt = require('bcryptjs');
const { db } = require('../config/db'); 

const checkUserExists = async (email) => {
    const sql = 'SELECT user_email FROM users WHERE user_email = ?';
    const [rows] = await db.execute(sql, [email]);
    return rows.length > 0;
};

exports.createAdmin = async (req, res) => {
    const { fullName, email, password, confirmPassword, phoneNumber, address, city } = req.body;
    
    if (password.length < 6) {
        return res.status(400).json({ 
            message: "Password is too short! It must be at least 6 characters or numbers." 
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const exists = await checkUserExists(email);
        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_address, user_city, user_role, user_status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'admin', 'active')`;
        
        const values = [fullName, email, hashedPassword, phoneNumber, address, city];
        
        await db.execute(sql, values);

        return res.status(201).json({ message: "Admin created successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ 
            message: "Error creating admin", 
            error: err.message 
        });
    }
};
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
const sql = 'SELECT * FROM users WHERE user_email = ? AND (user_role = "admin" OR user_role = "admin_user")';        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or you are not an admin" });
        }

        const admin = rows[0];

        if (admin.user_status !== 'active') {
            return res.status(403).json({ message: "Your account is inactive. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, admin.user_pass);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        return res.status(200).json({
            message: "Login successful",
            admin: {
                id: admin.user_id,
                name: admin.user_name,
                email: admin.user_email,
                role: admin.user_role
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error during login" });
    }
};