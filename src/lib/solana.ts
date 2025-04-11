import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { IDL, PROGRAM_ID } from './idl/alyrasign';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';

// Définir le type pour le programme AlyraSign
export type AlyraSignProgram = Program<any>;

// Types pour les PDAs
export type PDAResult = [PublicKey, number];

// Types pour les comptes
export interface AttendanceAccount {
  id: string;
  sessionId: string;
  student: PublicKey;
  isPresent: boolean;
  checkInTime: number;
  checkOutTime: number | null;
  note: string;
  createdAt: number;
  updatedAt: number;
}

interface AttendanceData {
  id: string;
  sessionId: string;
  student: string;
  isPresent: boolean;
  checkInTime: number;
  checkOutTime: number | null;
  note: string;
  createdAt: number;
  updatedAt: number;
}

interface AttendanceResult {
  id: string;
  sessionId: string;
  student: string;
  isPresent: boolean;
  checkInTime: number;
  checkOutTime: number | null;
  note: string;
  createdAt: number;
  updatedAt: number;
}

// Types pour les demandes d'accès
export interface RequestData {
  walletAddress: string;
  requestedRole: string;
  message: string;
  status: string;
  processedAt?: string;
}

// Récupérer les seeds depuis .env.local
export const ACCESS_STORAGE_SEED = process.env.NEXT_PUBLIC_ACCESS_STORAGE_SEED || "access-storage";
export const FORMATION_STORAGE_SEED = process.env.NEXT_PUBLIC_FORMATION_STORAGE_SEED || "formation-storage";
export const SESSION_STORAGE_SEED = process.env.NEXT_PUBLIC_SESSION_STORAGE_SEED || "session-storage";
export const ATTENDANCE_STORAGE_SEED = process.env.NEXT_PUBLIC_ATTENDANCE_STORAGE_SEED || "attendance-storage";
export const REQUEST_SEED = process.env.NEXT_PUBLIC_REQUEST_SEED || "request";
export const FORMATION_SEED = process.env.NEXT_PUBLIC_FORMATION_SEED || "formation";
export const SESSION_SEED = process.env.NEXT_PUBLIC_SESSION_SEED || "session";
export const ATTENDANCE_SEED = process.env.NEXT_PUBLIC_ATTENDANCE_SEED || "attendance";

// Configuration des tailles maximales depuis .env.local
export const MAX_ROLE_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_ROLE_LENGTH || "20");
export const MAX_MESSAGE_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGE_LENGTH || "100");
export const MAX_TITLE_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_TITLE_LENGTH || "100");
export const MAX_DESCRIPTION_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_DESCRIPTION_LENGTH || "500");
export const MAX_LOCATION_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_LOCATION_LENGTH || "100");

// Configuration des timeouts et limites
export const TX_TIMEOUT_MS = parseInt(process.env.NEXT_PUBLIC_TX_TIMEOUT_MS || "30000");
export const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || "3");
export const RETRY_DELAY_MS = parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY_MS || "2000");

// Messages personnalisables
export const SUCCESS_ATTENDANCE_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ATTENDANCE_MESSAGE || "Présence enregistrée avec succès";
export const ERROR_ATTENDANCE_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ATTENDANCE_MESSAGE || "Erreur lors de l'enregistrement de la présence";
export const SUCCESS_ATTENDANCE_UPDATE_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ATTENDANCE_UPDATE_MESSAGE || "Présence mise à jour avec succès";
export const ERROR_ATTENDANCE_UPDATE_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ATTENDANCE_UPDATE_MESSAGE || "Erreur lors de la mise à jour de la présence";
export const SUCCESS_ATTENDANCE_LIST_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ATTENDANCE_LIST_MESSAGE || "Liste des présences récupérée avec succès";
export const ERROR_ATTENDANCE_LIST_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ATTENDANCE_LIST_MESSAGE || "Erreur lors de la récupération des présences";

