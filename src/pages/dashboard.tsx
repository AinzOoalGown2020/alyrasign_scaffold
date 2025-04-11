import type { NextPage } from "next";
import Head from "next/head";
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import dynamic from 'next/dynamic';

// Importer le bouton de wallet de manière dynamique pour éviter les erreurs SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface Request {
  walletAddress: string;
  status: string;
}

const Dashboard: NextPage = () => {
  const wallet = useWallet();
  const router = useRouter();

  // Vérifier si l'utilisateur a une demande en attente
  const [hasPendingRequest, setHasPendingRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);

  // Effet pour suivre l'état de connexion du wallet
  useEffect(() => {
    setWalletConnected(wallet.connected);
  }, [wallet.connected]);

  useEffect(() => {
    const checkPendingRequests = async () => {
      if (wallet.publicKey) {
        try {
          const requests = JSON.parse(localStorage.getItem('alyraSign_pendingRequests') || '[]');
          
          const userRequests = requests.filter(
            (req: Request) => wallet.publicKey && req.walletAddress === wallet.publicKey.toString()
          );
          
          if (userRequests.some((req: Request) => req.status === 'pending')) {
            setHasPendingRequest(true);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification des demandes:", error);
        }
      }
      setIsLoading(false);
    };

    // Attendre un peu pour s'assurer que le wallet est connecté
    const timer = setTimeout(() => {
      checkPendingRequests();
    }, 1000);

    return () => clearTimeout(timer);
  }, [wallet.publicKey]);

  // Empêcher la redirection automatique de la page d'accueil
  useEffect(() => {
    // Stocker une information pour indiquer que l'utilisateur est sur le dashboard
    localStorage.setItem('alyraSign_onDashboard', 'true');
    
    return () => {
      // Nettoyer cette information lorsque l'utilisateur quitte le dashboard
      localStorage.removeItem('alyraSign_onDashboard');
    };
  }, []);

  // Fonction pour forcer la déconnexion du wallet
  const handleDisconnect = async () => {
    try {
      await wallet.disconnect();
      setWalletConnected(false);
      console.log("Wallet déconnecté avec succès");
    } catch (error) {
      console.error("Erreur lors de la déconnexion du wallet:", error);
    }
  };

  // Fonction pour forcer la connexion du wallet
  const handleConnect = async () => {
    try {
      await wallet.connect();
      setWalletConnected(true);
      console.log("Tentative de connexion du wallet");
    } catch (error) {
      console.error("Erreur lors de la connexion du wallet:", error);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Tableau de bord - AlyraSign</title>
        <meta name="description" content="Tableau de bord AlyraSign" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Tableau de bord</h1>
        
        {isLoading ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-lg text-gray-200 mb-4">Chargement...</p>
            </div>
          </Card>
        ) : !walletConnected ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-lg text-gray-200 mb-4">Veuillez connecter votre portefeuille pour accéder à votre tableau de bord.</p>
              <div className="mt-4 flex flex-col items-center space-y-4">
                <WalletMultiButtonDynamic className="btn btn-primary" />
                <Button
                  onClick={handleConnect}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Connecter le wallet
                </Button>
              </div>
            </div>
          </Card>
        ) : hasPendingRequest ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-lg text-gray-200 mb-4">Votre demande d'accès est en attente de validation.</p>
              <p className="text-md text-gray-300 mb-6">Un administrateur examinera votre demande et vous recevrez une notification dès qu'elle sera traitée.</p>
              <div className="mt-4">
                <Button
                  onClick={handleDisconnect}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Déconnecter le wallet
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-lg text-gray-200 mb-4">Bienvenue sur votre tableau de bord.</p>
              <p className="text-md text-gray-300 mb-6">Vous n'avez pas encore de demande d'accès en cours.</p>
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={() => router.push('/access')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Demander un accès
                </Button>
                <Button
                  onClick={handleDisconnect}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Déconnecter le wallet
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard; 