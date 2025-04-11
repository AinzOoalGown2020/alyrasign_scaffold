import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface AutoConnectContextState {
    autoConnect: boolean;
    setAutoConnect(autoConnect: boolean): void;
}

const AutoConnectContext = createContext<AutoConnectContextState>({} as AutoConnectContextState);

export const useAutoConnect = () => useContext(AutoConnectContext);

export const AutoConnectProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // TODO: fix auto connect to actual reconnect on refresh/other.
    // TODO: make switch/slider settings
    // const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', true);
    const { connect, connected, connecting } = useWallet();

    useEffect(() => {
        if (autoConnect && !connected && !connecting) {
            console.log('Tentative de connexion automatique...');
            connect().catch((error) => {
                console.error('Erreur lors de la connexion automatique:', error);
            });
        }
    }, [autoConnect, connected, connecting, connect]);

    return (
        <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>{children}</AutoConnectContext.Provider>
    );
};
