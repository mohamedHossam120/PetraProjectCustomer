const bcrypt = require('bcryptjs');
const { db } = require('../config/db'); 

const checkUserExists = async (email, username) => {
    const sql = 'SELECT user_email FROM users WHERE user_email = ? OR user_name = ?';
    const [rows] = await db.execute(sql, [email, username]);
    return rows.length > 0;
};


exports.createAdminUser = async (req, res) => {
    const { 
        name, username, email, password, 
        contactNumber, status, address, description 
    } = req.body;

    if (!name || !email || !password || !username) {
        return res.status(400).json({ message: "Please fill all required fields" });
    }

    try {
        const exists = await checkUserExists(email, username);
        if (exists) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (
            user_name, 
            user_email, 
            user_pass, 
            user_phone, 
            user_address, 
            user_role, 
            user_status,
            user_description
        ) VALUES (?, ?, ?, ?, ?, 'admin__user', ?, ?)`;
        
        const userStatus = status ? 'active' : 'inactive';

        const values = [
            name, 
            email, 
            hashedPassword, 
            contactNumber, 
            address || null, 
            userStatus, 
            description || null
        ];
        
        await db.execute(sql, values);

        return res.status(201).json({ 
            success: true,
            message: "Admin User created successfully" 
        });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ 
            message: "Error creating admin user", 
            error: err.message 
        });
    }
};