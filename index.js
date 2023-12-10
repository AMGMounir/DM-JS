const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));

//MongoDB

async function main() {
    try {
      await mongoose.connect("mongodb://localhost/bibliotheque");
      console.log("connected to mongo");
    } catch (error) {
      console.log(error);
    }
  }


//SCHEMAS
const authorSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  dateNaissance: Date,
  dateDeces: Date,
});

const Author = mongoose.model('Author', authorSchema);

// Définis le schéma pour les livres
const bookSchema = new mongoose.Schema({
  titre: String,
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  resume: String,
  isbn: String,
});

const Book = mongoose.model('Book', bookSchema);

//
app.get('/', async (req, res) => {
  try {
    const numAuthors = await Author.countDocuments();
    const numBooks = await Book.countDocuments();
    res.render('index', { numAuthors, numBooks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.get('/authors', async (req, res) => {
  const authors = await Author.find();
  res.render('authors', { authors });
});


app.get('/authors/new', (req, res) => {
  res.render('newAuthor');
});


app.post('/authors', async (req, res) => {
  const { nom, prenom, dateNaissance, dateDeces } = req.body;
  const newAuthor = new Author({
    nom,
    prenom,
    dateNaissance,
    dateDeces,
  });
  await newAuthor.save();
  res.redirect('/authors');
});


app.get('/authors/edit/:id', async (req, res) => {
  const author = await Author.findById(req.params.id);
  res.render('editAuthor', { author });
});

app.post('/authors/edit/:id', async (req, res) => {
  const { nom, prenom, dateNaissance, dateDeces } = req.body;
  await Author.findByIdAndUpdate(req.params.id, {
    nom,
    prenom,
    dateNaissance,
    dateDeces,
  });
  res.redirect('/authors');
});

app.get('/authors/delete/:id', async (req, res) => {
  await Author.findOneAndDelete(req.params.id);
  res.redirect('/authors');
});

app.get('/books', async (req, res) => {
  const books = await Book.find().populate('auteur');
  res.render('books', { books });
});

app.get('/books/new', async (req, res) => {
  const authors = await Author.find();
  res.render('newBook', { authors });
});


app.post('/books', async (req, res) => {
  const { titre, auteur, resume, isbn } = req.body;
  const newBook = new Book({
    titre,
    auteur,
    resume,
    isbn,
  });
  await newBook.save();
  res.redirect('/books');
});


app.get('/books/edit/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).populate('auteur');
  const authors = await Author.find();
  res.render('editBook', { book, authors });
});

app.post('/books/edit/:id', async (req, res) => {
  const { titre, auteur, resume, isbn } = req.body;
  await Book.findByIdAndUpdate(req.params.id, {
    titre,
    auteur,
    resume,
    isbn,
  });
  res.redirect('/books');
});

app.get('/books/delete/:id', async (req, res) => {
  try {
    await Book.findOneAndDelete({ _id: req.params.id });
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la suppression du livre');
  }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
main()