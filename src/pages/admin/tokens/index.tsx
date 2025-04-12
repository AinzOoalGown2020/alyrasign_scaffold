import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID } from '../../../lib/idl/alyrasign';
import { getAccessRequests, approveAccessRequest, rejectAccessRequest, revokeAccess } from '../../../lib/solana';
import { toast } from 'react-toastify';
import Button from '../../../components/Button';

interface TokenRequest {
  id: string;
  walletAddress: string;
  requestedRole: 'etudiant' | 'formateur';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string | Date;
}

const AdminTokensPage: FC = () => {
  const [requests, setRequests] = useState<TokenRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchWallet, setSearchWallet] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<TokenRequest[]>([]);
  const router = useRouter();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [selectedRole, setSelectedRole] = useState<string>('etudiant');
  
  // Utiliser la valeur depuis .env.local
  const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy";
  
  useEffect(() => {
    if (!publicKey) {
      router.replace('/');
      return;
    }
    
    loadRequests();
  }, [publicKey, router]);
  
  const loadRequests = async () => {
    try {
      console.log("Chargement des demandes d'accès...");
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      const allRequests = await getAccessRequests(wallet, connection);
      console.log("Demandes d'accès chargées:", allRequests);
      setRequests(allRequests.map(request => ({
        ...request,
        timestamp: new Date(request.timestamp)
      })));
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des demandes:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors du chargement des demandes');
      }
    }
  };
  
  const handleApprove = async (request: any) => {
    setProcessingId(request.id);
    try {
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      
      const success = await approveAccessRequest(request.id, wallet, connection, selectedRole);
      if (success) {
        toast.success(`La demande de ${request.walletAddress} a été approuvée avec le rôle ${selectedRole}.`);
        loadRequests();
      } else {
        toast.error("Erreur lors de l'approbation de la demande");
      }
    } catch (error: unknown) {
      console.error('Erreur lors de l\'approbation:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors de l\'approbation');
      }
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (request: any) => {
    setProcessingId(request.id);
    try {
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      
      const success = await rejectAccessRequest(request.id, wallet, connection);
      if (success) {
        toast.success(`La demande de ${request.walletAddress} a été rejetée.`);
        loadRequests();
      } else {
        toast.error("Erreur lors du rejet de la demande");
      }
    } catch (error: unknown) {
      console.error('Erreur lors du rejet:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors du rejet');
      }
    } finally {
      setProcessingId(null);
    }
  };
  
  const refreshBlockchainData = () => {
    loadRequests();
    toast.info("Données rafraîchies");
  };
  
  const handleSearch = async () => {
    if (!searchWallet.trim()) {
      toast.info("Veuillez entrer une adresse de wallet à rechercher");
      return;
    }
    
    setSearching(true);
    try {
      // Récupérer les demandes pour l'adresse spécifique
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      const requests = await getAccessRequests(wallet, connection, searchWallet);
      console.log("Demandes trouvées pour l'adresse:", requests);
      
      // Convertir les timestamps en Date et s'assurer que les types correspondent
      const formattedRequests: TokenRequest[] = requests.map(request => ({
        ...request,
        timestamp: new Date(request.timestamp)
      }));
      
      setSearchResults(formattedRequests);
      
      if (formattedRequests.length === 0) {
        toast.info(`Aucun accès trouvé pour l'adresse ${searchWallet}`);
      } else {
        const approvedCount = formattedRequests.filter(r => r.status === 'approved').length;
        const rejectedCount = formattedRequests.filter(r => r.status === 'rejected').length;
        const pendingCount = formattedRequests.filter(r => r.status === 'pending').length;
        
        toast.success(
          `${formattedRequests.length} accès trouvé(s) pour l'adresse ${searchWallet}: ` +
          `${approvedCount} approuvé(s), ${rejectedCount} rejeté(s), ${pendingCount} en attente`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche sur la blockchain");
    } finally {
      setSearching(false);
    }
  };
  
  const handleRevokeAccess = async (request: TokenRequest) => {
    if (!wallet || !connection) {
      toast.error("Wallet non connecté");
      return;
    }
    
    setProcessingId(request.id);
    try {
      const success = await revokeAccess(request.id, wallet, connection);
      if (success) {
        toast.success(`Les droits de ${request.walletAddress} ont été révoqués.`);
        // Recharger les données après la révocation
        await loadRequests();
        // Mettre à jour les résultats de recherche
        if (searchWallet) {
          handleSearch();
        }
      } else {
        toast.error("Erreur lors de la révocation des droits");
      }
    } catch (error) {
      console.error("Erreur lors de la révocation des droits:", error);
      toast.error("Erreur lors de la révocation des droits");
    } finally {
      setProcessingId(null);
    }
  };
  
  return (
    <>
      <Head>
        <title>Administration des tokens | AlyraSign</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Gestion des Demandes d'Accès</h1>
          <Button
            onClick={refreshBlockchainData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rafraîchir'}
          </Button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Détails de la blockchain : Programme <span className="font-mono">{PROGRAM_ID.toString().substring(0, 4)}...{PROGRAM_ID.toString().substring(PROGRAM_ID.toString().length - 4)}</span> sur {process.env.NEXT_PUBLIC_SOLANA_NETWORK}
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' 
              ? 'Les transactions sont envoyées à la blockchain Solana.'
              : 'Mode simulation : les transactions sont simulées localement.'}
          </p>
        </div>

        {/* Section des demandes en attente */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Demandes en attente</h2>
          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="text-center p-10 bg-gray-800 rounded">
              <h3 className="text-lg text-gray-300">Aucune demande en attente</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr className="bg-gray-700 text-gray-200">
                    <th className="py-3 px-4 text-left text-sm">ID</th>
                    <th className="py-3 px-4 text-left text-sm">Adresse du wallet</th>
                    <th className="py-3 px-4 text-left text-sm">Rôle demandé</th>
                    <th className="py-3 px-4 text-left text-sm">Message</th>
                    <th className="py-3 px-4 text-left text-sm">Date</th>
                    <th className="py-3 px-4 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.filter(r => r.status === 'pending').map((request) => (
                    <tr key={request.id} className="border-t border-gray-700">
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.id}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.walletAddress}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.requestedRole}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.message || '-'}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">
                        {new Date(request.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={processingId === request.id}
                          >
                            <option value="etudiant">Étudiant</option>
                            <option value="formateur">Formateur</option>
                          </select>
                          <Button
                            onClick={() => handleApprove(request)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? 'Traitement...' : 'Approuver'}
                          </Button>
                          <Button
                            onClick={() => handleReject(request)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? 'Traitement...' : 'Rejeter'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section des accès existants */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Gestion des Accès Existants</h2>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Rechercher par adresse de wallet..."
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                {searching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recherche...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher
                  </>
                )}
              </button>
              {searchWallet && (
                <button
                  onClick={() => {
                    setSearchWallet('');
                    setSearchResults([]);
                  }}
                  className="ml-2 p-2 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {searchWallet && searchResults.length === 0 && !searching ? (
            <div className="text-center p-10 bg-gray-800 rounded">
              <h3 className="text-lg text-gray-300">
                Aucun accès trouvé pour cette adresse de wallet
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr className="bg-gray-700 text-gray-200">
                    <th className="py-3 px-4 text-left text-sm">ID</th>
                    <th className="py-3 px-4 text-left text-sm">Adresse du wallet</th>
                    <th className="py-3 px-4 text-left text-sm">Rôle</th>
                    <th className="py-3 px-4 text-left text-sm">Message</th>
                    <th className="py-3 px-4 text-left text-sm">Date</th>
                    <th className="py-3 px-4 text-left text-sm">Statut</th>
                    <th className="py-3 px-4 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchWallet ? searchResults : requests.filter(r => r.status !== 'pending')).map((request) => (
                    <tr key={request.id} className="border-t border-gray-700">
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.id}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.walletAddress}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.requestedRole}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">{request.message || '-'}</td>
                      <td className="py-3 px-4 text-gray-200 text-sm">
                        {new Date(request.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                          request.status === 'approved' ? 'bg-green-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'approved' && (
                          <Button
                            onClick={() => handleRevokeAccess(request)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? 'Traitement...' : 'Retirer les droits'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminTokensPage; 