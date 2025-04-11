import { FC, useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { estimateTransactionFees } from '../lib/solana';

interface TransactionFeesProps {
  connection: Connection;
}

export const TransactionFees: FC<TransactionFeesProps> = ({ connection }) => {
  const [fees, setFees] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const estimatedFees = await estimateTransactionFees(connection);
        setFees(estimatedFees);
      } catch (error) {
        console.error("Erreur lors de la récupération des frais:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [connection]);

  if (loading) {
    return <div>Chargement des frais...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Frais de transaction</h3>
      <p className="text-sm text-gray-600">
        Frais estimés: {fees.toFixed(6)} SOL
      </p>
      <p className="text-xs text-gray-500 mt-1">
        *Les frais peuvent varier en fonction de la charge du réseau
      </p>
    </div>
  );
}; 