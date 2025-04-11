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
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [role, setRole] = useState<string>('STUDENT');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        if (!anchorWallet) {
          return;
        }

        const accessRequests = await getAccessRequests(anchorWallet, connection);
        
        // Vérifier si l'utilisateur a déjà une demande en attente
        const hasPending = accessRequests.some(
          request => request.walletAddress === anchorWallet.publicKey.toString() && 
                    request.status === 'pending'
        );
        setHasPendingRequest(hasPending);
      } catch (err) {
        console.error('Erreur lors de la vérification des demandes:', err);
      }
    };

    checkPendingRequest();
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
      toast.success("Demande d'accès envoyée avec succès!");
      setHasPendingRequest(true);
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
            <div className="text-center py-8">
              <p className="text-lg text-white">Veuillez connecter votre portefeuille pour demander un accès.</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Demande d'accès</h1>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Votre wallet</h2>
              <div className="bg-gray-700 rounded-md p-4">
                <p className="text-white text-sm break-all">
                  {publicKey?.toString()}
                </p>
              </div>
            </div>
            
            <TransactionFees connection={connection} />
          </Card>
          
          {hasPendingRequest ? (
            <Card className="mt-8">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-white mb-4">Demande en cours</h2>
                <p className="text-lg text-white">Vous avez déjà une demande d'accès en cours de traitement.</p>
                <p className="text-sm text-gray-300 mt-2">Un administrateur examinera votre demande prochainement.</p>
              </div>
            </Card>
          ) : (
            <Card className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Nouvelle demande</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                    Rôle souhaité
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="STUDENT">Étudiant</option>
                    <option value="TEACHER">Formateur</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Expliquez brièvement pourquoi vous souhaitez ce rôle..."
                  />
                </div>
                
                <div className="mt-6">
                  <Button type="submit" disabled={loading}>
                    Envoyer la demande
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {success && (
            <div className="mt-4 p-4 bg-green-800 text-white rounded-md">
              <p className="text-center">Votre demande d'accès a été envoyée avec succès!</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-800 text-white rounded-md">
              <p className="text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccessPage; 