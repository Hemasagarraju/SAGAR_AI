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
        <meta name="description" content="SAGARAGENT_AI - Autonomous Multi-Agent AI Automation Platform by Hemasagar Raju. Natural language prompt-to-DAG graph studio, self-healing execution pipelines, and real-time telemetry." />
        <meta name="author" content="Hemasagar Raju" />
        <meta name="keywords" content="AI, Autonomous Agents, Multi-Agent Systems, Next.js, Node.js, DAG, React Flow, Workflow Automation, Gemini, OpenRouter, Hemasagar Raju" />
        
        {/* Open Graph / LinkedIn / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SAGARAGENT_AI — Autonomous Multi-Agent Automation Platform" />
        <meta property="og:description" content="Transform plain English operational requirements into executable visual DAG workflows with 5 cooperating AI agents (Planner, Executor, Validator, Recovery, Monitoring)." />
        <meta property="og:site_name" content="SAGARAGENT_AI" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SAGARAGENT_AI — Autonomous Multi-Agent Automation Platform" />
        <meta name="twitter:description" content="Transform plain English operational requirements into executable visual DAG workflows with 5 cooperating AI agents." />
        
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
