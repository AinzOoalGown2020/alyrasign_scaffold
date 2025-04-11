# AlyraSign - Application de Gestion des Présences sur Solana

AlyraSign est une application décentralisée (dApp) de gestion des présences pour les établissements de formation, construite sur la blockchain Solana.

## Fonctionnalités

- Authentification via wallet Solana (Phantom, Solflare, etc.)
- Gestion des rôles (étudiant, formateur) via tokens blockchain
- Gestion des formations et des sessions
- Gestion des groupes d'étudiants
- Suivi des présences

## Mode de démonstration

L'application est actuellement en mode de démonstration avec des données simulées. Pour tester l'application sans implémenter les smart contracts Solana, vous pouvez utiliser les wallets de test suivants :

### Adresses de test prédéfinies

| Adresse Wallet | Rôle assigné |
|----------------|--------------|
| 79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy | formateur (admin) |

Pour tester l'application :
1. Connectez-vous avec l'un des wallets ci-dessus
2. L'application vous redirigera automatiquement vers l'interface correspondant à votre rôle
3. Vous pouvez également tester le processus de demande d'accès avec un nouveau wallet

**Note** : Les données sont stockées dans le localStorage du navigateur. Pour une démonstration inter-navigateurs ou multi-appareils, utilisez les adresses prédéfinies ci-dessus.

## État du Projet

Le frontend de l'application est fonctionnel avec des données simulées. Pour finaliser le projet, l'implémentation des smart contracts Solana est nécessaire.

### Prochaines étapes

1. **Implémentation des Smart Contracts Solana**

   - Créer un programme Solana pour la gestion des rôles :
     ```bash
     # Initialiser un nouveau projet Anchor
     anchor init alyrasign_program
     cd alyrasign_program
     ```

   - Structure des comptes blockchain à implémenter :
     - Compte de stockage des demandes d'accès
     - Compte de tokens pour les rôles
     - Compte de stockage des formations
     - Compte de stockage des sessions
     - Compte de stockage des groupes d'étudiants

2. **Instructions du Programme Solana à développer**

   - Gestion des Rôles :
     ```rust
     // Exemple de structure pour le programme de gestion des rôles
     #[program]
     pub mod alyrasign_roles {
         use super::*;
         
         pub fn request_role(ctx: Context<RequestRole>, role: String, message: String) -> Result<()> {
             // Code pour créer une demande de rôle
         }
         
         pub fn approve_role(ctx: Context<ApproveRole>, request_id: String) -> Result<()> {
             // Code pour approuver une demande et émettre un token
         }
         
         pub fn reject_role(ctx: Context<RejectRole>, request_id: String) -> Result<()> {
             // Code pour rejeter une demande
         }
     }
     ```

3. **Intégration Frontend-Backend**

   Modifier les fonctions suivantes pour intégrer les smart contracts :
   
   - `src/pages/access/index.tsx` : `handleSubmit` pour envoyer une transaction de demande de rôle
   - `src/pages/admin/tokens/index.tsx` : `handleApprove` et `handleReject` pour approuver/rejeter via blockchain
   - `src/views/home/index.tsx` : `checkUserRole` pour vérifier les tokens sur la blockchain

## Installation et Développement

1. **Prérequis**
   - Node.js (>= 16.x)
   - Solana CLI
   - Anchor Framework
   - Wallet Solana (Phantom, Solflare)

2. **Installation**
   ```bash
   # Cloner le dépôt
   git clone https://github.com/votre-username/alyrasign.git
   cd alyrasign
   
   # Installer les dépendances
   npm install
   ```

3. **Démarrer l'application en mode développement**
   ```bash
   npm run dev
   ```

4. **Compiler et déployer les programmes Solana**
   ```bash
   # Dans le dossier du programme
   anchor build
   anchor deploy
   ```

## Architecture

L'application suit une architecture où :
- Les données sont stockées sur la blockchain Solana
- Les smart contracts gèrent la logique métier
- Le frontend en Next.js fournit l'interface utilisateur

## État actuel

Actuellement, l'application utilise des données simulées stockées dans le localStorage du navigateur. L'objectif est de remplacer cette simulation par de véritables interactions avec la blockchain Solana.

## License

MIT

## Intégration Blockchain Solana

AlyraSign est conçu pour fonctionner avec la blockchain Solana. Nous avons mis en place une intégration hybride qui permet de :

1. Développer et tester l'application en mode simulation (utilisant localStorage)
2. Déployer l'application en production avec de vraies transactions blockchain

