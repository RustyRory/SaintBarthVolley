const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.send('API Volley fonctionne !');
});

// Importer les routes
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);


module.exports = app;
