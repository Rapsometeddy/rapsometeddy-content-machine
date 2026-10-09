import "./globals.css";

export const metadata = {
  title: "Rapsometeddy Content Machine",
  description: "Telegram-first content automation dashboard",
  icons: { icon: "/crowned-r.svg" },
  themeColor: "#09070f"
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