### Fonctionnalités blockchain implémentées

- Gestion des demandes d'accès (création, approbation, rejet)
- Gestion des formations (création, mise à jour)
- Gestion des sessions (création, activation)
- Vérification des rôles des utilisateurs

### Mode hybride

L'application peut fonctionner dans deux modes, contrôlés par une variable d'environnement :

- **Mode simulation** : Toutes les données sont stockées localement (localStorage).
- **Mode blockchain** : Les données sont stockées sur la blockchain Solana.

Consultez le fichier [INTEGRATION_BLOCKCHAIN.md](./INTEGRATION_BLOCKCHAIN.md) pour plus de détails sur l'intégration et les étapes restantes.


# Structure du Programme Solana (lib.rs)
Le programme Solana AlyraSign est développé avec le framework Anchor et gère plusieurs fonctionnalités clés:

1. Gestion des demandes d'accès:
- Initialisation du stockage (initialize_access_storage)
- Création de demandes (create_access_request)
- Approbation/Rejet des demandes (approve_access_request, reject_access_request)

2. Gestion des formations:
- Initialisation du stockage (initialize_formation_storage)
- Création/Mise à jour des formations (upsert_formation)

3. Gestion des sessions:
- Initialisation du stockage (initialize_session_storage)
- Création de sessions (create_session)

4. Gestion des présences:
- Initialisation du stockage (initialize_attendance_storage)
- Enregistrement des présences (record_attendance)
- Mise à jour des présences (update_attendance)

Le programme utilise des Program Derived Addresses (PDAs) pour stocker les données et implémente des vérifications strictes sur les longueurs des champs.

## Structure des Comptes
1. AccessRequestStorage: Stockage central pour les demandes d'accès
2. AccessRequest: Stocke les informations d'une demande d'accès individuelle
3. FormationStorage: Stockage central pour les formations
4. Formation: Stocke les informations d'une formation
5. SessionStorage: Stockage central pour les sessions
6. Session: Stocke les informations d'une session
7. AttendanceStorage: Stockage central pour les présences
8. Attendance: Stocke les informations d'une présence

## Intégration Front-end (solana.ts)
Le fichier solana.ts fournit l'interface entre le front-end React et le programme Solana, avec des fonctions pour:

1. Initialisation et configuration:
- getProvider: Obtient le provider Anchor
- getProgram: Obtient l'instance du programme AlyraSign
- Fonctions pour trouver les PDAs: findAccessStoragePDA, findFormationStoragePDA, etc.

2. Gestion des demandes d'accès:
- createAccessRequest: Crée une nouvelle demande
- approveAccessRequest: Approuve une demande
- rejectAccessRequest: Rejette une demande
- getAccessRequests: Récupère les demandes

3. Gestion des formations et sessions:
- createFormation: Crée une formation
- createSession: Crée une session
- getFormations: Récupère les formations
- getSessions: Récupère les sessions

4. Gestion des présences:
- initializeAttendanceStorage: Initialise le stockage des présences
- recordAttendance: Enregistre une présence (check-in)
- updateAttendance: Met à jour une présence (check-out)
- getStudentAttendances: Récupère l'historique des présences d'un étudiant

Le code implémente deux modes de fonctionnement:
- Mode blockchain (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true'): Interagit avec le programme Solana
- Mode simulation: Utilise le localStorage pour simuler le fonctionnement (utile pour le développement)

## Fonctionnement de la Gestion des Présences
1. Initialisation:
L'administrateur initialise le stockage des présences via initializeAttendanceStorage
Crée un compte qui suit le nombre total de présences et stocke l'administrateur

2. Enregistrement des présences:
Les étudiants enregistrent leur présence via recordAttendance
Crée un PDA unique basé sur l'étudiant et l'ID de la session
Stocke des informations comme l'heure d'arrivée et un message

3. Mise à jour des présences:
Les étudiants peuvent mettre à jour leur présence via updateAttendance
Met à jour l'enregistrement avec l'heure de départ et éventuellement un nouveau message

4. Consultation:
Les données de présence peuvent être récupérées via getStudentAttendances
Filtre les présences par étudiant

Cette structure permet un suivi transparent et immuable des présences, tout en maintenant la flexibilité nécessaire pour les mises à jour légitimes.

=================
-> si erreur "lock file version 4 requires -Znext-lockfile-bump"
Passer la version de 4 à 3 dans Cargo.lock 

-> si erreur "failed to parse manifest at /..."
Run "cargo update -p bytemuck_derive@1.9.1 --precise 1.8.1" 
