// Simulated in-memory "database" for messages
let messages = [
    { id: 1, content: 'Meeting at 4 PM', recipient: 'Alice Johnson', timestamp: new Date() },
    { id: 2, content: 'Don’t forget the report!', recipient: 'Bob Brown', timestamp: new Date() }
];

// Function to get all messages
const getMessages = (req, res) => {
    // Respond with the list of all messages
    res.json(messages);
};

// Function to add a new message
const addMessage = (req, res) => {
    // Extract the message details from the request body
    const { content, recipient } = req.body;

    // Create a new message entry with a unique ID
    const newMessage = { 
        id: messages.length + 1, 
        content, 
        recipient, 
        timestamp: new Date() 
    };

    // Add the new message to the in-memory messages array
    messages.push(newMessage);

    // Respond with the new message that was added
    res.status(201).json(newMessage);
};

module.exports = { getMessages, addMessage };
