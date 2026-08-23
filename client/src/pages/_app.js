import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Head>
        <title>SAGARAGENT_AI | Multi-Agent Operations Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
