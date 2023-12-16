require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bp = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.MONGO_DB_NAME,
});

const db = mongoose.connection;
db.once('open', () => {
});
const PokemonSchema = new mongoose.Schema({
  name: String,
  type: String,
});
const Pokemon = mongoose.model(process.env.MONGO_COLLECTION, PokemonSchema);

app.use(bp.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.get('/', async (req, res) => {
  const poke = await Pokemon.find();
  res.render('index', { pokemons: poke });
});
app.post('/add-pokemon', async (req, res) => {
  const { pokemonName } = req.body;
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const { name, types } = response.data;
    const newpoke = new Pokemon({
      name,
      type: types[0].type.name,
    });
    await newpoke.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error:', error.message);
    res.redirect('/');
  }
});
app.post('/remove', async (req, res) => {
  try {
    await Pokemon.deleteMany({});
    res.redirect('/');
  } catch (error) {
    console.error('Error:', error.message);
    res.redirect('/');
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
