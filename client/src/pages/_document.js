import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="SAGAR AI - Generative AI Super App by Hemasagar Raju. Ultra-HD Text-to-Image Creation, AI Prompt Studio, ChatGPT-Style Gemini 2.5 Pro Chat, and Multimodal AI Tools." />
        <meta name="author" content="Hemasagar Raju" />
        <meta name="keywords" content="SAGAR AI, Generative AI, Image Creation, Prompt Engineering, ChatGPT, Gemini Pro, Hemasagar Raju" />
        
        {/* Open Graph / LinkedIn / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SAGAR AI — Generative AI Super App Suite" />
        <meta property="og:description" content="Create 8K images, craft master prompts, chat with Google Gemini 2.5 Pro, and access zero-latency multimodal AI tools." />
        <meta property="og:site_name" content="SAGAR AI" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SAGAR AI — Generative AI Super App Suite" />
        <meta name="twitter:description" content="Create 8K images, craft master prompts, chat with Google Gemini 2.5 Pro, and access zero-latency multimodal AI tools." />
        
        <meta name="theme-color" content="#06b6d4" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
