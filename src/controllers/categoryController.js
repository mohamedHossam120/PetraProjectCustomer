const { db } = require('../config/db');


exports.addCategory = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "لم تصل بيانات، تأكد من إعدادات form-data في Postman." 
            });
        }

        const { name, status, description } = req.body;
        const image_url = req.file ? req.file.path : null;

        if (!name) {
            return res.status(400).json({ success: false, message: "حقل الاسم مطلوب." });
        }

        const sql = `INSERT INTO categories (name, status, image_url, description) VALUES (?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            name, 
            status || 'active', 
            image_url, 
            description || null
        ]);
        
        return res.status(201).json({ 
            success: true,
            message: "تمت الإضافة بنجاح!",
            data: { id: result.insertId, name, image_url }
        });

    } catch (err) {
        console.error("🔴 Backend Error:", err); 
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في قاعدة البيانات", 
            error: err.message 
        });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, status, description } = req.body;
    const new_image_url = req.file ? req.file.path : null;

    try {
        const [existing] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "الفئة غير موجودة" });
        }

        let sql = `UPDATE categories SET name = ?, status = ?, description = ?`;
        let params = [name, status, description];

        if (new_image_url) {
            sql += `, image = ?`;
            params.push(new_image_url);
        }

        sql += ` WHERE category_id = ?`;
        params.push(id);

        await db.execute(sql, params);
        
        return res.status(200).json({ message: "تم تحديث بيانات الفئة بنجاح" });
    } catch (err) {
        console.error("Update Error:", err.message);
        return res.status(500).json({ message: "خطأ في تحديث الفئة", error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const [subCategories] = await db.execute(
            'SELECT COUNT(*) as count FROM sub_categories WHERE category_id = ?',
            [id]
        );

        if (subCategories[0].count > 0) {
            return res.status(400).json({ 
                message: "لا يمكن حذف هذه الفئة! يوجد أقسام فرعية مرتبطة بها. يرجى حذفها أو نقلها أولاً." 
            });
        }

        const [result] = await db.execute('DELETE FROM categories WHERE category_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "الفئة غير موجودة بالفعل" });
        }

        return res.status(200).json({ message: "تم حذف الفئة بنجاح من النظام" });
    } catch (err) {
        return res.status(500).json({ message: "خطأ في عملية الحذف", error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories ORDER BY category_id DESC');
        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({ message: "خطأ في جلب البيانات", error: err.message });
    }
};