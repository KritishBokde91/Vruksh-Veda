// app/layout.tsx
import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Vrukshaveda",
  description: "Ayurvedic Plants Wisdom",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-leaf"></div>
        <div className="orb orb-green"></div>
        <div className="orb orb-teal"></div>
        <Header />
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}