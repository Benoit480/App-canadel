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

## V4.1 iPhone Fix
- Logo Canadel embarqué directement dans le code pour éliminer les images cassées sur GitHub Pages.
- Formulaire forcé en une seule colonne sur iPhone.
- Correction des débordements des champs.
- Espacements, titres, cartes et boutons réajustés à partir du test réel iPhone.

## V4.2 — transfert GitHub simplifié
Le dossier `assets` a été retiré. Le logo Canadel est intégré directement dans le code.
Tous les fichiers à transférer sur GitHub sont maintenant au même niveau.

## V4.3 — QR logo sans bordure
Le logo Canadel est superposé directement au centre du QR universel, sans cadre, sans fond blanc ajouté, sans padding et sans bordure.
