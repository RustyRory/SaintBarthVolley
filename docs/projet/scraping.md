# Scraping web

# Analyse de la page FFVB

## Objectif

**Comprendre le HTML**

### Identifier :

- Où est le **classement**
- Où sont les **matchs**
- Comment reconnaître **UNE ligne valide**

### Questions à se poser

Pour CHAQUE table :

1. Quel est le conteneur commun ?
2. À quoi ressemble une ligne utile (`<tr>`) ?
3. Combien de colonnes (`<td>`) ?
4. Quelles colonnes sont obligatoires ?
5. Qu’est-ce qui permet d’ignorer les lignes parasites ?

## Remplissage de `standings`

### Structure de la table classement

La table commence ici :

```html
<tablecellspacing="1"cellpadding="2"border="0"align="center"...>
```

Chaque **ligne d’équipe** = un `<tr bgcolor="#EEEEF8">`

La **première ligne** est l’en-tête (à ignorer).

Ordre réel des colonnes par ligne équipe :

| Index TD | Contenu affiché | Signification |
| --- | --- | --- |
| 0 | `1.` | Rang |
| 1 | `PATRONAGE LAIQUE LORIENT` | Nom équipe |
| 2 | `29` | Points |
| 3 | `12` | Joués |
| 4 | `11` | Gagnés |
| 5 | `1` | Perdus |
| 6 | *(vide)* | Forfaits |
| 7 | `2` | Victoires 3-0 |
| 8 | `5` | Victoires 3-1 |
| 9 | `4` | Victoires 3-2 |
| 10 | *(vide)* | Défaites 2-3 |
| 11 | *(vide)* | Défaites 1-3 |
| 12 | `1` | Défaites 0-3 |
| 13 | `33` | Sets pour |
| 14 | `16` | Sets contre |
| 15 | `2.063` | Coeff sets |
| 16 | `1138` | Points marqués |
| 17 | `1034` | Points encaissés |
| 18 | `1.101` | Coeff points |
| 19+ | Icônes | à ignorer |

### Mapping vers ta collection `standings`

Ton modèle :

```jsx
standings {
  championshipId,
  teamName,
  rank,
  points,
  played,
  wins,
  losses,
  setsFor,
  setsAgainst
}

```

Mapping clair :

| Champ Mongo | Source HTML |
| --- | --- |
| `championshipId` | connu via l’URL (3MB / ABCCS / saison) |
| `teamName` | td[1].text |
| `rank` | td[0] → enlever le `.` |
| `points` | td[2] |
| `played` | td[3] |
| `wins` | td[4] |
| `losses` | td[5] |
| `setsFor` | td[13] |
| `setsAgainst` | td[14] |

**Remarques importantes**

- Les colonnes vides existent → **ne pas compter les `<td>` non textuels**
- Toujours parser en `int`
- `teamName` = texte brut (pas d’ID FFVB fiable ici)

Exemple d’objet :

```json
{
"championshipId":"3MB_2025_2026",
"teamName":"PATRONAGE LAIQUE LORIENT",
"rank":1,
"points":29,
"played":12,
"wins":11,
"losses":1,
"setsFor":33,
"setsAgainst":16
}
```

## Remplissage de `matches`

### 🔎 Structure des matchs

Chaque **journée** commence par :

```html
<tr>
<tdcolspan="12">Journée 13</td>
</tr>
```

Ensuite, chaque match = un `<tr bgcolor="#EEEEF8">`

### Colonnes d’un match

Exemple ligne :

```html
<td>3MB074</td><!-- code match -->
<td>01/02/26</td><!-- date -->
<td>16:00</td><!-- heure -->
<td>C.P.B. RENNES 35</td><!-- équipe domicile -->
<td>⚽</td>
<td>CESSON VOLLEY...</td><!-- équipe extérieure -->
<td>2</td><!-- sets domicile -->
<td>3</td><!-- sets extérieur -->
<td>30:28, ...</td><!-- détail sets -->
<td>107-113</td><!-- points -->
<td>ARBITRES</td>
```

