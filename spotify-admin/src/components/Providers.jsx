"use client";
import { AuthContextProvider } from "../context/AuthContext";
import AdminGuard from "./AdminGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
    return (
        <AuthContextProvider>
            <AdminGuard>
                <ToastContainer />
                {children}
            </AdminGuard>
        </AuthContextProvider>
    );
}
