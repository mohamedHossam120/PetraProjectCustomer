const { db } = require('../config/db');

exports.addService = async (req, res) => {
    try {
        const { 
            name, category, sub_category, description, 
            price, max_price, admin_commission_rate 
        } = req.body;
        
        const image = req.file ? req.file.path : null;

        const sql = `INSERT INTO services 
            (name, category, sub_category, description, price, max_price, admin_commission_rate, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            name, category, sub_category, description, 
            price || 0, 
            max_price || 0, 
            admin_commission_rate || 0, 
            image
        ]);
        
        res.status(201).json({ 
            success: true, 
            message: "Service added successfully!",
            data: { id: result.insertId, name } 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.getServicesBySubCategory = async (req, res) => {
    const { subId } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM services WHERE sub_category = ?', [subId]);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};