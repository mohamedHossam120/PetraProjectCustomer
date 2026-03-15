const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const userCtrl = require('../controllers/userController');

router.post('/register/customer', userCtrl.registerCustomer);
router.post('/register/provider', userCtrl.registerProvider);
router.post('/register/admin', userCtrl.createAdmin); 

router.post('/login', userCtrl.login);
router.get('/all', userCtrl.getUsers);
router.put('/update/:id', upload.single('profileImage'), userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);

module.exports = router;