// Next, React
import { FC, useEffect } from 'react';
import { useRouter } from 'next/router';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

// Constantes
const DEV_ADDRESS = "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const HomeView: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  // Fonction pour vérifier le rôle de l'utilisateur sur la blockchain Solana
  const checkUserRole = async () => {
    if (!wallet.publicKey) return null;
    
    // Simulation de vérification de rôle (à remplacer par une vraie vérification)
    if (wallet.publicKey.toString() === DEV_ADDRESS) {
      console.log("Utilisateur identifié comme développeur/formateur");
      
      // Stocker l'information de reconnexion pour prévenir les boucles infinies
      localStorage.setItem('alyraSign_lastConnectedRole', 'formateur');
      localStorage.setItem('alyraSign_lastConnectedWallet', wallet.publicKey.toString());
      
      return 'formateur';
    }
    
    // POUR DÉMONSTRATION UNIQUEMENT: Liste d'adresses de test avec des rôles prédéfinis
    // À remplacer par une vérification blockchain réelle en production
    const testAddresses = {
      // Vous pouvez ajouter ici les adresses de vos wallets de test
      // Format: 'adresse_du_wallet': 'role'
      '5YNmX8xXSWcLBYkVkgZ1ZQQqJ3oJRSB1MwYJbxnQP5NZ': 'etudiant',
      'C8DRQgE3K8A9vLT9UmgHDkEF8fJhpuRRZd6hNzVDADiL': 'etudiant',
      'AGsJu1jZmFK9SMD4KrEMGU89VvUT8CcMEGLLmNNG1bHT': 'formateur'
      // Ajoutez d'autres adresses au besoin
    };
    
    // Vérifier si l'adresse est dans la liste des adresses de test
    const currentWalletAddress = wallet.publicKey.toString();
    if (testAddresses[currentWalletAddress]) {
      console.log("Utilisateur identifié comme", testAddresses[currentWalletAddress], "dans la liste de test");
      
      // Stocker l'information pour éviter des appels répétés
      localStorage.setItem('alyraSign_lastConnectedRole', testAddresses[currentWalletAddress]);
      localStorage.setItem('alyraSign_lastConnectedWallet', currentWalletAddress);
      
      return testAddresses[currentWalletAddress];
    }
    
    // Vérification réelle sur la blockchain Solana (code à décommenter et implémenter)
    /*
    try {
      // Créer une connexion à Solana
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      
      // ID du programme Solana déployé
      const programId = new PublicKey('VOTRE_PROGRAM_ID_ICI');
      
      // Dériver l'adresse du compte de token (PDA) pour cet utilisateur
      // Cette adresse est déterministe et basée sur le wallet de l'utilisateur
      const [userRoleAccount, _] = await PublicKey.findProgramAddress(
        [
          Buffer.from("role"),
          wallet.publicKey.toBuffer()
        ],
        programId
      );
      
      // Vérifier si le compte existe
      const accountInfo = await connection.getAccountInfo(userRoleAccount);
      
      if (accountInfo) {
        // Désérialiser les données du compte pour récupérer le rôle
        // La structure exacte dépendra de votre programme Solana
        const roleData = borsh.deserialize(
          // Schéma de désérialisation (défini selon votre programme)
          {
            schema: USER_ROLE_SCHEMA,
            class: UserRoleAccount
          },
          accountInfo.data
        );
        
        console.log('Rôle trouvé sur la blockchain:', roleData.role);
        
        // Stocker l'information pour éviter des appels répétés
        localStorage.setItem('alyraSign_lastConnectedRole', roleData.role);
        localStorage.setItem('alyraSign_lastConnectedWallet', wallet.publicKey.toString());
        
        return roleData.role; // 'etudiant' ou 'formateur'
      } else {
        console.log('Aucun compte de rôle trouvé pour cet utilisateur sur la blockchain');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle sur la blockchain:', error);
    }
    */
    
    // En attendant l'implémentation blockchain, utiliser le localStorage
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    
    console.log('Données localStorage - Demandes:', pendingRequestsJson);
    console.log('Données localStorage - Traitements:', processedRequestsJson);
    
    if (pendingRequestsJson && processedRequestsJson) {
      try {
        const pendingRequests = JSON.parse(pendingRequestsJson);
        const processedRequests = JSON.parse(processedRequestsJson);
        
        // Trouver la demande de l'utilisateur actuel
        const currentWalletAddress = wallet.publicKey.toString();
        console.log('Recherche de demandes pour:', currentWalletAddress);
        
        const userRequest = pendingRequests.find(req => req.walletAddress === currentWalletAddress);
        console.log('Demande trouvée:', userRequest);
        
        // Vérifier si la demande a été approuvée
        if (userRequest) {
          console.log('Statut de la demande:', processedRequests[userRequest.id]);
          
          if (processedRequests[userRequest.id] === 'approved') {
            console.log('Demande APPROUVÉE - Rôle attribué:', userRequest.requestedRole);
            
            // Stocker l'information de reconnexion pour prévenir les boucles infinies
            localStorage.setItem('alyraSign_lastConnectedRole', userRequest.requestedRole);
            localStorage.setItem('alyraSign_lastConnectedWallet', currentWalletAddress);
            
            return userRequest.requestedRole; // 'etudiant' ou 'formateur'
          }
        }
      } catch (e) {
        console.error('Erreur lors de la vérification du rôle:', e);
      }
    }
    
    console.log('Aucun rôle trouvé pour cet utilisateur');
    return null; // Par défaut, pas de rôle
  };

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (wallet.connected && wallet.publicKey) {
        console.log('Wallet connecté:', wallet.publicKey.toBase58());
        getUserSOLBalance(wallet.publicKey, connection);
        
        // Utiliser setTimeout pour s'assurer que le composant est monté et que le wallet est bien connecté
        setTimeout(async () => {
          // Vérifier si c'est un cas de reconnexion du même wallet
          const lastConnectedWallet = localStorage.getItem('alyraSign_lastConnectedWallet');
          const lastConnectedRole = localStorage.getItem('alyraSign_lastConnectedRole');
          
          if (lastConnectedWallet === wallet.publicKey.toString() && lastConnectedRole) {
            console.log('Reconnexion détectée pour le même wallet:', lastConnectedWallet);
            
            // Rediriger directement selon le rôle sauvegardé
            if (lastConnectedRole === 'formateur') {
              router.push('/admin/formations');
              return;
            } else if (lastConnectedRole === 'etudiant') {
              router.push('/etudiants');
              return;
            }
          }
          
          // Sinon, vérifier le rôle normalement
          const userRole = await checkUserRole();
          console.log('Rôle détecté:', userRole);
          
          if (userRole === 'formateur') {
            router.push('/admin/formations');
          } else if (userRole === 'etudiant') {
            router.push('/etudiants');
          } else {
            router.push('/access');
          }
        }, 500);
      }
    };
    
    checkAndRedirect();
  }, [wallet.connected, wallet.publicKey, connection, getUserSOLBalance, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-md w-full bg-black bg-opacity-70 rounded-lg shadow-xl p-8 border border-gray-700">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-500 mb-6">
          Bienvenue sur AlyraSign
        </h1>
        
        <p className="text-center text-gray-300 mb-8">
          Application de gestion des présences pour les étudiants
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
