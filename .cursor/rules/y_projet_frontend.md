# Frontend d'une Application de Gestion de Formations sur Solana

## Design et ergonomie :
- UI claire, minimaliste, et design system moderne.
- Utilisation cohérente des couleurs pour distinguer les actions
- Mises en page en cartes/blocs et contours doux.
- Interface responsive avec structure en colonnes.

## En-tête (Navbar)

- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.

- Menu de navigation (Les menus seront visibles suivant le role de connexion)
	-- Demande d'acces
	-- Portail Étudiant (role Etudiant)
	-- Portail Étudiant (role Formateur)
	-- Gestion des Formations (role Formateur)
		--- Sous page : Gestion des Formations (role Formateur)
		--- Sous page : Gestion des Sessions (role Formateur)
	-- Gestion des Étudiant (role Formateur)
	-- Administration (role Formateur)

- Bouton de connexion au wallet (à droite)
	-- Suivant le type de role assigné, la redirection de connexion sera differente :
		--- si Role Formateur, redirection sur la page "Administration"
		--- si Role Etudiant, redirection sur la page "Portail Étudiant"
		--- si pas de Role, redirection sur page de demande d'acces

- Acces Developpeur 
	-- L'adresse du Wallet "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy" sera ecrite dans le code (comme "dev_address" afin d'avoir tous les acces sans token)
	-- Le token et role "dev_address" auront été crees manuellement via la console, prevoir un fichier tuto détaillé "README_dev.txt"

## Page d'Accueil (`/`) 

- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Bouton "Select Wallet" est placé à droite, suggérant la connexion a un wallet avec reconnaissance des wallet existants (exemple : Phantom/Solflare/...)

- Section Principale (Main Section) 
	-- Bouton "Select Wallet" est placé au milieu, suggérant la connexion a un wallet avec reconnaissance des wallet existants (exemple : Phantom/Solflare/...)
	-- Un message de bienvenue centré, "Bienvenue sur AlyraSign", en texte gras pour mettre l'accent.
	-- Une description sous le message principal : "Application de gestion des présences pour les étudiants", explicitant la fonction principale de l'application.

- Pied de page (Footer) :
	-- Un texte d'invitation à la connexion : "Connectez-vous pour accéder à votre espace".
	
- Action du Bouton de connexion au wallet
	-- Suivant le type de role assigné, la redirection de connexion sera differente aprés la verification sur la blockchain :
		--- si Role Formateur, redirection sur la page "Administration"
		--- si Role Etudiant, redirection sur la page "Portail Étudiant"
		--- si pas de Role, redirection sur page de demande d'acces

- Acces Developpeur 
	-- L'adresse du Wallet "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy" sera ecrite dans le code (comme "dev_address" avec tous les acces)
	-- Le token et role "dev_address" seront crees manuellement via la console, prevoir un fichier tuto détaillé "README_dev.txt"

## Page de "Demande d'accés" (`/access`) 
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- Un message de bienvenue centré, "Bienvenue sur AlyraSign", en texte gras pour mettre l'accent.
	-- Une description sous le message principal : "Application de gestion des présences pour les étudiants", explicitant la fonction principale de l'application.
	-- Dans un encadré, tout le texte est centré :
		--- Titre : "Demande d'accés"
		--- Texte : "Vous n'avez pas encore accés à cette application."
		--- Texte : "Veuillez soumettre une demande d'accés"
		--- Titre du menu déroulant : Role souhaité
			---- Choix menu déroulant : Etudiant / Formateur
		--- Titre du champs message : "Message (optionnel)"
			---- Encart message avec en fond "Expliquez pourquoi vous demandez l'accés..."
		--- Bouton sur la longueur de l'encadré : "Soumettre la demande"
	-- Action du Bouton "Soumettre la demande"
		--- Envoi de l'adresse wallet prealablement et acuellement inscrite sur la blockchain, associée à l'ID de AlyraSign et tagué "Wait_Token" + tagué soit "Ask_Etudiant" ou soit "Ask_Formateur"

## Page "Administration" (`/admin/tokens`)
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Gestion des Formations / Gestion des Étudiant / Administration (sélectionné)
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- Titre : Gestion des authorisations de roles
	-- Roles predefinis (dans le code)
		--- Role Formateur (acces fonctionnalités formateur)
		--- Role Etudiant (acces fonctionnalités etudiant)
	-- Creation de Tokens "ALYRA"
		--- Assignation de role sur le token
		--- Assignation du token (+role) à l'adresse wallet recupérée sur la blockchain

