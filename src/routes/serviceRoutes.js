const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const serviceCtrl = require('../controllers/serviceController');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_services', 
        resource_type: 'auto', 
    },
});

const upload = multer({ storage });

router.post('/add', upload.single('image'), serviceCtrl.addService);
router.get('/sub/:subId', serviceCtrl.getServicesBySubCategory);

module.exports = router;