// Messages d'administration
export const SUCCESS_ADMIN_INITIALIZATION_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ADMIN_INITIALIZATION_MESSAGE || "Initialisation réussie";
export const ERROR_ADMIN_INITIALIZATION_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ADMIN_INITIALIZATION_MESSAGE || "Erreur lors de l'initialisation";
export const SUCCESS_ADMIN_APPROVAL_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ADMIN_APPROVAL_MESSAGE || "Demande approuvée avec succès";
export const ERROR_ADMIN_APPROVAL_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ADMIN_APPROVAL_MESSAGE || "Erreur lors de l'approbation de la demande";
export const SUCCESS_ADMIN_REJECT_MESSAGE = process.env.NEXT_PUBLIC_SUCCESS_ADMIN_REJECT_MESSAGE || "Demande rejetée avec succès";
export const ERROR_ADMIN_REJECT_MESSAGE = process.env.NEXT_PUBLIC_ERROR_ADMIN_REJECT_MESSAGE || "Erreur lors du rejet de la demande";

// Variable pour contrôler l'utilisation de la blockchain
const USE_BLOCKCHAIN = process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true';

// Types d'erreurs possibles
export const ErrorTypes = {
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  ALREADY_INITIALIZED: 'ALREADY_INITIALIZED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
};

/**
 * Obtenir le provider Anchor avec le wallet actuel
 */
export const getProvider = (wallet: any, connection: any): AnchorProvider => {
  if (!wallet) {
    throw new Error("Wallet not connected");
  }

  return new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: 'processed' }
  );
};

/**
 * Estime les frais de transaction
 */
export const estimateTransactionFees = async (connection: Connection): Promise<number> => {
  try {
    const recentPrioritizationFees = await connection.getRecentPrioritizationFees();
    if (recentPrioritizationFees.length === 0) {
      return 0.000005; // Frais par défaut en SOL
    }
    // Utiliser la première entrée pour obtenir les frais
    return recentPrioritizationFees[0].prioritizationFee / 1e9; // Convertir en SOL
  } catch (error) {
    console.error("Erreur lors de l'estimation des frais:", error);
    return 0.000005; // Frais par défaut en SOL
  }
};

/**
 * Fonction utilitaire pour obtenir le programme avec estimation des frais
 */
export const getProgram = async (wallet: AnchorWallet, connection: Connection): Promise<AlyraSignProgram | null> => {
  try {
    console.log("getProgram appelé avec:", { 
      wallet: wallet ? "disponible" : "non disponible",
      connection: connection ? "disponible" : "non disponible",
      publicKey: wallet?.publicKey?.toString(),
      programId: PROGRAM_ID.toString()
    });
    
    if (!wallet || !connection) {
      console.warn("Wallet ou connexion non disponible, utilisation du mode simulation");
      return null;
    }
    
    // Vérifier si le wallet est connecté
    if (!wallet.publicKey) {
      console.warn("Wallet connecté mais pas de clé publique disponible");
      return null;
    }
    
    // Estimer les frais de transaction
    const fees = await estimateTransactionFees(connection);
    console.log("Frais de transaction estimés:", fees, "SOL");
    
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'processed', preflightCommitment: 'processed' }
    );
    anchor.setProvider(provider);
    
    // TODO: Les erreurs de typage sont liées à la version d'Anchor et seront résolues dans une future mise à jour
    // @ts-ignore - Ignorer temporairement les erreurs de typage d'Anchor
    const program = new Program(IDL, PROGRAM_ID, provider) as AlyraSignProgram;
    console.log("Programme créé avec succès");
    return program;
  } catch (error) {
    console.error("Erreur dans getProgram:", error);
    return null;
  }
};

// Fonction pour trouver le PDA du stockage
export const findAccessStoragePDA = async () => {
  return await PublicKey.findProgramAddress(
    [Buffer.from('access_storage')],
    PROGRAM_ID
  );
};

// Fonction pour trouver le PDA d'une demande d'accès
const findAccessRequestPDA = async (storagePDA: PublicKey, index: number) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('access_request'),
      storagePDA.toBuffer(),
      Buffer.from(index.toString())
    ],
    PROGRAM_ID
  );
};

