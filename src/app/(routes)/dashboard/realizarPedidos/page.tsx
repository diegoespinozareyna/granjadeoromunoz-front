"use client"

import { FormRealizaPedidos } from "@/app/components/pedidos/FormRealizaPedidos";
import { FormRealizaPedidos2 } from "@/app/components/pedidos/FormRealizaPedidos2";
import { PopUpGeneral } from "@/app/components/popup/PopUpGeneral";
import useApi from "@/app/hooks/fetchData/useApi";
import { usePopupOpen } from "@/app/hooks/popupopen/usePopupOpen";
import { useConfigStore, useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material"
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

// Extend the Window interface to include VisanetCheckout
declare global {
    interface Window {
        VisanetCheckout?: {
            open: () => void;
            configure: (config: any) => any;
            configuration: {
                complete: (response: any) => void;
            };
        };
    }
}

const RealizarPedidos = () => {

    const router = useRouter();

    const { getValues, setValue, handleSubmit, control, watch } = useForm()

    const { openPopup, hangeStatePopUp } = usePopupOpen();

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

    console.log("getValues", getValues()?.dataVoucher);

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
                medioPago: (getValues()?.pasarelaPay == true ? "3" : (getValues()?.medioPago ?? "1")), // 1: efectivo, 2: yape/transferencia
                precio: getValues()?.precio,
                lugarEntrega: getValues()?.lugarEntrega ?? "1",
                direccionEntrega: getValues()?.direccionEntrega, // direccion de entrega
                pagoTotal: getValues()?.pagoTotal,
                documentoUsuario: user?.documentoUsuario,
                nombresUsuario: user?.nombres,
                apellidoPaternoUsuario: user?.apellidoPaterno,
                apellidoMaternoUsuario: user?.apellidoMaterno,
                membresia: getValues()?.membresia,
                distritoEntrega: getValues()?.distritoEntrega,
                provinciaEntrega: getValues()?.provinciaEntrega,
                departamentoEntrega: getValues()?.departamentoEntrega,
                celularEntrega: getValues()?.celularEntrega,
                zona: getValues()?.zona,
                usuario: `${user?.nombres} ${user?.apellidoPaterno} ${user?.apellidoMaterno}`,
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
        { value: "Santa Rosa", label: "Santa Rosa", zona: "Norte" },
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
        { value: "Magdalena", label: "Magdalena", zona: "Central" },
        { value: "Cercado", label: "Cercado", zona: "Central" },
        { value: "Breña", label: "Breña", zona: "Central" },
        { value: "Breña", label: "Breña", zona: "Central" },
        { value: "San Miguel", label: "San Miguel", zona: "Central" },
        //este
        { value: "Ate", label: "Ate", zona: "Este" },
        { value: "Chaclacayo", label: "Chaclacayo", zona: "Este" },
        { value: "El Agustino", label: "El Agustino", zona: "Este" },
        { value: "San Antonio - Jicamarca", label: "San Antonio - Jicamarca", zona: "Este" },
        { value: "Lurigancho", label: "Lurigancho", zona: "Este" },
        { value: "San Juan de Lurigancho", label: "San Juan de Lurigancho", zona: "Este" },
        { value: "Santa Anita", label: "Santa Anita", zona: "Este" },
        { value: "Santa Eulalia", label: "Santa Eulalia", zona: "Este" },
        { value: "Cieneguilla", label: "Cieneguilla", zona: "Este" },
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
        { value: "Barranco", label: "Barranco", zona: "Central Sur" },
        { value: "San Isidro", label: "San Isidro", zona: "Central Sur" },
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

    //pago pasarela

    const openForm = () => {
        window?.VisanetCheckout?.open();
    }

    // useEffect(() => {
    //     setValue("montoPasarela", dataAsientos?.precio)
    // }, []);

    // const [openPopup, setOpenPopup] = useState<boolean>(false);
    const [loading2, setLoading2] = useState(false);
    const [tokenSession77, setTokenSession77] = useState<any>(null);
    const [sessionPaso2, setSessionPaso2] = useState<any>(null);
    const [initialized, setInitialized] = useState(false);
    const [paymentInitialized, setPaymentInitialized] = useState(false);
    const initializationRef = useRef(false);
    const [changePasarela, setChangePasarela] = useState(false);

    const initializePaymentGateway = useCallback(async () => {
        if (!getValues()?.pasarelaPay || initializationRef.current) {
            console.log("pasarelaPay", getValues()?.pasarelaPay)
            console.log("initializationRef.current", initializationRef.current)
            return;
        }

        // Marcar como inicializado inmediatamente
        initializationRef.current = true;
        setPaymentInitialized(true);

        console.log("reserva pasarelawedrfgfdsd")
        const MERCHANT_ID = "650245394";
        // const AMOUNT = "300";
        const AMOUNT = getValues()?.pagoTotal;
        // const AMOUNT = 1;
        // const AMOUNT = Apis.PRECIO_PASARELA;
        // const JS_URL = "https://static-content-qas.vnforapps.com/v2/js/checkout.js?qa=true"; // test
        const JS_URL = "https://static-content.vnforapps.com/v2/js/checkout.js"; // prod
        const PUCHASE_NUMBER = Math.floor(Math.random() * (999999999999 - 1 + 1)) + 1; // único por transacción
        let SECURITY_TOKEN = '';

        const loadInit = async () => {

            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }

            try {
                setLoading2(true)
                // const res1 = await axios.get('https://nodejs-niubiz-lotexpres.onrender.com/api/auth/pasarelaNiubiz') // prd render servidor lento
                const res1 = await axios.get('https://nodejs-niubiz-munoz.vercel.app/api/auth/pasarelaNiubiz') // prd render servidor lento
                // const res1 = await axios.get('http://localhost:5000/api/auth/pasarelaNiubiz') // local
                console.log(res1)

                if (res1 == null) return;
                SECURITY_TOKEN = res1.data.data;
                // SECURITY_TOKEN = res1;
                // setTokenSession77(res1)
                setTokenSession77(res1)
                getTokenNiubizSesion(res1);

            } catch (error) {
                alert('Error al generar el token de seguridad');
                const loadingElement = document.getElementById('loading');
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                initializationRef.current = false;
                setPaymentInitialized(false);
            } finally {
                setLoading2(false)
            }
        }
        const getTokenNiubizSesion = async (securityToken: any) => {
            // console.log(securityToken)
            try {
                // const sessionKey = await getSessionKey(MERCHANT_ID, securityToken, AMOUNT)
                const sessionToken2 = {
                    codigoComercio: MERCHANT_ID,
                    tokenGenerado: securityToken.data.data,
                    montoPagar: AMOUNT,
                    //MDD
                    MDD4: "diegoespinozareyna@gmail.com", // ID del usuario correo
                    MDD21: 0, //
                    MDD32: "73505082", // ID del usuario dni
                    MDD75: 'Invitado', // Registrado o Invitado
                    MDD77: 100 // Registrado o Invitado
                }
                // console.log(sessionToken2)
                // const res2 = await axios.post('https://nodejs-niubiz-lotexpres.onrender.com/api/auth/pasarelaniubiz2', sessionToken2) // prd render servidor lento
                const res2 = await axios.post('https://nodejs-niubiz-munoz.vercel.app/api/auth/pasarelaniubiz2', sessionToken2) // prd
                // const res2 = await axios.post('http://localhost:5000/api/auth/pasarelaniubiz2', sessionToken2) // local
                console.log(res2)
                if (res2 == null) {
                    console.log("res2 null")
                    return
                };
                setSessionPaso2(res2?.data?.data)
                await addNiubizScript(res2?.data?.data);
            } catch (error) {
                alert('Error al generar el token de sesión');
                const loadingElement = document.getElementById('loading');
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
            } finally {
                // setLoading2(false)
            }
        }

        const addNiubizScript = async (sessionKey: any) => {
            const script = document.createElement('script');
            script.src = JS_URL;
            script.async = true;
            // console.log(sessionKey)
            script.onload = () => setConfigurationForm(sessionKey);
            document.head.appendChild(script);
        }

        const setConfigurationForm = async (sessionKey: any) => {
            //comprobar status
            const form1 = window?.VisanetCheckout?.configure({
                sessiontoken: `${sessionKey}`,
                channel: 'web',
                merchantid: "650245394",
                purchasenumber: `${PUCHASE_NUMBER}`,
                amount: AMOUNT,
                expirationminutes: '20',
                timeouturl: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/timeout` : 'http://localhost:3000/timeout',
                merchantlogo: 'https://files.readme.io/296927b-LOGO-NIUBIZ-LATEST.svg',
                // merchantlogo: <img src='https://res.cloudinary.com/dk5xdo8n1/image/upload/v1720914692/Niubiz_Logo_01_rjynld.png' alt="img" />,
                formbuttoncolor: '#000000',
                action: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/transaction` : 'http://localhost:3000/transaction',
            });
            // console.log(form1)
            window?.VisanetCheckout?.open();
            // No considerar la siguiente línea si desea enviar los valores generados por el formulario a su backend

            if (window?.VisanetCheckout?.configuration) {
                window.VisanetCheckout.configuration.complete = completePayment;
            }
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }

        const completePayment = async (response: any) => {
            //comprobar status
            // console.log(response)
            // console.log(tokenSession77)
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            const sessionToken3 = {
                codigoComercio: MERCHANT_ID,
                tokenGenerado2: response.token,
                montoPagar: AMOUNT,
                numeroAleatorio: PUCHASE_NUMBER,
                tokenSession: SECURITY_TOKEN,
                // tokenSession: tokenSession77?.data?.data,
                // tokenSession: sessionPaso2,
            }
            try {
                // console.log(sessionToken3)
                // const res3 = await axios.post('https://nodejs-niubiz-lotexpres.onrender.com/api/auth/pasarelanuibiz3', sessionToken3) // prd render sercidor lento
                const res3 = await axios.post('https://nodejs-niubiz-munoz.vercel.app/api/auth/pasarelanuibiz3', sessionToken3) // prd
                // const res3 = await axios.post('http://localhost:5000/api/auth/pasarelanuibiz3', sessionToken3) // local
                // const res3 = await getAuthorization(MERCHANT_ID, response.token, AMOUNT, PUCHASE_NUMBER, SECURITY_TOKEN)
                console.log("]Larespuesta final es: ", res3)
                // const authorizationResponse = await getAuthorization(MERCHANT_ID, response.token, AMOUNT, PUCHASE_NUMBER, SECURITY_TOKEN);
                const authorizationResponseElement = document.getElementById('authorizationResponse');
                if (authorizationResponseElement) {
                    authorizationResponseElement.innerHTML = JSON.stringify(res3, undefined, 4);
                }
                const loadingElement = document.getElementById('loading');
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                // Redireccionar a una url front
                console.log("pago ok", res3)
                console.log("pago ok", res3?.data?.data?.dataMap?.STATUS)
                console.log("pago ok", res3?.data?.data?.dataMap?.STATUS == "Authorized")
                if (res3?.data?.data?.dataMap?.STATUS == "Authorized") {
                    Swal.fire({
                        icon: "success",
                        title: "Pago exitoso",
                        text: `Un ejecutivo se comunicará con usted en la brevedad posible`,
                    });
                    console.log("pago ok", res3)
                    console.log("pago ok")
                    onSubmit(getValues());
                    setTimeout(() => {
                        window.location.reload()
                    }, 5000)
                }
                else if (res3?.data?.data?.dataMap?.STATUS !== "Authorized") {
                    console.log("pago ok", res3?.data?.data?.data?.ACTION_DESCRIPTION
                    )
                    Swal.fire({
                        icon: "warning",
                        title: "Ocurrió un inconveniente con su pago",
                        text: `Error: ${res3?.data?.data?.data?.ACTION_DESCRIPTION}, por su seguridad se le enviará a la página principal`,
                    });
                    if (process.env.NEXT_PUBLIC_API_URL) {
                        setTimeout(() => {
                            window.location.reload()
                        }, 7000)
                    }
                    else {
                        Swal.fire({
                            icon: "warning",
                            title: "Ocurrió un inconveniente con su pago",
                            text: `Error: ${res3?.data?.data?.data?.ACTION_DESCRIPTION}, por su seguridad se le enviará a la página principal`,
                        });
                        // setTimeout(() => {
                        //     window.location.reload()
                        // }, 7000)
                    }
                }
            } catch (error) {
                Swal.fire({
                    icon: "warning",
                    title: "Alerta",
                    text: "Ocurrió un error con su pago, NO se hizo el cobro. Por su seguridad lo enviaremos a la página principal",
                });
                if (process.env.NEXT_PUBLIC_API_URL) {
                    setTimeout(() => {
                        window.location.replace(`${process.env.NEXT_PUBLIC_API_URL}`);
                    }, 5000)
                }
                else {
                    setTimeout(() => {
                        window.location.replace("http://localhost:3000/");
                    }, 5000)
                }
            } finally {
                setLoading2(false)
            }
        }
        //fin pasarela niubiz
        loadInit()
    }, [getValues]);

    // Efecto que se ejecuta solo cuando cambia pasarelaPay a true
    useEffect(() => {
        console.log("pasarelaPay", getValues()?.pasarelaPay)
        console.log("paymentInitialized", paymentInitialized)
        if (getValues()?.pasarelaPay && !paymentInitialized) {
            initializePaymentGateway();
        }
    }, [getValues()?.pasarelaPay, paymentInitialized, initializePaymentGateway, changePasarela]);

    const [allUploaded, setAllUploaded] = useState(false); // ✅ estado final
    const [urls, setUrls] = useState<string[]>([]); // para guardar los links subidos

    const uploadFiles = async (files: File[]) => {
        const uploadedUrls: string[] = [];
        let success = true;

        for (const file of files) {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await axios.post(
                    `${Apis.URL_APOIMENT_BACKEND_DEV2}/upload`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );

                if (res.status === 200) {
                    uploadedUrls.push(res.data.url);
                } else {
                    success = false;
                }
            } catch (err) {
                console.error("Error al subir", file.name, err);
                success = false;
            }
        }

        // guardar resultados en el estado
        setUrls(uploadedUrls);
        setAllUploaded(success && uploadedUrls.length === files.length);

        return uploadedUrls;
    };

    const handleSubirVouchers = async (key: any) => {
        const datosPedido = getValues()?.dataPoUp?.infoOrder
        try {
            if (!getValues()?.dataVoucher) return alert("Selecciona una imagen");
            setLoading2(true)

            let urls: string[] = [];
            let allUploaded = true;

            // subir uno por uno
            for (const file of getValues()?.dataVoucher) {
                const formData = new FormData();
                formData.append("image", file);

                const res: any = await axios.post(`${Apis.URL_APOIMENT_BACKEND_DEV2}/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (res.status === 200) {
                    urls.push(res.data.url);
                } else {
                    allUploaded = false;
                    break;
                }
            }

            if (allUploaded) {
                const jsonSend = {
                    status: "0",
                    fechaPedido: moment.tz(getValues()?.fechaPedido, "YYYY-MM-DD", "America/Lima").toISOString(),
                    fechaEntregaPedido: moment.tz(getValues()?.fechaEntregaPedido, "YYYY-MM-DD", "America/Lima").toISOString(),
                    cantidadPaquetes: getValues()?.cantidadPaquetes,
                    kilos: getValues()?.kilos,
                    precioSemanal: config?.precioKiloHuevos ?? "4.70",
                    medioPago: getValues()?.medioPago ?? "1",
                    precio: getValues()?.precio,
                    lugarEntrega: getValues()?.lugarEntrega ?? "1",
                    direccionEntrega: getValues()?.direccionEntrega,
                    pagoTotal: getValues()?.pagoTotal,
                    documentoUsuario: user?.documentoUsuario,
                    nombresUsuario: user?.nombres,
                    apellidoPaternoUsuario: user?.apellidoPaterno,
                    apellidoMaternoUsuario: user?.apellidoMaterno,
                    membresia: getValues()?.membresia,
                    distritoEntrega: getValues()?.distritoEntrega,
                    provinciaEntrega: getValues()?.provinciaEntrega,
                    departamentoEntrega: getValues()?.departamentoEntrega,
                    celularEntrega: getValues()?.celularEntrega,
                    zona: getValues()?.zona,
                    usuario: `${user?.nombres} ${user?.apellidoPaterno} ${user?.apellidoMaterno}`,
                    proyecto: Apis.PROYECTCURRENT,
                    urlsPago: urls,
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
                        confirmButtonColor: '#3085d6',
                        showLoaderOnConfirm: true,
                        allowOutsideClick: false,
                    });

                    const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/subirVoucher`;

                    // aquí iteramos cada voucher
                    for (const voucherUrl of urls) {
                        const jsonSend = {
                            codPedido: response?.data?._id,
                            nOperacion: new Date().getTime(),
                            documentoUsuario: user?.documentoUsuario,
                            fechaPago: moment.tz("America/Lima").format("YYYY-MM-DD"),
                            formaPago: getValues()?.formaPago,
                            monto: getValues()?.monto,
                            fechaVerificacion: "",
                            estadoVerificacion: "0",
                            conceptoPago: "pago pedido",
                            status: "0",
                            observaciones: "",
                            proyecto: Apis.PROYECTCURRENT,
                            url: voucherUrl,
                        }

                        const responseFinal = await apiCall({
                            method: 'post',
                            endpoint: url,
                            data: jsonSend
                        })
                        console.log("responsefuianl: ", responseFinal)
                    }

                    setTimeout(() => {
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
                        showLoaderOnConfirm: true,
                        allowOutsideClick: false,
                    });
                }
            }
        }
        catch (error) {
            console.error("Error al subir el voucher: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al subir el voucher',
                text: 'No se ha podido subir el voucher',
            });
        }
        finally {
            setLoading2(false)
            setValue("dataVoucher", null);
            setValue("monto", null);
            setValue("formaPago", null);
        }
    }


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
                            limitePEdidos > "0" && getValues()?.pagoTotal !== null && getValues()?.pagoTotal !== "" && getValues()?.pagoTotal !== undefined &&
                            // <Button disabled={loading} sx={{ width: "100%", backgroundColor: "#22b2aa", ":hover": { backgroundColor: "#006060", color: "white" }, fontWeight: "bold", color: "black" }} variant="contained" color="success" type="submit">
                            //     Realizar Pedido
                            // </Button>
                            <div className="flex flex-col md:flex-row justify-center items-center gap-1 mt-2">
                                {/* <div className="flex justify-center items-center gap-2 px-3 w-full">
                                    <button
                                        disabled={loading2}
                                        type="button"
                                        className={` text-[12px] text-white w-full py-2 px-2 rounded-sm  font-bold text-xl cursor-pointer ${loading2 ? "opacity-50 bg-slate-500" : "bg-violet-500"}`}
                                        onClick={() => {
                                            // setOpenPopup(true)
                                            setValue("siPasarelaPay", true)
                                            setValue("pasarelaPay", true)
                                            // setValue("montoPasarela", dataAsientos?.precio)
                                            setChangePasarela(!changePasarela);
                                        }}>
                                        PAGAR CON YAPE (Código Aprobación directo SIN subir voucher)
                                    </button>
                                </div> */}
                                <div className="flex justify-center items-center gap-2 px-3 w-full">
                                    <button type="button" className="bg-green-500 text-[12px] text-white w-full py-2 px-2 rounded-sm  font-bold text-xl cursor-pointer" onClick={() => {
                                        // setOpenPopup(true)
                                        setValue("noPasarelaPay", true)
                                        setValue("pasarelaPay", false)
                                        setValue("siPasarelaPay", false)
                                        setPaymentInitialized(false);
                                        initializationRef.current = false;

                                        hangeStatePopUp(true)
                                        setValue("dataPoUp", {
                                            title: `Subir Voucher de ${user?.nombres} - ${user?.documentoUsuario}`,
                                            infoOrder: "new",
                                            action: "subirVoucher",
                                        })
                                    }}>
                                        PAGAR CON transdferencia/QR (Subir Voucher OBLIGATORIO)
                                    </button>
                                </div>
                            </div>
                    }
                </form>
            </div>
            {
                getValues()?.pasarelaPay &&
                <div className="uppercase text-center text-base font-bold text-black">
                    {/* {"Datos Usuario"} */}
                    <div className="App">
                        <div className="loading" id='loading'></div>
                        <div className='hidden content'>
                            <div className="container mt-5">
                                <div className="hidden row">
                                    <div className='col-12 mt-3'>
                                        <button onClick={openForm} className='btn btn-primary'>Pagar</button>
                                    </div>
                                    <div className='col-12 mt-5'>
                                        <label>Response</label>
                                        <textarea id="authorizationResponse" className='form-control' readOnly rows={1}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {
                openPopup &&
                <PopUpGeneral getValues={getValues} setValue={setValue} control={control} hangeStatePopUp={hangeStatePopUp} handleSubirVouchers={handleSubirVouchers} loading2={loading2} pagoTransferencia={true} byAdmin={false} />
            }
        </div>
    )
}

export default RealizarPedidos