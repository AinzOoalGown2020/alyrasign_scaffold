// Next, React
import { FC, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

// Variables d'environnement
const DEV_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const USE_BLOCKCHAIN = process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === "true";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface Request {
  walletAddress: string;
  status: string;
  requestedRole: string;
  id: string;
}

interface ProcessedRequest extends Request {
  processedAt: string;
}

export const HomeView: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  // Initialiser le localStorage au chargement
  useEffect(() => {
    console.log("Initialisation du localStorage");
    if (!localStorage.getItem('alyraSign_pendingRequests')) {
      localStorage.setItem('alyraSign_pendingRequests', JSON.stringify([]));
    }
    if (!localStorage.getItem('alyraSign_processedRequests')) {
      localStorage.setItem('alyraSign_processedRequests', JSON.stringify({}));
    }
  }, []);

  // Fonction pour vérifier le rôle de l'utilisateur sur la blockchain Solana
  const checkUserRole = useCallback(async () => {
    if (!wallet.publicKey) {
      console.log('Pas de wallet connecté');
      return null;
    }

    const currentWalletAddress = wallet.publicKey.toString();
    console.log('Vérification du rôle pour:', currentWalletAddress);

    // Vérifier si c'est l'adresse de développement
    if (currentWalletAddress === DEV_ADDRESS) {
      console.log('Adresse de développement détectée - Rôle: formateur');
      return 'formateur';
    }

    // Vérifier le localStorage pour les informations de reconnexion
    const lastConnectedRole = localStorage.getItem('alyraSign_lastConnectedRole');
    const lastConnectedWallet = localStorage.getItem('alyraSign_lastConnectedWallet');
    const onDashboard = localStorage.getItem('alyraSign_onDashboard') === 'true';

    console.log('Informations de reconnexion:', {
      lastConnectedRole,
      lastConnectedWallet,
      onDashboard
    });

    if (lastConnectedWallet === currentWalletAddress && lastConnectedRole) {
      console.log('Utilisateur reconnecté - Rôle:', lastConnectedRole);
      return lastConnectedRole;
    }

    // Récupérer les demandes d'accès
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');

    if (pendingRequestsJson && processedRequestsJson) {
      const pendingRequests = JSON.parse(pendingRequestsJson);
      const processedRequests = JSON.parse(processedRequestsJson);

      console.log('Demandes en attente:', pendingRequests);
      console.log('Demandes traitées:', processedRequests);

      // Vérifier les demandes traitées
      for (const requestId in processedRequests) {
        const request = processedRequests[requestId];
        if (request.walletAddress === currentWalletAddress && request.status === 'approved') {
          console.log('Demande approuvée trouvée:', request);
          localStorage.setItem('alyraSign_lastConnectedRole', request.requestedRole);
          localStorage.setItem('alyraSign_lastConnectedWallet', currentWalletAddress);
          localStorage.setItem('alyraSign_onDashboard', 'false');
          return request.requestedRole;
        }
      }

      // Vérifier les demandes en attente
      const userPendingRequests = pendingRequests.filter(
        (req: any) => req.walletAddress === currentWalletAddress
      );

      if (userPendingRequests.length > 0) {
        console.log('Demande en attente trouvée:', userPendingRequests[0]);
        return null; // Retourner null pour indiquer qu'une demande est en cours
      }
    }

    // Si aucune demande n'est trouvée, rediriger vers le formulaire de demande d'accès
    console.log('Aucune demande trouvée - Redirection vers le formulaire');
    router.push('/access');
    return null;
  }, [wallet.publicKey, router]);

  const checkAndRedirect = useCallback(async () => {
    console.log("Fonction checkAndRedirect appelée");
    console.log("Chemin actuel:", router.pathname);
    
    // Vérifier si nous sommes déjà sur une page de dashboard
    if (router.pathname === '/dashboard' || router.pathname === '/etudiants' || router.pathname === '/admin') {
      console.log("Déjà sur une page de dashboard, pas de redirection nécessaire");
      return;
    }

    // Récupérer les informations de connexion
    const lastConnectedRole = localStorage.getItem('alyraSign_lastConnectedRole');
    const lastConnectedWallet = localStorage.getItem('alyraSign_lastConnectedWallet');
    const onDashboard = localStorage.getItem('alyraSign_onDashboard') === 'true';
    
    console.log("Vérification de redirection:", {
      lastConnectedRole,
      lastConnectedWallet,
      onDashboard,
      currentWallet: wallet?.publicKey?.toString(),
      isConnected: !!wallet,
      currentPath: router.pathname
    });

    // Vérifier si le wallet est connecté et correspond au dernier wallet connu
    if (wallet && lastConnectedRole && lastConnectedWallet === wallet.publicKey?.toString()) {
      console.log("Wallet connectée et correspond au dernier rôle connu");
      
      // Rediriger en fonction du rôle
      if (lastConnectedRole === 'etudiant') {
        console.log("Rôle étudiant détecté, redirection vers le portail étudiant");
        localStorage.setItem('alyraSign_onDashboard', 'true');
        router.push('/etudiants');
      } else if (lastConnectedRole === 'formateur') {
        console.log("Rôle formateur détecté, redirection vers le portail formateur");
        localStorage.setItem('alyraSign_onDashboard', 'true');
        router.push('/admin');
      } else {
        console.log("Rôle inconnu:", lastConnectedRole);
      }
    } else {
      console.log("Pas de redirection nécessaire:", {
        hasWallet: !!wallet,
        hasLastRole: !!lastConnectedRole,
        walletMatch: lastConnectedWallet === wallet?.publicKey?.toString()
      });
    }
  }, [wallet, router]);

  // Vérifier le rôle et rediriger quand le wallet change
  useEffect(() => {
    console.log("useEffect - wallet.publicKey changé:", wallet.publicKey?.toString());
    if (wallet.publicKey) {
      checkUserRole().then(role => {
        console.log("Rôle trouvé:", role);
        if (role) {
          console.log("Rôle trouvé, tentative de redirection");
          checkAndRedirect();
        } else {
          console.log("Aucun rôle trouvé, pas de redirection");
        }
      });
    }
  }, [wallet.publicKey, checkUserRole, checkAndRedirect]);

  // Vérifier la redirection au chargement initial
  useEffect(() => {
    console.log("useEffect - chargement initial");
    if (wallet.publicKey) {
      console.log("Wallet déjà connecté au chargement initial");
      checkAndRedirect();
    }
  }, [checkAndRedirect, wallet.publicKey]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-md w-full bg-black bg-opacity-70 rounded-lg shadow-xl p-8 border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <div className="w-[70px] h-[70px] relative mr-4">
            <Image 
              src="/AlyraSign.png" 
              alt="AlyraSign Logo" 
              width={200}
              height={70}
              sizes="(max-width: 768px) 150px, 200px"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-500">
            {process.env.NEXT_PUBLIC_APP_NAME || 'AlyraSign'}
          </h1>
        </div>
        
        <p className="text-center text-gray-300 mb-8">
          {process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Application de gestion des présences pour les étudiants'}
        </p>
        
        <div className="flex justify-center mb-6">
          <WalletMultiButtonDynamic className="btn btn-primary btn-lg rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700" />
        </div>
        
        <p className="text-center text-gray-500 text-sm">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>
    </div>
  );
};
