const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// Define routes
router.get('/', callController.getAllCalls);
router.post('/', callController.addCall);

module.exports = router;
