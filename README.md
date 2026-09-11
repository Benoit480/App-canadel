# Suivi Commandes QR

Prototype PWA prêt pour GitHub Pages + Firebase.

## Installation
1. Créer un dépôt GitHub et téléverser tous les fichiers.
2. Dans Firebase, créer une application Web.
3. Activer **Cloud Firestore** et **Storage**.
4. Copier la configuration Firebase dans `firebase-config.js`.
5. Publier les règles `firestore.rules` et `storage.rules` dans Firebase.
6. Dans GitHub : Settings → Pages → Deploy from branch → `main` / root.

## Utilisation
- Bouton **Administration** : créer une commande.
- Un identifiant aléatoire est créé et un QR unique est généré.
- Le client scanne le QR, confirme la réception, choisit l'état, donne une note et peut joindre des photos.
- Les réponses remontent dans le tableau de bord.

## Important avant production
Ce prototype privilégie la simplicité de mise en route. Les règles Firestore permettent actuellement l'accès public aux commandes afin que les clients puissent répondre sans compte. Avant une utilisation commerciale réelle, ajoutez Firebase Authentication pour l'administration et une fonction serveur/token à usage limité pour empêcher toute modification non autorisée.
