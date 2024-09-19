const db = require('../db');

// Get all messages
exports.getAllMessages = (req, res) => {
  db.query('SELECT * FROM message_log', (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving messages');
    }
    res.json(results);
  });
};

// Add a new message
exports.addMessage = (req, res) => {
  const { user_id, sender_name, recipient_name, message_content, category_id } = req.body;
  const query = 'INSERT INTO message_log (user_id, sender_name, recipient_name, message_content, category_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [user_id, sender_name, recipient_name, message_content, category_id], (err, results) => {
    if (err) {
      return res.status(500).send('Error adding the message');
    }
    res.status(201).send('Message added successfully');
  });
};
