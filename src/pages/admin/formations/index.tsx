import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';

interface Formation {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  sessionCount: number;
  lastSync?: Date;
  isSynced: boolean;
}

const AdminFormationsPage: FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormation, setNewFormation] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  
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
    
    // Charger les formations (simulation)
    loadFormations();
  }, [wallet.connected, wallet.publicKey, router]);
  
  const loadFormations = () => {
    // Simuler le chargement des formations depuis la blockchain
    const mockFormations: Formation[] = [
      {
        id: '1',
        title: 'Développement Blockchain Avancé',
        description: 'Apprenez les techniques avancées de développement blockchain sur Solana',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        sessionCount: 12,
        lastSync: new Date('2023-08-20'),
        isSynced: true
      },
      {
        id: '2',
        title: 'Smart Contracts Solana',
        description: 'Création et déploiement de smart contracts sur Solana',
        startDate: new Date('2023-10-05'),
        endDate: new Date('2024-01-20'),
        sessionCount: 10,
        lastSync: new Date('2023-09-25'),
        isSynced: true
      },
      {
        id: '3',
        title: 'NFT et Métavers',
        description: 'Création et gestion de NFTs sur la blockchain Solana',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-04-30'),
        sessionCount: 0,
        isSynced: false
      }
    ];
    
    setFormations(mockFormations);
  };
  
  const handleCreateFormation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!newFormation.title || !newFormation.description || !newFormation.startDate || !newFormation.endDate) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    // Créer une nouvelle formation (locale)
    const formationToAdd: Formation = {
      id: Date.now().toString(), // Génération d'un ID temporaire
      title: newFormation.title,
      description: newFormation.description,
      startDate: new Date(newFormation.startDate),
      endDate: new Date(newFormation.endDate),
      sessionCount: 0,
      isSynced: false
    };
    
    // Ajouter la formation localement
    setFormations(prev => [...prev, formationToAdd]);
    
    // Réinitialiser le formulaire et fermer la modale
    setNewFormation({
      title: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    setIsCreateModalOpen(false);
  };
  
  const handleSyncFormation = (id: string) => {
    // Simuler la synchronisation d'une formation avec la blockchain
    console.log(`Synchronisation de la formation ${id} avec la blockchain`);
    
    // Mettre à jour l'état local
    setFormations(prev => 
      prev.map(formation => 
        formation.id === id 
          ? { ...formation, isSynced: true, lastSync: new Date() } 
          : formation
      )
    );
    
    // Ici, vous implémenteriez l'appel au programme Solana pour synchroniser la formation
  };
  
  const handleDeleteFormation = (id: string) => {
    // Confirmation de suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }
    
    // Supprimer la formation de l'état local
    setFormations(prev => prev.filter(formation => formation.id !== id));
    
    // Ici, vous implémenteriez l'appel au programme Solana pour marquer la formation comme supprimée
  };
  
  const handleSyncAll = () => {
    // Simuler la synchronisation de toutes les formations avec la blockchain
    console.log('Synchronisation de toutes les formations avec la blockchain');
    
    // Mettre à jour l'état local
    setFormations(prev => 
      prev.map(formation => ({ 
        ...formation, 
        isSynced: true, 
        lastSync: new Date() 
      }))
    );
    
    // Ici, vous implémenteriez l'appel au programme Solana pour synchroniser toutes les formations
  };
  
  if (!wallet.connected || wallet.publicKey?.toString() !== DEV_ADDRESS) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Gestion des Formations | AlyraSign</title>
        <meta name="description" content="Gestion des formations pour AlyraSign" />
      </Head>
      
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Gestion des Formations</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleSyncAll}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Synchroniser avec la Blockchain
            </button>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une Formation
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map(formation => (
            <div key={formation.id} className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{formation.title}</h2>
                <p className="text-gray-300 mb-4">{formation.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formation.startDate.toLocaleDateString()} - {formation.endDate.toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Sessions: {formation.sessionCount}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <a
                    href={`https://explorer.solana.com/address/${wallet.publicKey?.toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 text-sm inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Voir sur Solana Explorer
                  </a>
                  
                  {formation.lastSync && (
                    <div className="text-gray-500 text-xs">
                      Dernière synchronisation: {formation.lastSync.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/admin/sessions?formationId=${formation.id}`)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  Gérer les Sessions
                </button>
                
                <button
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm"
                >
                  Modifier
                </button>
                
                <button
                  onClick={() => handleDeleteFormation(formation.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  Supprimer
                </button>
                
                {!formation.isSynced && (
                  <button
                    onClick={() => handleSyncFormation(formation.id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                  >
                    Synchroniser
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Modal de création de formation */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Créer une Nouvelle Formation</h2>
              
              <form onSubmit={handleCreateFormation}>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newFormation.title}
                    onChange={(e) => setNewFormation({...newFormation, title: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                    placeholder="Titre de la formation"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFormation.description}
                    onChange={(e) => setNewFormation({...newFormation, description: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white h-24 resize-none"
                    placeholder="Description de la formation"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={newFormation.startDate}
                    onChange={(e) => setNewFormation({...newFormation, startDate: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={newFormation.endDate}
                    onChange={(e) => setNewFormation({...newFormation, endDate: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md"
                  >
                    Annuler
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFormationsPage; 