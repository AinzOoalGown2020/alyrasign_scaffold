import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '@solana/wallet-adapter-react';

import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import * as SolanaConfig from '../../../lib/solana';

export default function BlockchainConfig() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useBlockchain, setUseBlockchain] = useState(
    process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true'
  );

  const [config, setConfig] = useState({
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '',
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    programId: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '',
    adminWallet: process.env.NEXT_PUBLIC_ADMIN_WALLET || '',
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur
    const checkAdmin = async () => {
      if (connected && publicKey) {
        // Dans un environnement de test, nous vérifions simplement si l'adresse correspond à l'admin configuré
        const adminAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET || '';
        const isAdmin = publicKey.toString() === adminAddress;
        setIsAdmin(isAdmin);
        setIsLoading(false);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [connected, publicKey]);

  const handleToggleBlockchain = () => {
    // Dans une application réelle, cela devrait mettre à jour le fichier .env.local
    // Pour cette démonstration, on simule le changement
    setUseBlockchain(!useBlockchain);
    alert(`Mode blockchain ${!useBlockchain ? 'activé' : 'désactivé'} (simulation - nécessite un redémarrage de l'application pour prendre effet)`);
  };

  const handleSaveConfig = () => {
    // Dans une application réelle, cela devrait mettre à jour le fichier .env.local
    // Pour cette démonstration, on simule le changement
    alert('Configuration sauvegardée (simulation - nécessite un redémarrage de l\'application pour prendre effet)');
  };

  const handleDownloadEnvFile = () => {
    const envContent = `NEXT_PUBLIC_SOLANA_RPC_URL=${config.rpcUrl}
NEXT_PUBLIC_SOLANA_NETWORK=${config.network}
NEXT_PUBLIC_SOLANA_PROGRAM_ID=${config.programId}
NEXT_PUBLIC_USE_BLOCKCHAIN=${useBlockchain}
NEXT_PUBLIC_ADMIN_WALLET=${config.adminWallet}`;

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Configuration Blockchain</h1>
          <p className="text-center text-gray-700">Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!connected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Configuration Blockchain</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">Veuillez connecter votre portefeuille pour accéder à cette page.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Configuration Blockchain</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">
              Cette page est réservée aux administrateurs.
            </p>
            <p className="text-center text-gray-700">
              Votre adresse: {publicKey?.toString()}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configuration Blockchain</h1>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/admin/blockchain')} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
              Retour
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">État de la blockchain</h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2">Mode blockchain:</span>
                <span className={`px-2 py-1 rounded ${useBlockchain ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {useBlockchain ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <Button 
                onClick={handleToggleBlockchain}
                className={`${useBlockchain ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {useBlockchain ? 'Désactiver' : 'Activer'} la blockchain
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              En mode désactivé, l'application utilise le localStorage pour simuler les interactions blockchain.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Paramètres de connexion</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rpcUrl">
                URL RPC Solana
              </label>
              <input
                id="rpcUrl"
                type="text"
                value={config.rpcUrl}
                onChange={(e) => setConfig({...config, rpcUrl: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://api.devnet.solana.com"
              />
              <p className="text-gray-500 text-xs mt-1">
                URL du point de terminaison RPC Solana pour les connexions réseau.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="network">
                Réseau Solana
              </label>
              <select
                id="network"
                value={config.network}
                onChange={(e) => setConfig({...config, network: e.target.value})}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="devnet">Devnet</option>
                <option value="testnet">Testnet</option>
                <option value="mainnet-beta">Mainnet Beta</option>
                <option value="localnet">Localnet</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Le réseau Solana à utiliser. Pour le développement, utilisez devnet.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="programId">
                ID du programme
              </label>
              <input
                id="programId"
                type="text"
                value={config.programId}
                onChange={(e) => setConfig({...config, programId: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Entrez l&apos;ID du programme Solana"
              />
              <p className="text-gray-500 text-xs mt-1">
                L'ID unique du programme Solana déployé pour AlyraSign.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adminWallet">
                Adresse wallet administrateur
              </label>
              <input
                id="adminWallet"
                type="text"
                value={config.adminWallet}
                onChange={(e) => setConfig({...config, adminWallet: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Entrez l&apos;adresse du wallet administrateur"
              />
              <p className="text-gray-500 text-xs mt-1">
                L'adresse du wallet autorisé à accéder aux fonctionnalités d'administration.
              </p>
            </div>

            <div className="flex space-x-2 mt-6">
              <Button onClick={handleSaveConfig} className="bg-blue-600 text-white hover:bg-blue-700">
                Sauvegarder la configuration
              </Button>
              <Button onClick={handleDownloadEnvFile} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                Télécharger .env.local
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <h2 className="text-lg font-semibold mb-3 text-yellow-800">Note importante</h2>
            <p className="text-gray-700">
              Les modifications apportées à cette page ne sont simulées qu'à des fins de démonstration. 
              Dans une application réelle, ces changements mettraient à jour le fichier .env.local sur le serveur.
              <br /><br />
              Pour appliquer les modifications manuellement, téléchargez le fichier .env.local généré et 
              placez-le dans le répertoire racine de votre projet. Redémarrez ensuite l'application pour 
              que les changements prennent effet.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 