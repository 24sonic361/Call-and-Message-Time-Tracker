const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importing routes
const callRoutes = require('./routes/callRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/calls', callRoutes);
app.use('/api/messages', messageRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

