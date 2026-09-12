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


## V6.3 — détails complets administration
Un bouton « Voir détails » est ajouté aux réceptions. Il ouvre une fiche complète avec toutes les données enregistrées du formulaire et les informations d'anomalie. Les photos s'afficheront ici lorsqu'elles auront des URL Firebase Storage enregistrées.
