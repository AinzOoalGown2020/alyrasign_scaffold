# Plan de Développement - Projet AlyraSign

- En cas de doute, pose moi tes questions.
- Toujours penser à centraliser les données importantes dans @.env.local

## Références des documents originaux

- [Spécifications Frontend](.cursor/rules/y_projet_frontend.md)
- [Architecture du Projet](.cursor/rules/y_projet_architecture.md)
- [Developpement des Smart Contracts Solana](@y_plan_dev_blockchain.md)

## Phase 1 : Configuration et Structure de Base

### 1.1 Configuration du Projet
- [x] Vérifier et mettre à jour les dépendances dans package.json
- [x] Configurer l'environnement de développement (devnet Solana)
- [x] Mettre en place les variables d'environnement

### 1.2 Structure des Dossiers
- [x] Organiser les dossiers selon l'architecture définie
- [x] Créer les composants de base (layout, navigation, etc.)
- [x] Configurer les routes Next.js

### 1.3 Configuration de TailwindCSS
- [x] Configurer les thèmes et couleurs selon les spécifications
- [x] Créer les composants UI de base (boutons, cartes, formulaires, etc.)

## Phase 2 : Développement du Backend Solana

### 2.1 Définition des Structures de Données
- [x] Définir les structures pour les formations
- [x] Définir les structures pour les sessions
- [x] Définir les structures pour les groupes d'étudiants
- [x] Définir les structures pour les demandes d'accès

### 2.2 Développement des Smart Contracts
- [x] Centraliser la configuration du Programme ID dans .env.local
- [x] Créer les structures d'interface IDL conformes à Anchor
- [x] Implémenter le contrat pour la gestion des formations
- [x] Implémenter le contrat pour la gestion des sessions
- [x] Implémenter le contrat pour la gestion des présences
- [x] Implémenter le contrat pour la gestion des demandes d'accès
- [x] Implémenter le système de tokens pour les rôles

### 2.3 Tests des Smart Contracts
- [x] Écrire des tests unitaires pour les demandes d'accès
- [x] Écrire des tests unitaires pour les formations
- [x] Écrire des tests unitaires pour les sessions
- [x] Écrire des tests unitaires pour les présences
- [ ] Écrire des tests d'intégration
- [ ] Effectuer des tests de performance

## Phase 3 : Développement du Frontend

### 3.1 Page d'Accueil et Authentification
- [x] Développer la page d'accueil
- [x] Implémenter la connexion wallet
- [x] Développer la page de demande d'accès

### 3.2 Portail Formateur
- [x] Développer la page d'administration
- [x] Développer la gestion des formations
- [x] Développer la gestion des sessions
- [x] Développer la gestion des étudiants

### 3.3 Portail Étudiant
- [x] Développer la page d'accueil étudiant
- [x] Développer la visualisation des formations
- [x] Développer la gestion des présences

### 3.4 Composants Communs
- [x] Développer la barre de navigation
- [x] Développer le pied de page
- [x] Développer les composants de notification
- [x] Développer les modales et formulaires communs

## Phase 4 : Intégration et Tests

### 4.1 Intégration Frontend-Backend
- [x] Intégrer les smart contracts avec le frontend (simulation avec localStorage)
- [x] Développer l'interface de gestion des demandes d'accès
- [x] Améliorer le tableau de bord blockchain
- [ ] Implémenter la synchronisation des données
- [x] Gérer les erreurs et les cas limites

### 4.2 Tests d'Intégration
- [x] Tests des flux complets (création de formation, gestion des sessions, etc.)
- [ ] Tests de performance
- [ ] Tests de sécurité

### 4.3 Tests Utilisateurs
- [x] Tests avec des formateurs
- [x] Tests avec des étudiants
- [x] Collecte et intégration des retours

## Phase 5 : Optimisation et Déploiement

### 5.1 Optimisation
- [x] Centraliser les configurations dans .env.local
- [x] Nettoyer les wallets de test dans .env.local
- [x] Uniformiser l'ID du programme dans tous les fichiers de configuration
- [ ] Optimiser les transactions Solana
- [x] Optimiser les performances du frontend
- [x] Optimiser l'expérience utilisateur

### 5.2 Documentation
- [x] Documenter le code
- [x] Créer un guide d'utilisation
- [x] Créer un guide de déploiement

### 5.3 Déploiement
- [x] Déployer les smart contracts sur devnet
- [x] Déployer l'application frontend
- [ ] Configurer le monitoring et les alertes

## Points de Contrôle

1. Fin de la Phase 1 : ✅ Structure de base fonctionnelle
2. Fin de la Phase 2 : ✅ Smart contracts développés et testés unitairement
3. Fin de la Phase 3 : ✅ Interface utilisateur complète
4. Fin de la Phase 4 : ⏳ Application intégrée et testée
5. Fin de la Phase 5 : ⏳ Application déployée et documentée

## Prochaines étapes prioritaires
1. Implémenter le système de tokens pour les rôles
2. Implémenter les tests d'intégration
3. Remplacer la simulation localStorage par les vraies transactions blockchain
4. Configurer le monitoring pour suivre les transactions blockchain

