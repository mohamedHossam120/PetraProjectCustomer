const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const subcategoryCtrl = require('../controllers/subcategoryController');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_subcategories', 
        resource_type: 'auto', 
    },
});

const upload = multer({ storage });

router.post('/add', upload.single('image'), subcategoryCtrl.addSubCategory);
router.get('/category/:categoryId', subcategoryCtrl.getSubCategoriesByCategory);
router.delete('/delete/:id', subcategoryCtrl.deleteSubCategory);

module.exports = router;