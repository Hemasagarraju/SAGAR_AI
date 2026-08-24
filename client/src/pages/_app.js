import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useReviewStore } from '../store/reviewStore';
import ReviewModal from '../components/ReviewModal';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const { initializeAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();
  const { initSessionTracking } = useReviewStore();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
    const cleanup = initSessionTracking();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [initializeAuth, initializeTheme, initSessionTracking]);

  return (
    <>
      <Head>
        <title>SAGAR AI | Generative AI Super App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
      <ReviewModal />
    </>
  );
}
