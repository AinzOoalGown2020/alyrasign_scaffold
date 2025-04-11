import { FC, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { recordAttendance, getStudentAttendances } from '../../lib/solana';
import { toast } from 'react-toastify';

interface Session {
  id: string;
  formationId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  attended?: boolean;
}

interface Formation {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  sessions: Session[];
}

interface Attendance {
  sessionId: string;
}

const EtudiantPortalPage: FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [isSigningAttendance, setIsSigningAttendance] = useState<boolean>(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState<boolean>(false);
  
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  
  const loadAttendances = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      const attendances = await getStudentAttendances(wallet.publicKey, wallet, connection);
      setAttendances(attendances);
      
      // Mettre à jour le statut de présence dans les sessions
      if (attendances.length > 0) {
        setFormations(prevFormations => {
          return prevFormations.map(formation => {
            const updatedSessions = formation.sessions.map(session => {
              const attendance = attendances.find((a: Attendance) => a.sessionId === session.id);
              if (attendance) {
                return {
                  ...session,
                  attended: attendance.isPresent
                };
              }
              return session;
            });
            
            return {
              ...formation,
              sessions: updatedSessions
            };
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error);
      toast.error('Une erreur est survenue lors du chargement de vos présences.');
    }
  }, [wallet, connection]);
  
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      loadStudentData();
      loadAttendances();
    } else {
      router.push('/');
    }
  }, [wallet.connected, wallet.publicKey, router, loadAttendances]);
  
  const loadStudentData = () => {
    // Simuler le chargement des formations de l'étudiant depuis la blockchain
    const now = new Date();
    
    const mockFormations: Formation[] = [
      {
        id: '1',
        title: 'Développement Blockchain Avancé',
        description: 'Apprenez les techniques avancées de développement blockchain sur Solana',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        sessions: [
          {
            id: '1',
            formationId: '1',
            title: 'Introduction à Solana',
            date: new Date('2023-09-05'),
            startTime: '09:00',
            endTime: '12:30',
            attended: true
          },
          {
            id: '2',
            formationId: '1',
            title: 'Smart Contracts avec Rust',
            date: new Date('2023-09-12'),
            startTime: '09:00',
            endTime: '12:30',
            attended: true
          },
          {
            id: '3',
            formationId: '1',
            title: 'Développement d\'applications décentralisées',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), // 5 jours dans le futur
            startTime: '09:00',
            endTime: '12:30'
          }
        ]
      },
      {
        id: '2',
        title: 'Smart Contracts Solana',
        description: 'Création et déploiement de smart contracts sur Solana',
        startDate: new Date('2023-10-05'),
        endDate: new Date('2024-01-20'),
        sessions: [
          {
            id: '4',
            formationId: '2',
            title: 'Concepts de base des smart contracts',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2), // 2 jours dans le futur
            startTime: '14:00',
            endTime: '17:30'
          }
        ]
      }
    ];
    
    setFormations(mockFormations);
    
    // Trouver la prochaine session
    const allSessions = mockFormations.flatMap(f => f.sessions);
    const futureSessions = allSessions.filter(s => s.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (futureSessions.length > 0) {
      setNextSession(futureSessions[0]);
    }
  };
  
  const handleSignAttendance = async () => {
    if (!nextSession) return;
    
    try {
      setIsSigningAttendance(true);
      
      // S'assurer que l'ID de session est sous forme numérique
      // Cela correspond à la structure attendue par le smart contract Solana
      const sessionIdNumber = nextSession.id;
      
      const result = await recordAttendance(
        sessionIdNumber, 
        true, 
        'Présence enregistrée via l\'application',
        wallet,
        connection
      );
      
      if (result) {
        toast.success('Votre présence a été enregistrée avec succès !');
        
        // Mettre à jour l'UI pour montrer que la présence a été enregistrée
        setNextSession(prev => {
          if (!prev) return null;
          return { ...prev, attended: true };
        });
        
        // Recharger l'historique des présences
        loadAttendances();
      } else {
        toast.error('Une erreur est survenue lors de l\'enregistrement de votre présence.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la présence:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement de votre présence.');
    } finally {
      setIsSigningAttendance(false);
    }
  };
  
  if (!wallet.connected) {
    return null;
  }
  
  return (
    <div>
      <Head>
        <title>Portail Étudiant | AlyraSign</title>
        <meta name="description" content="Portail étudiant AlyraSign" />
      </Head>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Portail Étudiant</h1>
        
        {nextSession && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-8 border border-blue-700">
            <h2 className="text-xl font-semibold text-white mb-2">Prochaine Session</h2>
            <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-blue-300">{nextSession.title}</h3>
              <p className="text-white">
                <span className="text-gray-300">Formation: </span>
                {formations.find(f => f.id === nextSession.formationId)?.title}
              </p>
              <div className="mt-3 flex items-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {nextSession.date.toLocaleDateString()}
              </div>
              <div className="mt-1 flex items-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {nextSession.startTime} - {nextSession.endTime}
              </div>
            </div>
            <button 
              onClick={handleSignAttendance}
              disabled={isSigningAttendance || (nextSession?.attended === true)}
              className={`w-full py-3 ${
                nextSession?.attended 
                  ? 'bg-green-600 cursor-not-allowed' 
                  : isSigningAttendance 
                    ? 'bg-gray-600 cursor-wait' 
                    : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-semibold rounded-md transition-colors`}
            >
              {nextSession?.attended 
                ? 'Présence déjà signée' 
                : isSigningAttendance 
                  ? 'Enregistrement en cours...' 
                  : 'Signer ma présence'}
            </button>
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Mes Formations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formations.map(formation => (
              <div key={formation.id} className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{formation.title}</h3>
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
                      Sessions: {formation.sessions.length}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
                  <button
                    onClick={() => router.push(`/etudiants/formations/${formation.id}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
                  >
                    Voir les sessions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Historique des Présences
            {isLoadingAttendances && (
              <span className="ml-2 inline-block text-sm text-gray-400">(Chargement...)</span>
            )}
          </h2>
          
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-white">Formation</th>
                  <th className="px-4 py-3 text-left text-white">Session</th>
                  <th className="px-4 py-3 text-left text-white">Date</th>
                  <th className="px-4 py-3 text-left text-white">Horaire</th>
                  <th className="px-4 py-3 text-left text-white">Présence</th>
                </tr>
              </thead>
              <tbody>
                {formations.flatMap(formation => 
                  formation.sessions.map(session => {
                    // Trouver l'enregistrement de présence correspondant
                    const sessionAttendance = attendances.find((a: Attendance) => a.sessionId === session.id);
                    
                    return (
                      <tr key={session.id} className="border-t border-gray-700">
                        <td className="px-4 py-3 text-gray-300">{formation.title}</td>
                        <td className="px-4 py-3 text-gray-300">{session.title}</td>
                        <td className="px-4 py-3 text-gray-300">{session.date.toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-300">{session.startTime} - {session.endTime}</td>
                        <td className="px-4 py-3">
                          {session.date < new Date() ? (
                            sessionAttendance || session.attended ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                                Présent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                                Absent
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                              À venir
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtudiantPortalPage; 