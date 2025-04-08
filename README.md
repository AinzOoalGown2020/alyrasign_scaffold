# Alyra Sign Scaffold

Ce projet est un scaffold pour développer des dApps sur Solana, adapté pour les besoins d'Alyra. Il est basé sur le scaffold officiel de Solana Labs.

## Fonctionnalités

- Intégration des wallets avec connexion automatique
- Gestion d'état
- Composants réutilisables
- Exemples d'utilisation de web3.js
- Navigation et gestion des pages
- Système de notifications
- Styling avec TailwindCSS

## Installation

```bash
npm install
# ou
yarn install
```

## Développement

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

## Structure du Projet

```
├── public : fichiers hébergés publiquement
├── src : dossiers et fichiers principaux
│   ├── components : composants UI réutilisables
│   ├── contexts : contextes React
│   ├── hooks : hooks React personnalisés
│   ├── models : structures de données
│   ├── pages : pages de l'application
│   ├── stores : stores pour la gestion d'état
│   ├── styles : styles globaux
│   ├── utils : utilitaires
│   └── views : vues principales
```

## License

MIT
