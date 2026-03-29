const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const checkUserExists = async (email) => {
    const [rows] = await db.execute('SELECT user_id FROM users WHERE user_email = ?', [email]);
    return rows.length > 0;
};

exports.registerCustomer = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, phoneNumber, address, city } = req.body;
    
    let fullName = firstName + " " + lastName;

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    try {
        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_address, user_role, user_status) 
                     VALUES (?, ?, ?, ?, ?, 'customer', 'active')`;
        
        const fullAddress = address ? `${city}, ${address}` : city;

        await db.execute(sql, [fullName, email, hashedPassword, phoneNumber, fullAddress]);

        return res.status(201).json({ 
            success: true, 
            message: "Customer registered successfully" 
        });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Registration error", 
            error: err.message 
        });
    }
};

exports.registerProvider = async (req, res) => {
    // 1. استقبال البيانات من Body
    const {
        fullName, email, password, phoneNumber, city, address,
        category_id, subcategory_id, service_id, price_type, price, 
        description, availability, commission
    } = req.body;

    // 2. استقبال الصور (تم استخدام req.files لأننا سنستخدم .fields في الراوت)
    const profile_image = req.files?.['profile_image'] ? req.files['profile_image'][0].path : null;
    const service_image = req.files?.['service_image'] ? req.files['service_image'][0].path : null;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // التحقق من وجود البريد الإلكتروني مسبقاً
        const [existing] = await connection.execute('SELECT user_id FROM users WHERE user_email = ?', [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. إدخال بيانات المستخدم (الأب)
        const sqlUser = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_city, user_address, profile_image, user_role, user_status) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'provider', 'pending')`;
        
        const [userResult] = await connection.execute(sqlUser, [
            fullName || null, email || null, hashedPassword, phoneNumber || null, 
            city || null, address || null, profile_image || null
        ]);

        const newProviderId = userResult.insertId;

        // 4. إدخال بيانات الخدمة (الابن)
        const sqlService = `INSERT INTO provider_services (provider_id, service_id, category_id, subcategory_id, price, price_type, commission, description, image, availability) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const scheduleData = availability ? (typeof availability === 'object' ? JSON.stringify(availability) : availability) : null;

        await connection.execute(sqlService, [
            newProviderId, 
            service_id || null, 
            category_id || null, 
            subcategory_id || null,
            price || 0, 
            price_type || null, 
            commission || 0, 
            description || null, 
            service_image || null, 
            scheduleData
        ]);

        await connection.commit();
        res.status(201).json({ success: true, message: "تم تسجيل مقدم الخدمة بنجاح وفي انتظار مراجعة الإدارة" });

    } catch (err) {
        await connection.rollback();
        console.error("Registration Error:", err);
        res.status(500).json({ success: false, message: "فشل التسجيل", error: err.message });
    } finally {
        connection.release();
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE user_email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.user_pass))) {
            return res.status(401).json({ message: "Invalid login credentials" });
        }

        if (user.user_status !== 'active') {
            return res.status(403).json({ message: `Account is ${user.user_status}` });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.user_role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return res.json({ 
            token, 
            role: user.user_role, 
            name: user.user_name, 
            id: user.user_id,
            image: user.profile_image 
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error during login" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email, user_role, user_status, user_phone, profile_image FROM users');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { name, phone, city, address } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const userId = req.params.id;

    try {
        let sql = `UPDATE users SET user_name=?, user_phone=?, user_city=?, user_address=?`;
        let params = [name, phone, city, address];

        if (imagePath) {
            sql += `, profile_image=?`;
            params.push(imagePath);
        }

        sql += ` WHERE user_id=?`;
        params.push(userId);

        await db.execute(sql, params);
        return res.json({ message: "Profile updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(`DELETE FROM users WHERE user_id = ?`, [id]);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};