## Page "Gestion des Formations" (`/admin/formations`) 
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Gestion des Formations (sélectionné) / Gestion des Étudiant / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- A gauche, Titre "Gestion des Formations"
	-- A droite, 2 boutons :
		--- Bouton violet "Synchroniser avec la Blockchain" - action qui recupere toutes les formations (+ sessions) valides de la blockchain
		--- Bouton bleu "Créer une Formation" - action qui active une fenetre modale de Creation d'une formation
	-- Au mileu, Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

 ### Zone de cartes de formations (`/admin/formations`)
	- Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

	- Chaque carte de formation contient :
		-- Titre de la formation (texte en gras, en haut) 
		-- Description courte
		-- Dates : début et fin de la formation, format JJ-MM-AAAA
		-- Nombre de sessions : affiché sous forme de compteur (ex. Sessions: 0)
		-- link "Voir sur Solana Explorer" : permet d'ouvrir un nouvel onglet avec l'adresse du wallet 
		-- Texte "Derniere synchronisation : {date+time}. Info visible uniquement si la formation a deja été synchronisée sur la blockchain
		-- Bouton vert : "Gérer les Sessions" - action de navigation vers une page de gestion de sessions associées
		-- Bouton orange/jaune : "Modifier" - action de modification de la carte formation
		-- Bouton rouge : "Supprimer" - action de suppression de la carte formation (tag "deleted")
		-- Bouton violet : "Synchroniser" - visible uniquement si la carte de formation vient d'etre crée ou modifiée ou qu'une session à été crée ou modifiée dans cette carte formation

	- Les cartes sont :
		-- Stylisées avec des bords arrondis
		-- Ombres portées légères pour un effet de profondeur
		-- Séparées par des marges/paddings clairs pour une bonne lisibilité

	- Creation d'une formation (modale)
		-- Titre "Créer une Nouvelle Formation"
		-- Description + champs texte
		-- Date de début au format JJ-MM-AAAA (Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif)
		-- Date de fin au format JJ-MM-AAAA (Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif)
		-- Bouton blanc "Annuler"
		-- Bouton bleu "Créer"
			--- Action du bouton "créer", affichage de la carte formation avec un bouton "Synchroniser" (local avant envoi sur la blockchain)