/**
 * Trouve l'adresse PDA pour le stockage des formations
 */
export const findFormationStoragePDA = async (): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FORMATION_STORAGE_SEED)],
    PROGRAM_ID
  );
};

/**
 * Trouve l'adresse PDA pour le stockage des sessions
 */
export const findSessionStoragePDA = async (): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SESSION_STORAGE_SEED)],
    PROGRAM_ID
  );
};

// Types pour les demandes d'accès
export interface AccessRequest {
  id: string;
  walletAddress: string;
  requestedRole: 'etudiant' | 'formateur';
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Fonction pour récupérer les demandes d'accès
export const getAccessRequests = async (
  wallet: AnchorWallet,
  connection: Connection,
  walletAddress?: string
): Promise<AccessRequest[]> => {
  try {
    console.log("getAccessRequests appelé", { 
      walletAddress,
      useBlockchain: USE_BLOCKCHAIN,
      walletConnected: wallet?.publicKey?.toString()
    });
    
    if (!USE_BLOCKCHAIN) {
      console.log("Mode simulation activé - Utilisation du localStorage");
      const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
      const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
      
      const pendingRequests = pendingRequestsJson ? JSON.parse(pendingRequestsJson) : [];
      const processedRequests = processedRequestsJson ? JSON.parse(processedRequestsJson) : {};
      
      let allRequests = [...pendingRequests];
      if (processedRequests) {
        allRequests = allRequests.concat(Object.values(processedRequests));
      }
      
      if (walletAddress) {
        return allRequests.filter(r => r.walletAddress === walletAddress);
      }
      
      return allRequests;
    }

    const program = await getProgram(wallet, connection);
    
    if (!program) {
      console.warn("Programme non disponible, vérifiez la connexion du wallet et la connexion à Solana");
      return [];
    }

    // Récupérer le PDA du stockage
    const [storagePDA] = await findAccessStoragePDA();
    console.log("Storage PDA trouvé:", storagePDA.toString());
    
    // Récupérer le compte de stockage pour obtenir le compteur
    const storageAccount = await (program.account as any).accessRequestStorage.fetch(storagePDA);
    console.log("Compte de stockage trouvé:", storageAccount);
    
    // Si une adresse spécifique est fournie
    if (walletAddress) {
      try {
        const publicKey = new PublicKey(walletAddress);
        
        // Parcourir tous les indices possibles jusqu'à ce qu'on trouve la demande
        for (let i = 0; i < storageAccount.requestCount; i++) {
          try {
            const [requestPDA] = await PublicKey.findProgramAddress(
              [
                Buffer.from(REQUEST_SEED),
                publicKey.toBuffer(),
                new BN(i).toArrayLike(Buffer, 'le', 8)
              ],
              PROGRAM_ID
            );
            
            console.log("Recherche de demande pour l'adresse:", walletAddress, "index:", i);
            
            try {
              const requestAccount = await (program.account as any).accessRequest.fetch(requestPDA);
              console.log("Compte de demande trouvé:", requestAccount);
              
              if (requestAccount && requestAccount.requester.toString() === walletAddress) {
                return [{
                  id: requestPDA.toString(),
                  walletAddress: requestAccount.requester.toString(),
                  requestedRole: requestAccount.role as 'etudiant' | 'formateur',
                  message: requestAccount.message,
                  timestamp: new Date(requestAccount.createdAt.toNumber() * 1000).toISOString(),
                  status: requestAccount.status as 'pending' | 'approved' | 'rejected'
                }];
              }
            } catch (error) {
              console.log("Pas de demande à l'index", i);
            }
          } catch (error) {
            console.log("Erreur lors de la recherche du PDA pour l'index", i);
          }
        }
        console.log("Aucune demande trouvée pour cette adresse");
        return [];
      } catch (error) {
        console.log("Erreur lors de la recherche de demande:", error);
        return [];
      }
    }
    
    // Si aucune adresse n'est fournie, récupérer toutes les demandes
    const requests: AccessRequest[] = [];
    
    // Parcourir tous les indices possibles
    for (let i = 0; i < storageAccount.requestCount; i++) {
      try {
        const [requestPDA] = await PublicKey.findProgramAddress(
          [
            Buffer.from(REQUEST_SEED),
            storagePDA.toBuffer(),
            new BN(i).toArrayLike(Buffer, 'le', 8)
          ],
          PROGRAM_ID
        );
        
        try {
          const requestAccount = await (program.account as any).accessRequest.fetch(requestPDA);
          
          requests.push({
            id: requestPDA.toString(),
            walletAddress: requestAccount.requester.toString(),
            requestedRole: requestAccount.role as 'etudiant' | 'formateur',
            message: requestAccount.message,
            timestamp: new Date(requestAccount.createdAt.toNumber() * 1000).toISOString(),
            status: requestAccount.status as 'pending' | 'approved' | 'rejected'
          });
        } catch (error) {
          console.log("Pas de demande à l'index", i);
        }
      } catch (error) {
        console.log("Erreur lors de la recherche du PDA pour l'index", i);
      }
    }
    
    return requests;
  } catch (error) {
    console.error("Erreur dans getAccessRequests:", error);
    return [];
  }
};

/**
 * Calcule l'adresse PDA pour une formation
 */
export const calculateFormationPDA = async (formationId: string): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FORMATION_SEED), Buffer.from(formationId)],
    PROGRAM_ID
  );
};

