const express = require('express');
const { protect, restrictTo } = require('../controllers/authController'); 
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/residents', protect, restrictTo('admin'), userController.listAllResidents);

router.patch('/residents/:userId/maintenance', protect, restrictTo('admin'), userController.updateMaintenanceStatus);

module.exports = router;