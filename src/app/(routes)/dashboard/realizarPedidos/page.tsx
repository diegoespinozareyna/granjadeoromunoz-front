"use client"

import { FormRealizaPedidos } from "@/app/components/pedidos/FormRealizaPedidos";
import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material"
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const RealizarPedidos = () => {

    const router = useRouter();

    const { getValues, setValue, handleSubmit, control } = useForm()
    // const [showPassword, setShowPassword] = useState(false)
    const { apiCall, loading, error } = useApi()

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

    const onSubmit = async (data: any) => {
        console.log(data)

        const hanleFetchApi = async () => {
            console.log("response", getValues());

            const jsonSend = {
                status: "0",
                fechaPedido: getValues()?.fechaPedido,
                fechaEntregaPedido: getValues()?.fechaEntregaPedido,
                cantidadPaquetes: getValues()?.cantidadPaquetes,
                kilos: getValues()?.kilos,
                precioSemanal: getValues()?.precioSemanal,
                medioPago: getValues()?.medioPago, // 1: efectivo, 2: yape/transferencia
                precio: getValues()?.precio,
                lugarEntrega: getValues()?.lugarEntrega,
                direccionEntrega: getValues()?.direccionEntrega, // direccion de entrega
                pagoTotal: getValues()?.pagoTotal,
                documentoUsuario: session?.documentoUsuario,
                nombresUsuario: session?.nombres,
                apellidoPaternoUsuario: session?.apellidoPaterno,
                apellidoMaternoUsuario: session?.apellidoMaterno,
                usuario: `${session?.nombres} ${session?.apellidoPaterno} ${session?.apellidoMaterno}`,
                proyecto: Apis.PROYECTCURRENT,
            };

            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/registroPedido`
            const response = await apiCall({
                method: 'POST',
                endpoint: url,
                data: jsonSend
            })
            console.log("responsefuianl: ", response)
            if (response.status === 201) {
                Swal.fire({
                    title: 'Pedido enviado',
                    text: 'Se ha enviado el pedido',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    // showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    // cancelButtonColor: '#d33',
                    // cancelButtonText: 'No',
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false,
                    preConfirm: () => {
                        router.push(`/dashboard/${Apis.PROYECTCURRENT}`);
                        return
                    },
                });
            } else {
                Swal.fire({
                    title: 'Error al enviar pedido',
                    text: 'No se ha podido enviar el pedido',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    // cancelButtonText: 'No',
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false,
                    preConfirm: () => {
                        return
                    },
                });
            }
        }

        if (getValues()?.lugarEntrega == "1") {
            Swal.fire({
                title: 'Dirección de Envío',
                input: 'text',
                inputPlaceholder: 'Ingrese la dirección de entrega',
                icon: 'question',
                confirmButtonText: 'Guardar',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false,
                inputValidator: (value) => {
                    if (!value) {
                        return 'La dirección es obligatoria';
                    }
                    return null;
                },
                preConfirm: (value) => {
                    // setValue se ejecuta solo si hay un valor válido
                    if (value) {
                        setValue("direccionEntrega", value);
                        hanleFetchApi()
                    }
                }
            });
        }
        else {
            console.log("la data es sin doreccion: ", data);
            setValue("direccionEntrega", "");
            hanleFetchApi()
        }
    }

    const obtenerSabado = () => {
        // Obtener fecha actual en Lima
        const today = moment.tz("America/Lima");

        // Día de la semana actual (0 = domingo, 6 = sábado)
        const currentDay = today.day();

        // Si hoy es sábado (6), sumamos 7 días → siguiente sábado
        // Si no, sumamos los días restantes hasta el sábado (6 - currentDay)
        const daysToAdd = currentDay === 6 ? 7 : 6 - currentDay;

        // Obtener el próximo sábado
        const nextSaturday = today.clone().add(daysToAdd, 'days').startOf('day').hour(13).minute(0);

        return `Sábado ${nextSaturday.format("DD-MM-YYYY")}`;
    }

    useEffect(() => {
        setValue(`precioSemanal`, "7.80")
        setValue(`fechaPedido`, `Hoy ${moment.tz("America/Lima").format("DD-MM-YYYY")}`)
        setValue(`fechaEntregaPedido`, obtenerSabado())
    }, [])

    return (
        <div className="flex flex-col items-start justify-start mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            <div className="md:ml-0 border-0 border-[#006060] rounded-lg p-3 px-10 mt-1 bg-[rgba(255,255,255,0.1)]">
                <h2 className="text-xl font-bold text-gray-800 my-4 uppercase text-center">Datos de Pedido</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormRealizaPedidos {...{ getValues, setValue, control, apiCall }} />
                    <Button disabled={loading} loading={loading} sx={{ width: "100%", backgroundColor: "#22b2aa", ":hover": { backgroundColor: "#006060", color: "white" }, fontWeight: "bold", color: "black" }} variant="contained" color="success" type="submit">
                        Realizar Pedido
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default RealizarPedidos