/**
 * Calcule l'adresse PDA pour une session
 */
export const calculateSessionPDA = async (sessionId: string): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SESSION_SEED), Buffer.from(sessionId)],
    PROGRAM_ID
  );
};

/**
 * Fonction pour créer une formation avec intégration blockchain
 */
export const createFormation = async (title: string, description: string, wallet: any, connection: any) => {
  try {
    if (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true') {
      const program = await getProgram(wallet, connection) as AlyraSignProgram;
      
      if (!wallet) {
        throw new Error("Wallet not connected");
      }
      
      const [storagePda] = await findFormationStoragePDA();
      const formationId = Date.now().toString();
      const [formationPda] = await calculateFormationPDA(formationId);
      
      await (program.methods
        .upsertFormation(
          formationId,
          title,
          description
        ) as any)
        .accounts({
          signer: wallet.publicKey,
          formationStorage: storagePda,
          formation: formationPda,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .rpc();
      
      return true;
    } else {
      // Version simulation (localStorage)
      const formationsJson = localStorage.getItem('alyraSign_formations');
      const formations = formationsJson ? JSON.parse(formationsJson) : [];
      
      const newFormation = {
        id: Date.now().toString(),
        title,
        description,
        createdAt: Date.now()
      };
      
      formations.push(newFormation);
      localStorage.setItem('alyraSign_formations', JSON.stringify(formations));
      
      return true;
    }
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la formation:', error);
    if (error instanceof Error) {
      toast.error('Erreur lors de la création de la formation: ' + error.message);
    }
    return false;
  }
};

/**
 * Fonction pour créer une session avec intégration blockchain
 */
export const createSession = async (formationId: string, title: string, date: string, location: string, wallet: any, connection: any) => {
  try {
    if (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true') {
      const program = await getProgram(wallet, connection) as AlyraSignProgram;
      
      if (!wallet) {
        throw new Error("Wallet not connected");
      }
      
      const [storagePda] = await findSessionStoragePDA();
      const startDate = Math.floor(new Date(date).getTime() / 1000);
      const endDate = startDate + 2 * 60 * 60;
      const sessionId = Date.now().toString();
      const [sessionPda] = await calculateSessionPDA(sessionId);
      
      await (program.methods
        .createSession(
          sessionId,
          formationId,
          new anchor.BN(startDate),
          new anchor.BN(endDate),
          location
        ) as any)
        .accounts({
          signer: wallet.publicKey,
          sessionStorage: storagePda,
          session: sessionPda,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .rpc();
      
      return true;
    } else {
      // Version simulation (localStorage)
      // Récupérer les sessions depuis le localStorage
      const sessionsJson = localStorage.getItem('alyraSign_sessions');
      const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      
      // Créer une nouvelle session
      const newSession = {
        id: Date.now().toString(),
        formationId,
        title,
        date,
        location,
        createdAt: Date.now()
      };
      
      // Ajouter la nouvelle session à la liste
      sessions.push(newSession);
      
      // Enregistrer les modifications
      localStorage.setItem('alyraSign_sessions', JSON.stringify(sessions));
      
      return true;
    }
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la session:', error);
    if (error instanceof Error) {
      toast.error('Erreur lors de la création de la session: ' + error.message);
    }
    return false;
  }
};

/**
 * Fonction pour récupérer les formations
 */
export const getFormations = async () => {
  try {
    if (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true') {
      // Version blockchain - à implémenter avec des filtres de compte
      // Récupérer les formations depuis le programme
      
      // Exemple simplifié pour le moment
      const formationsJson = localStorage.getItem('alyraSign_formations');
      
      if (!formationsJson) return [];
      
      return JSON.parse(formationsJson);
    } else {
      // Version simulation (localStorage)
      // Récupérer les formations depuis le localStorage
      const formationsJson = localStorage.getItem('alyraSign_formations');
      
      if (!formationsJson) return [];
      
      return JSON.parse(formationsJson);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return [];
  }
};

/**
 * Fonction pour récupérer les sessions
 */
export const getSessions = async () => {
  try {
    if (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true') {
      // Version blockchain - à implémenter avec des filtres de compte
      // Récupérer les sessions depuis le programme
      
      // Exemple simplifié pour le moment
      const sessionsJson = localStorage.getItem('alyraSign_sessions');
      
      if (!sessionsJson) return [];
      
      return JSON.parse(sessionsJson);
    } else {
      // Version simulation (localStorage)
      // Récupérer les sessions depuis le localStorage
      const sessionsJson = localStorage.getItem('alyraSign_sessions');
      
      if (!sessionsJson) return [];
      
      return JSON.parse(sessionsJson);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return [];
  }
};

/**
 * Crée une demande d'accès
 */
export const createAccessRequest = async (
  wallet: AnchorWallet,
  connection: Connection,
  requestedRole: string,
  message: string
): Promise<boolean> => {
  try {
    if (!USE_BLOCKCHAIN) {
      // Mode simulation
      const requests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        walletAddress: wallet.publicKey.toString(),
        requestedRole,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      requests.push(newRequest);
      localStorage.setItem('accessRequests', JSON.stringify(requests));
      return true;
    }

    const program = await getProgram(wallet, connection);
    if (!program) {
      throw new Error("Programme non disponible");
    }

    // Estimer les frais avant la transaction
    const fees = await estimateTransactionFees(connection);
    console.log("Frais estimés pour la demande d'accès:", fees, "SOL");

    const [storagePDA] = await findAccessStoragePDA();
    const [requestPDA] = await findAccessRequestPDA(storagePDA, 0);

    await (program.methods as any)
      .createAccessRequest(requestedRole, message)
      .accounts({
        storage: storagePDA,
        request: requestPDA,
        requester: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    toast.success(`Demande d'accès créée avec succès! Frais: ${fees} SOL`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la demande d'accès:", error);
    toast.error("Erreur lors de la création de la demande d'accès");
    return false;
  }
};

/**
 * Calcule l'adresse PDA pour une demande d'accès
 */
export const calculateRequestPDA = async (walletAddress: PublicKey): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(REQUEST_SEED), walletAddress.toBuffer()],
    PROGRAM_ID
  );
};

/**
 * Fonction pour approuver une demande d'accès
 */
export const approveAccessRequest = async (requestId: string, wallet: any, connection: Connection): Promise<boolean> => {
  try {
    console.log("approveAccessRequest appelé avec:", { requestId, walletConnected: !!wallet });
    
    // Version simulation (localStorage)
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    
    if (!pendingRequestsJson || !processedRequestsJson) {
      throw new Error("Données non disponibles");
    }
    
    const pendingRequests = JSON.parse(pendingRequestsJson);
    const processedRequests = JSON.parse(processedRequestsJson);
    
    console.log("Demandes en attente avant traitement:", pendingRequests);
    console.log("Demandes traitées avant traitement:", processedRequests);
    
    // Trouver la demande à approuver
    const requestIndex = pendingRequests.findIndex((req: any) => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error("Demande non trouvée");
    }
    
    const request = pendingRequests[requestIndex];
    console.log("Demande à approuver:", request);
    
    // Mettre à jour le statut
    request.status = 'approved';
    request.processedAt = new Date().toISOString();
    
    // Déplacer la demande vers les demandes traitées
    processedRequests[requestId] = request;
    pendingRequests.splice(requestIndex, 1);
    
    console.log("Demandes en attente après traitement:", pendingRequests);
    console.log("Demandes traitées après traitement:", processedRequests);
    
    // Sauvegarder les modifications
    localStorage.setItem('alyraSign_pendingRequests', JSON.stringify(pendingRequests));
    localStorage.setItem('alyraSign_processedRequests', JSON.stringify(processedRequests));
    
    // Stocker l'information de reconnexion pour prévenir les boucles infinies
    localStorage.setItem('alyraSign_lastConnectedRole', request.requestedRole);
    localStorage.setItem('alyraSign_lastConnectedWallet', request.walletAddress);
    localStorage.setItem('alyraSign_onDashboard', 'false');
    
    console.log("Informations de reconnexion stockées:", {
      role: request.requestedRole,
      wallet: request.walletAddress,
      onDashboard: false
    });
  
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'approbation de la demande:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Une erreur est survenue lors de l\'approbation');
    }
    return false;
  }
};

/**
 * Fonction pour rejeter une demande d'accès
 */
export const rejectAccessRequest = async (requestId: string, wallet: any, connection: Connection): Promise<boolean> => {
  try {
    console.log("rejectAccessRequest appelé avec:", { requestId, walletConnected: !!wallet });
    
    // Version simulation (localStorage)
    const pendingRequestsJson = localStorage.getItem('alyraSign_pendingRequests');
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    
    if (!pendingRequestsJson || !processedRequestsJson) {
      throw new Error("Données non disponibles");
    }
    
    const pendingRequests = JSON.parse(pendingRequestsJson);
    const processedRequests = JSON.parse(processedRequestsJson);
    
    // Trouver la demande à rejeter
    const requestIndex = pendingRequests.findIndex((req: any) => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error("Demande non trouvée");
    }
    
    const request = pendingRequests[requestIndex];
    
    // Mettre à jour le statut
    request.status = 'rejected';
    request.processedAt = new Date().toISOString();
    
    // Déplacer la demande vers les demandes traitées
    processedRequests[requestId] = request;
    pendingRequests.splice(requestIndex, 1);
    
    // Sauvegarder les modifications
    localStorage.setItem('alyraSign_pendingRequests', JSON.stringify(pendingRequests));
    localStorage.setItem('alyraSign_processedRequests', JSON.stringify(processedRequests));
    
    console.log("Demande rejetée avec succès:", request);
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors du rejet de la demande:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Une erreur est survenue lors du rejet');
    }
    return false;
  }
};

/**
 * Révoque les droits d'accès d'un utilisateur
 */
export const revokeAccess = async (requestId: string, wallet: any, connection: Connection): Promise<boolean> => {
  try {
    console.log('Révocation des droits pour la demande:', requestId);
    
    // Version simulation (localStorage)
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    
    if (!processedRequestsJson) {
      throw new Error("Données non disponibles");
    }
    
    const processedRequests = JSON.parse(processedRequestsJson);
    
    // Trouver la demande à révoquer
    const request = processedRequests[requestId];
    if (!request) {
      console.error('Demande non trouvée:', requestId);
      return false;
    }
    
    // Mettre à jour le statut de la demande
    request.status = 'rejected';
    request.processedAt = new Date().toISOString();
    
    // Sauvegarder les modifications
    localStorage.setItem('alyraSign_processedRequests', JSON.stringify(processedRequests));
    
    // Si c'était le dernier rôle connu, le supprimer
    const lastConnectedWallet = localStorage.getItem('alyraSign_lastConnectedWallet');
    if (lastConnectedWallet === request.walletAddress) {
      localStorage.removeItem('alyraSign_lastConnectedRole');
      localStorage.removeItem('alyraSign_lastConnectedWallet');
      localStorage.removeItem('alyraSign_onDashboard');
    }
    
    console.log('Droits révoqués avec succès pour la demande:', requestId);
    return true;
  } catch (error) {
    console.error('Erreur lors de la révocation des droits:', error);
    return false;
  }
};

/**
 * Initialise le compte de stockage des demandes d'accès
 */
export const initializeAccessStorage = async (wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findAccessStoragePDA();
    
    await (program.methods
      .initializeAccessStorage() as any)
      .accounts({
        admin: wallet.publicKey,
        accessStorage: storagePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'initialisation du stockage des accès:', error);
    return false;
  }
};

/**
 * Initialise le compte de stockage des formations
 */
export const initializeFormationStorage = async (wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findFormationStoragePDA();
    
    await (program.methods
      .initializeFormationStorage() as any)
      .accounts({
        admin: wallet.publicKey,
        formationStorage: storagePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'initialisation du stockage des formations:', error);
    return false;
  }
};

/**
 * Initialise le compte de stockage des sessions
 */
export const initializeSessionStorage = async (wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findSessionStoragePDA();
    
    await (program.methods
      .initializeSessionStorage() as any)
      .accounts({
        admin: wallet.publicKey,
        sessionStorage: storagePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'initialisation du stockage des sessions:', error);
    return false;
  }
};

/**
 * Trouve l'adresse PDA pour le stockage des présences
 */
export const findAttendanceStoragePDA = async (): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ATTENDANCE_STORAGE_SEED)],
    PROGRAM_ID
  );
};

