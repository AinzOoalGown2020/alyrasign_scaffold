import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, useMemo } from 'react';
import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { AutoConnectProvider } from '../components/AutoConnectProvider';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    // Vous pouvez également fournir un réseau personnalisé RPC
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    
    // Utiliser les wallets standards sans les adapter manuellement
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter()
        ],
        []
    );

    return (
        <>
          <Head>
            <title>AlyraSign</title>
            <link rel="icon" href="/AlyraSign.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>

          <ContextProvider>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <AutoConnectProvider>
                    <div className="flex flex-col h-screen">
                      <ToastContainer
                        position="bottom-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                      />
                      <Notifications />
                      <AppBar />
                      <ContentContainer>
                        <Component {...pageProps} />
                      </ContentContainer>
                      <Footer />
                    </div>
                  </AutoConnectProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </ContextProvider>
        </>
    );
};

export default App;
