import "./globals.css";

export const metadata = {
  title: "AgentFlow",
  description: "AI Workflow Automation Platform",
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