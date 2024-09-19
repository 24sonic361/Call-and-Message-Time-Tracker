const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Define routes
router.get('/', messageController.getAllMessages);
router.post('/', messageController.addMessage);

module.exports = router;
