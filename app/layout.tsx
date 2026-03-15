import type { Metadata } from "next";
import localFont from "next/font/local";

import { Providers } from "./providers";
import "./globals.css";

const display = localFont({
  src: [
    {
      path: "../public/fonts/palatino-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/palatino-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    {
      path: "../public/fonts/bahnschrift.ttf",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VoiceFlowOS",
    template: "%s | VoiceFlowOS",
  },
  description:
    "VoiceFlowOS helps businesses create, deploy, and manage AI phone agents that answer calls and feed every conversation back into an actionable dashboard.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-[color:var(--background)] text-[color:var(--foreground)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
