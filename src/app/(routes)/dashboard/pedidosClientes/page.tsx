"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PedidosClientes = () => {

    const router = useRouter();

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

    const fetchDataPedidosClientes = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedidos`;
        console.log("session", session?.documentoUsuario);
        const response = await apiCall({ method: "get", endpoint: url, data: null, params: { documentoUsuario: session?.documentoUsuario } });
        console.log("response", response);
        setDatos(response?.data);
    }

    useEffect(() => {
        if (oneRender.current && session !== null) {
            fetchDataPedidosClientes();
            oneRender.current = false;
            return;
        }
    }, [session])

    return (
        <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="ml-[60px] md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            <div className="mt-5 !flex flex-col gap-3 !justify-center !items-center p-4 overflow-x-scroll md:overflow-x-hidden w-[500px] md:w-full">
                {
                    datos?.map((item: any, index: number) => {
                        return (
                            <>
                                <div className="w-4/5 md:w-full flex flex-col justify-center items-center gap-3 border-2 border-[#005c5c] bg-[rgba(255,255,255,0.1)] rounded-lg p-4">
                                    <div className="flex justify-center items-center gap-2">
                                        
                                        <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[100px]">
                                            {`Pedido #${index + 1}`}
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                            PAQUETES
                                        </div>
                                        <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[100px]">
                                            {item?.cantidadPaquetes}
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center gap-2 w-full mt-5">
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold md-text-base text-xs">
                                                FECHA DE PEDIDO
                                            </div>
                                            <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-full">
                                                {item?.fechaPedido?.split?.("T")[0].split?.("-")[2]}
                                                -
                                                {item?.fechaPedido?.split?.("T")[0].split?.("-")[1]}
                                                -
                                                {item?.fechaPedido?.split?.("T")[0].split?.("-")[0]}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold md-text-base text-xs">
                                                FECHA DE ENTREGA
                                            </div>
                                            <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-full">
                                                {item?.fechaEntregaPedido}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex flex-col justify-center items-center gap-2 m-5">
                                            <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                                LUGAR DE ENTREGA
                                            </div>
                                            <div className="flex justify-center items-center gap-2 w-3/4">
                                                <div style={{ backgroundColor: item.lugarEntrega == "1" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                                    {"Domicilio"}
                                                </div>
                                                <div style={{ backgroundColor: item.lugarEntrega == "2" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                                    {"Oficina-Orbes"}
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[350px] h-[50px]">
                                                    {item.direccionEntrega}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                                ESTADO
                                            </div>
                                            <div className="flex justify-center items-center gap-2 w-3/4">
                                                <div style={{ backgroundColor: item.status == "1" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                                    {"Entregado"}
                                                </div>
                                                <div style={{ backgroundColor: item.status == "0" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                                    {"Pendiente"}
                                                </div>
                                                <div style={{ backgroundColor: item.status == "2" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                                    {"Rerogramar"}
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[350px] h-[50px]">
                                                    {"NOTA:"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default PedidosClientes