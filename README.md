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
| 5YNmX8xXSWcLBYkVkgZ1ZQQqJ3oJRSB1MwYJbxnQP5NZ | étudiant |
| C8DRQgE3K8A9vLT9UmgHDkEF8fJhpuRRZd6hNzVDADiL | étudiant |
| AGsJu1jZmFK9SMD4KrEMGU89VvUT8CcMEGLLmNNG1bHT | formateur |

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
