# Architecture d'une Application de Gestion de Formations sur Solana

## Introduction
Ce document décrit l'architecture d'une application de gestion de formations et de sessions sur la blockchain Solana. L'application permet aux formateurs de créer et gérer des formations, et aux étudiants de s'inscrire aux sessions et de signer leur présence. Toutes les données sont stockées de manière sécurisée et immuable sur Solana.

## Structure des Données

### Comptes de Stockage
- **Objectif** : Gérer efficacement les données sur Solana en utilisant des comptes de stockage pour stocker plusieurs formations et sessions dans un même compte.
- **Avantages** :
  - **Réduction des coûts de transaction** : Mise à jour d'un compte existant au lieu de créer une transaction pour chaque entité.
  - **Optimisation de l'espace** : Stockage structuré et efficace des données.
  - **Gestion simplifiée** : Un seul compte peut contenir plusieurs entités liées, facilitant leur récupération et leur gestion.

### Types de Comptes
- **Compte de Stockage des Formations** : Contient toutes les formations avec leurs métadonnées (nom, description, dates, statut, etc.).
- **Compte de Stockage des Sessions** : Contient toutes les sessions, liées aux formations par des IDs, avec leurs métadonnées.
- **Index des Formations/Sessions Actives** : Liste les IDs des formations et sessions actives pour une récupération rapide.
- **Compte de stockage des demandes d’accès** : Pour enregistrer les requêtes des utilisateurs (et leurs adresses de wallet) qui n’ont pas encore de rôle attribué. Il permettrait de suivre l’historique des demandes, de stocker les messages facultatifs et de faciliter leur traitement par les formateurs.
- **Compte de stockage des groupes d’étudiants** : Pour la gestion des groupes importés dans la section « Gestion des Étudiants », où vous avez des groupes en attente et validés sur la blockchain. Ce compte contiendrait les informations sur le nom du groupe, la liste des identifiants des étudiants, ainsi que les formations associées pour un accès et une gestion optimisés.

### Gestion des Statuts
- **Marquage logique** : Mise à jour d'un champ de statut (actif, supprimé, etc.) au lieu de supprimer physiquement les données.
- **Filtrage** : Filtrer les entrées marquées comme supprimées lors de la récupération des données.
- **Réutilisation d'espace** : Les emplacements marqués comme supprimés peuvent être réutilisés pour stocker de nouvelles données.

## Gestion de l'Espace et des Coûts

### Évaluation de la Taille des Données
- **Compte de stockage** : Chaque compte de stockage doit être évalué en fonction des contraintes de taille et de coûts du stockage sur Solana. L’idée est de structurer les données de manière à permettre des mises à jour groupées et une récupération rapide, tout en évitant la multiplication excessive des transactions.
- **Allocation d'espace** : Pour 100 formations, allouer 35 000 octets.
- **Extension** : Créer un nouveau compte de stockage de la même taille si la limite est atteinte.

### Optimisation des Transactions
- **Regroupement** : Effectuer plusieurs mises à jour dans une seule transaction.
- **Pagination** : Récupérer les données par lots pour réduire le nombre de transactions.
- **Indexation efficace** : Utiliser des comptes d'index pour accéder rapidement aux données actives.

## Gestion des Accès et Authentification

### Système de Tokens
- **Token Formateur** : Accès complet à toutes les fonctionnalités.
- **Token Étudiant** : Permet de consulter les formations, s'inscrire aux sessions, et accéder aux informations personnelles.
- **Ajout de nouveaux rôles** : Possibilité d'ajouter facilement de nouveaux types de tokens.
- **Mise à jour des droits** : Modification des droits associés à chaque type de token via des contrats intelligents.

### Processus d'Authentification
1. **Connexion** : L'utilisateur se connecte avec son portefeuille Solana.
2. **Vérification** : Vérification des tokens associés à l'adresse du portefeuille.
3. **Inscription** : Demande d'accès si l'utilisateur n'a pas de token.
4. **Validation et approbation** : Vérification et approbation par l'formateur.
5. **Émission du token** : Émission d'un token correspondant au rôle vérifié.
6. **Attribution des droits** : Accès aux fonctionnalités en fonction des tokens détenus.

### Association Token-Wallet
1. **Inscription** : L'utilisateur fournit son adresse de portefeuille.
2. **Vérification** : L'utilisateur signe un message pour prouver la propriété de l'adresse.
3. **Émission du token** : Émission d'un token approprié.
4. **Mise à jour des droits** : Mise à jour des droits d'accès en conséquence.


## Outils

- Metaplex
- Scaffold

### Frameworks principaux
- Next.js : v13.5.1
- React : v18.2.0
- TypeScript : v5.3.3
- Node.js : v23.10.0

### Bibliothèques Solana
- @solana/web3.js : v1.78.5
- @coral-xyz/anchor : v0.30.1
- AVM (Anchor Version Manager) : v0.31.0
- Solana CLI : v2.0.25 (Agave)

### Outils de développement
- TailwindCSS : v3.4.1

### Environnement
- RPC URL : Devnet Solana
