
"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Autocomplete, Button, Card, CardContent, CardHeader, IconButton, InputAdornment, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Badge, Calendar, CheckCircle, Clock, CloudAlertIcon, CloudUpload, Edit, Edit2Icon, Eye, EyeOff, ListCheck, Loader2, MapPin, Package, PencilLine, RotateCcw, ScrollText, SearchIcon, X } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import { useConfigStore } from "@/app/store/userStore";
import { PopUpGeneral } from "@/app/components/popup/PopUpGeneral";
import { usePopupOpen } from "@/app/hooks/popupopen/usePopupOpen";
import axios from "axios";

interface Stock {
    stockContable: string,
    stockDisponible: string,
    stockEntregado: string,
    proyecto: string;
}

const pedidosAdmin = () => {
    const router = useRouter();

    const config = useConfigStore((state) => state.config);
    console.log("config", config);

    const { getValues, setValue, handleSubmit, control, watch } = useForm()

    const formAll = watch(["monto", "formaPago", "dataVoucher"]);
    console.log("formAll", formAll);

    const { openPopup, hangeStatePopUp } = usePopupOpen();

    const oneRender = useRef(true);

    const { apiCall } = useApi()

    const [loading, setLoading] = useState("");
    const [loading2, setLoading2] = useState(false);

    const [session, setSession] = useState<any>(null);
    const [datos, setDatos] = useState<any>([]);
    const [stock, setStock] = useState<any>([]);
    const [precioKilos, setPrecioKilos] = useState<any>('');

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
        setPrecioKilos(Number(config?.precioKiloHuevos ?? 0));
    }, [config])

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
        setDatos(response?.data);
    }

    const fetchStock = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/stock`
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                proyecto: Apis.PROYECTCURRENT,
            }
        });
        console.log("response", response?.data?.find((stock: Stock) => stock.proyecto === Apis.PROYECTCURRENT));
        setStock(response?.data?.find((stock: Stock) => stock.proyecto === Apis.PROYECTCURRENT));
    }

    useEffect(() => {
        if (oneRender.current && session !== null) {
            fetchDataPedidosClientes();
            fetchStock();
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
            documentoUsuario: getValues()?.documentoUsuario ?? "",
            statusFiltro: getValues()?.statusFiltro ?? null,
        }

        console.log("jsonFechas", jsonFechas);

        setValue("fechaInicio", fechaInicio.format('YYYY-MM-DD'));
        setValue("fechaFin", fechaFin.format('YYYY-MM-DD'));

        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                documentoUsuario: getValues()?.documentoUsuario ?? "",
                fechaInicio: fechaInicio.format('DD-MM-YYYY'),
                fechaFin: fechaFin.format('DD-MM-YYYY'),
                statusFiltro: getValues()?.statusFiltro ?? null,
            }
        });
        console.log("response", response);
        setDatos(response?.data);
    }

    const handleChangeState = async (id: string, dni: string, nombres: string) => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/changeStatusPedido`;
        console.log("url", url);

        const { isConfirmed } = await Swal.fire({
            title: `Cambiar estado del pedido de ${nombres} - ${dni}`,
            html: `
            <select id="estado" class="swal2-input">
              <option value="">Selecciona un estado</option>
              <option value="0">Pendiente</option>
              <option value="1">Entregado</option>
              <option value="2">En Ruta</option>
              <option value="3">Rechazado</option>
            </select>
            <textarea id="comentario" class="swal2-textarea" placeholder="Escribe un comentario"></textarea>
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
                const estado = (document.getElementById('estado') as HTMLSelectElement).value;
                const comentario = (document.getElementById('comentario') as HTMLTextAreaElement).value.trim();

                if (!estado) {
                    Swal.showValidationMessage('Debes seleccionar un estado');
                    return;
                }

                if (!comentario) {
                    Swal.showValidationMessage('Debes escribir un comentario');
                    return;
                }

                try {
                    const response = await apiCall({
                        method: 'patch',
                        endpoint: url,
                        data: {
                            status: estado,
                            comentario,
                            id
                        }
                    });

                    if (response.status === 201) {
                        return { estado, comentario }; // Devuelve valores para usarlos fuera
                    } else {
                        Swal.showValidationMessage('Error al actualizar el estado');
                    }
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

            fetchDataPedidosClientesFiltro();
        }
    };

    const handleChangeFechaEntrega = async (id: string, dni: string, nombres: string) => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/changeStatusFechaEntregaPedido`;
        console.log("url", url);

        const { value: nuevaFecha } = await Swal.fire({
            title: `Cambiar fecha de entrega de ${nombres} - ${dni}`,
            input: 'date',
            inputLabel: 'Nueva fecha de entrega',
            inputPlaceholder: 'Selecciona una fecha',
            showCancelButton: true,
            confirmButtonText: 'Reprogramar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            width: '300px',
            inputValidator: (value) => {
                if (!value) return 'Debes ingresar una fecha válida';
            },
            allowOutsideClick: () => !Swal.isLoading(),
            showLoaderOnConfirm: true,
            preConfirm: async (fechaSeleccionada) => {
                try {
                    const response = await apiCall({
                        method: 'patch',
                        endpoint: url,
                        data: {
                            fechaEntregaPedido: moment.tz(fechaSeleccionada, "YYYY-MM-DD", "America/Lima").toISOString(),
                            id: id
                        }
                    });
                    if (response.status === 201) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Fecha actualizada',
                            text: `La fecha de entrega fue actualizada correctamente.`,
                            timer: 2000
                        });
                        console.log("response: ", fechaSeleccionada, id);
                        fetchDataPedidosClientesFiltro();
                    }
                } catch (error) {
                    Swal.showValidationMessage(`Error al actualizar: ${error}`);
                }
            }
        });

        if (nuevaFecha !== undefined) {
            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `El estado del pedido fue actualizado correctamente.`,
                timer: 2000
            });
        }
        // console.log("response", response);
        // setDatos(response?.data);
    }

    const [busqueda, setBusqueda] = useState('');

    const datosFiltrados = datos?.filter((item: any) => {
        // console.log("item", item);
        const filtro = (
            item?.nombresUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoPaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoMaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.distritoEntrega?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.documentoUsuario?.toLowerCase() == (busqueda?.toLowerCase()) ||
            item?.cantidadPaquetes?.toLowerCase() == (busqueda?.toLowerCase())
        );
        return filtro
    }
    );
    console.log("datosFiltrados", datosFiltrados);

    const [arrUrls, setArrUrls] = useState<any>([]);

    const exportarExcel = () => {
        let res: any = [];

        const fetchUrls = async () => {
            try {
                const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getVouchersAllFull`;
                const response = await apiCall({
                    method: "get", endpoint: url, data: null, params: {
                        proyecto: Apis.PROYECTCURRENT,
                    }
                });
                console.log("response", response);
                if (response?.status === 200) {
                    setArrUrls(response?.data);
                    // 1. Preparar los datos que quieres exportar
                    const datosParaExcel = datosFiltrados.map((pedido: any) => ({
                        Estado:
                            pedido.status == "0"
                                ? "Pendiente"
                                : pedido.status == "1"
                                    ? "Entregado"
                                    : pedido.status == "2"
                                        ? "En Ruta"
                                        : "Rechazado",
                        Usuario: `${pedido.nombresUsuario} ${pedido.apellidoPaternoUsuario || ""} ${pedido.apellidoMaternoUsuario || ""}`,
                        DNI: pedido.documentoUsuario,
                        Telefono: pedido.celularEntrega || "-",
                        // Fecha_Pedido: new Date(pedido.fechaPedido).toLocaleDateString(),
                        Fecha_Pedido: pedido.fechaPedido?.split?.("T")[0] || "",
                        Fecha_Entrega: pedido.fechaEntregaPedido?.split?.("T")[0] || "",
                        Paquetes: pedido.cantidadPaquetes,
                        Kilos: pedido.kilos,
                        Pago_Total: pedido.pagoTotal,
                        Dirección: pedido.direccionEntrega || "-",
                        Distrito: pedido.distritoEntrega || "-",
                        Provincia: pedido.provinciaEntrega || "-",
                        Departamento: pedido.departamentoEntrega || "-",
                        URLVoucher: response?.data?.filter((x: any) => x.codPedido == pedido._id)?.map((item: any, idx: number) => `=HYPERLINK("${item.url}", "Voucher ${item.status === "0" ? "Pendiente" : item.status === "1" ? "Aceptado" : item.status === "2" ? "Rechazado" : ""}")`)
                            ?.join('\n') ?? "",
                    }));

                    // 2. Crear hoja y workbook
                    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

                    // 3. Descargar archivo
                    XLSX.writeFile(workbook, "pedidos.xlsx");
                }
                setArrUrls(response?.data);
            } catch (error) {
                console.error("Error al procesar el pedido:", error);
                return null; // O manejar el error de otra manera

            }
        }

        fetchUrls()
        console.log("arrUrls: ", arrUrls);

    };

    const handleEditClick = (id: string) => {
        setLoading(id);
        router.push(`/dashboard/editarPedidos/${id}`);
    };

    const handleChangePrecioHuevos = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/pacthConfig`;
        const response = await apiCall({
            method: "patch", endpoint: url, data: {
                precioKiloHuevos: precioKilos,
                proyecto: Apis.PROYECTCURRENT,
            }
        });
        console.log("response precioKilos", response);

        if (response.status === 201) {
            Swal.fire({
                icon: 'success',
                title: 'Precio actualizado',
                text: `El precio por kilo de huevos fue actualizado correctamente.`,
                timer: 2000
            });
            setPrecioKilos(response?.data?.precioKilos);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo actualizar el precio por kilo de huevos.`,
            });
        }
    }

    const handleSubirVouchers = async () => {
        const datosPedido = getValues()?.dataPoUp?.infoOrder
        try {
            if (!getValues()?.dataVoucher) return alert("Selecciona una imagen");
            setLoading2(true)
            const formData = new FormData();
            formData.append("image", getValues()?.dataVoucher);
            const res: any = await axios.post(`${Apis.URL_APOIMENT_BACKEND_DEV2}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // console.log("res", res);
            if (res.status == 200) {
                const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/subirVoucher`;

                const jsonSend = {
                    codPedido: datosPedido?._id,
                    nOperacion: new Date().getTime(),
                    documentoUsuario: datosPedido?.documentoUsuario,
                    fechaPago: moment.tz("America/Lima").format("YYYY-MM-DD"),
                    formaPago: getValues()?.formaPago,
                    monto: getValues()?.monto,
                    fechaVerificacion: "",
                    estadoVerificacion: "0",
                    conceptoPago: "pago pedido",
                    status: "0", // "0" pendiente, "1" aceptado, "2" rechazado
                    observaciones: "",
                    proyecto: Apis.PROYECTCURRENT,
                    url: res?.data?.url,
                }

                const response = await apiCall({
                    method: 'post',
                    endpoint: url,
                    data: jsonSend
                })
                console.log("responsefuianl: ", response)
                if (response.status === 201) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Voucher subido',
                        text: 'Se ha subido el voucher',
                        timer: 2000
                    });
                    hangeStatePopUp(false);
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

    const handleGetVouchersAll = async (id: string) => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getVouchersAll`;
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                id: id,
                proyecto: Apis.PROYECTCURRENT,
            }
        });
        console.log("response", response);
        setValue("VouchersAll", response?.data);
    }

    const handleEditVoucher = async (id: string, idPedido: string) => {
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

    return (
        <>
            <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
                <div className="ml-[00px] md:ml-0">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                        {"<< Atras"}
                    </Button>
                </div>
                {/* <div className="flex flex-row md:flex-row gap-1 items-center justify-center mt-5 ml-20 md:ml-0"> */}
                <div className="flex w-full md:w-full ml-0 justify-start items-start md:ml-0 mt-5 gap-1">
                    <div className="flex flex-col gap-0 text-white !w-[130px]">
                        <div className="flex flex-col justify-start items-start gap-0">
                            <div className="uppercase text-sm font-bold text-white">{"Mes"}</div>
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
                                                    className="!w-full bg-slate-100 rounded-lg h-[35px]"
                                                    sx={{
                                                        input: {
                                                            color: '#000', // texto negro
                                                            WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                            height: '1px',
                                                            border: 'none',
                                                            fontSize: '0.6rem',
                                                            // borderRadius: '10px',
                                                            // backgroundColor: '#efefef',
                                                            marginLeft: '-10px !important',
                                                            width: '70px !important',
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
                    <div className="flex flex-col gap-0 text-white !w-[130px]">
                        <div className="flex flex-col justify-start items-start gap-0">
                            <div className="uppercase text-sm font-bold text-white">{"Status"}</div>
                            <div className="!w-full -mt-2">
                                <Controller
                                    name={`statusFiltro`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Autocomplete
                                            options={[
                                                { value: "0", label: "Pendiente", last: "31" },
                                                { value: "1", label: "Entrregado", last: "28" },
                                                { value: "2", label: "En Ruta", last: "31" },
                                                { value: "3", label: "Rechazado", last: "31" },
                                            ]}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={[
                                                { value: "0", label: "Pendiente", last: "31" },
                                                { value: "1", label: "Entrregado", last: "28" },
                                                { value: "2", label: "En Ruta", last: "31" },
                                                { value: "3", label: "Rechazado", last: "31" },
                                            ].find(opt => opt.value === field.value) || null}
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
                                                    className="!w-full bg-slate-100 rounded-lg h-[35px]"
                                                    sx={{
                                                        input: {
                                                            color: '#000', // texto negro
                                                            WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                            height: '1px',
                                                            border: 'none',
                                                            fontSize: '0.6rem',
                                                            marginLeft: '-10px !important',
                                                            width: '70px !important',
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
                    <div className="mt-5 flex flex-col gap-3 !w-1/4">
                        <IconButton
                            sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" }, borderRadius: "10px" }}
                            onClick={() => fetchDataPedidosClientesFiltro()}
                        >
                            <SearchIcon size={20} />
                        </IconButton>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 !w-1/4">
                        <IconButton
                            sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" }, borderRadius: "10px" }}
                            onClick={() => exportarExcel()}
                        // startIcon={<ScrollText />}
                        >
                            <PiMicrosoftExcelLogoDuotone size={20} />
                        </IconButton>
                    </div>
                </div>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Nombre,DNI,Distrito,#Paquetes..."
                    className="mb-4 p-2 border rounded w-full max-w-md bg-white mt-5"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            <div className="flex gap-3 bg-[#00bcbc] px-2 py-1 rounded-lg my-1 text-3xl w-[200px] md:w-[200px] mt-4 font-bold">
                {/* <div className="text-base font-bold">{`Pedidos Pendientes`}</div> */}
                <div className="text-base flex justify-end">{`Ped. Pendientes: ${datos?.filter((x: any) => x.status == "0")?.length}`}</div>
            </div>
            <div className="flex gap-3 bg-yellow-400 px-2 py-1 rounded-lg my-1 text-3xl w-[200px] md:w-[200px] font-bold">
                {/* <div className="text-base font-bold">{`Pedidos Pendientes`}</div> */}
                <div className="text-base flex justify-end">{`TOTAL PAQUETES: ${datos?.filter((x: any) => x.status == "0")?.reduce((acum: any, val: any) => acum + Number(val?.cantidadPaquetes !== undefined && val?.cantidadPaquetes !== null ? val?.cantidadPaquetes : 0), 0)}`}</div>
            </div>
            <div className="flex gap-3 bg-[#00bcbc] px-2 py-1 rounded-lg my-1 text-3xl w-[200px] md:w-[200px] font-bold">
                {/* <div className="text-base font-bold">{`Pedidos En Ruta`}</div> */}
                <div className="text-base flex justify-end">{`Ped. En Ruta: ${datos?.filter((x: any) => x.status == "2")?.length}`}</div>
            </div>
            <div className="flex gap-3 bg-[#00bcbc] px-2 py-1 rounded-lg my-1 text-3xl w-[200px] md:w-[200px] font-bold">
                {/* <div className="text-base font-bold">{`Pedidos Entregados`}</div> */}
                <div className="text-base flex justify-end">{`Ped. Entregados: ${datos?.filter((x: any) => x.status == "1")?.length}`}</div>
            </div>
            <div className="flex gap-3 bg-[#00bcbc] px-2 py-1 rounded-lg my-1 text-3xl w-[200px] md:w-[200px] font-bold">
                {/* <div className="text-base font-bold">{`Pedidos Rechazados`}</div> */}
                <div className="text-base flex justify-end">{`Ped. Rechazados: ${datos?.filter((x: any) => x.status == "3")?.length}`}</div>
            </div>
            <div className="flex justify-center items-center gap-1 px-1 py-1 rounded-lg my-1 ">
                <div className="flex flex-col justify-start items-start gap-0 text-black">
                    <label className="text-base font-bold text-white">Precio Kilo Huevos Actual:</label>
                    <div className="relative w-full max-w-md mb-4 mt-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">S/.</span>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Precio kilos Actual"
                            className="pl-10 p-2 border rounded w-full bg-white"
                            value={precioKilos}
                            onChange={(e) => setPrecioKilos(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        Swal.fire({
                            title: '¿Estás seguro?',
                            text: `¿Deseas actualizar el precio por kilo de huevos a ${precioKilos}?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, actualizar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            showLoaderOnConfirm: true,
                            allowOutsideClick: () => !Swal.isLoading(),
                            preConfirm: async () => {
                                try {
                                    // Aquí llamas tu función personalizada, por ejemplo:
                                    await handleChangePrecioHuevos();
                                } catch (error) {
                                    Swal.showValidationMessage(`Error al actualizar: ${error}`);
                                }
                            }
                        });
                    }}
                    sx={{ backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" }, height: "50px", width: "10px", borderRadius: "10px" }}
                >
                    <Edit size={20} />
                </Button>
            </div>

            <div className="mt-0 md:ml-[000px] base:ml-[000px] ml-[00px]">
                {
                    datosFiltrados?.length > 0 ?
                        <div className="p-4">
                            <div className="w-[90vw] max-h-[70vh] overflow-y-auto overflow-x-auto">
                                <table className="w-[90vw] bg-white border border-gray-200 rounded-lg shadow-md">
                                    <thead className="sticky top-0 z-10 bg-[#005c5c]">
                                        <tr className="bg-[#005c5c] text-left text-sm text-gray-50">
                                            <th className="p-3 border-b">Status</th>
                                            <th className="p-3 border-b">Subir Voucher</th>
                                            <th className="p-3 border-b">Usuario</th>
                                            <th className="p-3 border-b">Fecha Pedido</th>
                                            <th className="p-3 border-b">Entrega</th>
                                            <th className="p-3 border-b">Paquetes</th>
                                            <th className="p-3 border-b">Kilos</th>
                                            <th className="p-3 border-b">Pago Total</th>
                                            <th className="p-3 border-b">Dirección</th>
                                            <th className="p-3 border-b">Comentario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datosFiltrados?.map((pedido: any, index: number) => (
                                            <tr key={pedido._id} style={{ backgroundColor: index % 2 == 0 ? "#f2f2f2" : "#ffffff" }} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="flex justify-start items-center gap-1">
                                                        <button
                                                            className={`text-xs ${pedido.status == "0" ? "bg-yellow-500 hover:bg-yellow-700" : pedido.status == "1" ? "bg-green-500 hover:bg-green-700" : pedido.status == "2" ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"} text-white px-2 py-1 rounded-lg`}
                                                            onClick={() => handleChangeState(pedido._id, pedido?.documentoUsuario, pedido?.nombresUsuario)}
                                                        >
                                                            {pedido.status == "0" ? "Pendiente" : pedido.status == "1" ? "Entregado" : pedido.status == "2" ? "En Ruta" : pedido.status == "3" && "Rechazado"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-start items-center gap-2">
                                                        <div
                                                            onClick={() => {
                                                                hangeStatePopUp(true)
                                                                setValue("dataPoUp", {
                                                                    title: `Subir Voucher de ${pedido?.nombresUsuario} - ${pedido?.documentoUsuario}`,
                                                                    infoOrder: pedido,
                                                                    action: "subirVoucher",
                                                                })
                                                            }}
                                                            className={`text-xs bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded-lg flex items-center cursor-pointer`}
                                                        >
                                                            <CloudUpload size={15} />
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                hangeStatePopUp(true)
                                                                handleGetVouchersAll(pedido._id)
                                                                setValue("dataPoUp", {
                                                                    title: `Voucher(s) de ${pedido?.nombresUsuario} - ${pedido?.documentoUsuario}`,
                                                                    infoOrder: pedido,
                                                                    action: "verVouchers",
                                                                })
                                                            }}
                                                            className="rounded-md bg-green-500 hover:bg-green-700 text-white px-2 py-1 cursor-pointer"
                                                        >
                                                            <ListCheck size={15} className="text-green-50" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {`${pedido?.nombresUsuario} ${pedido?.apellidoPaternoUsuario ?? ""} ${pedido?.apellidoMaternoUsuario} - ${pedido?.documentoUsuario} ${pedido?.membresia?.split(" - ")[0]?.split(": ")[1] == "0" ? "- EMPRENDEDOR" : ""} - ${pedido?.membresia?.split(" - ")[1]?.split(": ")[1] == "0" ? "- EMPRESARIO" : ""} - Cel.: ${pedido?.celularEntrega ?? ""}`}
                                                </td>
                                                <td className="p-3">
                                                    {pedido.fechaPedido?.split?.("T")[0].split?.("-")[2]}-{pedido.fechaPedido?.split?.("T")[0].split?.("-")[1]}-{pedido.fechaPedido?.split?.("T")[0].split?.("-")[0]}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-row gap-1 justify-start items-center">
                                                        <div>
                                                            {pedido.fechaEntregaPedido?.split?.("T")[0].split?.("-")[2]}-{pedido.fechaEntregaPedido?.split?.("T")[0].split?.("-")[1]}-{pedido.fechaEntregaPedido?.split?.("T")[0].split?.("-")[0]}
                                                        </div>
                                                        <div>
                                                            <button
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded-lg cursor-pointer"
                                                                color="primary"
                                                                onClick={() => handleChangeFechaEntrega(pedido._id, pedido?.documentoUsuario, pedido?.nombresUsuario)}
                                                            >
                                                                {"Reprogramar"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="grid grid-cols-2 justify-start items-center gap-1">
                                                        <div>
                                                            {pedido.cantidadPaquetes}
                                                        </div>
                                                        <div>
                                                            <button
                                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-blue-500 hover:bg-blue-700 flex items-center justify-center`}
                                                                onClick={() => handleEditClick(pedido._id)}
                                                                disabled={loading == pedido._id}
                                                            >
                                                                {loading == pedido._id ? (
                                                                    <Loader2 size={15} className="animate-spin" />
                                                                ) : (
                                                                    <PencilLine size={15} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">{pedido.kilos}</td>
                                                <td className="p-3 font-semibold text-green-600">S/. {pedido.pagoTotal}</td>
                                                <td className="p-3">{`${pedido.direccionEntrega ?? ""} - ${pedido.distritoEntrega ?? ""} - ${pedido.provinciaEntrega ?? ""} - ${pedido.departamentoEntrega ?? ""} - ${pedido.celularEntrega ?? ""}`}</td>
                                                <td className="p-3">{`${pedido.comentario ?? ""}`}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        :
                        <div className="flex flex-col items-center justify-center gap-2 w-full md:ml-1">
                            <div className="font-bold text-xl text-red-300">{"Usted no ha realizado ningún pedido"}</div>
                            <div className="font-bold text-xl text-red-300">{"en este periodo..."}</div>
                            <div className="font-bold text-base text-red-300">{""}</div>
                        </div>
                }
            </div>
            {
                openPopup &&
                <PopUpGeneral getValues={getValues} setValue={setValue} control={control} hangeStatePopUp={hangeStatePopUp} handleSubirVouchers={handleSubirVouchers} handleEditVoucher={handleEditVoucher} loading2={loading2} />
            }
        </>
    )
}

export default pedidosAdmin