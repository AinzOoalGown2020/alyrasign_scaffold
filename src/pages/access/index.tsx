import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';

const AccessRequestPage: FC = () => {
  const [role, setRole] = useState<'etudiant' | 'formateur'>('etudiant');
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const wallet = useWallet();
  const router = useRouter();

  // Simuler la vérification du rôle (à remplacer par une vraie vérification sur la blockchain)
  const DEV_ADDRESS = "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy";
  
  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
    if (!wallet.connected) {
      setIsChecking(false);
      router.push('/');
      return;
    }
    
    // Si l'utilisateur est déjà un développeur avec tous les accès
    if (wallet.publicKey?.toString() === DEV_ADDRESS) {
      router.push('/admin/formations');
      return;
    }
    
    // Vérifier si l'utilisateur a une demande approuvée
    const checkApprovedRequest = () => {
      if (!wallet.publicKey) return;
      
      // Récupérer les demandes soumises
      const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
      let userRequests = [];
      
      if (pendingRequestsJson) {
        try {
          userRequests = JSON.parse(pendingRequestsJson);
        } catch (e) {
          console.error('Erreur lors de la récupération des demandes:', e);
        }
      }
      
      // Récupérer les décisions (approuvées/rejetées)
      const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
      let processedRequests = {};
      
      if (processedRequestsJson) {
        try {
          processedRequests = JSON.parse(processedRequestsJson);
        } catch (e) {
          console.error('Erreur lors de la récupération des statuts:', e);
        }
      }
      
      // Vérifier si l'utilisateur a une demande approuvée
      const currentWalletAddress = wallet.publicKey.toString();
      
      const userRequest = userRequests.find(req => req.walletAddress === currentWalletAddress);
      
      if (userRequest) {
        if (processedRequests[userRequest.id] === 'approved') {
          // L'utilisateur a une demande approuvée, le rediriger vers la page appropriée
          if (userRequest.requestedRole === 'etudiant') {
            router.push('/etudiants');
          } else if (userRequest.requestedRole === 'formateur') {
            router.push('/admin/formations');
          }
        } else {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };
    
    checkApprovedRequest();
    
  }, [wallet.connected, wallet.publicKey, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.publicKey) {
      return;
    }
    
    // Créer un objet de demande d'accès
    const accessRequest = {
      id: `request_${Date.now()}`, // Générer un ID unique basé sur le timestamp
      walletAddress: wallet.publicKey.toString(),
      requestedRole: role,
      message: message,
      status: 'pending',
      timestamp: new Date()
    };
    
    // Récupérer les demandes existantes du localStorage
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    let pendingRequests = [];
    
    if (pendingRequestsJson) {
      try {
        pendingRequests = JSON.parse(pendingRequestsJson);
      } catch (e) {
        console.error('Erreur lors de la récupération des demandes en attente:', e);
      }
    }
    
    // Ajouter la nouvelle demande
    pendingRequests.push(accessRequest);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('alyraSign_pendingRequests', JSON.stringify(pendingRequests));
    
    // Simuler l'envoi d'une demande d'accès à la blockchain
    console.log('Soumission de la demande d\'accès:', accessRequest);
    
    // Ici, vous implémenteriez l'appel au programme Solana pour enregistrer la demande
    
    // Afficher une alerte de confirmation
    alert('Votre demande a été soumise avec succès! Vous serez redirigé vers la page d\'accueil.');
    
    // Simuler un délai avant la redirection
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };
  
  if (!wallet.connected) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Demande d'accès | AlyraSign</title>
        <meta name="description" content="Demande d'accès à l'application AlyraSign" />
      </Head>
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
        {isChecking ? (
          <div className="max-w-md w-full bg-black bg-opacity-70 rounded-lg shadow-xl p-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-center text-white mb-4">Vérification de vos droits d'accès...</h2>
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full bg-black bg-opacity-70 rounded-lg shadow-xl p-8 border border-gray-700">
            <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-blue-500 mb-2">
              Bienvenue sur AlyraSign
            </h1>
            
            <p className="text-center text-gray-300 mb-6">
              Application de gestion des présences pour les étudiants
            </p>
            
            <div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-center text-white mb-4">Demande d'accès</h2>
              
              <p className="text-center text-gray-300 mb-2">
                Vous n'avez pas encore accès à cette application.
              </p>
              <p className="text-center text-gray-300 mb-4">
                Veuillez soumettre une demande d'accès
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Rôle souhaité
                  </label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'etudiant' | 'formateur')}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="formateur">Formateur</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white h-24 resize-none"
                    placeholder="Expliquez pourquoi vous demandez l'accès..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Soumettre la demande
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessRequestPage; 