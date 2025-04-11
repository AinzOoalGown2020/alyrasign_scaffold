import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../../../components/Layout';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function BlockchainAdmin() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Administration Blockchain</h1>
          <p className="text-center text-gray-700">Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!connected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Administration Blockchain</h1>
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
          <h1 className="text-2xl font-bold mb-6">Administration Blockchain</h1>
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
          <h1 className="text-2xl font-bold">Administration Blockchain</h1>
          <Button onClick={() => router.push('/admin')} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
            Retour au tableau de bord
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Console de Test</h2>
            <p className="text-gray-600 mb-6">
              Testez les interactions avec la blockchain Solana, initialisez les comptes de stockage, et vérifiez le bon fonctionnement des transactions.
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => router.push('/admin/blockchain/test')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Accéder à la console
              </Button>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
              </span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <p className="text-gray-600 mb-6">
              Configurez les paramètres de connexion blockchain, gérez les variables d&apos;environnement et activez ou désactivez les fonctionnalités blockchain.
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => router.push('/admin/blockchain/config')}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Gérer la configuration
              </Button>
              <span className={`text-xs px-2 py-1 rounded ${
                process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Tableau de Bord</h2>
            <p className="text-gray-600 mb-6">
              Consultez les statistiques et l&apos;état actuel de la blockchain Solana, y compris les demandes d&apos;accès, les formations et les sessions.
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => router.push('/admin/blockchain/dashboard')}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Voir le tableau de bord
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Informations de connexion</h2>
          <Card className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-2 text-gray-700">Wallet connecté</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono break-all text-gray-800">
                  {publicKey?.toString()}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 text-gray-700">Programme ID</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono break-all text-gray-800">
                  {process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || 'Non configuré'}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 text-gray-700">Réseau Solana</h3>
                <div className="bg-white p-3 rounded border text-sm text-gray-800">
                  {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 text-gray-700">URL RPC</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono break-all text-gray-800">
                  {process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'URL par défaut'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="max-w-2xl w-full">
            <Card className="p-6 border-l-4 border-yellow-500">
              <h2 className="text-lg font-semibold mb-3 text-yellow-800">Note importante</h2>
              <p className="text-gray-700">
                Cette interface d&apos;administration est conçue pour tester et configurer les interactions blockchain pour AlyraSign. 
                Assurez-vous d&apos;utiliser le bon réseau et de disposer de suffisamment de SOL pour les transactions.
                {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN !== 'true' && (
                  <strong className="block mt-2">
                    Le mode blockchain est actuellement désactivé. Les opérations seront simulées avec localStorage.
                  </strong>
                )}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 