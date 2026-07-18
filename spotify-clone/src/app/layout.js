
import "./globals.css";
import PlayerContextProvider from "../context/PlayerContext";
import { AuthContextProvider } from "../context/AuthContext";
import ClientAppWrapper from "../components/ClientAppWrapper";

export const metadata = {
  title: "NotSpotify",
  description: "NotSpotify Clone using Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <PlayerContextProvider>
            <ClientAppWrapper>
               {children}
            </ClientAppWrapper>
          </PlayerContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
