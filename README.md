# App Canadel V6 — Style V3

Cette version restaure le visuel de la V3 (fond, cartes, proportions et style général)
tout en conservant les fonctions récentes de l'application :
- FR / ENG
- Firebase / Firestore
- administration
- QR fusionné avec le logo Canadel

Les expérimentations visuelles V4/V5 et les fonds de meubles ont été retirés.


## V6.1 — correction iPhone
Le visuel V3 est conservé. Sur téléphone, la grille du formulaire passe maintenant à une seule colonne afin d'éviter le chevauchement et la coupure des champs.


## V6.2 — suivi anomalie
Lorsqu'une réception est confirmée avec une anomalie, le client reçoit un message lui demandant de communiquer avec son vendeur. Le message est bilingue FR/EN. Aucun message supplémentaire n'est affiché lorsque « Tout est conforme » est sélectionné.


## V6.3.1
Correction de la V6.3 : retour à la base V6.2 fonctionnelle et ajout isolé du bouton « Voir détails » dans l'administration.


## V6.4 — Photos Firebase Storage
Les photos choisies par le client sont téléversées dans Firebase Storage sous `receipts/<id>/...`.
Leurs URL sont enregistrées dans `receipts.photoUrls` dans Firestore et elles apparaissent dans Administration → Voir détails.

IMPORTANT : activez Firebase Storage dans la console Firebase puis publiez le fichier `storage.rules`.
Les règles fournies sont adaptées au prototype sans authentification : lecture publique et création d'images de moins de 10 Mo seulement. Pour la production, sécurisez l'administration avec Firebase Authentication.
