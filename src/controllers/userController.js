const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerCustomer = async (req, res) => {
    const { fullName, email, password, confirmPassword, phoneNumber, address, city } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_address, user_city, user_role, user_status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active')`;
        
        await db.execute(sql, [fullName, email, hashedPassword, phoneNumber, address || null, city || null]);

        res.status(201).json({ message: "تم تسجيل العميل بنجاح" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "هذا البريد الإلكتروني مسجل مسبقاً" });
        }
        res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
    }
};

exports.createAdmin = async (req, res) => {
    const { fullName, email, password, confirmPassword, phoneNumber, address, city } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_address, user_city, user_role, user_status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'admin', 'active')`;
        
        await db.execute(sql, [fullName, email, hashedPassword, phoneNumber, address || null, city || null]);

        res.status(201).json({ message: "تم إنشاء حساب الأدمن بنجاح" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "هذا البريد الإلكتروني مسجل مسبقاً" });
        }
        res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
    }
};

exports.registerProvider = async (req, res) => {
    const { fullName, email, password, phoneNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (user_name, user_email, user_pass, user_phone, user_role, user_status) 
                     VALUES (?, ?, ?, ?, 'provider', 'pending')`;
        await db.execute(sql, [fullName, email, hashedPassword, phoneNumber]);
        res.status(201).json({ message: "تم التسجيل، بانتظار مراجعة الإدارة" });
    } catch (err) {
        res.status(500).json({ message: "خطأ", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE user_email = ?', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.user_pass))) {
            return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
        }
        if (user.user_status !== 'active') {
            return res.status(403).json({ message: `الحساب ${user.user_status}` });
        }
        const token = jwt.sign({ id: user.user_id, role: user.user_role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.user_role, name: user.user_name });
    } catch (err) { res.status(500).json({ message: "خطأ في السيرفر" }); }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email, user_role, user_status FROM users');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateUser = async (req, res) => {
    const { name, phone, city } = req.body;
    const imagePath = req.file ? req.file.path : null;
    try {
        let sql = `UPDATE users SET user_name=?, user_phone=?, city=? ${imagePath ? ', profile_image=?' : ''} WHERE user_id=?`;
        let params = imagePath ? [name, phone, city, imagePath, req.params.id] : [name, phone, city, req.params.id];
        await db.execute(sql, params);
        res.json({ message: "تم تحديث البيانات بنجاح" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params; 
    try {
        const sql = `DELETE FROM users WHERE user_id = ?`; 
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.status(200).json({ message: `تم حذف المستخدم رقم ${id} بنجاح` });
    } catch (err) {
        res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
    }
};