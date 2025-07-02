"use client"

import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export const Navbar = () => {

    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('auth-token');
            const decoded: any = jwtDecode(token as string);
            console.log('Datos del usuario:', decoded?.user);
            setSession(decoded?.user);
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            localStorage.removeItem("auth-token");
            window.location.href = '/';
        }
    }, [])

    const logout = () => {
        Swal.fire({
            title: 'Cerrar Sesión',
            text: 'Seguro que desea cerrar la sesión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'SI',
            cancelButtonText: 'NO',
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: () => {
                localStorage.removeItem("auth-token");
                window.location.href = '/';
                return
            },
        });
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full">
            <div className='rounded-full overflow-hidden relative z-50 flex'>
                <img
                    src={"/logo.jpg"}
                    alt="Inmobiliaria Muñoz Logo"
                    className="md:h-32 h-20 mx-auto relative z-10"
                />
            </div>
            <h2 className="text-lg font-bold text-gray-300 text-center">Bienvenido</h2>
            <h2 className="text-xl font-bold text-[#efefef] text-center">{session !== null ? `${session?.nombres} ${session?.apellidoPaterno} ${session?.apellidoMaterno}` : "Cargando..."}</h2>
            <div className="flex justify-between items-center md:w-[370px] w-[300px]">
                <h2 className="text-xl font-bold text-[#efefef] text-center">{session !== null ? `Membresia Empresario` : "Cargando..."}</h2>
                <button onClick={() => logout()} className="bg-red-400 hover:bg-red-500 px-1 py-0 rounded-lg cursor-pointer text-white">Cerrar Sesión</button>
            </div>
        </div>
    )
}