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
        <meta name="description" content="SAGARAGENT_AI - Agentic AI Operations Automation Platform. Turn natural language prompts into executable multi-agent workflows." />
        <meta name="theme-color" content="#030712" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
