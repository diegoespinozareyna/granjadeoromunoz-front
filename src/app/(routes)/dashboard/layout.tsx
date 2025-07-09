"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/app/components/navbar/Navbar";
import "./styleFondoOro.css"
import { useUserStore } from "@/app/store/userStore";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        try {
            const token = localStorage.getItem('auth-token');
            const decoded: any = jwtDecode(token as string);
            console.log('Datos del usuario:', decoded?.user);
            setUser(decoded?.user);
            // setSession(decoded?.user);
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            localStorage.removeItem("auth-token");
            window.location.href = '/';
        }
    }, [])

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div
                    // id='fondo-oro-verde' 
                    className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-200px)] font-[family-name:var(--font-geist-sans)] px-2 py-2 bg-[#007c7c]">
                    <Navbar />
                    {children}
                </div>
            </body>
        </html>
    );
}

