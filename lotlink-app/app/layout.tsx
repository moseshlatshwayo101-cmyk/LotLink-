import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LotLink — Global Auction Sourcing",
  description:
    "Research, verify, and route legitimate public and government surplus opportunities. AI researches; humans verify; customers decide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
