"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Autocomplete, Button, Card, CardContent, CardHeader, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Badge, Calendar, CheckCircle, Clock, MapPin, Package, RotateCcw, X } from "lucide-react";
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
            documentoUsuario: session?.documentoUsuario,
        }

        console.log("jsonFechas", jsonFechas);

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
        console.log("session", getValues()?.mesFiltro);

        // const today: any = moment().tz("America/Lima");
        const todayString = getValues()?.mesFiltro;
        const todayStringYear = moment.tz("America/Lima").format("YYYY-MM-DD")?.split?.("-")[0];
        // console.log("today", today);
        // console.log("todayString", todayString);
        // console.log("todayStringYear", todayStringYear);

        const matchMes: any = meses.find(mes => mes.value === todayString);
        console.log("matchMes", matchMes);
        // setValue("mesFiltro", matchMes.value);

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
            documentoUsuario: session?.documentoUsuario,
        }

        console.log("jsonFechas", jsonFechas);

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

    return (
        <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="ml-[60px] md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            {/* <div className="flex flex-row md:flex-row gap-1 items-center justify-center mt-5 ml-20 md:ml-0"> */}
            <div className="grid grid-cols-2 w-3/4 md:w-full ml-15 justify-center items-center md:ml-0 mt-5 gap-1">
                <div className="flex flex-col gap-0 text-white">
                    <div className="flex flex-col justify-start items-start gap-0 w-full">
                        <div className="uppercase text-sm font-bold text-white">{"Mes Búsqueda"}</div>
                        <div className="!w-full -mt-2">
                            <Controller
                                name={`mesFiltro`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Autocomplete
                                        options={meses}
                                        getOptionLabel={(option) => option.label}
                                        isOptionEqualToValue={(option, value) => option.value === value.value}
                                        value={meses.find(opt => opt.value === field.value) || null}
                                        onChange={(_, selectedOption) => {
                                            field.onChange(selectedOption?.value ?? null);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                // label={"Mes Busqueda"}
                                                margin="dense"
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                className="!w-full bg-slate-100 rounded-lg h-[40px]"
                                                sx={{
                                                    input: {
                                                        color: '#000', // texto negro
                                                        WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                        height: '8px',
                                                        border: 'none',
                                                        // borderRadius: '10px',
                                                        // backgroundColor: '#efefef',
                                                    },
                                                    '.Mui-disabled': {
                                                        WebkitTextFillColor: '#000 !important',
                                                        color: '#000 !important',
                                                        opacity: 1, // elimina el desvanecido
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => fetchDataPedidosClientesFiltro()} variant="outlined" color="primary">
                        {"Ver Historial"}
                    </Button>
                </div>
            </div>
            <div className="mt-5 !flex flex-col gap-3 !justify-center !items-center p-4 overflow-x-scroll md:overflow-x-hidden w-[500px] md:w-full">
                {
                    datos.length > 0 ?
                        datos?.map((item: any, index: number) => {
                            return (
                                // <>
                                //     <div className="w-4/5 md:w-full flex flex-col justify-center items-center gap-3 border-2 border-[#005c5c] bg-[rgba(255,255,255,0.1)] rounded-lg p-4">
                                //         <div className="flex justify-center items-center gap-2">

                                //             <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[100px]">
                                //                 {`Pedido #${index + 1}`}
                                //             </div>
                                //         </div>
                                //         <div className="flex justify-center items-center gap-2">
                                //             <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                //                 PAQUETES
                                //             </div>
                                //             <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[100px]">
                                //                 {item?.cantidadPaquetes}
                                //             </div>
                                //         </div>

                                //         <div className="flex justify-center items-center gap-2 w-full mt-5">
                                //             <div className="flex flex-col justify-center items-center gap-2">
                                //                 <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold md-text-base text-xs">
                                //                     FECHA DE PEDIDO
                                //                 </div>
                                //                 <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-full">
                                //                     {item?.fechaPedido?.split?.("T")[0].split?.("-")[2]}
                                //                     -
                                //                     {item?.fechaPedido?.split?.("T")[0].split?.("-")[1]}
                                //                     -
                                //                     {item?.fechaPedido?.split?.("T")[0].split?.("-")[0]}
                                //                 </div>
                                //             </div>
                                //             <div className="flex flex-col justify-center items-center gap-2">
                                //                 <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold md-text-base text-xs">
                                //                     FECHA DE ENTREGA
                                //                 </div>
                                //                 <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-full">
                                //                     {item?.fechaEntregaPedido}
                                //                 </div>
                                //             </div>
                                //         </div>

                                //         <div>
                                //             <div className="flex flex-col justify-center items-center gap-2 m-5">
                                //                 <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                //                     LUGAR DE ENTREGA
                                //                 </div>
                                //                 <div className="flex justify-center items-center gap-2 w-3/4">
                                //                     <div style={{ backgroundColor: item.lugarEntrega == "1" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                //                         {"Domicilio"}
                                //                     </div>
                                //                     <div style={{ backgroundColor: item.lugarEntrega == "2" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                //                         {"Oficina-Orbes"}
                                //                     </div>
                                //                 </div>
                                //                 <div className="flex justify-center items-center gap-2">
                                //                     <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[350px] h-[50px]">
                                //                         {item.direccionEntrega}
                                //                     </div>
                                //                 </div>
                                //             </div>
                                //         </div>

                                //         <div>
                                //             <div className="flex flex-col justify-center items-center gap-2">
                                //                 <div className="bg-cyan-200 px-3 py-2 rounded-md text-black font-bold">
                                //                     ESTADO
                                //                 </div>
                                //                 <div className="flex justify-center items-center gap-2 w-3/4">
                                //                     <div style={{ backgroundColor: item.status == "1" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                //                         {"Entregado"}
                                //                     </div>
                                //                     <div style={{ backgroundColor: item.status == "0" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                //                         {"Pendiente"}
                                //                     </div>
                                //                     <div style={{ backgroundColor: item.status == "2" ? "#ff0" : "" }} className="bg-slate-50 px-3 py-2 rounded-md text-black w-full text-center">
                                //                         {"Rerogramar"}
                                //                     </div>
                                //                 </div>
                                //                 <div className="flex justify-center items-center gap-2">
                                //                     <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[350px] h-[50px]">
                                //                         {"NOTA:"}
                                //                     </div>
                                //                 </div>
                                //             </div>
                                //         </div>
                                //     </div>
                                // </>
                                <div className="w-3/4 md:w-full max-w-md mx-auto">
                                    <Card className="border-2 border-[#22B2AA] shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                                        <div className="bg-gradient-to-r from-[#22B2AA] to-[#007C7C] text-white py-1 px-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold">Pedido #{index + 1}</h3>
                                                    {/* <p className="text-[#FFFFFF] text-sm">Paquetes de Huevos</p> */}
                                                </div>
                                                <div className="bg-white/20 rounded-full p-2">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 space-y-4">
                                            {/* Cantidad de paquetes */}
                                            <div className="flex items-center justify-between bg-[#22B2AA]/5 rounded-lg p-3 border border-[#22B2AA]/20">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-5 w-5 text-[#007C7C]" />
                                                    <span className="font-medium text-[#007C7C]">Paquetes</span>
                                                </div>
                                                <span className="text-2xl font-bold text-[#007C7C]">{item.cantidadPaquetes}</span>
                                            </div>

                                            {/* Fechas */}
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center gap-3 p-2">
                                                    <Calendar className="h-4 w-4 text-[#007C7C]" />
                                                    <div>
                                                        <p className="text-xs text-[#007C7C]/70 uppercase tracking-wide font-medium">Fecha de Pedido</p>
                                                        <p className="text-sm font-semibold text-[#007C7C]">{item.fechaPedido?.split?.("T")[0].split?.("-")[2]}-{item.fechaPedido?.split?.("T")[0].split?.("-")[1]}-{item.fechaPedido?.split?.("T")[0].split?.("-")[0]}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-2">
                                                    <Clock className="h-4 w-4 text-[#007C7C]" />
                                                    <div>
                                                        <p className="text-xs text-[#007C7C]/70 uppercase tracking-wide font-medium">{"Fecha de Entrega (referencial)"}</p>
                                                        <p className="text-sm font-semibold text-[#007C7C]">{item.fechaEntregaPedido?.split?.("T")[0].split?.("-")[2]}-{item.fechaEntregaPedido?.split?.("T")[0].split?.("-")[1]}-{item.fechaEntregaPedido?.split?.("T")[0].split?.("-")[0]}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lugar de entrega */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-[#007C7C]" />
                                                    <span className="text-xs text-[#007C7C]/70 uppercase tracking-wide font-medium">Lugar de Entrega</span>
                                                </div>
                                                <div className="bg-[#22B2AA]/5 rounded-lg p-3 border border-[#22B2AA]/20">
                                                    <p className="font-semibold text-[#007C7C] text-sm">{item.lugarEntrega == "1" ? "Domicilio" : item.lugarEntrega == "2" ? "Oficina Orbes" : ""}</p>
                                                    <p className="text-xs text-[#007C7C]/80 mt-1">{`${item.direccionEntrega ?? ""} / ${item?.celular ?? ""}`}</p>
                                                </div>
                                            </div>

                                            {/* Estado */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-[#007C7C]/70 uppercase tracking-wide font-medium">Estado</span>
                                                <div className={`${item.status == "0" ? "bg-yellow-500 hover:bg-yellow-700" : item.status == "1" ? "bg-green-500 hover:bg-green-700" : item.status == "2" ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"} rounded-lg text-xs font-medium px-2 py-1`}>
                                                    {/* <StatusIcon className="h-3 w-3 mr-1" /> */}
                                                    {item.status == "0" ? "Pendiente" : item.status == "1" ? "Entregado" : item.status == "2" ? "En Ruta" : item.status == "3" && "Rechazado"}
                                                </div>
                                            </div>

                                            {/* Notas */}
                                            {/* {notes && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-[#007C7C]/70 uppercase tracking-wide font-medium">Notas</p>
                                                    <div className="bg-[#FFFFFF] border border-[#22B2AA]/30 rounded-lg p-3">
                                                        <p className="text-sm text-[#007C7C]/90 italic">{notes}</p>
                                                    </div>
                                                </div>
                                            )} */}
                                        </CardContent>
                                    </Card>
                                </div>
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