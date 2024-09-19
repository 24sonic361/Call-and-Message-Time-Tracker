const express = require('express');
const router = express.Router();
const { getMessages, addMessage } = require('../controllers/messageController');

// Define the GET route to fetch all message logs
router.get('/', getMessages);

// Define the POST route to add a new message log
router.post('/', addMessage);

module.exports = router;
