// Simulated in-memory "database" for calls
let calls = [
    { id: 1, contact: 'Alice Johnson', duration: 12, timestamp: new Date() },
    { id: 2, contact: 'Bob Brown', duration: 8, timestamp: new Date() }
];

// Function to get all calls
const getCalls = (req, res) => {
    // Respond with the list of all calls
    res.json(calls);
};

// Function to add a new call
const addCall = (req, res) => {
    // Extract the call details from the request body
    const { contact, duration } = req.body;

    // Create a new call entry with a unique ID
    const newCall = { 
        id: calls.length + 1, 
        contact, 
        duration, 
        timestamp: new Date() 
    };


    calls.push(newCall);


    res.status(201).json(newCall);
};

module.exports = { getCalls, addCall };
