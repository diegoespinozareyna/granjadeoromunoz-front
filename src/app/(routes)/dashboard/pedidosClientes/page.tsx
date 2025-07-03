"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const PedidosClientes = () => {

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

    const fetchDataPedidosClientes = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedidos`;
        console.log("session", session?.documentoUsuario);

        const today = moment().tz("America/Lima");

        // Día de la semana (0: domingo, 6: sábado)
        const dayOfWeek = today.day();

        // Calcular fecha de inicio del sábado
        const fechaInicio = dayOfWeek === 6
            ? today.clone().startOf('day')
            : today.clone().subtract((dayOfWeek + 1) % 7, 'days').startOf('day');

        // Calcular fecha de fin del viernes (6 días después, en zona Lima)
        const fechaFin = fechaInicio.clone().add(6, 'days').endOf('day').tz("America/Lima", true);

        const jsonFechas = {
            fechaInicio: fechaInicio.format('DD-MM-YYYY'),
            fechaFin: fechaFin.format('DD-MM-YYYY'),
            documentoUsuario: session?.documentoUsuario,
        };

        setValue("fechaInicio", fechaInicio.format('YYYY-MM-DD'));
        setValue("fechaFin", fechaFin.format('YYYY-MM-DD'));

        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                documentoUsuario: session?.documentoUsuario,
                fechaInicio: fechaInicio.format('DD-MM-YYYY'),
                fechaFin: fechaFin.format('DD-MM-YYYY'),
            }
        });
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

    const fetchDataPedidosClientesFiltro = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedidos`;

        console.log("fecahInicio", getValues()?.fechaInicio?.split?.("T")[0].split?.("-")[2]);
        console.log("fecahInicio", getValues()?.fechaInicio?.split?.("T")[0]);
        console.log("fechaFin", getValues()?.fechaFin?.split?.("T")[0].split?.("-")[2]);
        console.log("fechaFin", getValues()?.fechaFin?.split?.("T")[0]);

        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                documentoUsuario: session?.documentoUsuario,
                fechaInicio: `${getValues()?.fechaInicio?.split?.("T")[0].split?.("-")[2]}-${getValues()?.fechaInicio?.split?.("T")[0].split?.("-")[1]}-${getValues()?.fechaInicio?.split?.("T")[0].split?.("-")[0]}`,
                fechaFin: `${getValues()?.fechaFin?.split?.("T")[0].split?.("-")[2]}-${getValues()?.fechaFin?.split?.("T")[0].split?.("-")[1]}-${getValues()?.fechaFin?.split?.("T")[0].split?.("-")[0]}`,
            }
        });
        console.log("response", response);
        setDatos(response?.data);
    }

    return (
        <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="ml-[60px] md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            {/* <div className="flex flex-row md:flex-row gap-1 items-center justify-center mt-5 ml-20 md:ml-0"> */}
            <div className="grid grid-cols-3 w-3/4 md:w-full justify-end items-end ml-15 md:ml-0 mt-5 gap-1">
                <div className="flex flex-col gap-0 text-white">
                    <div>Fecha Inicio</div>
                    <Controller
                        name={`fechaInicio`}
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
                                // defaultValue={moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm")}
                                disabled={false}
                                required={false}
                                type={"date"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                multiline={false}
                                minRows={1}
                                className="w-full"
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
                                    console.log("value", value);
                                    field.onChange(value); // ISO string con zona Lima (sin Z al final)
                                }}
                            />
                        )}
                    />
                </div>
                <div className="flex flex-col gap-0 text-white">
                    <div>Fecha Inicio</div>
                    <Controller
                        name={`fechaFin`}
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
                                // defaultValue={moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm")}
                                disabled={false}
                                required={false}
                                type={"date"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                multiline={false}
                                minRows={1}
                                className="w-full"
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
                                    field.onChange(value); // ISO string con zona Lima (sin Z al final)
                                }}
                            />
                        )}
                    />
                </div>
                <div className="mt-7">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => fetchDataPedidosClientesFiltro()} variant="outlined" color="primary">
                        {"Filtrar"}
                    </Button>
                </div>
            </div>
            <div className="mt-5 !flex flex-col gap-3 !justify-center !items-center p-4 overflow-x-scroll md:overflow-x-hidden w-[500px] md:w-full">
                {
                    datos.length > 0 ?
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
                        :
                        <div className="flex flex-col items-center justify-center gap-2 w-full">
                            <div className="font-bold text-xl text-red-300">{"Usted no ha realizado ningún pedido"}</div>
                            <div className="font-bold text-xl text-red-300">{"en este periodo..."}</div>
                            <div className="font-bold text-base text-red-300">{""}</div>
                        </div>
                }
            </div>
        </div>
    )
}

export default PedidosClientes