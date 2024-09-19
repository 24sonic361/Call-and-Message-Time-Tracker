const db = require('../db');

// Get all calls
exports.getAllCalls = (req, res) => {
  db.query('SELECT * FROM call_log', (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving calls');
    }
    res.json(results);
  });
};

// Add a new call
exports.addCall = (req, res) => {
  const { user_id, contact_name, contact_number, call_duration, category_id } = req.body;
  const query = 'INSERT INTO call_log (user_id, contact_name, contact_number, call_duration, category_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [user_id, contact_name, contact_number, call_duration, category_id], (err, results) => {
    if (err) {
      return res.status(500).send('Error adding the call');
    }
    res.status(201).send('Call added successfully');
  });
};
