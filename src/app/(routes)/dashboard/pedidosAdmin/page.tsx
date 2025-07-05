"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Autocomplete, Button, Card, CardContent, CardHeader, InputAdornment, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Badge, Calendar, CheckCircle, Clock, MapPin, Package, RotateCcw, X } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

interface Stock {
    stockContable: string,
    stockDisponible: string,
    stockEntregado: string,
    proyecto: string;
}

const pedidosAdmin = () => {

    const router = useRouter();

    const { getValues, setValue, handleSubmit, control } = useForm()

    const oneRender = useRef(true);

    const { apiCall } = useApi()

    const [session, setSession] = useState<any>(null);
    const [datos, setDatos] = useState<any>([]);
    const [stock, setStock] = useState<any>([]);

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
        }

        console.log("jsonFechas", jsonFechas);

        setValue("fechaInicio", fechaInicio.format('YYYY-MM-DD'));
        setValue("fechaFin", fechaFin.format('YYYY-MM-DD'));

        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                documentoUsuario: getValues()?.documentoUsuario ?? "",
                fechaInicio: fechaInicio.format('DD-MM-YYYY'),
                fechaFin: fechaFin.format('DD-MM-YYYY'),
            }
        });
        console.log("response", response);
        setDatos(response?.data);
    }

    const handleChangeState = async (id: string, dni: string, nombres: string) => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/changeStatusPedido`;
        console.log("url", url);

        const { value: estado } = await Swal.fire({
            title: `Cambiar estado del pedido de ${nombres} - ${dni}`,
            input: 'select',
            inputOptions: {
                '0': 'Pendiente',
                '1': 'Entregado',
                '2': 'En Ruta',
                '3': 'Rechazado',
            },
            inputPlaceholder: 'Selecciona un estado',
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            width: '300px',
            inputValidator: (value) => {
                if (!value) return 'Debes seleccionar un estado';
            },
            allowOutsideClick: () => !Swal.isLoading(),
            showLoaderOnConfirm: true,
            preConfirm: async (estadoSeleccionado) => {
                try {
                    const response = await apiCall({
                        method: 'patch',
                        endpoint: url,
                        data: {
                            status: estadoSeleccionado,
                            id: id
                        }
                    });
                    if (response.status === 201) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Estado actualizado',
                            text: `El estado del pedido fue actualizado correctamente.`,
                            timer: 2000
                        });
                        console.log("response: ", estadoSeleccionado, id);
                        fetchDataPedidosClientesFiltro()
                    }
                } catch (error) {
                    Swal.showValidationMessage(`Error al actualizar: ${error}`);
                }
            }
        });

        if (estado !== undefined) {
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

    const handleChangeStock = async () => {
        console.log("handleChangeStock", "stock");
    }

    const [busqueda, setBusqueda] = useState('');

    const datosFiltrados = datos?.filter((item: any) => {
        const filtro = (
            item?.nombresUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoPaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoMaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.documentoUsuario?.toLowerCase().includes(busqueda?.toLowerCase())
        );
        return filtro
    }
    );
    console.log("datosFiltrados", datosFiltrados);

    const exportarExcel = () => {
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
            Fecha_Pedido: new Date(pedido.fechaPedido).toLocaleDateString(),
            Fecha_Entrega: pedido.fechaEntregaPedido?.split?.("T")[0] || "",
            Paquetes: pedido.cantidadPaquetes,
            Kilos: pedido.kilos,
            Pago_Total: pedido.pagoTotal,
            Dirección: pedido.direccionEntrega || "-",
        }));

        // 2. Crear hoja y workbook
        const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

        // 3. Descargar archivo
        XLSX.writeFile(workbook, "pedidos.xlsx");
    };

    return (
        <>
            <div className="flex flex-col items-start justify-center mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
                <div className="ml-[60px] md:ml-0">
                    <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                        {"<< Atras"}
                    </Button>
                </div>
                {/* <div className="flex flex-row md:flex-row gap-1 items-center justify-center mt-5 ml-20 md:ml-0"> */}
                <div className="grid grid-cols-3 w-full md:w-full ml-0 justify-start items-start md:ml-0 mt-5 gap-1">
                    <div className="flex flex-col gap-0 text-white">
                        <div className="flex flex-col justify-start items-start gap-0 w-full">
                            <div className="uppercase text-sm font-bold text-white">{"Mes"}</div>
                            <div className="!w-[120px] -mt-2">
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

                            {/* <div className="uppercase text-sm font-bold text-white mt-2">{"DNI Busqueda"}</div> */}
                            {/* <div>
                                <Controller
                                    name={`documentoUsuario`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            error={!!fieldState.error}
                                            helperText={fieldState.error ? fieldState.error.message : ""}
                                            // label={item.label}
                                            variant="outlined"
                                            placeholder={"DNI:"}
                                            size="small"
                                            // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                            // disabled={true}
                                            // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                            type={"number"}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            // multiline={item.multiline}
                                            // minRows={item.rows}
                                            // InputProps={{
                                            //     startAdornment: <InputAdornment position="start">DNI:</InputAdornment>,
                                            // }}
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
                                                value = value.replace(/(?!^)-|[^0-9.,]/g, "");// positivos y negativos
                                                field.onChange(value);
                                            }}
                                        />
                                    )}
                                />
                            </div> */}
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3">
                        <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => fetchDataPedidosClientesFiltro()} variant="outlined" color="primary">
                            {"BUSCAR"}
                        </Button>
                    </div>
                    <div className="mt-5 flex flex-col gap-3">
                        <Button sx={{ width: "80%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => exportarExcel()} variant="outlined" color="primary">
                            {"EXCEL"}
                        </Button>
                    </div>
                </div>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Buscar Nombre o DNI..."
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
            {/* <div className="mt-5 flex flex-col md:flex-row justify-center items-center gap-1 text-3xl font-bold text-gray-800">
                <div>{`Stock Total:`}</div>
                <div className="bg-slate-50 px-3 py-2 rounded-md text-black w-[250px]">
                    {`${"1000"} paquetes`}
                </div>
                <div className="px-3 py-2">
                    <Button variant="contained" color="success" onClick={() => handleChangeStock()}>
                        {"Aumentar Stock +"}
                    </Button>
                </div>
            </div> */}

            <div className="mt-0 md:ml-[200px] base:ml-[300px] ml-[450px]">
                {
                    datosFiltrados?.length > 0 ?
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-4">Pedidos Programados</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-[#005c5c] text-left text-sm text-gray-50">
                                            <th className="p-3 border-b">Status</th>
                                            <th className="p-3 border-b">Usuario</th>
                                            <th className="p-3 border-b">Fecha Pedido</th>
                                            <th className="p-3 border-b">Entrega</th>
                                            <th className="p-3 border-b">Paquetes</th>
                                            <th className="p-3 border-b">Kilos</th>
                                            <th className="p-3 border-b">Pago Total</th>
                                            <th className="p-3 border-b !max-w-[100px] md:!max-w-[200px]">Dirección</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datosFiltrados?.map((pedido: any, index: number) => (
                                            <tr key={pedido._id} style={{ backgroundColor: index % 2 == 0 ? "#f2f2f2" : "#ffffff" }} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                                                <td className="p-3">
                                                    <button
                                                        className={`text-xs ${pedido.status == "0" ? "bg-yellow-500 hover:bg-yellow-700" : pedido.status == "1" ? "bg-green-500 hover:bg-green-700" : pedido.status == "2" ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"} text-white px-2 py-1 rounded-lg`}
                                                        onClick={() => handleChangeState(pedido._id, pedido?.documentoUsuario, pedido?.nombresUsuario)}
                                                    >
                                                        {pedido.status == "0" ? "Pendiente" : pedido.status == "1" ? "Entregado" : pedido.status == "2" ? "En Ruta" : pedido.status == "3" && "Rechazado"}
                                                    </button>
                                                </td>
                                                <td className="p-3">
                                                    {pedido.nombresUsuario} {pedido.apellidoPaternoUsuario} {pedido.apellidoMaternoUsuario} - {pedido.documentoUsuario}
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
                                                <td className="p-3">{pedido.cantidadPaquetes}</td>
                                                <td className="p-3">{pedido.kilos}</td>
                                                <td className="p-3 font-semibold text-green-600">S/. {pedido.pagoTotal}</td>
                                                <td className="p-3 !max-w-[100px] md:!max-w-[200px]">{pedido.direccionEntrega || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        :
                        <div className="flex flex-col items-center justify-center gap-2 w-full md:ml-1 -ml-46">
                            <div className="font-bold text-xl text-red-300">{"Usted no ha realizado ningún pedido"}</div>
                            <div className="font-bold text-xl text-red-300">{"en este periodo..."}</div>
                            <div className="font-bold text-base text-red-300">{""}</div>
                        </div>
                }
            </div>
        </>
    )
}

export default pedidosAdmin