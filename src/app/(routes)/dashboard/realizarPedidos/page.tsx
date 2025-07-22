"use client"

import { FormRealizaPedidos } from "@/app/components/pedidos/FormRealizaPedidos";
import { FormRealizaPedidos2 } from "@/app/components/pedidos/FormRealizaPedidos2";
import useApi from "@/app/hooks/fetchData/useApi";
import { useConfigStore, useUserStore } from "@/app/store/userStore";
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

    const { getValues, setValue, handleSubmit, control, watch } = useForm()

    const formAll = watch();
    console.log("formAll", formAll);
    // const [showPassword, setShowPassword] = useState(false)
    const { apiCall, loading, error } = useApi()

    const [session, setSession] = useState<any>(null);

    const [limitePEdidos, setLimitePEdidos] = useState<any>(null);
    const user = useUserStore((state) => state.user);
    console.log("user", user);

    const config = useConfigStore((state) => state.config);
    console.log("config", config);

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

    const [bloquearButton, setBloquearButton] = useState(false);

    const onSubmit = async (data: any) => {
        console.log(data)
        setBloquearButton(true);

        const hanleFetchApi = async () => {
            console.log("response", getValues());

            const jsonSend = {
                status: "0",
                fechaPedido: moment.tz(getValues()?.fechaPedido, "YYYY-MM-DD", "America/Lima").toISOString(),
                fechaEntregaPedido: moment.tz(getValues()?.fechaEntregaPedido, "YYYY-MM-DD", "America/Lima").toISOString(),
                cantidadPaquetes: getValues()?.cantidadPaquetes,
                kilos: getValues()?.kilos,
                precioSemanal: config?.precioKiloHuevos ?? "4.70",
                medioPago: getValues()?.medioPago ?? "1", // 1: efectivo, 2: yape/transferencia
                precio: getValues()?.precio,
                lugarEntrega: getValues()?.lugarEntrega ?? "1",
                direccionEntrega: getValues()?.direccionEntrega, // direccion de entrega
                pagoTotal: getValues()?.pagoTotal,
                documentoUsuario: session?.documentoUsuario,
                nombresUsuario: session?.nombres,
                apellidoPaternoUsuario: session?.apellidoPaterno,
                apellidoMaternoUsuario: session?.apellidoMaterno,
                membresia: getValues()?.membresia,
                distritoEntrega: getValues()?.distritoEntrega,
                provinciaEntrega: getValues()?.provinciaEntrega,
                departamentoEntrega: getValues()?.departamentoEntrega,
                celularEntrega: getValues()?.celularEntrega,
                zona: getValues()?.zona,
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
                        // router.push(`/dashboard/${Apis.PROYECTCURRENT}`);
                        return
                    },
                });
                setTimeout(() => {
                    // setBloquearButton(false);
                    window.location.href = `/dashboard/${Apis.PROYECTCURRENT}`;
                }, 2000);
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
        hanleFetchApi()
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

    // const obtenerSemana = async () => {
    //     const today = moment().tz("America/Lima");

    //     // Día de la semana (0: domingo, 6: sábado)
    //     const dayOfWeek = today.day();

    //     // Si hoy es sábado, la semana empieza hoy
    //     const fechaInicio = dayOfWeek === 6
    //         ? today.clone().startOf('day')
    //         : today.clone().subtract((dayOfWeek + 1) % 7, 'days').startOf('day'); // Restamos hasta el sábado anterior

    //     const fechaFin = fechaInicio.clone().add(6, 'days').endOf('day'); // Hasta el viernes siguiente

    //     const jsonFechas = {
    //         fechaInicio: fechaInicio.format('DD-MM-YYYY'),
    //         fechaFin: fechaFin.format('DD-MM-YYYY'),
    //         documentoUsuario: session?.documentoUsuario,
    //     };

    //     const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/pedidosSemana`

    //     const response = await apiCall({
    //         method: 'POST',
    //         endpoint: url,
    //         data: jsonFechas
    //     })

    //     console.log("response pedidos seman: ", response?.data
    //         ?.filter((x: any) => x.status !== "3")
    //         ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes), 0))
    //     const numPedidos = response?.data
    //         ?.filter((x: any) => x.status !== "3")
    //         ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes), 0)
    //     console.log("limite pedidos", session.membresia == "500" ? (10 * Number(1) - numPedidos)
    //         : (3 * Number(1) - numPedidos))
    //     setValue("limitePedidos", session.membresia == "500" ? (10 * Number(1) - numPedidos)
    //         : (3 * Number(1) - numPedidos))
    //     setLimitePEdidos(session.membresia == "500" ? (10 * Number(1) - numPedidos)
    //         : (3 * Number(1) - numPedidos))
    // }
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


    const distritos = [
        //norte
        { value: "Ventanilla", label: "Ventanilla", zona: "Norte" },
        { value: "Callao", label: "Callao", zona: "Norte" },
        { value: "Ancon", label: "Ancon", zona: "Norte" },
        { value: "Carabayllo", label: "Carabayllo", zona: "Norte" },
        { value: "Comas", label: "Comas", zona: "Norte" },
        { value: "Independencia", label: "Independencia", zona: "Norte" },
        { value: "Los Olivos", label: "Los Olivos", zona: "Norte" },
        { value: "Puente Piedra", label: "Puente Piedra", zona: "Norte" },
        { value: "San Martin de Porres", label: "San Martin de Porres", zona: "Norte" },
        //central
        { value: "Jesus Maria", label: "Jesus Maria", zona: "Central" },
        { value: "La Victoria", label: "La Victoria", zona: "Central" },
        { value: "Lima", label: "Lima", zona: "Central" },
        { value: "Lince", label: "Lince", zona: "Central" },
        { value: "Pueblo Libre", label: "Pueblo Libre", zona: "Central" },
        { value: "Rimac", label: "Rimac", zona: "Central" },
        { value: "San Luis", label: "San Luis", zona: "Central" },
        //este
        { value: "Ate", label: "Ate", zona: "Este" },
        { value: "Chaclacayo", label: "Chaclacayo", zona: "Este" },
        { value: "El Agustino", label: "El Agustino", zona: "Este" },
        { value: "San Antonio - Jicamarca", label: "San Antonio - Jicamarca", zona: "Este" },
        { value: "Lurigancho", label: "Lurigancho", zona: "Este" },
        { value: "San Juan de Lurigancho", label: "San Juan de Lurigancho", zona: "Este" },
        { value: "Santa Anita", label: "Santa Anita", zona: "Este" },
        { value: "Santa Eulalia", label: "Santa Eulalia", zona: "Este" },
        //sur
        { value: "Lurin", label: "Lurin", zona: "Sur" },
        { value: "Pachacamac", label: "Pachacamac", zona: "Sur" },
        { value: "Pucusana", label: "Pucusana", zona: "Sur" },
        { value: "San Juan De Miraflores", label: "San Juan De Miraflores", zona: "Sur" },
        { value: "Villa El Salvador", label: "Villa El Salvador", zona: "Sur" },
        { value: "Villa Maria del Triunfo", label: "Villa Maria del Triunfo", zona: "Sur" },
        //central sur
        { value: "Chorrillos", label: "Chorrillos", zona: "Central Sur" },
        { value: "San Borja", label: "San Borja", zona: "Central Sur" },
        { value: "Santiago de Surco", label: "Santiago de Surco", zona: "Central Sur" },
        { value: "Surquillo", label: "Surquillo", zona: "Central Sur" },
        { value: "Miraflores", label: "Miraflores", zona: "Central Sur" },
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
        // setDatos(response?.data);

        console.log("response pedidos seman: ", response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes ?? 0), 0))
        const numPedidos = response?.data
            ?.filter((x: any) => x.status !== "3")
            ?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes ?? 0), 0)
        console.log("numPedidos", numPedidos);
        console.log("limite pedidos", ((10 * Number(user?.membresia500 ?? 0)) + (3 * Number(user?.menbresia200 ?? 0)) - numPedidos))
        console.log("limite pedidos", ((10 * Number(user?.membresia500 ?? 0)) + (3 * Number(user?.menbresia200 ?? 0)) - numPedidos))
        setValue("limitePedidos2", ((10 * Number(user?.membresia500 ?? 0)) + (3 * Number(user?.menbresia200 ?? 0)) - numPedidos))
        setLimitePEdidos((10 * Number(user?.membresia500 ?? 0)) + (3 * Number(user?.menbresia200 ?? 0)) - numPedidos)

        setValue("membresia", `Empresario: ${user?.membresia500} - Emprendedor: ${user?.menbresia200}`)
        setValue("direccionEntrega", user?.direccion ?? "");
        // setValue("distritoEntrega", user?.distrito ?? "");
        setValue("provinciaEntrega", user?.provincia ?? "")
        setValue("departamentoEntrega", user?.departamento ?? "")
        setValue("celularEntrega", user?.celular ?? "")

    }

    useEffect(() => {
        if (user?.distrito && distritos.length > 0) {
            const match = distritos.find((opt) => opt.value?.toLowerCase() === user?.distrito?.toLowerCase());
            console.log("match", match);
            if (match) {
                setValue("distritoEntrega", match.value);
                setValue("zona", match.zona);
            }
        }
    }, [user?.distrito]);

    useEffect(() => {
        setValue(`precioSemanal`, config?.precioKiloHuevos ?? "4.70")
        setValue(`fechaPedido`, `${moment.tz("America/Lima").format("YYYY-MM-DD")}`)
        setValue(`fechaEntregaPedido`, `${moment.tz("America/Lima").add(6, "days").format("YYYY-MM-DD")}`)
        fetchDataPedidosClientes()
        if (user?.distrito) {
            fetchDataPedidosClientes()
        }
    }, [session, config, user, setValue])

    return (
        <div className="flex flex-col items-start justify-start mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            {
                bloquearButton &&
                <div className="fixed bottom-0 right-0 text-white bg-[rgba(0,0,0,0.5)] p-0 rounded-lg w-screen h-screen z-10">
                    .
                </div>
            }
            <div className="md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            <div className="md:ml-0 border-0 border-[#006060] rounded-lg p-3 px-10 mt-1 bg-[rgba(255,255,255,0.1)]">
                {/* <h2 className="text-xl font-bold text-gray-800 my-4 uppercase text-center">Datos de Pedido</h2> */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {
                        (limitePEdidos <= "0" || limitePEdidos == null || limitePEdidos === undefined) ?
                            <div className="flex flex-col items-center justify-center gap-2 w-full px-1 rounded-lg bg-[rgba(255,255,255,0.5)]">
                                <div className="font-bold text-3xl text-red-400">{"Lo sentimos..."}</div>
                                <div className="font-bold text-base text-red-400">{"Límite de pedidos mensuales alcanzado! Debe esperar hasta el próximo mes para poder realizar otro pedido."}</div>
                            </div>
                            :
                            limitePEdidos !== null &&
                            // <FormRealizaPedidos {...{ getValues, setValue, control, apiCall }} />
                            <FormRealizaPedidos2 {...{ getValues, setValue, control, apiCall, distritos }} />
                    }
                    {
                        limitePEdidos <= "0" ? ""
                            :
                            <Button disabled={loading} sx={{ width: "100%", backgroundColor: "#22b2aa", ":hover": { backgroundColor: "#006060", color: "white" }, fontWeight: "bold", color: "black" }} variant="contained" color="success" type="submit">
                                Realizar Pedido
                            </Button>
                    }
                </form>
            </div>
        </div>
    )
}

export default RealizarPedidos