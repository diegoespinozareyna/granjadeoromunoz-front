"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { changeDecimales } from "@/app/utils/functions/changeDecimales";
import { Button, TextField } from "@mui/material"
import { jwtDecode } from "jwt-decode";
import { DollarSign, PrinterCheck, Weight, X } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";

interface Pedido {
    status: string;
    pagoTotal: string;
    cantidadPaquetes: string;
}

const CobrarUtilidad = () => {

    const router = useRouter();
    const user = useUserStore((state) => state.user);
    console.log("user", user);

    const fetchUserId = async (id: any) => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getUserIdById`;
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                id: id,
            }
        });
        console.log("response", response);
        setValue("userId", response?.data);
    }

    useEffect(() => {

        fetchUserId(user?._id);

        if (user?.isCobrar !== "1") {
            Swal.fire({
                icon: 'error',
                title: 'Su Usuario no tiene permitido el cobro de utilidades',
                // text: 'No se ha podido editar el voucher',
                timer: 1000
            })
            setTimeout(() => {
                router.push(`/dashboard/${Apis.PROYECTCURRENT}`);
            }, 1000);
        }

        console.log("user?.banco", user);

        setValue("banco", user?.banco ?? "Sin Datos");
        setValue("numeroCuenta", user?.numeroCuenta ?? "Sin Datos");
        setValue("cciCuenta", user?.cciCuenta ?? "Sin Datos");
        setValue("titularCuenta", user?.titularCuenta ?? "Sin Datos");
    }, [user])

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

        const numPAquetes = response?.data?.filter((x: Pedido) => x.status === "1")?.reduce((acc: any, cur: any) => acc + Number(cur?.cantidadPaquetes ?? 0), 0)
        const kilosTotales = numPAquetes * 11;
        const efectivoRecaudado: number = response?.data?.filter((x: Pedido) => x.status === "1")?.reduce((acc: number, cur: Pedido) => acc + Number(cur?.pagoTotal ?? 0), 0);
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

    const [popup, setPopup] = useState<any>({
        status: false,
        title: "",
        infoUsuario: "",
        action: "",
    });

    const handleGetVouchersAll = async (id: string) => {
        console.log("id", id);
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getVouchersAll`;
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                id: id,
                proyecto: Apis.PROYECTCURRENT,
            }
        });
        console.log("response", response);
        setValue("VouchersAll", response?.data?.filter((item: any) => item?.status !== "2"));
    }

    const handleVouchersUser = async (user: any) => {
        try {
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getVouchersAll`;
            const response = await apiCall({
                method: "get", endpoint: url, data: null, params: {
                    id: user?._id,
                    proyecto: Apis.PROYECTCURRENT,
                }
            });
            console.log("response", response?.data);
            setValue("VouchersAll", response?.data?.filter((item: any) => item?.status !== "2"));
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            localStorage.removeItem("auth-token");
            window.location.href = '/';
        }
    }

    const handleEditVoucher = async (id: any, idPedido: string, idUsuario: string) => {
        console.log("id", id);
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getEditVoucher`;
        try {
            const response = await apiCall({
                method: "patch", endpoint: url, data: {
                    id: id,
                    status: getValues()?.status,
                    observaciones: getValues()?.observaciones,
                    proyecto: Apis.PROYECTCURRENT,
                }
            })
            console.log("response", response);
            if (response?.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Voucher editado',
                    text: 'Se ha editado el voucher',
                    timer: 2000
                });
                if (getValues()?.status === "1") {
                    const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/patchZeroUtilidades`;
                    const response = await apiCall({
                        method: "patch", endpoint: url, data: {
                            id: idUsuario,
                            utilidad1: "0",
                            utilidad2: "0",
                            utilidad3: "0",
                            utilidad4: "0",
                            utilidad5: "0",
                            utilidad6: "0",
                            utilidad7: "0",
                            utilidad8: "0",
                            utilidad9: "0",
                            utilidad10: "0",
                        }
                    });
                    console.log("response", response?.data);
                }
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2000);
                setValue("status", "");
                setValue("observaciones", "");
                await handleGetVouchersAll(idPedido);
            }
        } catch (error) {
            console.error("Error al editar el voucher: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al editar el voucher',
                text: 'No se ha podido editar el voucher',
                timer: 2000
            })
        }
    }

    const handleDatosCuenta = async (user: any) => {
        try {
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/patchDatosCuentaBancaria`;
            const response = await apiCall({
                method: "patch", endpoint: url, data: {
                    id: user?._id,
                    banco: getValues()?.banco,
                    numeroCuenta: getValues()?.numeroCuenta,
                    cciCuenta: getValues()?.cciCuenta,
                    titularCuenta: getValues()?.titularCuenta,
                    proyecto: Apis.PROYECTCURRENT,
                }
            })
            console.log("response", response);
            if (response?.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Datos de la Cuenta actualizados',
                    text: 'Se ha actualizado los datos de la cuenta',
                    timer: 2000
                });
                setValue("banco", "");
                setValue("numeroCuenta", "");
                setValue("cciCuenta", "");
                setValue("titularCuenta", "");
                localStorage.removeItem("auth-token");
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error("Error al editar el voucher: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al editar el voucher',
                text: 'No se ha podido editar el voucher',
                timer: 2000
            })
        }
    }

    return (
        <div>
            <div className="w-full flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden mb-8">
                <div className="ml-[60px] md:ml-0">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                        {"<< Atras"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 justify-center items-center mt-5 rounded-lg p-3 px-10 bg-[rgba(255,255,255,0.2)] w-[350px] mx-2">
                    {/* <div className="font-bold text-slate-700 text-3xl text-center">
                        {"Paquetes Totales Entregados:"}
                    </div>
                    <div className="font-bold text-yellow-500 text-6xl text-center">
                        {"3,707.00"}
                    </div> */}
                    <div className="p-2 rounded-lg bg-[#007c7c] flex flex-col justify-center items-center w-full">
                        <div className="flex justify-center items-center gap-2">
                            <div className="rounded-lg bg-[rgba(255,255,255,0.5)]">
                                <Weight size={40} className="mx-auto p-2" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-2 mt-2">
                            <div className="font-bold text-white text-3xl text-center">
                                {/* {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`} */}
                                {`40,777.00 Kg.`}
                            </div>
                            <div className="font-bold text-yellow-500 text-lg text-center">
                                {"Total Kilos Vendidos"}
                            </div>
                        </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#007c7c] flex flex-col justify-center items-center w-full">
                        <div className="flex justify-center items-center gap-2">
                            <div className="rounded-lg bg-[rgba(255,255,255,0.5)]">
                                <DollarSign size={40} className="mx-auto p-2" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-2 mt-2">
                            <div className="font-bold text-white text-3xl text-center">
                                {/* {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`} */}
                                {`S/.32,621.60`}
                            </div>
                            <div className="font-bold text-yellow-500 text-lg text-center">
                                {"Utilidad Trimestral (Julio - Setiembre)"}
                            </div>
                        </div>
                    </div>


                    {
                        user?.userType !== "admin" &&
                        <>

                            {
                                user?.membresia500 !== "0" &&
                                <div className="p-2 rounded-lg bg-[#007c7c] flex flex-col justify-center items-center w-full">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="rounded-lg bg-[rgba(255,255,255,0.5)]">
                                            <DollarSign size={40} className="mx-auto p-2" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-2 mt-2">
                                        <div className="font-bold text-white text-3xl text-center">
                                            {/* {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`} */}
                                            {user?.membresia500 !== "0" && "S/. 16,310.80"}
                                        </div>
                                        <div className="font-bold text-yellow-500 text-lg text-center">
                                            {user?.membresia500 !== "0" && "Utilidad Membresía Empresario (Grupal)"}
                                        </div>
                                    </div>
                                </div>
                            }

                            {
                                user?.menbresia200 !== "0" &&
                                <div className="p-2 rounded-lg bg-[#007c7c] flex flex-col justify-center items-center w-full">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="rounded-lg bg-[rgba(255,255,255,0.5)]">
                                            <DollarSign size={40} className="mx-auto p-2" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-2 mt-2">
                                        <div className="font-bold text-white text-3xl text-center">
                                            {/* {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`} */}
                                            {user?.menbresia200 !== "0" && "S/. 9,786.48"}
                                        </div>
                                        <div className="font-bold text-yellow-500 text-lg text-center">
                                            {user?.menbresia200 !== "0" && "Utilidad Membresía Emprendedor (Grupal)"}
                                        </div>
                                    </div>
                                </div>
                            }

                            <div className="p-2 rounded-lg bg-[#007c7c] flex flex-col justify-center items-center w-full">
                                <div className="flex justify-center items-center gap-2">
                                    <div className="rounded-lg bg-[rgba(255,255,255,0.5)]">
                                        <DollarSign size={40} className="mx-auto p-2" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2 mt-2">
                                    <div className="font-bold text-white text-3xl text-center">
                                        {/* {`${Number(datos?.kilosTotales)?.toFixed(0)} Kg.`} */}
                                        {`S/. ${changeDecimales(user?.utilidad1) ?? "No Corresponde"}`}
                                    </div>
                                    <div className="font-bold text-yellow-500 text-lg text-center">
                                        {"Utilidad Asignada"}
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    <button
                        className="bg-[#007c7c] hover:bg-green-900 text-amber-300 font-bold px-2 py-1 rounded-lg cursor-pointer border-1 border-white w-full mt-4"
                        color="primary"
                        onClick={() => {
                            handleVouchersUser(user);
                            setPopup({
                                status: true,
                                title: "Detalles de la Cuenta Bancaria",
                                infoUsuario: user,
                                action: "repartir",
                            })
                        }}
                    >
                        {"COBRAR UTILIDADES"}
                    </button>
                </div>
                {
                    popup.status &&
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(50,50,50,0.8)]">
                        <div onClick={() => setPopup({
                            ...popup,
                            status: false,
                        })} className="absolute z-10 top-0 right-0 cursor-pointer bg-transparent shadow w-[1000vh] h-[1000vh]">
                            .
                        </div>
                        <div className="relative z-20 bg-white p-6 rounded-lg shadow-lg m-2 flex flex-col justify-center items-center overflow-y-auto max-h-[90vh] w-full sm:w-[400px] md:w-[500px] lg:w-[600px]">
                            <h2 className="text-xl font-bold mb-4">
                                {popup.title}
                                <div>
                                    <X onClick={() => setPopup({
                                        ...popup,
                                        status: false,
                                    })} className="absolute top-2 right-2 cursor-pointer text-red-600 hover:text-red-800" size={20} />
                                </div>
                            </h2>
                            <div className="w-full flex flex-col justify-center items-center gap-4">
                                <div>
                                    <Controller
                                        name={`banco`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                // label={item.label}
                                                variant="outlined"
                                                // placeholder={item.placeholder}
                                                size="small"
                                                // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                disabled={false}
                                                required={true}
                                                type={"text"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                label="Banco"
                                                // multiline={true}
                                                // minRows={2}
                                                className="w-full bg-[#efefef]"
                                                sx={{
                                                    input: {
                                                        color: '#000', // texto negro
                                                        WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#efefef',
                                                    },
                                                    '.Mui-disabled': {
                                                        WebkitTextFillColor: '#000 !important',
                                                        color: '#000 !important',
                                                        opacity: 1, // elimina el desvanecido
                                                    },
                                                }}
                                                onChange={(e: any) => {
                                                    let value = e.target.value;
                                                    // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name={`numeroCuenta`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                // label={item.label}
                                                variant="outlined"
                                                // placeholder={item.placeholder}
                                                size="small"
                                                // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                disabled={false}
                                                required={true}
                                                type={"text"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                label="Numero de Cuenta Bancaria"
                                                // multiline={true}
                                                // minRows={2}
                                                className="w-full bg-[#efefef]"
                                                sx={{
                                                    input: {
                                                        color: '#000', // texto negro
                                                        WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#efefef',
                                                    },
                                                    '.Mui-disabled': {
                                                        WebkitTextFillColor: '#000 !important',
                                                        color: '#000 !important',
                                                        opacity: 1, // elimina el desvanecido
                                                    },
                                                }}
                                                onChange={(e: any) => {
                                                    let value = e.target.value;
                                                    // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name={`cciCuenta`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                // label={item.label}
                                                variant="outlined"
                                                // placeholder={item.placeholder}
                                                size="small"
                                                // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                disabled={false}
                                                required={true}
                                                type={"text"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                label="CCI de Cuenta Bancaria"
                                                // multiline={true}
                                                // minRows={2}
                                                className="w-full bg-[#efefef]"
                                                sx={{
                                                    input: {
                                                        color: '#000', // texto negro
                                                        WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#efefef',
                                                    },
                                                    '.Mui-disabled': {
                                                        WebkitTextFillColor: '#000 !important',
                                                        color: '#000 !important',
                                                        opacity: 1, // elimina el desvanecido
                                                    },
                                                }}
                                                onChange={(e: any) => {
                                                    let value = e.target.value;
                                                    // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name={`titularCuenta`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                // label={item.label}
                                                variant="outlined"
                                                // placeholder={item.placeholder}
                                                size="small"
                                                // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                disabled={false}
                                                required={true}
                                                type={"text"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                label="Titular de Cuenta Bancaria"
                                                // multiline={true}
                                                // minRows={2}
                                                className="w-full bg-[#efefef]"
                                                sx={{
                                                    input: {
                                                        color: '#000', // texto negro
                                                        WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#efefef',
                                                    },
                                                    '.Mui-disabled': {
                                                        WebkitTextFillColor: '#000 !important',
                                                        color: '#000 !important',
                                                        opacity: 1, // elimina el desvanecido
                                                    },
                                                }}
                                                onChange={(e: any) => {
                                                    let value = e.target.value;
                                                    // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded-lg cursor-pointer"
                                        color="primary"
                                        onClick={() => {
                                            handleDatosCuenta(user)
                                        }}
                                    >
                                        {"Agregar/Cambiar Datos de Cuenta Bancaria"}
                                    </button>
                                </div>
                                <div className={`${getValues()?.VouchersAll?.length > 0 ? "flex flex-col" : "flex flex-row"} gap-2 w-full`}>
                                    {`Vouchers Subidos(dar clic en la imagen para aprobar su pago):`}
                                    <div className="mt-0 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-1 justify-center items-center w-full">
                                        {
                                            getValues()?.VouchersAll?.length > 0 ?
                                                getValues()?.VouchersAll?.map((item: any, index: number) => (
                                                    <div key={index} className="flex flex-col justify-between items-center border-2 border-[#22B2AA] rounded-lg p-3 px-2">
                                                        <img
                                                            src={item.url}
                                                            alt={`Voucher ${index + 1}`}
                                                            className="w-full h-auto rounded-lg shadow-md cursor-pointer"
                                                            onClick={async () => {
                                                                if (false) {
                                                                    const { isConfirmed } = await Swal.fire({
                                                                        title: `Cambiar Status de voucher`,
                                                                        html: `
                                                                                                                                        <select id="status" class="swal2-input">
                                                                                                                                          <option value="">Selecciona un estado</option>
                                                                                                                                          <option value="1">Verificado Correctamente</option>
                                                                                                                                        </select>
                                                                                                                                      `,
                                                                        focusConfirm: false,
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Actualizar',
                                                                        cancelButtonText: 'Cancelar',
                                                                        confirmButtonColor: '#3085d6',
                                                                        cancelButtonColor: '#d33',
                                                                        width: '400px',
                                                                        allowOutsideClick: () => !Swal.isLoading(),
                                                                        showLoaderOnConfirm: true,
                                                                        preConfirm: async () => {
                                                                            const estado = (document.getElementById('status') as HTMLSelectElement)?.value;
                                                                            (estado !== undefined && estado !== null && estado !== "") && (setValue("status", estado));
                                                                            const comentario = (document.getElementById('comentario') as HTMLTextAreaElement)?.value.trim();
                                                                            (comentario !== undefined && comentario !== null && comentario !== "") && (setValue("observaciones", comentario));

                                                                            if (!estado) {
                                                                                Swal.showValidationMessage('Debes seleccionar un estado');
                                                                                return;
                                                                            }

                                                                            // if (!comentario) {
                                                                            //     Swal.showValidationMessage('Debes escribir un comentario');
                                                                            //     return;
                                                                            // }

                                                                            try {
                                                                                await handleEditVoucher(item?._id, item.codPedido, popup?.infoUsuario?._id);
                                                                            } catch (error) {
                                                                                Swal.showValidationMessage(`Error al actualizar: ${error}`);
                                                                            }
                                                                        }
                                                                    });

                                                                    if (isConfirmed) {
                                                                        Swal.fire({
                                                                            icon: 'success',
                                                                            title: 'Estado actualizado',
                                                                            text: `El estado del pedido fue actualizado correctamente.`,
                                                                            timer: 2000
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <div className="">
                                                            {
                                                                item.status &&
                                                                <div className={`font-bold text-xs text-gray-600 mt-1 ${item.status === "0" ? "text-yellow-600" : item.status === "1" ? "text-green-600" : "text-red-600"}`}>
                                                                    {item.status === "0" ? "Pendiente" : item.status === "1" ? "Aceptado" : item.status === "2" && "Rechazado"}
                                                                </div>
                                                            }
                                                            {/* {
                                                                item.formaPago &&
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    {"Forma de Pago: " + (item.formaPago === "0" ? "Efectivo" : item.formaPago === "1" ? "Yape" : "Transferencia")}
                                                                </div>
                                                            }
                                                            {
                                                                item.monto &&
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    {"Monto: S/." + item.monto}
                                                                </div>
                                                            }
                                                            {
                                                                item.observaciones &&
                                                                <div className="text-xs text-red-300 mt-1">
                                                                    {`Observaciones: ${item.observaciones}`}
                                                                </div>
                                                            }
                                                            {
                                                                item.conceptoPago &&
                                                                <div className="text-xs text-red-300 mt-1">
                                                                    {`Observaciones: ${item.conceptoPago}`}
                                                                </div>
                                                            } */}
                                                        </div>
                                                    </div>
                                                ))
                                                :
                                                <div className="font-bold text-xs">No Tiene Vouchers Subidos</div>
                                        }
                                    </div>
                                    {/* :
                                                                        <div className="flex justify-start items-center gap-1">
                                                                            {"Este pedido no cuenta con Vouchers subidos."}
                                                                        </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default CobrarUtilidad