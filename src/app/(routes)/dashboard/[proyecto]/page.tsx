"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Dashboard = () => {

    const [session, setSession] = useState<any>(null);
    const { setValue, getValues } = useForm()
    const { apiCall } = useApi()
    const topePedidos = 300;
    let isDayes = false;
    const [images, setImages] = useState<any>([]);

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

    const fetchPedidosFechasTrue = async () => {
        const isDay = moment().tz("America/Lima").day();
        if (isDay == 1 || isDay == 2 || isDay == 3) {
            console.log("isDay: ", isDay);
            setValue("isPedidos", true);
            isDayes = true;
            if (isDay == 1) {
                setValue("fechaInicio", moment().tz("America/Lima").format('DD-MM-YYYY'));
                setValue("fechaFin", moment().tz("America/Lima").format('DD-MM-YYYY'));
            }
            if (isDay == 2) {
                setValue("fechaInicio", moment().tz("America/Lima").subtract(1, 'days').format('DD-MM-YYYY'));
                setValue("fechaFin", moment().tz("America/Lima").format('DD-MM-YYYY'));
            }
            if (isDay == 3) {
                setValue("fechaInicio", moment().tz("America/Lima").subtract(2, 'days').format('DD-MM-YYYY'));
                setValue("fechaFin", moment().tz("America/Lima").format('DD-MM-YYYY'));
            }
        }
        try {
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedidos`;
            const response = await apiCall({
                method: "get", endpoint: url, data: null, params: {
                    documentoUsuario: getValues()?.documentoUsuario ?? "",
                    fechaInicio: getValues()?.fechaInicio,
                    fechaFin: getValues()?.fechaFin,
                    statusFiltro: getValues()?.statusFiltro ?? null,
                }
            });
            console.log("response fechas true", response?.data);
            console.log("responsen cantidad de pedidos realizados", response?.data?.reduce((acum: number, pedido: any) => acum + Number(pedido?.cantidadPaquetes), 0));
            const pedidosTotales = response?.data?.reduce((acum: number, pedido: any) => acum + Number(pedido?.cantidadPaquetes), 0);
            setValue("pedidosRealizados", response?.data?.reduce((acum: number, pedido: any) => acum + Number(pedido?.cantidadPaquetes), 0));
            setImages(
                session?.userType !== "admin" && isDayes == true && pedidosTotales < topePedidos ?
                    [
                        {
                            src: "/realizarpedido.jpg",
                            action: "REALIZAR PEDIDO",
                            push: "realizarPedidos",
                            alt: "Inmobiliaria Muñoz Logo",
                            width: 56,
                            height: 56,
                        },
                        {
                            src: "/Tú decides Instagram post (1).png",
                            action: "VER PEDIDOS",
                            push: "pedidosClientes",
                            alt: "Inmobiliaria Muñoz Logo",
                            width: 56,
                            height: 56,
                        },
                        {
                            src: "/COBRARUTILIDA2.png",
                            action: "COBRAR UTILIDAD",
                            push: "cobrarUtilidad",
                            alt: "Inmobiliaria Muñoz Logo",
                            width: 56,
                            height: 56,
                        },
                    ]
                    :
                    session?.userType !== "admin" && isDayes == true && pedidosTotales >= topePedidos ?
                        [
                            {
                                src: "/Tú decides Instagram post (1).png",
                                action: "VER PEDIDOS",
                                push: "pedidosClientes",
                                alt: "Inmobiliaria Muñoz Logo",
                                width: 56,
                                height: 56,
                            },
                            {
                                src: "/COBRARUTILIDA2.png",
                                action: "COBRAR UTILIDAD",
                                push: "cobrarUtilidad",
                                alt: "Inmobiliaria Muñoz Logo",
                                width: 56,
                                height: 56,
                            },
                        ]
                        :
                        session?.userType !== "admin" && isDayes !== true ?
                            [
                                {
                                    src: "/Tú decides Instagram post (1).png",
                                    action: "VER PEDIDOS",
                                    push: "pedidosClientes",
                                    alt: "Inmobiliaria Muñoz Logo",
                                    width: 56,
                                    height: 56,
                                },
                                {
                                    src: "/COBRARUTILIDA2.png",
                                    action: "COBRAR UTILIDAD",
                                    push: "cobrarUtilidad",
                                    alt: "Inmobiliaria Muñoz Logo",
                                    width: 56,
                                    height: 56,
                                },
                            ]
                            :
                            session?.userType?.includes("admin") &&
                            [
                                {
                                    src: "/Tú decides Instagram post (1).png",
                                    action: "VER PEDIDOS",
                                    push: "pedidosAdmin",
                                    alt: "Inmobiliaria Muñoz Logo",
                                    width: 56,
                                    height: 56,
                                },
                                {
                                    src: "/COBRARUTILIDA2.png",
                                    action: "COBRAR UTILIDAD",
                                    push: "cobrarUtilidad",
                                    alt: "Inmobiliaria Muñoz Logo",
                                    width: 56,
                                    height: 56,
                                },
                                {
                                    src: "/verUsuarios.png",
                                    action: "VER USUARIOS",
                                    push: "verUsuarios",
                                    alt: "Inmobiliaria Muñoz Logo",
                                    width: 56,
                                    height: 56,
                                },
                            ]
            )
        } catch (error) {
            console.log("error", error);
        }
    }

    useEffect(() => {
        fetchPedidosFechasTrue()
    }, [])


    const router = useRouter();

    return (
        <>
            <div className="grid grid-cols-1 gap-2 mt-5 !overflow-x-hidden">
                {images?.map((image: any, index: any) => (
                    <div key={index} className="flex justify-center items-center">
                        <div onClick={() => router.push(`/dashboard/${image.push}`)} className="relative w-80 h-w-80 overflow-hidden shadow-lg group cursor-pointer">
                            <img
                                src={image.src}
                                alt="Imagen"
                                className="w-full h-full object-cover object-[center_10%] opacity-80 group-hover:opacity-100 transition-transform duration-300 scale-90 group-hover:scale-100"
                            />
                            {/* <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-green-500 hover:bg-green-700 font-bold px-4 py-2 rounded-xl font-bblueold text-slate-50 text-sm text-center cursor-pointer">
                                    {image.action}
                                </button>
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Dashboard