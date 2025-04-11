import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { PROGRAM_ID } from '../../../lib/idl/alyrasign';
import { initializeAllStorage, getAccessRequests } from '../../../lib/solana';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white shadow-md rounded-lg ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

const Button = ({ children, onClick, className = "" }: ButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

interface AccessRequest {
  id: string;
  walletAddress: string;
  requestedRole: string;
  message: string;
  timestamp: string;
  status: string;
}

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  formationsCount: number;
  sessionsCount: number;
}

const BlockchainDashboard = () => {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    formationsCount: 0,
    sessionsCount: 0
  });
  
  useEffect(() => {
    if (!wallet || !connection) {
      router.replace('/');
      return;
    }
    
    const loadData = async () => {
      try {
        const allRequests = await getAccessRequests(wallet, connection);
        const pendingRequests = allRequests.filter((req: AccessRequest) => req.status === 'pending');
        
        setStats(prevStats => ({
          ...prevStats,
          totalRequests: allRequests.length,
          pendingRequests: pendingRequests.length
        }));
        
        setRequests(allRequests);
      } catch (error: unknown) {
        console.error('Erreur lors du chargement des statistiques:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Une erreur est survenue lors du chargement des statistiques');
        }
      }
    };
    
    void loadData();
  }, [wallet, connection]);

  const handleInitializeStorage = async () => {
    try {
      setLoading(true);
      toast.info("Initialisation des comptes de stockage...");
      
      if (!wallet || !connection) {
        throw new Error("Wallet non connecté");
      }
      
      const success = await initializeAllStorage(wallet, connection);
      
      if (success) {
        toast.success("Comptes de stockage initialisés avec succès!");
        setInitialized(true);
      } else {
        toast.error("Erreur lors de l'initialisation des comptes de stockage");
      }
    } catch (error: unknown) {
      console.error('Erreur lors de l\'initialisation:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors de l\'initialisation');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <p className="text-center">Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord blockchain</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Formations</h3>
            <p className="text-3xl font-bold">{stats.formationsCount}</p>
            <p className="text-gray-500 mt-2">Formations enregistrées</p>
          </Card>
          
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-2">Sessions</h3>
            <p className="text-3xl font-bold">{stats.sessionsCount}</p>
            <p className="text-gray-500 mt-2">Sessions planifiées</p>
          </Card>
          
          <Card className="p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold mb-2">Demandes</h3>
            <p className="text-3xl font-bold">{stats.pendingRequests}</p>
            <p className="text-gray-500 mt-2">Demandes en attente</p>
          </Card>
          
          <Card className="p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold mb-2">Réseau</h3>
            <p className="text-xl font-semibold capitalize">{process.env.NEXT_PUBLIC_SOLANA_NETWORK}</p>
            <p className="text-gray-500 mt-2">Réseau Solana utilisé</p>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations Blockchain</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Réseau</span>
                <span className="font-semibold capitalize">{process.env.NEXT_PUBLIC_SOLANA_NETWORK}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">RPC URL</span>
                <span className="font-mono text-sm">{process.env.NEXT_PUBLIC_SOLANA_RPC_URL}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Programme ID</span>
                <span className="font-mono text-sm">{PROGRAM_ID.toString().substring(0, 6)}...{PROGRAM_ID.toString().substring(PROGRAM_ID.toString().length - 4)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Mode Blockchain</span>
                <span className={`px-2 py-1 text-xs rounded-full ${process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' ? 'Activé' : 'Simulation'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/admin/blockchain/test')} 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 text-left px-4"
              >
                Console de Test
              </Button>
              <Button 
                onClick={() => router.push('/admin/tokens')} 
                className="w-full bg-purple-600 text-white hover:bg-purple-700 text-left px-4"
              >
                Gérer les Demandes
              </Button>
              <Button 
                onClick={() => router.push('/admin/formations')} 
                className="w-full bg-green-600 text-white hover:bg-green-700 text-left px-4"
              >
                Gérer les Formations
              </Button>
              <Button 
                onClick={() => router.push('/admin/blockchain/config')} 
                className="w-full bg-gray-600 text-white hover:bg-gray-700 text-left px-4"
              >
                Configuration
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="text-blue-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mode {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' ? 'Blockchain' : 'Simulation'}</h3>
                <p className="text-gray-600 mt-1">
                  {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' 
                    ? "Les interactions sont effectuées directement sur la blockchain Solana. Assurez-vous d'avoir suffisamment de SOL pour les transactions."
                    : "Le mode simulation utilise le localStorage pour simuler les interactions blockchain. Aucune transaction réelle n'est effectuée."}
                </p>
                <p className="mt-3">
                  <Button 
                    onClick={() => router.push('/admin/blockchain/config')} 
                    className="text-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Modifier la configuration
                  </Button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BlockchainDashboard; 