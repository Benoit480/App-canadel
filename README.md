# App Canadel V4 — reproduction fidèle de la maquette

Version GitHub Pages prête à publier.

## Visuel
Cette version reprend la direction visuelle de la maquette de référence:
- bleu/noir profond
- logo Canadel centré sur l'expérience client
- champs bleu nuit
- boutons verts
- cartes et bordures bleu acier
- écran d'état de livraison
- satisfaction par étoiles
- ajout/prévisualisation de photos
- dashboard ordinateur avec navigation verticale
- cartes Total réceptions / Conformes / Avec problème / Satisfaction
- QR universel avec logo Canadel au centre

## Fonctionnement
Le QR est unique pour toutes les boîtes et pointe vers la racine de l'application.
Le client entre lui-même son numéro de commande.

## Installation GitHub
Décompresser le ZIP et déposer directement son contenu à la racine du dépôt GitHub Pages.

## Firebase
La configuration du projet app-canadel est déjà incluse.
Publier aussi les règles `firestore.rules` pour les essais.

IMPORTANT: les règles actuelles sont volontairement permissives pour le développement. Il faut sécuriser l'administration avec Firebase Authentication avant une mise en production publique.

## Photos
La sélection et la prévisualisation sont présentes. Le stockage permanent des images nécessitera l'activation de Firebase Storage.
