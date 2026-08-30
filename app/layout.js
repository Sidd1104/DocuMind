import "./globals.css";

export const metadata = {
  title: "DocuMind — Your Documents. Organized. Understood.",
  description:
    "An intelligent personal document platform that securely organizes, understands, and retrieves information from your important documents.",
  keywords: ["DocuMind", "document intelligence", "secure document vault", "AI assistant", "PDF search"],
  authors: [{ name: "DocuMind" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "DocuMind — Your Documents. Organized. Understood.",
    description:
      "An intelligent personal document platform that securely organizes, understands, and retrieves information from your important documents.",
    type: "website",
    siteName: "DocuMind",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen font-sans antialiased selection:bg-teal-100 selection:text-navy-900">
        {children}
      </body>
    </html>
  );
}