/**
 * Calcule l'adresse PDA pour une présence
 */
export const calculateAttendancePDA = async (studentPubkey: PublicKey, sessionId: string): Promise<PDAResult> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ATTENDANCE_SEED), studentPubkey.toBuffer(), Buffer.from(sessionId)],
    PROGRAM_ID
  );
};

/**
 * Initialise le compte de stockage des présences
 */
export const initializeAttendanceStorage = async (wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findAttendanceStoragePDA();
    
    await (program.methods
      .initializeAttendanceStorage() as any)
      .accounts({
        admin: wallet.publicKey,
        attendanceStorage: storagePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'initialisation du stockage des présences:', error);
    return false;
  }
};

/**
 * Enregistre une présence (check-in)
 */
export const recordAttendance = async (sessionId: string, isPresent: boolean, note: string = "", wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findAttendanceStoragePDA();
    const [attendancePda] = await calculateAttendancePDA(wallet.publicKey, sessionId);
    
    await (program.methods
      .recordAttendance(
        sessionId,
        isPresent,
        note
      ) as any)
      .accounts({
        student: wallet.publicKey,
        attendanceStorage: storagePda,
        attendance: attendancePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'enregistrement de la présence:', error);
    return false;
  }
};

/**
 * Met à jour une présence (check-out)
 */
