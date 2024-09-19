const express = require('express');
const app = express();
const callRoutes = require('./routes/callRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Middleware to parse JSON requests
app.use(express.json());

// Define the routes
app.use('/api/calls', callRoutes);
app.use('/api/messages', messageRoutes);

// Start the server on port 3000 or a specified port in the environment
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
