# Guide d'intégration blockchain pour AlyraSign

Ce guide explique comment intégrer les smart contracts Solana avec l'application frontend AlyraSign.

## Configuration de l'environnement

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```
# Configuration Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=5JVAuK9R3kmtwgrM8v1QqH5yH1hfiEQPYbidhzz6RoUs

# Contrôle de l'utilisation de la blockchain vs simulation
NEXT_PUBLIC_USE_BLOCKCHAIN=true

# Configuration des comptes de stockage (PDAs seeds)
NEXT_PUBLIC_ACCESS_STORAGE_SEED=access-storage
NEXT_PUBLIC_FORMATION_STORAGE_SEED=formation-storage
NEXT_PUBLIC_SESSION_STORAGE_SEED=session-storage

# Taille maximale des champs
NEXT_PUBLIC_MAX_ROLE_LENGTH=20
NEXT_PUBLIC_MAX_MESSAGE_LENGTH=100
NEXT_PUBLIC_MAX_TITLE_LENGTH=100
NEXT_PUBLIC_MAX_DESCRIPTION_LENGTH=500
NEXT_PUBLIC_MAX_LOCATION_LENGTH=100
```

### 2. Connexion du wallet

AlyraSign utilise le connecteur de wallet Solana pour permettre aux utilisateurs de s'authentifier et d'interagir avec la blockchain. Les adaptateurs suivants sont configurés:

- PhantomWalletAdapter
- SolflareWalletAdapter
- BackpackWalletAdapter

## Développement

### Mode de développement (simulation)

Pour faciliter le développement sans avoir à effectuer de transactions blockchain à chaque test, AlyraSign propose un mode simulation qui stocke les données dans localStorage. Pour activer ce mode:

1. Mettez `NEXT_PUBLIC_USE_BLOCKCHAIN=false` dans votre fichier `.env.local`
2. Redémarrez l'application

Ce mode simule les structures de données de la blockchain mais utilise le stockage local pour un développement plus rapide.

### Mode blockchain

Pour tester les interactions réelles avec la blockchain:

1. Mettez `NEXT_PUBLIC_USE_BLOCKCHAIN=true` dans votre fichier `.env.local`
2. Assurez-vous que le programme Solana est déployé sur devnet
3. Redémarrez l'application

## Initialisation des comptes de stockage

Avant d'utiliser l'application, les comptes de stockage doivent être initialisés sur la blockchain:

1. Connectez-vous avec un wallet admin
2. Accédez à la page Admin > Blockchain
3. Cliquez sur le bouton "Initialiser tous les comptes de stockage"

Cette étape ne doit être effectuée qu'une seule fois, ou si vous redéployez le programme.

## Architecture de l'intégration

L'intégration blockchain est organisée comme suit:

1. **Fichiers IDL** (`src/lib/idl/`) - Définitions d'interface pour les smart contracts
2. **Client blockchain** (`src/lib/solana.ts`) - Fonctions pour interagir avec les smart contracts
3. **Hooks personnalisés** (`src/hooks/`) - React hooks pour consommer les fonctions blockchain
4. **Composants d'interface** - Utilisent les hooks pour permettre aux utilisateurs d'interagir avec la blockchain

## Tests

Pour tester les interactions blockchain:

1. Assurez-vous que vous êtes connecté avec le bon wallet (admin, formateur ou étudiant)
2. Utilisez la page de test blockchain (Admin > Blockchain > Test) pour vérifier chaque fonction
3. Consultez les logs dans la console du navigateur pour les détails des transactions

## Dépannage

### Erreurs communes

- **Wallet non connecté** - Assurez-vous que votre wallet est connecté et configuré pour devnet
- **Solde insuffisant** - Assurez-vous d'avoir des SOL sur votre wallet devnet (`solana airdrop 2`)
- **Erreurs d'autorisation** - Vérifiez que vous utilisez le bon wallet pour l'opération

## Travail accompli

Nous avons développé les éléments suivants :

1. **Programme Solana** : Un smart contract complet pour gérer les demandes d'accès, les formations et les sessions.
2. **Bibliothèque d'intégration** : `src/lib/solana.ts` qui fournit des fonctions pour interagir avec la blockchain.
3. **Interface d'administration blockchain** : Page `src/pages/admin/blockchain/index.tsx` pour initialiser et gérer les comptes de stockage.
4. **Mise à jour de la page d'accès** : Intégration de la blockchain pour les demandes d'accès dans `src/pages/access/index.tsx`.
5. **Configuration d'environnement** : `.env.local` pour contrôler l'utilisation de la blockchain vs simulation.
6. **Mode hybride** : Implémentation d'un système qui fonctionne en mode simulation (localStorage) et en mode blockchain réelle.
7. **Tests blockchain** : Console de test `src/pages/admin/blockchain/test.tsx` pour tester les opérations blockchain.
8. **Dashboard blockchain** : Tableau de bord `src/pages/admin/blockchain/dashboard.tsx` pour visualiser l'état de la blockchain.
9. **Menu d'administration** : Le lien vers l'administration blockchain a été intégré dans le menu d'administration.

## Étapes d'intégration restantes

### 1. Finaliser les corrections du fichier solana.ts

Le fichier `src/lib/solana.ts` contient des erreurs de linter qui doivent être corrigées. Ces erreurs sont principalement dues à l'absence de typage précis pour les comptes du programme Anchor. Pour résoudre ces problèmes, il faut :

1. Déployer le programme Solana sur devnet
2. Générer l'IDL du programme
3. Créer un type TypeScript correct pour les comptes du programme

Une fois l'IDL généré, remplacer la définition de l'interface `AlyraSign` par l'IDL généré :

