import "./globals.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Providers from "../components/Providers";

export const metadata = {
  title: "Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex items-start min-h-screen">
            <Sidebar />
            <div className="flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]">
              <Navbar />
              <div className="pt-8 pl-5 sm:pt-12 sm:pl-12">
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
