const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const userCtrl = require('../controllers/userController');

// إعدادات Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_users',
        resource_type: 'auto',
    },
});

const upload = multer({ storage });

// إعداد رفع ملفين بأسماء مختلفة لمزود الخدمة
const providerUploads = upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'service_image', maxCount: 1 }
]);

// --- المسارات ---
router.post('/register/provider', providerUploads, userCtrl.registerProvider);
router.post('/register/customer', upload.single('profile_image'), userCtrl.registerCustomer);
router.post('/login', userCtrl.login);
router.get('/all', userCtrl.getUsers);
router.delete('/:id', userCtrl.deleteUser);

module.exports = router;