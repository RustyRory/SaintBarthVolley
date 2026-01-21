const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const mongoose = require('mongoose');

const PORT = process.env.PORT ;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));
