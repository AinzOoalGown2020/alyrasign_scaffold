import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Layout from '../../../components/Layout';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

import { 
  initializeAllStorage, 
  submitAccessRequest, 
  approveAccessRequest, 
  rejectAccessRequest,
  getAccessRequests,
  createFormation,
  getFormations,
  createSession,
  getSessions,
  getProgram,
  findAccessStoragePDA,
  findAttendanceStoragePDA,
  initializeAttendanceStorage,
  recordAttendance,
  updateAttendance,
  getStudentAttendances,
  createAccessRequest
} from '../../../lib/solana';
import { PROGRAM_ID } from '../../../lib/idl/alyrasign';
import { SystemProgram } from '@solana/web3.js';

export default function BlockchainTestConsole() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Ajouter une fonction pour afficher la configuration
  useEffect(() => {
    if (connected && publicKey) {
      const showConfig = () => {
        setLogs(prevLogs => [
          ...prevLogs, 
          `[${new Date().toLocaleTimeString()}] Configuration actuelle:`,
          `[${new Date().toLocaleTimeString()}] - Wallet: ${publicKey.toString()}`,
          `[${new Date().toLocaleTimeString()}] - RPC URL: ${process.env.NEXT_PUBLIC_SOLANA_RPC_URL}`,
          `[${new Date().toLocaleTimeString()}] - Network: ${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`,
          `[${new Date().toLocaleTimeString()}] - Program ID: ${process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID}`,
          `[${new Date().toLocaleTimeString()}] - Use Blockchain: ${process.env.NEXT_PUBLIC_USE_BLOCKCHAIN}`
        ]);
      };
      
      showConfig();
    }
  }, [connected, publicKey]);

  // Liste des tests disponibles
  const tests = [
    {
      id: 'init-access-storage',
      name: 'Initialiser le stockage des demandes d\'accès',
      description: 'Crée le compte de stockage pour les demandes d\'accès',
      action: async () => {
        setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Initialisation du stockage des demandes d'accès...`]);
        
        try {
          // Ajout de logs de debug pour vérifier la configuration
          setLogs(prevLogs => [...prevLogs, 
            `[${new Date().toLocaleTimeString()}] Configuration blockchain:`,
            `[${new Date().toLocaleTimeString()}] USE_BLOCKCHAIN: ${process.env.NEXT_PUBLIC_USE_BLOCKCHAIN}`,
            `[${new Date().toLocaleTimeString()}] Type: ${typeof process.env.NEXT_PUBLIC_USE_BLOCKCHAIN}`
          ]);
          
          // Récupérer le programme Anchor
          const program = await getProgram(publicKey, connection);
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Programme obtenu: ${PROGRAM_ID.toString()}`]);
          
          // Trouver le PDA pour le stockage
          const [storagePda] = await findAccessStoragePDA();
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] PDA du stockage: ${storagePda.toString()}`]);
          
          // Appeler l'instruction d'initialisation avec les noms corrects
          await program.methods
            .initializeAccessStorage()
            .accounts({
              admin: publicKey,
              storage: storagePda,
              systemProgram: SystemProgram.programId
            })
            .rpc();
          
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ✅ Stockage des demandes d'accès initialisé avec succès!`]);
          return true;
        } catch (error: any) {
          console.error('Erreur lors de l\'initialisation du stockage:', error);
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ❌ Erreur: ${error.message}`]);
          if (error.logs) {
            error.logs.forEach((log: string) => {
              setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Log: ${log}`]);
            });
          }
          return false;
        }
      }
    },
    { id: 'create_access_request', name: 'Créer une demande d\'accès', description: 'Crée une nouvelle demande d\'accès pour le wallet connecté' },
    { id: 'get_access_requests', name: 'Lister les demandes d\'accès', description: 'Récupère toutes les demandes d\'accès' },
    { id: 'approve_access_request', name: 'Approuver une demande d\'accès', description: 'Approuve une demande d\'accès spécifiée' },
    { id: 'reject_access_request', name: 'Rejeter une demande d\'accès', description: 'Rejette une demande d\'accès spécifiée' },
    { id: 'create_formation', name: 'Créer une formation', description: 'Crée une nouvelle formation' },
    { id: 'get_formations', name: 'Lister les formations', description: 'Récupère toutes les formations' },
    { id: 'create_session', name: 'Créer une session', description: 'Crée une nouvelle session pour une formation' },
    { id: 'get_sessions', name: 'Lister les sessions', description: 'Récupère toutes les sessions' },
    {
      id: 'init-attendance-storage',
      name: 'Initialiser le stockage des présences',
      description: 'Crée le compte de stockage pour les présences',
      action: async () => {
        setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Initialisation du stockage des présences...`]);
        
        try {
          // Récupérer le programme Anchor
          const program = await getProgram(publicKey, connection);
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Programme obtenu: ${PROGRAM_ID.toString()}`]);
          
          // Trouver le PDA pour le stockage des présences
          const [storagePda] = await findAttendanceStoragePDA();
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] PDA du stockage des présences: ${storagePda.toString()}`]);
          
          // Appeler l'instruction d'initialisation
          await program.methods
            .initializeAttendanceStorage()
            .accounts({
              admin: publicKey,
              storage: storagePda,
              systemProgram: SystemProgram.programId
            })
            .rpc();
          
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ✅ Stockage des présences initialisé avec succès!`]);
          return true;
        } catch (error: any) {
          console.error('Erreur lors de l\'initialisation du stockage des présences:', error);
          setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ❌ Erreur: ${error.message}`]);
          if (error.logs) {
            error.logs.forEach((log: string) => {
              setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Log: ${log}`]);
            });
          }
          return false;
        }
      }
    },
    { id: 'record_attendance', name: 'Enregistrer une présence', description: 'Enregistre une présence pour une session' },
    { id: 'update_attendance', name: 'Mettre à jour une présence', description: 'Met à jour une présence existante' },
    { id: 'get_attendances', name: 'Lister les présences', description: 'Récupère toutes les présences d\'un étudiant' },
    { id: 'init_all_storage', name: 'Initialiser tous les stockages', description: 'Initialise tous les comptes de stockage en une fois' },
  ];

  // États pour les formulaires et les sélections
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    roleRequest: { role: 'student', message: 'Demande de test' },
    formation: { title: 'Formation test', description: 'Description de test' },
    session: { formationId: '', title: 'Session test', date: new Date().toISOString().split('T')[0], location: 'Paris' },
    attendance: { sessionId: '', isPresent: true, note: 'Présence enregistrée via console de test' }
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur
    const checkAdmin = async () => {
      if (connected && publicKey) {
        const adminAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET || '';
        const isAdmin = publicKey.toString() === adminAddress;
        setIsAdmin(isAdmin);
        setIsLoading(false);

        if (isAdmin) {
          // Charger les données initiales
          await loadInitialData();
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [connected, publicKey]);

  const loadInitialData = async () => {
    try {
      // Charger les demandes d'accès
      const requests = await getAccessRequests();
      setAccessRequests(requests);
      
      // Charger les formations
      const formations = await getFormations();
      setFormations(formations);
      
      // Charger les sessions
      const sessions = await getSessions();
      setSessions(sessions);
      
      // Sélectionner la première formation s'il y en a
      if (formations.length > 0) {
        setFormData(prev => ({
          ...prev,
          session: { ...prev.session, formationId: formations[0].id }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  };

  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleFormChange = (formType: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [field]: value
      }
    }));
  };

  const executeTest = async (testId: string) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    addLog(`Exécution du test: ${testId}`);

    try {
      const test = tests.find(test => test.id === testId);
      if (test?.action) {
        await test.action();
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'exécution du test:', error);
      addLog(`❌ Erreur: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Initialiser le stockage
  const handleInitializeStorage = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await initializeAllStorage(publicKey, connection);
      addLog('✅ Stockage initialisé avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation du stockage:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Créer une demande d'accès
  const handleCreateAccessRequest = async () => {
    if (!publicKey) return;
    
    try {
      await createAccessRequest(
        publicKey.toString(),
        formData.roleRequest.role,
        formData.roleRequest.message
      );
      addLog('✅ Demande d\'accès créée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande d\'accès:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Récupérer les demandes d'accès
  const handleGetAccessRequests = async () => {
    try {
      const requests = await getAccessRequests();
      setAccessRequests(requests);
      addLog(`✅ ${requests.length} demandes d'accès récupérées`);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes d\'accès:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Approuver une demande d'accès
  const handleApproveAccessRequest = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await approveAccessRequest(selectedRequestId, publicKey, connection);
      addLog('✅ Demande d\'accès approuvée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation de la demande d\'accès:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Rejeter une demande d'accès
  const handleRejectAccessRequest = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await rejectAccessRequest(selectedRequestId, publicKey, connection);
      addLog('✅ Demande d\'accès rejetée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors du rejet de la demande d\'accès:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Créer une formation
  const handleCreateFormation = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await createFormation(
        formData.formation.title,
        formData.formation.description,
        publicKey,
        connection
      );
      addLog('✅ Formation créée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la création de la formation:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Récupérer les formations
  const handleGetFormations = async () => {
    try {
      const formationsList = await getFormations();
      setFormations(formationsList);
      addLog(`✅ ${formationsList.length} formations récupérées`);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des formations:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Créer une session
  const handleCreateSession = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await createSession(
        formData.session.formationId,
        formData.session.title,
        formData.session.date,
        formData.session.location,
        publicKey,
        connection
      );
      addLog('✅ Session créée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la création de la session:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Récupérer les sessions
  const handleGetSessions = async () => {
    try {
      const sessionsList = await getSessions();
      setSessions(sessionsList);
      addLog(`✅ ${sessionsList.length} sessions récupérées`);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des sessions:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  // Nouvelles fonctions pour les tests liés aux présences
  
  const handleInitializeAllStorage = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await initializeAllStorage(publicKey, connection);
      addLog('✅ Tous les stockages ont été initialisés avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation des stockages:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };
  
  const handleRecordAttendance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await recordAttendance(
        formData.attendance.sessionId,
        formData.attendance.isPresent,
        formData.attendance.note,
        publicKey,
        connection
      );
      addLog('✅ Présence enregistrée avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la présence:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };
  
  const handleUpdateAttendance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      await updateAttendance(
        formData.attendance.sessionId,
        formData.attendance.isPresent,
        formData.attendance.note,
        publicKey,
        connection
      );
      addLog('✅ Présence mise à jour avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };
  
  const handleGetAttendances = async () => {
    if (!publicKey || !connection) return;
    
    try {
      const attendances = await getStudentAttendances(publicKey, publicKey, connection);
      addLog(`✅ ${attendances.length} présences récupérées`);
      attendances.forEach((attendance: any, index: number) => {
        addLog(`  ${index + 1}. Session: ${attendance.sessionId}, Présent: ${attendance.isPresent}`);
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des présences:', error);
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Console de Test Blockchain</h1>
          <p className="text-center text-gray-700">Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!connected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Console de Test Blockchain</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">Veuillez connecter votre portefeuille pour accéder à cette page.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Console de Test Blockchain</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">
              Cette page est réservée aux administrateurs.
            </p>
            <p className="text-center text-gray-700">
              Votre adresse: {publicKey?.toString()}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Console de Test Blockchain</h1>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/admin/blockchain')} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
              Retour
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tests disponibles</h2>
              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.id} className="border rounded p-3 hover:bg-gray-50">
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                    <Button
                      onClick={() => executeTest(test.id)}
                      disabled={isExecuting}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-sm py-1 px-3"
                    >
                      {isExecuting ? 'Exécution...' : 'Exécuter'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Formulaires de test</h2>
              
              {/* Formulaire pour demande d'accès */}
              <div className="mb-6 border-b pb-4">
                <h3 className="font-medium mb-2">Demande d'accès</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={formData.roleRequest.role}
                    onChange={(e) => handleFormChange('roleRequest', 'role', e.target.value)}
                  >
                    <option value="student">Étudiant</option>
                    <option value="trainer">Formateur</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.roleRequest.message}
                    onChange={(e) => handleFormChange('roleRequest', 'message', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Formulaire pour formation */}
              <div className="mb-6 border-b pb-4">
                <h3 className="font-medium mb-2">Formation</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.formation.title}
                    onChange={(e) => handleFormChange('formation', 'title', e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    value={formData.formation.description}
                    onChange={(e) => handleFormChange('formation', 'description', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Formulaire pour session */}
              <div>
                <h3 className="font-medium mb-2">Session</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formation</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={formData.session.formationId}
                    onChange={(e) => handleFormChange('session', 'formationId', e.target.value)}
                  >
                    {formations.length === 0 && (
                      <option value="">Aucune formation disponible</option>
                    )}
                    {formations.map(formation => (
                      <option key={formation.id} value={formation.id}>
                        {formation.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.session.title}
                    onChange={(e) => handleFormChange('session', 'title', e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date"
                    className="w-full p-2 border rounded"
                    value={formData.session.date}
                    onChange={(e) => handleFormChange('session', 'date', e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.session.location}
                    onChange={(e) => handleFormChange('session', 'location', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {accessRequests.length > 0 && (
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Demandes en cours</h2>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner une demande</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                  >
                    {accessRequests.map(req => (
                      <option key={req.id} value={req.id}>
                        {req.requester.substring(0, 8)}... - {req.role} ({req.status})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => executeTest('approve_access_request')}
                    disabled={isExecuting}
                    className="bg-green-600 text-white hover:bg-green-700 text-sm py-1 px-3"
                  >
                    Approuver
                  </Button>
                  <Button
                    onClick={() => executeTest('reject_access_request')}
                    disabled={isExecuting}
                    className="bg-red-600 text-white hover:bg-red-700 text-sm py-1 px-3"
                  >
                    Rejeter
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Console de logs</h2>
                <Button 
                  onClick={clearLogs}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  Effacer les logs
                </Button>
              </div>
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Exécutez un test pour voir les logs...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 mt-6 border-l-4 border-yellow-500">
              <h2 className="text-lg font-semibold mb-3 text-yellow-800">Note importante</h2>
              <p className="text-gray-700">
                Cette console est {process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true' ? 'configurée pour utiliser la blockchain' : 'actuellement en mode démonstration et simule les interactions blockchain avec localStorage'}.
                <br /><br />
                Valeur actuelle de NEXT_PUBLIC_USE_BLOCKCHAIN: <code>{process.env.NEXT_PUBLIC_USE_BLOCKCHAIN}</code>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 