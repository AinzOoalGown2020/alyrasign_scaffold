# Guide de déploiement des smart contracts AlyraSign

Ce guide explique comment déployer les smart contracts AlyraSign sur le réseau devnet de Solana.

## Prérequis

- CLI Solana installé
- Anchor CLI installé
- Un wallet Solana configuré avec des devnet SOL

## Étapes de déploiement

### 1. Configuration de l'environnement

```bash
# Se placer dans le répertoire du projet Anchor
cd alyrasign-solana/alyrasign

# Configurer Solana CLI pour utiliser devnet
solana config set --url devnet

# Vérifier que vous avez des SOL sur votre wallet devnet
solana balance

# Si nécessaire, obtenir des SOL devnet (airdrop)
solana airdrop 2
```

### 2. Construire le programme

```bash
# Construire le programme Anchor
anchor build
```

### 3. Déployer le programme

```bash
# Déployer le programme sur devnet
anchor deploy

# Si vous avez déjà déployé le programme et souhaitez mettre à jour, utilisez:
anchor upgrade ./target/deploy/alyrasign.so --program-id 5JVAuK9R3kmtwgrM8v1QqH5yH1hfiEQPYbidhzz6RoUs
```

### 4. Vérifier le déploiement

```bash
# Vérifier que le programme est bien déployé
solana program show 5JVAuK9R3kmtwgrM8v1QqH5yH1hfiEQPYbidhzz6RoUs
```

### 5. Initialiser les comptes de stockage

Après le déploiement, vous devez initialiser les comptes de stockage via l'interface d'administration:

1. Connectez-vous à l'application avec le wallet admin
2. Accédez à la page "Tableau de bord blockchain"
3. Cliquez sur le bouton d'initialisation des comptes

### 6. Mettre à jour la configuration de l'application

Dans le fichier `.env.local`, assurez-vous que les configurations suivantes sont correctes:

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=5JVAuK9R3kmtwgrM8v1QqH5yH1hfiEQPYbidhzz6RoUs
NEXT_PUBLIC_USE_BLOCKCHAIN=true
```

## Notes importantes

- Conservez votre clé privée Solana en sécurité
- N'utilisez pas le même wallet pour le développement et la production
- Testez toujours sur devnet avant de déployer sur mainnet
- Gardez une trace de l'ID du programme pour référence future 