import type { Metadata } from "next";
import { Outfit, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Solmisa — Train Your Ear",
    template: "%s | Solmisa",
  },
  description:
    "Music ear training built on Gordon's Music Learning Theory. Develop relative pitch, master intervals, and build deep musicianship through spaced repetition.",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    siteName: "Solmisa",
    title: "Solmisa — Train Your Ear",
    description:
      "Music ear training built on research. Develop relative pitch through spaced repetition.",
  },
  twitter: {
    card: "summary",
    title: "Solmisa — Train Your Ear",
    description:
      "Music ear training built on research. Develop relative pitch through spaced repetition.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
