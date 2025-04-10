import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';

interface Session {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  isSynced: boolean;
}

interface Formation {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
}

const AdminSessionsPage: FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  
  const wallet = useWallet();
  const router = useRouter();
  const { formationId } = router.query;
  
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
    
    // Vérifier si l'ID de la formation est présent
    if (!formationId) {
      router.push('/admin/formations');
      return;
    }
    
    // Charger les informations de la formation et des sessions (simulation)
    loadFormationAndSessions(formationId as string);
  }, [wallet.connected, wallet.publicKey, router, formationId]);
  
  const loadFormationAndSessions = (formationId: string) => {
    // Simuler le chargement de la formation depuis la blockchain
    const mockFormation: Formation = {
      id: formationId as string,
      title: 'Développement Blockchain Avancé',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-12-15')
    };
    
    // Simuler le chargement des sessions depuis la blockchain
    const mockSessions: Session[] = [
      {
        id: '1',
        title: 'Introduction à Solana',
        date: new Date('2023-09-05'),
        startTime: '09:00',
        endTime: '12:30',
        isSynced: true
      },
      {
        id: '2',
        title: 'Smart Contracts avec Rust',
        date: new Date('2023-09-12'),
        startTime: '09:00',
        endTime: '12:30',
        isSynced: true
      },
      {
        id: '3',
        title: 'Développement d\'applications décentralisées',
        date: new Date('2023-09-19'),
        startTime: '09:00',
        endTime: '12:30',
        isSynced: false
      }
    ];
    
    setFormation(mockFormation);
    setSessions(mockSessions);
  };
  
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!newSession.title || !newSession.date || !newSession.startTime || !newSession.endTime) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    // Créer une nouvelle session (locale)
    const sessionToAdd: Session = {
      id: Date.now().toString(), // Génération d'un ID temporaire
      title: newSession.title,
      date: new Date(newSession.date),
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      isSynced: false
    };
    
    // Ajouter la session localement
    setSessions(prev => [...prev, sessionToAdd]);
    
    // Réinitialiser le formulaire et fermer la modale
    setNewSession({
      title: '',
      date: '',
      startTime: '',
      endTime: ''
    });
    setIsCreateModalOpen(false);
  };
  
  const handleDeleteSession = (id: string) => {
    // Confirmation de suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      return;
    }
    
    // Supprimer la session de l'état local
    setSessions(prev => prev.filter(session => session.id !== id));
    
    // Ici, vous implémenteriez l'appel au programme Solana pour marquer la session comme supprimée
  };
  
  const handleSyncAll = () => {
    // Simuler la synchronisation de toutes les sessions avec la blockchain
    console.log('Synchronisation de toutes les sessions avec la blockchain');
    
    // Mettre à jour l'état local
    setSessions(prev => 
      prev.map(session => ({ 
        ...session, 
        isSynced: true
      }))
    );
    
    // Ici, vous implémenteriez l'appel au programme Solana pour synchroniser toutes les sessions
  };
  
  if (!wallet.connected || wallet.publicKey?.toString() !== DEV_ADDRESS || !formation) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Gestion des Sessions | AlyraSign</title>
        <meta name="description" content="Gestion des sessions pour AlyraSign" />
      </Head>
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/formations')}
            className="text-blue-400 hover:text-blue-500 inline-flex items-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux formations
          </button>
          
          <h1 className="text-3xl font-bold text-white">Sessions de la formation</h1>
          <p className="text-lg text-gray-300 mt-2">
            {formation.title} (Du {formation.startDate.toLocaleDateString()} au {formation.endDate.toLocaleDateString()})
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
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
              Créer une Session
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">{session.title}</h2>
                
                <div className="mb-4">
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {session.date.toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  Gérer les Présences
                </button>
                
                <button
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm"
                >
                  Modifier
                </button>
                
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Modal de création de session */}
        {isCreateModalOpen && formation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Créer une Nouvelle Session</h2>
              
              <div className="bg-blue-900 bg-opacity-30 p-4 rounded-md mb-6 border border-blue-800">
                <p className="text-blue-300 font-medium">Période de la formation</p>
                <p className="text-white">Du {formation.startDate.toLocaleDateString()} au {formation.endDate.toLocaleDateString()}</p>
              </div>
              
              <form onSubmit={handleCreateSession}>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                    placeholder="Titre de la session"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                    min={formation.startDate.toISOString().split('T')[0]}
                    max={formation.endDate.toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
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

export default AdminSessionsPage; 