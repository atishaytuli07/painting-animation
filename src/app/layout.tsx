import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "../../components/custom-cursor";

export const metadata: Metadata = {
  title: "Painting Animation",
  description: "Smooth painting animation with color transitions on mouse move",
  icons: {
    icon: "https://images.emojiterra.com/microsoft/fluent-emoji/15.1/1024px/1f7e1_flat.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
