import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

interface StudentGroup {
  id: string;
  name: string;
  students: string[];
  formations: string[];
  isPushedToBlockchain: boolean;
}

interface Formation {
  id: string;
  title: string;
}

const AdminEtudiantsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'ajout' | 'recherche'>('ajout');
  const [groupName, setGroupName] = useState('');
  const [studentAddresses, setStudentAddresses] = useState<string[]>([]);
  const [pendingGroups, setPendingGroups] = useState<StudentGroup[]>([]);
  const [validatedGroups, setValidatedGroups] = useState<StudentGroup[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  
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
    
    // Charger les données (simulation)
    loadData();
  }, [wallet.connected, wallet.publicKey, router]);
  
  const loadData = () => {
    // Simuler le chargement des formations depuis la blockchain
    const mockFormations: Formation[] = [
      { id: '1', title: 'Développement Blockchain Avancé' },
      { id: '2', title: 'Smart Contracts Solana' },
      { id: '3', title: 'NFT et Métavers' }
    ];
    
    // Simuler le chargement des groupes depuis la blockchain
    const mockPendingGroups: StudentGroup[] = [
      {
        id: '1',
        name: 'Groupe A',
        students: [
          '8Kw7yz1mVrsSSSi7afPs1evRnaiQNQGj8x6xnL6UwxgB',
          '5BzCh3mbZs8RuGAZoGr4Jq9R4YyLxwj9q1FXhLaY1GDC'
        ],
        formations: ['1'],
        isPushedToBlockchain: false
      }
    ];
    
    const mockValidatedGroups: StudentGroup[] = [
      {
        id: '2',
        name: 'Groupe B',
        students: [
          '9Kw7yz1mVrsSSSi7afPs1evRnaiQNQGj8x6xnL6UwxgC',
          '6BzCh3mbZs8RuGAZoGr4Jq9R4YyLxwj9q1FXhLaY1GDD',
          '7DzCh3mbZs8RuGAZoGr4Jq9R4YyLxwj9q1FXhLaY1GEE'
        ],
        formations: ['1', '2'],
        isPushedToBlockchain: true
      }
    ];
    
    setFormations(mockFormations);
    setPendingGroups(mockPendingGroups);
    setValidatedGroups(mockValidatedGroups);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        
        // Extraire les adresses des étudiants du fichier
        const addresses = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        setStudentAddresses(addresses);
      };
      reader.readAsText(file);
    } else {
      setFileContent('');
      setStudentAddresses([]);
    }
  };
  
  const handleRemoveStudent = (index: number) => {
    setStudentAddresses(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddGroup = () => {
    if (!groupName) {
      alert('Veuillez entrer un nom de groupe');
      return;
    }
    
    if (studentAddresses.length === 0) {
      alert('Veuillez ajouter des étudiants au groupe');
      return;
    }
    
    // Créer un nouveau groupe
    const newGroup: StudentGroup = {
      id: Date.now().toString(), // Génération d'un ID temporaire
      name: groupName,
      students: studentAddresses,
      formations: [],
      isPushedToBlockchain: false
    };
    
    // Ajouter le groupe aux groupes en attente
    setPendingGroups(prev => [...prev, newGroup]);
    
    // Réinitialiser le formulaire
    setGroupName('');
    setStudentAddresses([]);
    setSelectedFile(null);
    setFileContent('');
  };
  
  const handleAddFormationToGroup = (groupId: string, formationId: string) => {
    setPendingGroups(prev => 
      prev.map(group => 
        group.id === groupId && !group.formations.includes(formationId)
          ? { ...group, formations: [...group.formations, formationId] }
          : group
      )
    );
  };
  
  const handleRemoveFormationFromGroup = (groupId: string, formationId: string) => {
    setPendingGroups(prev => 
      prev.map(group => 
        group.id === groupId
          ? { ...group, formations: group.formations.filter(id => id !== formationId) }
          : group
      )
    );
  };
  
  const handlePushToBlockchain = (groupId: string) => {
    // Simuler l'envoi du groupe à la blockchain
    console.log(`Envoi du groupe ${groupId} à la blockchain`);
    
    // Mettre à jour l'état local
    const groupToPush = pendingGroups.find(group => group.id === groupId);
    
    if (groupToPush) {
      // Supprimer le groupe des groupes en attente
      setPendingGroups(prev => prev.filter(group => group.id !== groupId));
      
      // Ajouter le groupe aux groupes validés
      setValidatedGroups(prev => [...prev, { ...groupToPush, isPushedToBlockchain: true }]);
    }
    
    // Ici, vous implémenteriez l'appel au programme Solana pour enregistrer le groupe
  };
  
  const handleDeleteGroup = (groupId: string) => {
    // Confirmation de suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      return;
    }
    
    // Supprimer le groupe des groupes en attente
    setPendingGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Ici, vous implémenteriez l'appel au programme Solana pour marquer le groupe comme supprimé (si nécessaire)
  };
  
  const refreshBlockchainData = () => {
    // Simuler la récupération des données depuis la blockchain
    console.log('Récupération des données depuis la blockchain');
    loadData();
    
    // Ici, vous implémenteriez l'appel au programme Solana pour récupérer les données actualisées
  };
  
  if (!wallet.connected || wallet.publicKey?.toString() !== DEV_ADDRESS) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Gestion des Étudiants | AlyraSign</title>
        <meta name="description" content="Gestion des étudiants pour AlyraSign" />
      </Head>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Gestion des Étudiants</h1>
        
        <div className="flex border-b border-gray-700 mb-8">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'ajout' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('ajout')}
          >
            Ajout des étudiants
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'recherche' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('recherche')}
          >
            Recherche Étudiants
          </button>
        </div>
        
        {activeTab === 'ajout' && (
          <div>
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Ajouter un nouveau groupe</h2>
              
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  placeholder="Ex: Promotion 2023 - Groupe A"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Importer des étudiants
                </label>
                <div className="flex items-center">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer">
                    <span>Choisir un fichier</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="ml-4 text-gray-300">{selectedFile.name}</span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">
                  Formats acceptés: .txt, .csv - Une adresse de wallet par ligne
                </p>
                
                {studentAddresses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-white text-sm font-medium mb-2">Étudiants importés ({studentAddresses.length}):</p>
                    <div className="bg-gray-700 p-4 rounded-md max-h-40 overflow-y-auto">
                      {studentAddresses.map((address, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <span className="text-gray-300 text-sm">{address}</span>
                          <button
                            onClick={() => handleRemoveStudent(index)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleAddGroup}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
              >
                Ajouter le groupe en local
              </button>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Groupes en attente de validation</h2>
              
              {pendingGroups.length === 0 ? (
                <p className="text-gray-400">Aucun groupe en attente de validation.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-4 py-3 text-left text-white">Nom du groupe</th>
                        <th className="px-4 py-3 text-left text-white">Nombre d'étudiants</th>
                        <th className="px-4 py-3 text-left text-white">Étudiants</th>
                        <th className="px-4 py-3 text-left text-white">Formations associées</th>
                        <th className="px-4 py-3 text-left text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingGroups.map((group) => (
                        <tr key={group.id} className="border-t border-gray-700">
                          <td className="px-4 py-3 text-gray-300">{group.name}</td>
                          <td className="px-4 py-3 text-gray-300">{group.students.length}</td>
                          <td className="px-4 py-3 text-gray-300">
                            <div className="max-h-20 overflow-y-auto">
                              {group.students.map((student, index) => (
                                <div key={index} className="text-sm mb-1">
                                  {student.substring(0, 6)}...{student.substring(student.length - 4)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col space-y-2">
                              {group.formations.map(formationId => {
                                const formation = formations.find(f => f.id === formationId);
                                return (
                                  <div key={formationId} className="flex items-center">
                                    <span className="text-gray-300 text-sm">{formation?.title}</span>
                                    <button
                                      onClick={() => handleRemoveFormationFromGroup(group.id, formationId)}
                                      className="ml-2 text-red-500 hover:text-red-400 text-xs"
                                    >
                                      Retirer
                                    </button>
                                  </div>
                                );
                              })}
                              
                              <select
                                className="mt-2 p-2 bg-gray-700 rounded-md border border-gray-600 text-gray-300 text-sm"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddFormationToGroup(group.id, e.target.value);
                                    e.target.value = '';  // Réinitialiser le select
                                  }
                                }}
                                value=""
                              >
                                <option value="" disabled>Associer une formation</option>
                                {formations
                                  .filter(f => !group.formations.includes(f.id))
                                  .map(formation => (
                                    <option key={formation.id} value={formation.id}>
                                      {formation.title}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePushToBlockchain(group.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                                disabled={group.formations.length === 0}
                              >
                                Pousser sur la Blockchain
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                              >
                                Supprimer
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Groupes validés sur la blockchain</h2>
                <button
                  onClick={refreshBlockchainData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Actualiser les données Blockchain
                </button>
              </div>
              
              {validatedGroups.length === 0 ? (
                <p className="text-gray-400">Aucun groupe validé sur la blockchain.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-4 py-3 text-left text-white">Nom du groupe</th>
                        <th className="px-4 py-3 text-left text-white">Nombre d'étudiants</th>
                        <th className="px-4 py-3 text-left text-white">Formations associées</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validatedGroups.map((group) => (
                        <tr key={group.id} className="border-t border-gray-700">
                          <td className="px-4 py-3 text-gray-300">{group.name}</td>
                          <td className="px-4 py-3 text-gray-300">{group.students.length}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {group.formations.map(formationId => {
                              const formation = formations.find(f => f.id === formationId);
                              return (
                                <div key={formationId} className="text-sm mb-1">
                                  {formation?.title}
                                </div>
                              );
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'recherche' && (
          <div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Recherchez un Étudiant</h2>
              
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Adresse Wallet de l'étudiant
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                  placeholder="Entrez l'adresse wallet de l'étudiant"
                />
              </div>
              
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
              >
                Rechercher
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEtudiantsPage; 