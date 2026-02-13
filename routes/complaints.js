const express = require('express');
const router = express.Router();

const compCtrl = require('../controllers/complaintController');
const authCtrl = require('../controllers/authController');

router.post('/', authCtrl.protect, authCtrl.authorize('resident','admin'), compCtrl.create);

router.get('/mine', authCtrl.protect, authCtrl.authorize('resident','admin'), compCtrl.getMine);

router.put('/:id', authCtrl.protect, authCtrl.authorize('resident','admin'), compCtrl.update);

router.delete('/:id', authCtrl.protect, authCtrl.authorize('resident','admin'), compCtrl.remove);

router.get('/', authCtrl.protect, authCtrl.authorize('admin'), compCtrl.listAll);

router.put('/:id/approve', authCtrl.protect, authCtrl.authorize('admin'), compCtrl.approve);
router.put('/:id/complete', authCtrl.protect, authCtrl.authorize('admin'), compCtrl.complete);

module.exports = router;