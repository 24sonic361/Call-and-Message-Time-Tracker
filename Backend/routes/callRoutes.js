const express = require('express');
const router = express.Router();
const { getCalls, addCall } = require('../controllers/callController');

// Define the GET route to fetch all call logs
router.get('/', getCalls);

// Define the POST route to add a new call log
router.post('/', addCall);

module.exports = router;