## Page "Gestion des Sessions" (`/admin/sessions`) 
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Gestion des Formations (sélectionné) / Gestion des Étudiant / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) via le bouton "Gérer les Sessions" de la carte formation
	- en bleu, une fleche vers la gauche + "Retour aux formations" - action (fil d'ariane) de retour sur la page des formations
		--> Bouton violet : "Synchroniser" - visible uniquement sur la carte de formation si une session à été crée ou modifiée
	- Titre a gauche, "Sessions de la formation"
	- Texte a gauche : nom de la formation + Dates de la formation (Du xx-xx-xxxx au xx-xx-xxxx) choisie
	-- A droite, 2 boutons :
		--- Bouton violet "Synchroniser avec la Blockchain" - action qui recupere toutes les formations (+ sessions) valides de la blockchain
		--- Bouton bleu "Créer une Formation" - action qui active une fenetre modale de Creation d'une session
	-- Au mileu, Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

 ### Zone de cartes de sessions (`/admin/sessions`) via le bouton "Gérer les Sessions" de la carte formation
	- Présentation sous forme de cartes alignées horizontalement, avec disposition en grille (flex ou grid).

	- Chaque carte de sessions contient :
		-- Titre de la session (texte en gras, en haut) 
		-- Dates de la session, format JJ-MM-AAAA 
		-- Heure de debut, format HH:MM
		-- Heure de fin, format HH:MM
		-- Bouton vert : "Gérer les Presences" - action de navigation vers une page de gestion des presences de la session
		-- Bouton orange/jaune : "Modifier" - action de modification de la carte session
		-- Bouton rouge : "Supprimer" - action de suppression de la carte session (tag "deleted")

	- Les cartes sont :
		-- Stylisées avec des bords arrondis
		-- Ombres portées légères pour un effet de profondeur
		-- Séparées par des marges/paddings clairs pour une bonne lisibilité

	- Creation d'une formation (modale)
		-- Titre de la formation (texte en gras, en haut) : "Creer une Nouvelle Session"
		-- Encadré bleu clair avec texte bleu foncé : "Periode de la formation" + Date "Du xx-xx-xxxx au xx-xx-xxxx"
			--- Les dates sont automatiquement recupérées sur la formation parent
		-- Description courte
		-- Dates de la formation, format JJ-MM-AAAA 
			--- Sélecteur de date permettant de choisir une nouvelle date avec un calendrier interactif
			--- Dans le calendrier interactif, seules les dates de la formation parent seront actives, les autres dates seront grisées et desactivées (non cliquable)
		-- Heure de debut, format HH:MM
		-- Heure de fin, format HH:MM
		-- Bouton blanc "Annuler"
		-- Bouton bleu "Créer"

## Page "Gestion des Étudiants" (`/admin/etudiants`) :
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Gestion des Formations / Gestion des Étudiant (sélectionné) / Administration 
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section) 
	-- Boutons sous menu à gauche
		--- Ajout des etudiants (`/admin/etudiants/ajout`) : par defaut
		--- Recherche Etudiants (`/admin/etudiants/recherche`)

 ### Sous-page Ajout des etudiants (`/admin/etudiants/ajout`) : par defaut
	- Section Principale (Main Section) 
		-- Titre de la Section : "Gestion des Étudiants"
		-- Formulaire d'Ajout de Groupe :
			--- Champ de Saisie : Un champ pour entrer le "Nom du groupe" avec un exemple pour guider l'utilisateur.
			--- Bouton d'Importation : Un bouton "Choisir un fichier" pour sélectionner un fichier contenant les étudiants à importer. Le nom du fichier sélectionné est affiché à côté.
			--- Instructions : Un texte explicatif sur les formats de fichier acceptés (.txt, .csv) et la structure requise (une adresse par ligne).
			--- Liste des Étudiants : Affichage des étudiants importés sous forme de texte (ici, un identifiant d'étudiant), qui peut être supprimé si nécessaire.
			--- Bouton d'Action : Un bouton "Ajouter le groupe en local" pour valider l'ajout du groupe.

		-- Titre de Section : "Groupes en attente de validation" pour indiquer les groupes qui nécessitent une approbation.
		-- Tableau : Un tableau affichant les groupes avec les colonnes suivantes :
			--- Nom du groupe : Le nom du groupe en attente.
			--- Nombre d'Étudiants : Le nombre d'étudiants associés au groupe.
			--- Étudiants : Une liste d'identifiants d'étudiants associés au groupe.
			--- Formations Associées : Dropdown affichant toutes les formations existantes pour choisir la formation à associer au groupe d'etudiants uploadé. 
				---- Apres le choix une ligne s'ajoute au-dessus du dropdown affichant le nom de la formation + link-texte "Retirer" pour supprimer la formation si besoin
				---- Possibilité d'ajouter autant de formation voulue avec le dropdown
			--- Actions : Boutons pour pousser le groupe sur la blockchain ou supprimer le groupe.
				---- Bouton vert "Pousser sur la Blockchain"
				---- Bouton rouge "Supprimer"

		-- Titre de Section : "Groupes validés sur la blockchain" pour distinguer les groupes qui ont été approuvés.
		-- Bouton bleu à droite : "Actualiser les donées Blockchain" - action de recuperation de la liste des groupes sur la blockchain.
		-- Tableau : Un tableau similaire à celui des groupes en attente, affichant les colonnes pour le nom du groupe, le nombre d'étudiants, et les formations associées.

 ### Sous-page Recherche Etudiants (`/admin/etudiants/recherche`)
	- Section Principale (Main Section) 
		-- Titre de la Section : "Recherchez un Étudiant"
			--- Affichage de toutes les formations associées à l'etudiant trouvé

## Page "Portail Étudiant" (`/etudiants`) :
- En-tête (Header)
	-- Logo à gauche : "AlyraSign", stylisé en bleu, avec un lien vers la page d'accueil.
	-- Menu à gauche : Portail Étudiant (sélectionné)
	-- Bouton "Select Wallet" est placé à droite, est deja connecté (via le Bouton "Select Wallet" de la Page d'Accueil) et affiche l'adresse tonquée du wallet avec un dropdown (Changer de Wallet / Deconnection)

- Section Principale (Main Section)  (`/etudiants/formations`) : par defaut
	-- Titre de la Section : "Mes Formations"
		--- Mis en avant de la prochaine session
		--- Liste des formations associées
