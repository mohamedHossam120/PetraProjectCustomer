const { db } = require('../config/db');

exports.addSubCategory = async (req, res) => {
    try {
        const { subcategory_name, category_id } = req.body;
        const subcategory_image = req.file ? req.file.path : null;

        if (!subcategory_name || !category_id) {
            return res.status(400).json({ 
                success: false, 
                message: "حقل الاسم ورقم القسم الرئيسي مطلوبان." 
            });
        }

        const sql = `INSERT INTO subcategories (subcategory_name, category_id, subcategory_image) VALUES (?, ?, ?)`;
        
        const [result] = await db.execute(sql, [subcategory_name, category_id, subcategory_image]);
        
        return res.status(201).json({ 
            success: true,
            message: "تمت إضافة القسم الفرعي بنجاح!",
            data: { 
                id: result.insertId, 
                name: subcategory_name, 
                category_id, 
                image_url: subcategory_image 
            }
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات", error: err.message });
    }
};

exports.getSubCategoriesByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM subcategories WHERE category_id = ? ORDER BY subcategory_id DESC', 
            [categoryId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: "خطأ في جلب البيانات", error: err.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM subcategories WHERE subcategory_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "القسم غير موجود" });
        }
        return res.status(200).json({ success: true, message: "تم حذف القسم الفرعي بنجاح" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "خطأ في الحذف", error: err.message });
    }
};