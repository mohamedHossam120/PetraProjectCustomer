const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const adminUserCtrl = require('../controllers/adminuserController');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_admin_users', 
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage });


router.post('/signup', adminUserCtrl.createAdminUser); 

router.post('/login', adminUserCtrl.userLogin); 

router.get('/all', adminUserCtrl.getAllUsers); 


router.put('/update/:id', upload.single('profileImage'), adminUserCtrl.updateAdminUser); 

router.delete('/delete/:id', adminUserCtrl.deleteAdminUser); 

module.exports = router;