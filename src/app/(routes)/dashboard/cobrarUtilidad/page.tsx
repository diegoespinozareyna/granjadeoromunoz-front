"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material"
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface Pedido {
    status: string;
    pagoTotal: string;
    cantidadPaquetes: string;
}

const CobrarUtilidad = () => {

    const router = useRouter();

    const { getValues, setValue, handleSubmit, control } = useForm()

    const oneRender = useRef(true);

    const { apiCall } = useApi()

    const [session, setSession] = useState<any>(null);
    const [datos, setDatos] = useState<any>([]);

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
        console.log("session", session?.documentoUsuario);

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
            // documentoUsuario: session?.documentoUsuario,
        }

        console.log("jsonFechas", jsonFechas);

        setValue("fechaInicio", fechaInicio.format('YYYY-MM-DD'));
        setValue("fechaFin", fechaFin.format('YYYY-MM-DD'));

        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                // documentoUsuario: session?.documentoUsuario,
                fechaInicio: fechaInicio.format('DD-MM-YYYY'),
                fechaFin: fechaFin.format('DD-MM-YYYY'),
            }
        });
        console.log("response", response);

        const numPAquetes = response?.data?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes), 0)
        const kilosTotales = numPAquetes * 11;
        const efectivoRecaudado: number = response?.data?.filter((x: Pedido) => x.status === "1")?.reduce((acc: number, cur: Pedido) => acc + Number(cur?.pagoTotal), 0);
        console.log("numPAquetes", numPAquetes);
        console.log("kilosTotales", kilosTotales);
        console.log("efectivoRecaudado", efectivoRecaudado);

        setDatos({
            numPAquetes: numPAquetes,
            kilosTotales: kilosTotales,
            efectivoRecaudado: efectivoRecaudado,
        });

    }

    useEffect(() => {
        if (oneRender.current && session !== null) {
            fetchDataPedidosClientes();
            oneRender.current = false;
            return;
        }
    }, [session])

    return (
        <div>
            <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden mb-8">
                <div className="ml-[60px] md:ml-0">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                        {"<< Atras"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 justify-center items-center mt-5 border-2 border-[#22B2AA] rounded-lg p-3 px-10 bg-[rgba(255,255,255,0.8)] w-[350px] mx-2">
                    <div className="font-bold text-slate-700 text-3xl text-center">
                        {"Pedidos Totales Entregados:"}
                    </div>
                    <div className="font-bold text-yellow-500 text-6xl text-center">
                        {datos?.numPAquetes}
                    </div>
                    <div className="font-bold text-slate-700 text-3xl text-center mt-6">
                        {"Kilos Totales:"}
                    </div>
                    <div className="font-bold text-yellow-500 text-6xl text-center">
                        {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`}
                    </div>
                    <div className="font-bold text-slate-700 text-3xl text-center mt-6">
                        {"Utilidades Generadas:"}
                    </div>
                    <div className="font-bold text-yellow-500 text-6xl text-center">
                        {`S/.${Number(datos?.kilosTotales * 0.80)?.toFixed(2)}`}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CobrarUtilidad