import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/session-provider";
import { Navigation } from "@/components/navigation";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coleta Inteligente Fernando de Noronha",
  description: "Sistema de monitoramento inteligente de lixeiras para coleta otimizada em Fernando de Noronha",
  keywords: ["Coleta Inteligente", "Fernando de Noronha", "Monitoramento", "Lixeiras", "Sustentabilidade"],
  authors: [{ name: "Equipe Coleta Inteligente" }],
  openGraph: {
    title: "Coleta Inteligente Fernando de Noronha",
    description: "Sistema de monitoramento inteligente de lixeiras para coleta otimizada",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Navigation />
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}