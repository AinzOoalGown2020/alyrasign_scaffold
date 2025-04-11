import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAccessRequests, approveAccessRequest } from '../../lib/solana';
import { useWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

interface Request {
  id: string;
  walletAddress: string;
  requestedRole: string;
  message: string;
  timestamp: string;
  status: string;
}

const AdminIndex: React.FC = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [accessRequests, setAccessRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletToCheck, setWalletToCheck] = useState('');
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isDeletingAccess, setIsDeletingAccess] = useState(false);

  // Charger les demandes d'accès au chargement
  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    try {
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      const requests = await getAccessRequests(wallet, connection);
      setAccessRequests(requests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const success = await approveAccessRequest(requestId, wallet, connection);
      if (success) {
        toast.success('Demande approuvée avec succès');
        loadAccessRequests(); // Recharger les demandes
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  };

  const checkAccessStatus = async () => {
    if (!walletToCheck) {
      toast.error('Veuillez entrer une adresse de wallet');
      return;
    }

    setIsCheckingStatus(true);
    try {
      // Vérifier dans le localStorage
      const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
      const processedRequests = processedRequestsJson ? JSON.parse(processedRequestsJson) : {};
      
      // Chercher dans les demandes traitées
      let foundRequest = null;
      for (const requestId in processedRequests) {
        const request = processedRequests[requestId];
        if (request.walletAddress === walletToCheck) {
          foundRequest = request;
          break;
        }
      }

      if (foundRequest) {
        setAccessStatus({
          walletAddress: foundRequest.walletAddress,
          role: foundRequest.requestedRole,
          status: foundRequest.status,
          processedAt: foundRequest.processedAt
        });
      } else {
        setAccessStatus(null);
        toast.info('Aucun accès trouvé pour cette adresse');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const deleteAccess = async () => {
    if (!accessStatus) {
      toast.error('Aucun accès sélectionné');
      return;
    }

    setIsDeletingAccess(true);
    try {
      // Récupérer les demandes traitées
      const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
      const processedRequests = processedRequestsJson ? JSON.parse(processedRequestsJson) : {};
      
      // Trouver et supprimer la demande
      let requestId = null;
      for (const id in processedRequests) {
        if (processedRequests[id].walletAddress === accessStatus.walletAddress) {
          requestId = id;
          break;
        }
      }

      if (requestId) {
        // Supprimer la demande
        delete processedRequests[requestId];
        localStorage.setItem('alyraSign_processedRequests', JSON.stringify(processedRequests));

        // Nettoyer les informations de connexion
        const lastConnectedWallet = localStorage.getItem('alyraSign_lastConnectedWallet');
        if (lastConnectedWallet === accessStatus.walletAddress) {
          localStorage.removeItem('alyraSign_lastConnectedRole');
          localStorage.removeItem('alyraSign_lastConnectedWallet');
          localStorage.removeItem('alyraSign_onDashboard');
        }

        toast.success('Accès supprimé avec succès');
        setAccessStatus(null);
        setWalletToCheck('');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'accès:', error);
      toast.error('Erreur lors de la suppression de l\'accès');
    } finally {
      setIsDeletingAccess(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      {/* Section Gestion des Demandes d'Accès */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gestion des Demandes d'Accès</h2>
        {isLoading ? (
          <p>Chargement des demandes...</p>
        ) : accessRequests.length === 0 ? (
          <p>Aucune demande d'accès en attente</p>
        ) : (
          <div className="space-y-4">
            {accessRequests.map((request) => (
              <div key={request.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Wallet: {request.walletAddress}</p>
                    <p>Rôle demandé: {request.requestedRole}</p>
                    <p>Message: {request.message}</p>
                    <p>Date: {new Date(request.timestamp).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approuver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Gestion des Accès Existants */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gestion des Accès Existants</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Adresse du wallet à vérifier
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletToCheck}
              onChange={(e) => setWalletToCheck(e.target.value)}
              placeholder="Entrez l'adresse du wallet"
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={checkAccessStatus}
              disabled={isCheckingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCheckingStatus ? 'Vérification...' : 'Vérifier le statut'}
            </button>
          </div>
        </div>

        {accessStatus && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Statut de l'accès</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Wallet:</span> {accessStatus.walletAddress}</p>
              <p><span className="font-medium">Rôle:</span> {accessStatus.role}</p>
              <p><span className="font-medium">Statut:</span> {accessStatus.status}</p>
              <p><span className="font-medium">Date de traitement:</span> {new Date(accessStatus.processedAt).toLocaleString()}</p>
            </div>
            <button
              onClick={deleteAccess}
              disabled={isDeletingAccess}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDeletingAccess ? 'Suppression...' : 'Supprimer l\'accès'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIndex; 