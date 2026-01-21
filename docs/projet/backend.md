# **Préparer le projet**

- Crée un dossier pour ton backend :

```bash
mkdir backend
cd backend
```

- Initialise un projet Node.js :

```bash
npm init -y
```

Ça crée un `package.json` avec toutes les infos de ton projet.

- Installe les dépendances essentielles :

```bash
npm install express mongoose dotenv cors
```

- **express** → framework pour créer des routes et serveur
- **mongoose** → interface pour MongoDB
- **dotenv** → variables d’environnement (ex : URL Mongo)
- **cors** → pour autoriser le frontend à accéder à ton API

- Installe les dépendances de développement :

```bash
npm install --save-dev nodemon
```

- **nodemon** → redémarre le serveur automatiquement quand tu modifies un fichier

Dans ton `package.json`, ajoute un script pour lancer le serveur avec nodemon :

```json
"scripts":{
"start":"node server.js",
"dev":"nodemon server.js"
}
```

# **Créer la structure du projet**

On va créer cette arborescence :

```
backend/
├──src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── app.js
└── server.js
```

- **server.js** → point d’entrée du serveur
- **app.js** → configuration Express (middlewares, routes)
- **routes/** → fichiers pour les routes (ex : `articles.js`)
- **controllers/** → logique métier (ex : créer un article)
- **models/** → modèles Mongoose (ex : Article)
- **middlewares/** → fonctions intermédiaires (ex : auth)

# **Installer MongoDB**

### Local (sur VPS ou PC)

1. Télécharger et installer MongoDB Community Server depuis le site officiel ou via ton package manager (Ubuntu : `sudo apt install mongodb`).
2. Lancer le service MongoDB :

```bash
sudo systemctl start mongod
sudo systemctlenable mongod
```

3. Tester la connexion :

```bash
mongo
```

On entre dans le shell MongoDB.

# **Configurer la connexion backend**

- Crée un fichier `.env` à la racine de ton projet :

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/saintbarthvolley
```

Si on utilise Atlas, remplacer l’URL par celle fournie.

- Dans **server.js**, on se connecte à MongoDB avec Mongoose :

```jsx
const mongoose =require('mongoose');
const dotenv =require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() =>console.log("MongoDB connecté"))
  .catch(err =>console.error(err));
```

> À ce stade, la base sera automatiquement créée dès que l'on insérera un premier document.
> 

# **Créer le serveur de base**

**server.js** :

```jsx
const dotenv =require('dotenv');
dotenv.config();

const app =require('./src/app');
const mongoose =require('mongoose');

constPORT = process.env.PORT ||5000;
constMONGO_URI = process.env.MONGO_URI ||'mongodb://127.0.0.1:27017/volley';

mongoose.connect(MONGO_URI)
  .then(() => {
console.log('MongoDB connecté');
    app.listen(PORT,() => {
console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch(err =>console.error(err));
```

- On lit les variables d’environnement avec dotenv
- On se connecte à MongoDB
- On démarre le serveur Express

# **Vérifier que ça fonctionne**

- Lancer le backend (`npm run dev`)
- Créer un article via l'API (`POST /api/articles`)
- MongoDB créera automatiquement :
    - La base `volley`
    - La collection `articles`
    - Le document

# **Configurer Express (app.js)**

**src/app.js** :

```jsx
const express =require('express');
const cors =require('cors');

const app =express();

// Middlewares globaux
app.use(cors());
app.use(express.json());// pour lire le JSON des requêtes

// Exemple route test
app.get('/',(req, res) => {
  res.send('API Volley fonctionne !');
});

// Import des routes
const articlesRoutes =require('./routes/articles');
app.use('/api/articles', articlesRoutes);

module.exports = app;
```

- `express.json()` permet de lire les `req.body` JSON
- `/api/articles` → endpoint pour gérer les actualités (GET/POST/PUT/DELETE)

# **Créer un modèle Mongoose**

**src/models/Article.js** :

```jsx
const mongoose =require('mongoose');

constArticleSchema =new mongoose.Schema({
title: {type:String,required:true },
content: {type:String,required:true },
publishedAt: {type:Date,default:Date.now },
status: {type:String,enum: ['draft','published'],default:'draft' }
});

module.exports = mongoose.model('Article',ArticleSchema);
```

- Chaque article a un titre, un contenu, une date et un statut
- `_id` est automatique

# **Créer un controller**

**src/controllers/articlesController.js** :

```jsx
constArticle =require('../models/Article');

// GET all articles
exports.getAllArticles =async (req, res) => {
try {
const articles =awaitArticle.find();
    res.json(articles);
  }catch (err) {
    res.status(500).json({message: err.message });
  }
};

// POST create article
exports.createArticle =async (req, res) => {
const { title, content, status } = req.body;
try {
const article =newArticle({ title, content, status });
await article.save();
    res.status(201).json(article);
  }catch (err) {
    res.status(400).json({message: err.message });
  }
};

// PUT update article
exports.updateArticle =async (req, res) => {
try {
const article =awaitArticle.findByIdAndUpdate(req.params.id, req.body, {new:true });
if (!article)return res.status(404).json({message:'Article non trouvé' });
    res.json(article);
  }catch (err) {
    res.status(400).json({message: err.message });
  }
};

// DELETE article
exports.deleteArticle =async (req, res) => {
try {
const article =awaitArticle.findByIdAndDelete(req.params.id);
if (!article)return res.status(404).json({message:'Article non trouvé' });
    res.json({message:'Article supprimé' });
  }catch (err) {
    res.status(500).json({message: err.message });
  }
};
```

- Chaque fonction correspond à un endpoint REST
- On utilise `async/await` pour la BDD

# **Créer les routes**

**src/routes/articles.js** :

```jsx
const express =require('express');
const router = express.Router();
const articlesController =require('../controllers/articlesController');

router.get('/', articlesController.getAllArticles);
router.post('/', articlesController.createArticle);
router.put('/:id', articlesController.updateArticle);
router.delete('/:id', articlesController.deleteArticle);

module.exports = router;
```

- Routes CRUD standard

# **Tester l’API**

- Lancer le serveur :

```bash
npm run dev
```

- Dans le navigateur : `http://localhost:5000/` → tu devrais voir :

```
API Volley fonctionne !
```

- Tester les routes `/api/articles` avec **Postman** :
- `GET /api/articles` → liste des articles
- `POST /api/articles` → crée un article
- `PUT /api/articles/:id` → modifie un article
- `DELETE /api/articles/:id` → supprime un article