import { FC, ReactNode, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface AutoConnectProviderProps {
  children: ReactNode;
}

export const AutoConnectProvider: FC<AutoConnectProviderProps> = ({ children }) => {
  const { connect, connected, wallet } = useWallet();

  useEffect(() => {
    if (!connected && wallet) {
      console.log('Tentative de connexion automatique...');
      try {
        connect();
      } catch (error) {
        console.error('Erreur lors de la connexion automatique:', error);
      }
    }
  }, [connected, connect, wallet]);

  return <>{children}</>;
}; 