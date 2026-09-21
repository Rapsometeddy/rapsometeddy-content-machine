import "./globals.css";

export const metadata = {
  title: "Rapsometeddy Content Machine",
  description: "Telegram-first content automation dashboard"
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