### Mapping vers `matches`

Ton modèle :

```jsx
matches {
  championshipId,
  opponentName,
  date,
  address,
  homeAway,
  status,
  scoreFor,
  scoreAgainst,
  setsDetail
}
```

Ici tu stockes **les matchs du club**, pas tous les matchs.

Donc il faut :

- connaître **le nom exact de TON équipe**
- comparer home / away

### 🏠 Logique home / away

Si `td[3] === TON_EQUIPE` → home

Si `td[5] === TON_EQUIPE` → away

### 📦 Mapping précis

| Champ Mongo | Source |
| --- | --- |
| `championshipId` | idem standings |
| `opponentName` | l’autre équipe |
| `date` | td[1] + td[2] |
| `homeAway` | comparaison |
| `status` | scores présents → `played`, sinon `scheduled` |
| `scoreFor` | td[6] ou td[7] selon home/away |
| `scoreAgainst` | inverse |
| `setsDetail` | td[8] |
| `address` | ❌ non présent sur cette page |

### Exemple match joué

```json
{
"championshipId":"3MB_2025_2026",
"opponentName":"CESSON VOLLEY SAINT-BRIEUC COTES D'ARMOR 2",
"date":"2026-02-01T16:00:00",
"homeAway":"home",
"status":"played",
"scoreFor":2,
"scoreAgainst":3,
"setsDetail":"30:28, 25:20, 16:25, 23:25, 13:15"
}
```

# Préparer les données “racines”

**Créer manuellement** :

### `Season`

Ex :

```json
{
"_id":"...",
"name":"2025-2026"
}

```

### `Team`

```json
{
"name":"AS Saint-Barthélemy d'Anjou VB",
"seasonId":"...",
"isArchived":false
}

```

### `Championship`

**1 championnat = 1 URL FFVB**

```json
{
"seasonId":"...",
"teamId":"...",
"federationUrl":"https://www.ffvb..."
}

```

Sans ça :

- pas de lien
- pas de cohérence
- pas d’update possible

# Script de scraping (console uniquement)

**Aucun Mongo**

Juste : *HTML → JS object*

### Télécharger la page

```jsx
axios.get(url)
```

### Parser le HTML

```jsx
const $ = cheerio.load(html);
```

### Extraire les données

```jsx
standings.push({
  teamName,
  rank,
  points,
});
```

### Vérifier avec `console.log`

- Données propres
- Nombres corrects
- Aucune ligne fantôme

Si ce n’est pas parfait ici → **STOP**, ne pas passer à Mongo

# Mapping vers les modèles Mongo

Quand le tableau JS est fiable :

### Relier les IDs

- retrouver `teamId` à partir du nom
- ajouter `championshipId`

### Upsert

```jsx
findOneAndUpdate(
  { championshipId, teamName },
  data,
  {upsert:true }
);
```

permet :

- mises à jour
- re-scraping sans doublons

# Scraping du classement (standings)

Résultat attendu :

- 1 document par équipe
- classement à jour
- lien championnat OK

**Ne passe PAS aux matchs tant que ça n’est pas stable**

# Scraping des matchs

Ici on gère :

- dates
- heures
- domicile / extérieur
- scores
- sets détaillés

### Découpage conseillé :

1. Identifier une “journée”
2. Identifier une ligne match
3. Distinguer :
    - match joué
    - match à venir
4. Parser les scores seulement si présents

# Normalisation & sécurité

À ajouter une fois que tout fonctionne :

- nettoyage des noms d’équipe
- parsing des dates (timezone)
- gestion des erreurs réseau
- logs propres
- limite de scraping (respect FFVB)

# Automatisation

Quand tout est stable :

### Options :

- script manuel
- cron
- tâche backend admin

Ex :

```bash
npm run scrape:ffvb
```


---

saison : 6985bb5d9903c98a455ca986
team : 6985bccd9903c98a455ca98b
champ : 6985bd859903c98a455ca98d
