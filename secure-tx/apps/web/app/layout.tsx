import "./globals.css";

export const metadata = {
  title: "Secure Transactions",
  description: "Mini secure transaction service"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
