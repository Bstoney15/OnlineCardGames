const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(bodyParser.json());


// fake database for testing
const users = {
  "alice": "password123",
  "bob": "word"
};

// Dummy login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const storedPassword = users[username];

  if (!storedPassword || storedPassword !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
