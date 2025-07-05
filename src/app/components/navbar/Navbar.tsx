"use client"

import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPowerOff } from "react-icons/fa";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import moment from "moment-timezone";
import useApi from "@/app/hooks/fetchData/useApi";
import { useForm } from "react-hook-form";

export const Navbar = () => {

    const [session, setSession] = useState<any>(null);

    const [limitePEdidos, setLimitePEdidos] = useState<any>(null);

    const { getValues, setValue, handleSubmit, control } = useForm()

    const { apiCall } = useApi()

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


    const obtenerSemana = async () => {
        const today = moment().tz("America/Lima");

        // Día de la semana (0: domingo, 6: sábado)
        const dayOfWeek = today.day();

        // Si hoy es sábado, la semana empieza hoy
        const fechaInicio = dayOfWeek === 6
            ? today.clone().startOf('day')
            : today.clone().subtract((dayOfWeek + 1) % 7, 'days').startOf('day'); // Restamos hasta el sábado anterior

        const fechaFin = fechaInicio.clone().add(6, 'days').endOf('day'); // Hasta el viernes siguiente

        const jsonFechas = {
            fechaInicio: fechaInicio.format('DD-MM-YYYY'),
            fechaFin: fechaFin.format('DD-MM-YYYY'),
            documentoUsuario: session?.documentoUsuario,
        };

        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/pedidosSemana`

        const response = await apiCall({
            method: 'POST',
            endpoint: url,
            data: jsonFechas
        })

        console.log("response pedidos seman: ", response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes), 0))
        const numPedidos = response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes), 0)
        console.log("limite pedidos", session.membresia == "500" ? (10 * Number(1) - numPedidos)
            : (3 * Number(1) - numPedidos))
        setValue("limitePedidos2", session.membresia == "500" ? (10 * Number(1) - numPedidos)
            : (3 * Number(1) - numPedidos))
        setLimitePEdidos(session.membresia == "500" ? (10 * Number(1) - numPedidos)
            : (3 * Number(1) - numPedidos))
    }

    useEffect(() => {
        // setValue(`precioSemanal`, "4.70")
        // setValue(`fechaPedido`, `Hoy ${moment.tz("America/Lima").format("DD-MM-YYYY")}`)
        // setValue(`fechaEntregaPedido`, obtenerSabado())
        obtenerSemana()
    }, [session])

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
            <div className="flex justify-start items-center gap-2 w-full">
                <button onClick={() => logout()} className="bg-red-400 hover:bg-red-500 px-1 py-1 rounded-lg cursor-pointer text-white"><FaPowerOff /></button>
            </div>
            <div className='rounded-full overflow-hidden relative z-50 flex'>
                <img
                    src={"/logo.jpg"}
                    alt="Inmobiliaria Muñoz Logo"
                    className="md:h-32 h-20 mx-auto relative z-10"
                />
            </div>
            {/* <h2 className="text-lg font-bold text-gray-300 text-center">Bienvenido</h2> */}
            <h2 className="text-xl font-bold text-[#efefef] text-center">
                {session !== null ? `${session?.nombres ?? ""} ${session?.apellidoPaterno ?? ""} ${session?.apellidoMaterno ?? ""}` : "Cargando..."}
            </h2>
            {
                session?.userType !== "admin" &&
                <div className="flex justify-center items-center md:w-[370px] w-[300px]">
                    <h2 className="text-xl font-bold text-[#efefef] text-center">
                        {session !== null ? `${session.membresia == "500" ? "EMPRESARIO" : "EMPRENDEDOR"}` : "Cargando..."}
                    </h2>
                </div>
            }
            {
                session?.userType !== "admin" &&
                <div className="flex justify-center items-center md:w-[370px] w-[300px]">
                    <h2 className="text-xl font-bold text-[#efefef] text-center">
                        {`Limite Pedidos: ${limitePEdidos}`}
                    </h2>
                </div>
            }
        </div>
    )
}