```typescript
// Remplacer ceci
export interface AlyraSign {
  version: string;
  name: string;
  instructions: any[];
  accounts: any[];
  types: any[];
}

// Par l'IDL généré après anchor build
import { IDL } from './idl/alyrasign';
export type AlyraSign = typeof IDL;
```

### 2. Déploiement du programme Solana

Pour déployer le programme Solana sur devnet :

1. Résoudre l'erreur de version du fichier Cargo.lock :
   ```bash
   cd alyrasign-program/alyrasign
   cargo update
   ```

2. Construisez le programme :
   ```bash
   anchor build
   ```

3. Obtenez l'ID du programme :
   ```bash
   solana address -k target/deploy/alyrasign-keypair.json
   ```

4. Mettez à jour l'ID dans `declare_id!()` dans `lib.rs` et dans les fichiers de configuration.

5. Redéployez :
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

6. Mettez à jour l'ID du programme dans `.env.local` et `src/lib/solana.ts`.

### 3. Activation de la blockchain

Une fois que vous êtes prêt à utiliser réellement la blockchain :

1. Modifiez `.env.local` :
   ```
   NEXT_PUBLIC_USE_BLOCKCHAIN=true
   ```

2. Assurez-vous que les clients se connectent au bon point d'accès RPC :
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```

### 4. Tests et déploiement final

Avant le déploiement final, effectuez les tests suivants :

1. Testez toutes les fonctionnalités en mode simulation (localStorage)
2. Testez toutes les fonctionnalités en mode blockchain sur devnet
3. Effectuez des tests de charge pour vérifier la performance du système

Une fois les tests terminés avec succès, vous pouvez déployer la version finale de l'application.

## Résumé des changements apportés au projet

1. **Implémentation du mode hybride** : Le système peut fonctionner en mode simulation (localStorage) ou en mode blockchain (Solana), en fonction de la valeur de la variable d'environnement `NEXT_PUBLIC_USE_BLOCKCHAIN`.

2. **Mise à jour de la bibliothèque Solana** : Ajout des fonctions pour initialiser les comptes de stockage, créer des demandes d'accès, approuver et rejeter des demandes, créer et gérer des formations et des sessions.

3. **Documentation détaillée** : Mise à jour de la documentation pour guider les développeurs dans l'intégration et le déploiement du système.

## Bon à savoir

- Le mode simulation est parfait pour le développement et les tests sans frais de transaction.
- Le mode blockchain nécessite un portefeuille Solana connecté (Phantom, Solflare, etc.) et suffisamment de SOL pour payer les frais de transaction.
- Toutes les variables de configuration importantes sont centralisées dans le fichier `.env.local` pour faciliter les modifications.
- La console de test blockchain (`/admin/blockchain/test`) permet de tester toutes les fonctionnalités blockchain sans modifier le code.

## Configuration centralisée

Une des forces de cette intégration est la centralisation des variables importantes dans le fichier `.env.local`. Cette approche offre plusieurs avantages :

1. **Simplicité de configuration** : Modifiez les paramètres clés en un seul endroit.
2. **Cohérence** : Garantit que le frontend et le smart contract utilisent les mêmes valeurs.
3. **Flexibilité** : Permet de basculer facilement entre mode simulation et blockchain.
4. **Maintenance simplifiée** : Facilite les modifications futures sans avoir à chercher dans tout le code.

### Variables importantes

Le fichier `.env.local` contient différentes catégories de variables :

```
# Configuration Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=5JVAuK9R3kmtwgrM8v1QqH5yH1hfiEQPYbidhzz6RoUs

# Contrôle de l'utilisation de la blockchain vs simulation
NEXT_PUBLIC_USE_BLOCKCHAIN=true

# Wallets de test prédéfinis
NEXT_PUBLIC_ADMIN_WALLET=79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy

# Configuration des comptes de stockage (PDAs seeds)
NEXT_PUBLIC_ACCESS_STORAGE_SEED=access-storage
NEXT_PUBLIC_FORMATION_STORAGE_SEED=formation-storage
NEXT_PUBLIC_SESSION_STORAGE_SEED=session-storage

# Taille maximale des champs (pour calcul de l'espace des comptes)
NEXT_PUBLIC_MAX_ROLE_LENGTH=20
NEXT_PUBLIC_MAX_MESSAGE_LENGTH=100
NEXT_PUBLIC_MAX_TITLE_LENGTH=100
NEXT_PUBLIC_MAX_DESCRIPTION_LENGTH=500
NEXT_PUBLIC_MAX_LOCATION_LENGTH=100
```

### Utilisation dans le code

Ces variables sont utilisées de manière cohérente dans :

1. **Le smart contract Solana** : Via des constantes comme `ACCESS_STORAGE_SEED` pour les PDAs et `MAX_ROLE_LENGTH` pour les vérifications de taille.

2. **La bibliothèque d'intégration** : Dans `src/lib/solana.ts` où elles sont importées via `process.env` et utilisées pour configurer les interactions avec la blockchain.

3. **L'interface utilisateur** : Pour afficher les configurations actuelles et permettre à l'administrateur de voir l'état du système.

### Page de configuration

Une page dédiée à la visualisation de la configuration est disponible dans l'interface d'administration à `/admin/blockchain/config`. Cette page affiche :

- Les valeurs actuelles des variables d'environnement
- La configuration active de la bibliothèque Solana
- Le mode de fonctionnement actuel (simulation ou blockchain)
- Des instructions pour modifier la configuration

Cette approche centralisée facilite grandement le développement et la maintenance de l'application, tout en offrant une flexibilité maximale pour les déploiements en environnements de test et de production. 