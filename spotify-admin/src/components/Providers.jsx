"use client";
import { AuthContextProvider } from "../context/AuthContext";
import AdminGuard from "./AdminGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";

export default function Providers({ children }) {
    return (
        <AuthContextProvider>
            <AdminGuard>
                <ToastContainer />
                <div className="flex items-start min-h-screen">
                    <Sidebar />
                    <div className="flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]">
                        <Navbar />
                        <div className="pt-8 pl-5 sm:pt-12 sm:pl-12">
                            {children}
                        </div>
                    </div>
                </div>
            </AdminGuard>
        </AuthContextProvider>
    );
}
