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

    const { apiCall, loading, error } = useApi()

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
        <div className="flex flex-col items-start justify-start mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="ml-[60px] md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            <div className="overflow-x-scroll md:overflow-x-hidden w-[500px] md:w-full">
                <table className="table-auto border-collapse text-sm mt-4 ml-[60px] md:ml-0">
                    <thead>
                        <tr className="!bg-[#00b3b3] text-slate-50">
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Fecha de Pedido</th>
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Paquetes</th>
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Kilos</th>
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Fecha de Entrega</th>
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Lugar de Entrega</th>
                            <th className="!max-w-[120] border-2 px-3 py-2 text-left uppercase  border-slate-300">Estado</th>
                            <th className="!max-w-[180px] border-2 px-3 py-2 text-left uppercase  border-slate-300">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos?.map((item: any, index: number) => {
                            return (
                                <tr key={index} className="border-b">

                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[120px] px-3 py-2">
                                        <div className={`text-base`}>
                                            {item?.fechaPedido.split("Hoy ")[1]}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[120px] px-3 py-2">
                                        <div className='text-base grid grid-cols-2 gap-1 overflow-x-auto'>
                                            {item?.cantidadPaquetes}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[180px] px-3 py-2">
                                        <div className='grid grid-cols-1 gap-1 text-base'>
                                            {/* <div className='text-base font-bold'>{`S/. ${Number(item?.precioVenta)?.toFixed(2) ?? Number(0).toFixed(2)}`}</div> */}
                                            {item?.kilos}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[180px] px-3 py-2">
                                        <div className='grid grid-cols-1 gap-1 text-base'>
                                            {/* <div className='text-base font-bold'>{`S/. ${Number(item?.precioVenta)?.toFixed(2) ?? Number(0).toFixed(2)}`}</div> */}
                                            {item?.fechaEntregaPedido}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[180px] px-3 py-2">
                                        <div className='grid grid-cols-1 gap-1 text-base'>
                                            {/* <div className='text-base font-bold'>{`S/. ${Number(item?.precioVenta)?.toFixed(2) ?? Number(0).toFixed(2)}`}</div> */}
                                            {item?.direccionEntrega !== "" && item.direccionEntrega !== null && item.direccionEntrega !== undefined ? item?.direccionEntrega : "Oficina Orbes"}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[120px] px-3 py-2">
                                        <div className={`text-base px-2 py-1 rounded-md text-center font-bold ${item?.status == "0" ? "bg-yellow-50 text-yellow-500" : item?.status == "1" ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"}`}>
                                            {item?.status == "0" ? "Pendiente" : item?.status == "1" ? "Entregado" : "En Ruta"}
                                            {/* {`${item?.categoria == "0" ? "Snack" : item?.categoria == "1" ? "Bebidas" : item?.categoria == "2" ? "Aseo Personal" : item?.categoria == "3" ? "Otros" : "Otros"}`} */}
                                        </div>
                                    </td>
                                    <td className="!bg-[#fff] border-2 border-slate-200 text-slate-500 !max-w-[180px] px-3 py-2">
                                        <div className='grid grid-cols-1 gap-1 text-base'>
                                            {/* <div>{` ${item?.factura ?? ""}`}</div> */}
                                            {""}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PedidosClientes