export const updateAttendance = async (sessionId: string, isPresent: boolean, note: string = "", wallet: any, connection: any) => {
  try {
    const program = await getProgram(wallet, connection) as AlyraSignProgram;
    
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    const [storagePda] = await findAttendanceStoragePDA();
    const [attendancePda] = await calculateAttendancePDA(wallet.publicKey, sessionId);
    
    await (program.methods
      .updateAttendance(isPresent, note) as any)
      .accounts({
        student: wallet.publicKey,
        attendanceStorage: storagePda,
        attendance: attendancePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    return false;
  }
};

// Mise à jour de la fonction initializeAllStorage pour inclure l'initialisation des présences
export const initializeAllStorage = async (wallet: any, connection: any) => {
  try {
    const accessStorage = await initializeAccessStorage(wallet, connection);
    const formationStorage = await initializeFormationStorage(wallet, connection);
    const sessionStorage = await initializeSessionStorage(wallet, connection);
    const attendanceStorage = await initializeAttendanceStorage(wallet, connection);
    
    return accessStorage && formationStorage && sessionStorage && attendanceStorage;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des comptes de stockage:', error);
    toast.error('Erreur lors de l\'initialisation des comptes de stockage');
    return false;
  }
};

// Alias pour submitAccessRequest vers createAccessRequest
export const submitAccessRequest = createAccessRequest;

/**
 * Vérifie si un utilisateur a un rôle spécifique - version simulée
 */
export const checkUserRole = async (userPublicKey: string, role: string) => {
  try {
    const processedRequestsJson = localStorage.getItem('alyraSign_processedRequests');
    if (!processedRequestsJson) return false;
    
    const processedRequests = JSON.parse(processedRequestsJson) as Record<string, RequestData>;
    const userRequests = Object.values(processedRequests)
      .filter((req) => req.walletAddress === userPublicKey && req.requestedRole === role);
    
    return userRequests.length > 0;
  } catch (error: unknown) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return false;
  }
};

/**
 * Récupère l'historique des présences d'un étudiant
 */
export const getStudentAttendances = async (studentPubkey: PublicKey, wallet: any, connection: any) => {
  try {
    if (process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === 'true') {
      const program = await getProgram(wallet, connection) as AlyraSignProgram;
      
      // Utiliser une assertion de type pour contourner les erreurs de typage
      const attendances = await (program.account as any).all([
        {
          memcmp: {
            offset: 8 + 8 + 8,
            bytes: studentPubkey.toBase58()
          }
        }
      ]) as { account: AttendanceAccount }[];
      
      return attendances.map(a => ({
        id: a.account.id,
        sessionId: a.account.sessionId,
        student: a.account.student.toString(),
        isPresent: a.account.isPresent,
        checkInTime: new Date(a.account.checkInTime * 1000),
        checkOutTime: a.account.checkOutTime ? new Date(a.account.checkOutTime * 1000) : null,
        note: a.account.note,
        createdAt: new Date(a.account.createdAt * 1000),
        updatedAt: new Date(a.account.updatedAt * 1000)
      }));
    } else {
      const attendancesJson = localStorage.getItem('alyraSign_attendances');
      const allAttendances = attendancesJson ? JSON.parse(attendancesJson) : [];
      const studentAddress = studentPubkey.toString();
      
      return allAttendances
        .filter((a: AttendanceResult) => a.student === studentAddress)
        .map((a: AttendanceResult) => ({
          id: a.id,
          sessionId: a.sessionId,
          student: new PublicKey(a.student),
          isPresent: a.isPresent,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime,
          note: a.note,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt
        }));
    }
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des présences:', error);
    toast.error(ERROR_ATTENDANCE_LIST_MESSAGE);
    return [];
  }
};

/**
 * Trouve l'adresse PDA pour une formation spécifique
 */
export const findFormationPDA = async (id: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("formation"), Buffer.from(id)],
    new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '')
  );
};

/**
 * Trouve l'adresse PDA pour une session spécifique
 */
export const findSessionPDA = async (formationPubkey: PublicKey, id: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("session"), formationPubkey.toBuffer(), Buffer.from(id)],
    new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '')
  );
};

// Exporter uniquement l'IDL
export { IDL } from './idl/alyrasign';

// Supprimer la redéclaration de PROGRAM_ID 