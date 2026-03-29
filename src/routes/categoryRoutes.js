const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const categoryCtrl = require('../controllers/categoryController.js');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_categories', 
        resource_type: 'auto', 
    },
});

const upload = multer({ storage });

router.get('/all', categoryCtrl.getAllCategories);
router.post('/add', upload.single('image'), categoryCtrl.addCategory);
router.put('/update/:id', upload.single('image'), categoryCtrl.updateCategory);
router.delete('/delete/:id', categoryCtrl.deleteCategory);

module.exports = router;