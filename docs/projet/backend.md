# Méthodologie backend

## **Préparer le projet**

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

## **Créer la structure du projet**

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

## **Installer MongoDB**

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

## **Configurer la connexion backend**

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

> La base sera automatiquement créée dès que l'on insérera un premier document.
> 

# **Exemple de création de collection**

## **Modèle Mongoose (`User.js`)**

**`src/models/User.js`** :

```jsx
const mongoose =require('mongoose');
const bcrypt =require('bcrypt');

constUserSchema =new mongoose.Schema({
email: {
type:String,
required:true,
unique:true,
lowercase:true,
trim:true
  },
passwordHash: {type:String,required:true },
role: {type:String,enum: ['admin','editor'],default:'editor' },
firstName: {type:String,required:true },
lastName: {type:String,required:true },
isActive: {type:Boolean,default:true },
lastLoginAt: {type:Date,default:null },
passwordUpdatedAt: {type:Date,default:null }
}, {timestamps:true });

// Comparer un mot de passe
UserSchema.methods.comparePassword =asyncfunction(password) {
returnawait bcrypt.compare(password,this.passwordHash);
};

// Définir ou changer le mot de passe
UserSchema.methods.setPassword =asyncfunction(password) {
const salt =await bcrypt.genSalt(10);
this.passwordHash =await bcrypt.hash(password, salt);
this.passwordUpdatedAt =newDate();
};

module.exports = mongoose.model('User',UserSchema);

```

## **Controller (`usersController.js`)**

**`src/controllers/usersController.js`** :

```jsx
constUser =require('../models/User');

// GET all users
exports.getAllUsers =async (req, res) => {
try {
const users =awaitUser.find().select('-passwordHash');// Ne jamais renvoyer les passwords
    res.json(users);
  }catch (err) {
    res.status(500).json({message: err.message });
  }
};

// GET single user
exports.getUserById =async (req, res) => {
try {
const user =awaitUser.findById(req.params.id).select('-passwordHash');
if (!user)return res.status(404).json({message:'Utilisateur non trouvé' });
    res.json(user);
  }catch (err) {
    res.status(500).json({message: err.message });
  }
};

// POST create user
exports.createUser =async (req, res) => {
try {
const { email, password, role, firstName, lastName } = req.body;
const user =newUser({ email, role, firstName, lastName });
await user.setPassword(password);
await user.save();
    res.status(201).json({message:'Utilisateur créé',userId: user._id });
  }catch (err) {
    res.status(400).json({message: err.message });
  }
};

// PUT update user
exports.updateUser =async (req, res) => {
try {
const { email, role, firstName, lastName, isActive, password } = req.body;
const user =awaitUser.findById(req.params.id);
if (!user)return res.status(404).json({message:'Utilisateur non trouvé' });

if (email) user.email = email;
if (role) user.role = role;
if (firstName) user.firstName = firstName;
if (lastName) user.lastName = lastName;
if (isActive !==undefined) user.isActive = isActive;
if (password)await user.setPassword(password);

await user.save();
    res.json({message:'Utilisateur mis à jour' });
  }catch (err) {
    res.status(400).json({message: err.message });
  }
};

// DELETE user
exports.deleteUser =async (req, res) => {
try {
const user =awaitUser.findByIdAndDelete(req.params.id);
if (!user)return res.status(404).json({message:'Utilisateur non trouvé' });
    res.json({message:'Utilisateur supprimé' });
  }catch (err) {
    res.status(500).json({message: err.message });
  }
};

```

## **Routes (`users.js`)**

**`src/routes/users.js`** :

```jsx
const express =require('express');
const router = express.Router();
const usersController =require('../controllers/usersController');

// Routes CRUD utilisateurs
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;

```

# **Importer les routes dans `app.js`**

**`src/app.js`** :

```jsx
const express =require('express');
const cors =require('cors');

const app =express();

app.use(cors());
app.use(express.json());

// Route test
app.get('/',(req, res) => {
  res.send('API Volley fonctionne !');
});

// Importer les routes
const newsRoutes =require('./routes/news');
app.use('/api/news', newsRoutes);

const usersRoutes =require('./routes/users');
app.use('/api/users', usersRoutes);

module.exports = app;
```

## **`server.js`**

**`server.js`** :

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

## **Tester l'API Users**

1. Lancer le serveur :

```bash
npm run dev
```

2. Tester les routes avec Postman :

| Méthode | URL | Description |
| --- | --- | --- |
| GET | /api/users | Liste tous les utilisateurs |
| GET | /api/users/:id | Récupérer un utilisateur |
| POST | /api/users | Créer un utilisateur |
| PUT | /api/users/:id | Mettre à jour un utilisateur |
| DELETE | /api/users/:id | Supprimer un utilisateur |

## **Tester la route “GET /”**

1. Ouvre Postman
2. Crée une nouvelle requête `GET`
3. URL : `http://localhost:5000/`
4. Clique sur **Send**

✅ Tu devrais voir :

```
API Volley fonctionne !
```

> Ça confirme que le serveur tourne et que Express répond.
> 

## **Tester la collection Users**

### GET all users

- Méthode : `GET`
- URL : `http://localhost:5000/api/users`
- Send → tu devrais recevoir un tableau vide `[]` si aucun utilisateur n’existe encore

### POST create user

- Méthode : `POST`
- URL : `http://localhost:5000/api/users`
- Body → `raw` → `JSON` :

```json
{
"email":"admin@clubvolley.fr",
"password":"MotDePasseSuperSecret",
"role":"admin",
"firstName":"Jean",
"lastName":"Dupont"
}
```

- Clique sur **Send**
    
    ✅ Tu devrais recevoir un JSON avec un message de succès et `userId`.
    

> MongoDB va créer automatiquement la base volley et la collection users.
> 

### GET single user

- Méthode : `GET`
- URL : `http://localhost:5000/api/users/<userId>`
- `<userId>` → l’ID retourné lors du POST
- Send → tu devrais voir les infos du user (sans le password)

### PUT update user

- Méthode : `PUT`
- URL : `http://localhost:5000/api/users/<userId>`
- Body → `raw` → `JSON` :

```json
{
"lastName":"Durand",
"password":"NouveauMotDePasse123"
}
```

- Send → succès, l’utilisateur est mis à jour

### DELETE user

- Méthode : `DELETE`
- URL : `http://localhost:5000/api/users/<userId>`
- Send → utilisateur supprimé
