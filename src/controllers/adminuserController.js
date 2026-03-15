const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createAdminUser = async (req, res) => {
    const { name, username, email, password, confirmPassword, userType, contactNumber, status, address, description } = req.body;
    
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (name, username, email, password, role, phone, status, address, description) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [name, username, email, hashedPassword, userType, contactNumber, status, address, description]);
        res.status(201).json({ message: "Admin user created successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Email or Username already exists" });
        res.status(500).json({ message: "Error", error: err.message });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: `Account is ${user.status}` });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, username, email, role, status, phone, profile_image FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAdminUser = async (req, res) => {
    const userId = req.params.id;
    const { name, username, email, phone, status, address, description } = req.body;
    
    const imageURL = req.file ? req.file.path : null; 

    try {
        let sql = `UPDATE users SET name=?, username=?, email=?, phone=?, status=?, address=?, description=?`;
        let params = [name, username, email, phone, status, address, description];

        if (imageURL) {
            sql += `, profile_image=?`;
            params.push(imageURL);
        }

        sql += ` WHERE id=?`;
        params.push(userId);

        await db.execute(sql, params);
        res.json({ message: "User updated successfully", image: imageURL });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAdminUser = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};