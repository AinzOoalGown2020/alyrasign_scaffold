import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';

interface TokenRequest {
  id: string;
  walletAddress: string;
  requestedRole: 'etudiant' | 'formateur';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

const AdminTokensPage: FC = () => {
  const [requests, setRequests] = useState<TokenRequest[]>([]);
  const wallet = useWallet();
  const router = useRouter();
  
  // Simuler la vérification du rôle (à remplacer par une vraie vérification sur la blockchain)
  const DEV_ADDRESS = "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy";
  
  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
    if (!wallet.connected) {
      router.push('/');
      return;
    }
    
    // Vérifier si l'utilisateur a les permissions nécessaires
    if (wallet.publicKey?.toString() !== DEV_ADDRESS) {
      router.push('/');
      return;
    }
    
    // Charger les demandes (simulation)
    loadRequests();
  }, [wallet.connected, wallet.publicKey, router]);
  
  const loadRequests = () => {
    // Tenter de récupérer les demandes précédemment traitées du localStorage
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    let processedRequests: Record<string, 'approved' | 'rejected'> = {};
    
    if (processedRequestsJson) {
      try {
        processedRequests = JSON.parse(processedRequestsJson);
      } catch (e) {
        console.error('Erreur lors de la récupération des demandes traitées:', e);
      }
    }
    
    // Initialiser un tableau vide pour les demandes
    let allRequests: TokenRequest[] = [];
    
    // Récupérer les demandes en attente du localStorage
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    
    if (pendingRequestsJson) {
      try {
        // Convertir les données JSON en objets avec des dates correctes
        const parsedRequests = JSON.parse(pendingRequestsJson);
        allRequests = parsedRequests.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp)
        }));
      } catch (e) {
        console.error('Erreur lors de la récupération des demandes en attente:', e);
      }
    }
    
    // Appliquer les statuts précédemment sauvegardés
    const updatedRequests = allRequests.map(request => {
      if (processedRequests[request.id]) {
        return {
          ...request,
          status: processedRequests[request.id]
        };
      }
      return request;
    });
    
    setRequests(updatedRequests);
  };
  
  const handleApprove = async (request: TokenRequest) => {
    // Simuler l'approbation de la demande
    console.log(`Approuver la demande pour ${request.walletAddress} en tant que ${request.requestedRole}`);
    
    try {
      // 1. Créer une transaction Solana pour l'approbation
      // Cette partie devrait être implémentée avec @solana/web3.js et/ou Anchor
      /*
      // Exemple d'implémentation avec Solana web3.js:
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      
      // Créer une nouvelle transaction
      const transaction = new Transaction();
      
      // Ajouter l'instruction pour appeler le programme Solana qui gère les rôles
      // Le program ID serait l'adresse de votre programme déployé sur la blockchain
      const programId = new PublicKey('VOTRE_PROGRAM_ID_ICI');
      
      // Créer l'instruction pour appeler la fonction "approve_role" de votre programme
      const approveRoleInstruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // L'admin qui approuve
          { pubkey: new PublicKey(request.walletAddress), isSigner: false, isWritable: true }, // Le wallet qui reçoit le rôle
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false } // Programme système de Solana
        ],
        programId,
        data: Buffer.from(Uint8Array.of(0, ...request.requestedRole.split('').map(c => c.charCodeAt(0)))) // 0 = code d'instruction pour approver, suivi du rôle
      });
      
      // Ajouter l'instruction à la transaction
      transaction.add(approveRoleInstruction);
      
      // Signer et envoyer la transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      
      // Attendre la confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction confirmée:', signature);
      */
      
      // En attendant l'implémentation réelle, nous simulons avec localStorage
      // Mettre à jour l'interface utilisateur
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r.id === request.id ? { ...r, status: 'approved' } : r
        )
      );
      
      // Sauvegarder l'état dans le localStorage
      saveProcessedRequest(request.id, 'approved');
      
      // Notifier l'utilisateur
      alert(`La demande de ${request.walletAddress} a été approuvée. Dans une implémentation complète, cette approbation serait envoyée à la blockchain Solana.`);
      
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      alert('Une erreur est survenue lors de l\'approbation de la demande.');
    }
  };
  
  const handleReject = async (request: TokenRequest) => {
    // Simuler le rejet de la demande
    console.log(`Rejeter la demande pour ${request.walletAddress}`);
    
    try {
      // 1. Créer une transaction Solana pour le rejet
      // Cette partie devrait être implémentée avec @solana/web3.js et/ou Anchor
      /*
      // Exemple d'implémentation avec Solana web3.js:
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      
      // Créer une nouvelle transaction
      const transaction = new Transaction();
      
      // Ajouter l'instruction pour appeler le programme Solana qui gère les rôles
      // Le program ID serait l'adresse de votre programme déployé sur la blockchain
      const programId = new PublicKey('VOTRE_PROGRAM_ID_ICI');
      
      // Créer l'instruction pour appeler la fonction "reject_role" de votre programme
      const rejectRoleInstruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // L'admin qui rejette
          { pubkey: new PublicKey(request.walletAddress), isSigner: false, isWritable: true }, // Le wallet qui est rejeté
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false } // Programme système de Solana
        ],
        programId,
        data: Buffer.from(Uint8Array.of(1)) // 1 = code d'instruction pour rejeter
      });
      
      // Ajouter l'instruction à la transaction
      transaction.add(rejectRoleInstruction);
      
      // Signer et envoyer la transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      
      // Attendre la confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction de rejet confirmée:', signature);
      */
      
      // En attendant l'implémentation réelle, nous simulons avec localStorage
      // Mettre à jour l'interface utilisateur
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r.id === request.id ? { ...r, status: 'rejected' } : r
        )
      );
      
      // Sauvegarder l'état dans le localStorage
      saveProcessedRequest(request.id, 'rejected');
      
      // Notifier l'utilisateur
      alert(`La demande de ${request.walletAddress} a été rejetée. Dans une implémentation complète, ce rejet serait enregistré sur la blockchain Solana.`);
      
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      alert('Une erreur est survenue lors du rejet de la demande.');
    }
  };
  
  const saveProcessedRequest = (requestId: string, status: 'approved' | 'rejected') => {
    // Récupérer les demandes traitées existantes
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    let processedRequests: Record<string, 'approved' | 'rejected'> = {};
    
    if (processedRequestsJson) {
      try {
        processedRequests = JSON.parse(processedRequestsJson);
      } catch (e) {
        console.error('Erreur lors de la récupération des demandes traitées:', e);
      }
    }
    
    // Ajouter ou mettre à jour la demande traitée
    processedRequests[requestId] = status;
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('alyraSign_processedRequests', JSON.stringify(processedRequests));
  };
  
  const refreshBlockchainData = () => {
    // Simuler le chargement depuis la blockchain en rechargeant les données initiales
    loadRequests();
    
    // Notifier l'utilisateur
    alert('Les données ont été actualisées depuis la blockchain.');
  };
  
  if (!wallet.connected || wallet.publicKey?.toString() !== DEV_ADDRESS) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Administration des Tokens | AlyraSign</title>
        <meta name="description" content="Administration des tokens pour AlyraSign" />
      </Head>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-white">Gestion des autorisations de rôles</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Rôles prédéfinis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-blue-400 mb-2">Rôle Formateur</h3>
              <p className="text-gray-300 text-sm">Accès aux fonctionnalités de gestion des formations, des sessions et des étudiants.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-green-400 mb-2">Rôle Étudiant</h3>
              <p className="text-gray-300 text-sm">Accès aux fonctionnalités de consultation des formations et de gestion des présences.</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Demandes d'accès en attente</h2>
            <button
              onClick={refreshBlockchainData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser depuis la blockchain
            </button>
          </div>
          
          {requests.length === 0 ? (
            <p className="text-gray-400">Aucune demande en attente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left text-white">Adresse wallet</th>
                    <th className="px-4 py-3 text-left text-white">Rôle demandé</th>
                    <th className="px-4 py-3 text-left text-white">Message</th>
                    <th className="px-4 py-3 text-left text-white">Date de demande</th>
                    <th className="px-4 py-3 text-left text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.filter(r => r.status === 'pending').map((request) => (
                    <tr key={request.id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-gray-300">{request.walletAddress.substring(0, 6)}...{request.walletAddress.substring(request.walletAddress.length - 4)}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{request.requestedRole}</td>
                      <td className="px-4 py-3 text-gray-300">{request.message || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{request.timestamp.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Création manuelle de tokens</h2>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Adresse Wallet
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  placeholder="Adresse du wallet Solana"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Rôle à assigner
                </label>
                <select
                  className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="formateur">Formateur</option>
                </select>
              </div>
            </div>
            <button
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
            >
              Créer et Assigner le Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTokensPage; 