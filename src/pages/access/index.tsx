import React, { useState, useEffect, FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { IDL } from '../../lib/idl/alyrasign';
import { getAccessRequests, createAccessRequest } from '../../lib/solana';
import { TransactionFees } from '../../components/TransactionFees';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface AccessRequest {
  id: string;
  walletAddress: string;
  requestedRole: string;
  status: string;
}

export const AccessPage: FC = () => {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const connection = useMemo(() => new Connection(clusterApiUrl('devnet')), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [submitted, setSubmitted] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [role, setRole] = useState<string>('STUDENT');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!anchorWallet) {
          setError("Veuillez connecter votre wallet");
          return;
        }

        const accessRequests = await getAccessRequests(anchorWallet, connection);
        setRequests(accessRequests);
        
        // Vérifier si l'utilisateur a déjà une demande en attente
        const hasPending = accessRequests.some(
          request => request.walletAddress === anchorWallet.publicKey.toString() && 
                    request.status === 'pending'
        );
        setHasPendingRequest(hasPending);
      } catch (err) {
        console.error('Erreur lors du chargement des demandes:', err);
        setError("Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [anchorWallet, connection]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!connected || !anchorWallet) {
      toast.error("Veuillez connecter votre wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createAccessRequest(anchorWallet, connection, role, message);

      setSuccess(true);
      setSubmitted(true);
      toast.success("Demande d'accès envoyée avec succès!");
      
      // Recharger les demandes
      const accessRequests = await getAccessRequests(anchorWallet, connection);
      setRequests(accessRequests);
    } catch (err) {
      console.error('Erreur lors de la création de la demande:', err);
      setError("Erreur lors de la création de la demande");
      toast.error("Erreur lors de la création de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-white">Demande d'accès</h1>
          <Card>
            <div className="text-center py-12">
              <p className="text-lg text-gray-200">Veuillez connecter votre portefeuille pour demander un accès.</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Demande d'accès</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <TransactionFees connection={connection} />
            
            <form onSubmit={handleSubmit} className="mt-8">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-200">
                  Rôle souhaité
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="STUDENT">Étudiant</option>
                  <option value="TEACHER">Formateur</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-200">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <Button type="submit" disabled={loading}>
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            {loading ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-lg text-gray-200">Chargement des demandes...</p>
                </div>
              </Card>
            ) : error ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                </div>
              </Card>
            ) : hasPendingRequest ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-lg text-gray-200">Vous avez déjà une demande d'accès en cours.</p>
                </div>
              </Card>
            ) : submitted ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-lg text-gray-200">Votre demande d'accès a été envoyée avec succès.</p>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-lg text-gray-200">Demandes d'accès:</p>
                </div>
                <div className="mt-4">
                  {requests.map((req) => (
                    <div key={req.id} className="text-sm text-gray-200 mb-2">
                      {req.walletAddress} - {req.requestedRole} - {req.status}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessPage; 