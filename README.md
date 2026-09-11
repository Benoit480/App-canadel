# App Canadel V3 — QR universel

## Changement principal
Il n'y a plus un QR par commande. Le même QR universel est imprimé sur toutes les boîtes. Le client scanne puis entre son numéro de commande et ses informations.

## V3
- QR universel
- Logo Canadel visuellement intégré au centre du QR
- Formulaire client
- Détection de numéro de commande déjà confirmé
- État de livraison
- Satisfaction 1–5
- Article, quantité et description en cas de problème
- Sélection/prévisualisation de photos
- Tableau de bord
- Réceptions
- Recherche
- Réclamations
- Statistiques
- Page imprimable du QR universel

## GitHub
Remplacer les fichiers du dépôt App-canadel par le contenu de ce ZIP.

## Firestore
La V3 utilise la collection `receipts`. Publier `firestore.rules` pendant les tests.

## À sécuriser avant production
Les règles de test sont ouvertes. Ajouter Firebase Authentication pour l'administration avant utilisation publique.

## Photos
Le formulaire permet déjà de choisir et prévisualiser des photos. Leur téléversement permanent sera activé après configuration de Firebase Storage.


## V3.1 — Design maquette
Interface entièrement refaite en style clair Canadel: blanc, gris doux, accents rouge Canadel, cartes et formulaires identiques à la direction visuelle des maquettes précédentes. La logique V3 QR universel est conservée.
