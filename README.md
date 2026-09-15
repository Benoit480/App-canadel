# App Canadel V8.1 — Administration sécurisée

Version basée sur V7.1 avec Firebase Authentication pour l'administration.

## À faire une seule fois dans Firebase
1. Firebase Console → Authentication → Get started.
2. Sign-in method → activer **Email/Password**.
3. Authentication → Users → Add user → créer le compte administrateur.
4. Firestore Database → Rules → remplacer les règles par le contenu de `firestore.rules` puis **Publish**.
5. Mettre tous les fichiers de ce ZIP à la racine du dépôt GitHub Pages.

## Sécurité V8
- Le formulaire client reste public.
- Le tableau de bord exige une connexion Firebase.
- Un visiteur public ne peut plus lire la collection `receipts` avec les règles V8.
- Les administrateurs connectés peuvent lire et modifier les données.
- La suppression reste interdite.

IMPORTANT : publier `firestore.rules` dans Firebase Console est indispensable. Le fichier présent dans GitHub ne modifie pas les règles Firebase automatiquement.


## V8.1 — Accès administration discret
- Le bouton Administration est masqué sur la page publique.
- Accès privé : ajoutez `?admin=1` à l’adresse de l’application.
- Exemple GitHub Pages : `https://benoit480.github.io/App-canadel/?admin=1`
- Firebase Authentication et les règles Firestore restent obligatoires.

V8.2 — Correctif iPhone/Safari
- Corrige le rendu fantôme pouvant afficher deux fois la carte « Informations de commande » pendant le défilement.
- Aucun changement au formulaire, à Firebase ou à l'administration.
- Compatible avec Cloudflare Pages : https://candelvalid.pages.dev


V8.3: correctif iPhone/Safari du double rendu visuel. Retrait des calques GPU ajoutés en V8.2 et cache-busting des fichiers CSS/JS.


V8.4 — Entête client simplifié: retrait de la grande image, conservation du bandeau Canadel/ENG et ajout d'une carte texte Confirmer ma livraison.


## V8.5 — Administration
- Statut de réclamation modifiable directement : Nouvelle / En traitement / Traitée.
- Couleurs de statut pour repérage rapide.
- Bouton « Supprimer cette commande » dans Voir détails avec confirmation.
- La suppression Firestore est permise uniquement à un utilisateur Firebase Authentication connecté.

IMPORTANT : publier aussi le fichier `firestore.rules` dans Firebase Console > Firestore Database > Rules, sinon le bouton de suppression sera refusé par Firebase.

## V8.6
- Corrige le défilement de la fenêtre Détails de la réception sur iPhone/Safari.
- Le contenu peut maintenant défiler jusqu'au bouton de suppression.
- Aucun changement aux données Firebase ni au formulaire client.
