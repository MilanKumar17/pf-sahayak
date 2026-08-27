import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PF Sahayak | Prototype",
  description: "An independent hackathon prototype for PF claim guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
