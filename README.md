# App Canadel V8 — Administration sécurisée

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
