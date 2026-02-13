const express = require('express');
const router = express.Router();

const noticeCtrl = require('../controllers/noticeController');
const authCtrl = require('../controllers/authController');

router.get('/', noticeCtrl.getAll);

router.post('/', authCtrl.protect, authCtrl.authorize('admin'), noticeCtrl.create);

router.put('/:id', authCtrl.protect, authCtrl.authorize('admin'), noticeCtrl.update);

router.delete('/:id', authCtrl.protect, authCtrl.authorize('admin'), noticeCtrl.remove);



module.exports = router;