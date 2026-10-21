
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daylist | Calendar & Tasks",
  description:
    "Organize your calendar and tasks in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
