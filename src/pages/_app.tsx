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
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>AlyraSign</title>
            <link rel="icon" href="/AlyraSign.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>

          <ContextProvider>
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
          </ContextProvider>
        </>
    );
};

export default App;
