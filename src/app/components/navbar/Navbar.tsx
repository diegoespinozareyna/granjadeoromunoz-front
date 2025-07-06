"use client"

import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPowerOff } from "react-icons/fa";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import moment from "moment-timezone";
import useApi from "@/app/hooks/fetchData/useApi";
import { useForm } from "react-hook-form";
import { useUserStore } from "@/app/store/userStore";

export const Navbar = () => {


    const [limitePEdidos, setLimitePEdidos] = useState<any>(null);

    const { getValues, setValue, handleSubmit, control } = useForm()

    const [datos, setDatos] = useState<any>([]);

    const user = useUserStore((state) => state.user);
    const [session, setSession] = useState<any>(user);

    console.log("user", user);

    const { apiCall } = useApi()

    const meses = [
        { value: "01", label: "Enero", last: "31" },
        { value: "02", label: "Febrero", last: "28" },
        { value: "03", label: "Marzo", last: "31" },
        { value: "04", label: "Abril", last: "30" },
        { value: "05", label: "Mayo", last: "31" },
        { value: "06", label: "Junio", last: "30" },
        { value: "07", label: "Julio", last: "31" },
        { value: "08", label: "Agosto", last: "31" },
        { value: "09", label: "Septiembre", last: "30" },
        { value: "10", label: "Octubre", last: "31" },
        { value: "11", label: "Noviembre", last: "30" },
        { value: "12", label: "Diciembre", last: "31" },
    ]

    const fetchDataPedidosClientes = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedidos`;
        console.log("session", user?.documentoUsuario);

        const today: any = moment().tz("America/Lima");
        const todayString = moment.tz("America/Lima").format("YYYY-MM-DD")?.split?.("-")[1];
        const todayStringYear = moment.tz("America/Lima").format("YYYY-MM-DD")?.split?.("-")[0];
        console.log("today", today);
        console.log("todayString", todayString);
        console.log("todayStringYear", todayStringYear);

        const matchMes: any = meses.find(mes => mes.value === todayString);
        console.log("matchMes", matchMes);
        setValue("mesFiltro", matchMes.value);

        const fechaInicioPrev = `01-${todayString}-${todayStringYear}`;
        const fechaFinPrev = `${matchMes?.last}-${todayString}-${todayStringYear}`;
        console.log("fechaInicioPrev", fechaInicioPrev);
        console.log("fechaFinPrev", fechaFinPrev);

        const fechaInicio = moment.tz(`01-${todayString}-${todayStringYear}`, 'DD-MM-YYYY', 'America/Lima')
        const fechaFin = moment.tz(`${matchMes?.last}-${todayString}-${todayStringYear}`, 'DD-MM-YYYY', 'America/Lima');
        console.log("fechaInicio", fechaInicio);
        console.log("fechaFin", fechaFin);

        const jsonFechas = {
            fechaInicio: fechaInicio.format('DD-MM-YYYY'),
            fechaFin: fechaFin.format('DD-MM-YYYY'),
            documentoUsuario: user?.documentoUsuario,
        }

        console.log("jsonFechas", jsonFechas);

        setValue("fechaInicio", fechaInicio.format('YYYY-MM-DD'));
        setValue("fechaFin", fechaFin.format('YYYY-MM-DD'));

        const response = user !== null && user?.documentoUsuario !== null && user?.documentoUsuario !== "" && await apiCall({
            method: "get", endpoint: url, data: null, params: {
                documentoUsuario: user?.documentoUsuario,
                fechaInicio: fechaInicio.format('DD-MM-YYYY'),
                fechaFin: fechaFin.format('DD-MM-YYYY'),
            }
        });
        console.log("response", response);
        setDatos(response?.data);

        console.log("response pedidos seman: ", response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes ?? 0), 0))
        const numPedidos = response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes ?? 0), 0)
        console.log("numPedidos", numPedidos);
        console.log("limite pedidos", user?.membresia == "500" ? (10 * Number(user?.repeticionUsuario ?? 0) - numPedidos)
            : (3 * Number(1) - numPedidos))
        setValue("limitePedidos2", user?.membresia == "500" ? (10 * Number(user?.repeticionUsuario ?? 0) - numPedidos)
            : (3 * Number(1) - numPedidos))
        setLimitePEdidos(user?.membresia == "500" ? (10 * Number(user?.repeticionUsuario ?? 0) - numPedidos)
            : (3 * Number(1) - numPedidos))
    }

    useEffect(() => {
        // setValue(`precioSemanal`, "4.70")
        // setValue(`fechaPedido`, `Hoy ${moment.tz("America/Lima").format("DD-MM-YYYY")}`)
        // setValue(`fechaEntregaPedido`, obtenerSabado())
        fetchDataPedidosClientes()
    }, [user])

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
                {user !== null ? `${user?.nombres ?? ""} ${user?.apellidoPaterno ?? ""} ${user?.apellidoMaterno ?? ""}` : "Cargando..."}
            </h2>
            {
                user?.userType !== "admin" &&
                <div className="flex justify-center items-center md:w-[370px] w-[300px]">
                    <h2 className="text-xl font-bold text-[#efefef] text-center">
                        {user !== null ? `${user.membresia == "500" ? "EMPRESARIO" : "EMPRENDEDOR"}` : "Cargando..."}
                    </h2>
                </div>
            }
            {
                user?.userType !== "admin" &&
                <div className="flex justify-center items-center md:w-[370px] w-[300px]">
                    <h2 className="text-xl font-bold text-[#efefef] text-center">
                        {`Limite Pedidos: ${limitePEdidos}`}
                    </h2>
                </div>
            }
        </div>
    )
}