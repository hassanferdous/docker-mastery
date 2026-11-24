import "./globals.css";

export const metadata = {
  title: "Docker Assignment 03",
  description: "Next.js + Express + PostgreSQL + Redis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
