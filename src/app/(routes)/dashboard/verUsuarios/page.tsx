"use client"

import { FormRealizaPedidos } from "@/app/components/pedidos/FormRealizaPedidos";
import { FormRealizaPedidos2 } from "@/app/components/pedidos/FormRealizaPedidos2";
import useApi from "@/app/hooks/fetchData/useApi";
import { useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { changeDecimales } from "@/app/utils/functions/changeDecimales";
import { Button } from "@mui/material"
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { CheckCheck, File, Loader2, Loader2Icon, PencilLine, PencilLineIcon, Send, X } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';

const verUsuarios = () => {

    const { apiCall, loading } = useApi()

    const { register, handleSubmit, setValue, getValues, watch, reset, control } = useForm()

    const refFetch = useRef(true);

    const [popup, setPopup] = useState<any>({
        status: false,
        title: "",
        infoUsuario: "",
        action: "",
    });

    const router = useRouter();
    const [datos, setDatos] = useState<any>([]);
    const [busqueda, setBusqueda] = useState('');

    const fetchData = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getAllUsuarios`;
        const response = await apiCall({
            method: "get", endpoint: url
        }
        );
        console.log("response", response);
        setDatos(response.data?.map((item: any) => {
            return {
                ...item,
                displayName: `${item?.nombres} ${item?.apellidoMaterno ?? ""} ${item?.apellidoMaterno}`,
            }
        }));
    };

    const datosFiltrados = datos?.filter((item: any) => {
        const filtro = (
            item?.nombresUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoPaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.apellidoMaternoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.documentoUsuario?.toLowerCase().includes(busqueda?.toLowerCase()) ||
            item?.displayName?.toLowerCase().includes(busqueda?.toLowerCase())
        );
        return filtro
    }
    );
    // console.log("datosFiltrados", datosFiltrados);

    useEffect(() => {
        if (refFetch.current) {
            fetchData();
            refFetch.current = false;
        }
    }, [])

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

    const handleEditVoucher = async (id: string, idPedido: string, idUsuario: string) => {
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
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
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

    const handleCobraUtilidad = async (usuario: any) => {
        try {
            console.log("usuario", usuario);
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/isCobrarUtilidad`;
            const response = await apiCall({
                method: "patch", endpoint: url, data: { isCobrar: getValues()?.isCobrar, id: usuario._id }
            })
            console.log("response", response);
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: getValues()?.isCobrar == "1" ? 'Usuario ahora podrá cobrar utilidad' : "Usuario ya no podrá cobrar utilidad",
                    text: '',
                    timer: 2000
                });
                setValue("isCobrar", null);
                fetchData();
                // setValue("observaciones", "");
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

    const handleUtilidad = async (usuario: any, monto: string, campo: string) => {
        try {
            console.log("usuario", usuario);
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/utilidadTrimestral`;
            const response = await apiCall({
                method: "patch", endpoint: url, data: { monto, campo, id: usuario._id }
            })
            console.log("response", response);
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Utilidad actualizada',
                    text: '',
                    timer: 2000
                });
                setValue(campo, null);
                fetchData();
                setPopup({
                    status: false,
                    title: "",
                    infoUsuario: "",
                    action: "",
                });
                // setValue("observaciones", "");
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

    const [loading2, setLoading2] = useState(false);

    const handleSubirVouchers = async (monto: any, key: any, user: any) => {
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

                const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/subirVoucher`;

                // aquí iteramos cada voucher
                for (const voucherUrl of urls) {
                    const jsonSend = {
                        codPedido: user?._id,
                        nOperacion: new Date().getTime(),
                        documentoUsuario: user?.documentoUsuario,
                        fechaPago: moment.tz("America/Lima").format("YYYY-MM-DD"),
                        formaPago: "deposito en cuenta",
                        monto: monto,
                        fechaVerificacion: "",
                        estadoVerificacion: "0",
                        conceptoPago: key,
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
                if (urls.length > 0) {
                    Swal.fire({
                        title: 'Pedido enviado',
                        text: 'Se ha enviado el pedido',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6',
                        showLoaderOnConfirm: true,
                        allowOutsideClick: false,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
                else {
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
            else {
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

    const handleVouchersUserExcel = async (user: any) => {
        try {
            const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getVouchersAll`;
            const response = await apiCall({
                method: "get", endpoint: url, data: null, params: {
                    id: user?._id,
                    proyecto: Apis.PROYECTCURRENT,
                }
            });
            // console.log("response", response?.data);
            setValue("VouchersAll", response?.data?.filter((item: any) => item?.status !== "2"));
            console.log("response", typeof (response?.data?.map((item: any) =>
                item.url,
            ) ?? [])?.join(", "));
            return (response?.data
                ?.filter((item: any) => item?.status !== "2")
                ?.map((item: any) =>
                    item.url,
                ) ?? [])?.join(", ");
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            localStorage.removeItem("auth-token");
            window.location.href = '/';
        }
    }

    // console.log("personas", datosFiltrados);

    const handleDownload = async () => {
        try {
            const cleanData = await Promise.all(
                (datosFiltrados ?? []).map(async (item: any) => {
                    const vouchers = await handleVouchersUserExcel(item);

                    return {
                        "DNI Cliente": `${item.documentoUsuario ?? ""}`,
                        "Nombre Cliente": `${item.nombres ?? ""} ${item.apellidoPaterno ?? ""} ${item.apellidoMaterno ?? ""}`,
                        "Celular Cliente": `${item.celular ?? ""}`,
                        "Direccion Cliente": `${item.direccion ?? ""}`,
                        "Usuario-Contraseña": `${item.documentoUsuario ?? ""} - ${item.password ?? ""}`,
                        "N° Membresia Empresario": `${item.membresia500 ?? ""}`,
                        "N° Membresia Emprendedor": `${item.menbresia200 ?? ""}`,
                        "Cobra Utilidades": `${item.isCobrar == "1" ? "SI" : "NO"}`,
                        "Banco": `${item.banco ?? ""}`,
                        "Número de Cuenta": `${item.numeroCuenta ?? ""}`,
                        "CCI Cuenta": `${item.cciCuenta ?? ""}`,
                        "Titular Cuenta": `${item.titularCuenta ?? ""}`,
                        "Monto Primer Trimestre": `${item.utilidad1 ?? ""}`,
                        "¿Se Pagó Primer Trimestre?":
                            item?.banco && item?.numeroCuenta && item?.cciCuenta && item?.titularCuenta && item?.utilidad1 == "0"
                                ? "SI"
                                : "NO",
                        "Vouchers Pagos": vouchers, // ✅ ahora sí llega el string resuelto
                    };
                })
            );

            // aquí generas tu Excel normalmente con cleanData
            console.log(cleanData);
            // ...
            // Si no hay filas, salimos o generamos un Excel con solo título
            if (cleanData.length === 0) {
                // Crear hoja vacía con título
                const wsEmpty: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[`Clientes`]]);
                // opcional: merges no necesarios (solo 1 columna)
                const wbEmpty = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wbEmpty, wsEmpty, "Reporte");
                const bufferEmpty = XLSX.write(wbEmpty, { bookType: "xlsx", type: "array" });
                saveAs(new Blob([bufferEmpty], { type: "application/octet-stream" }), "reporte.xlsx");
                return;
            }

            // 1) Crear worksheet con los datos empezando en A2 para dejar A1 para el título
            //    json_to_sheet escribiría encabezados en la fila 2.
            const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]); // Create an empty worksheet
            XLSX.utils.sheet_add_json(worksheet, cleanData, { origin: "A2" }); // Add JSON data starting at A2

            // 2) Añadir título en A1
            XLSX.utils.sheet_add_aoa(worksheet, [[`Clientes`]], { origin: "A1" });

            // 3) Determinar cuántas columnas existen para combinar desde A1 hasta la última columna
            let totalColumnsIndex = 0;
            if (worksheet["!ref"]) {
                const range = XLSX.utils.decode_range(worksheet["!ref"]);
                totalColumnsIndex = range.e.c; // índice 0-based de la última columna
            } else {
                // fallback seguro: número de columnas = keys del primer objeto - 1 (0-based)
                totalColumnsIndex = Object.keys(cleanData[0]).length - 1;
            }

            // 4) Combinar la fila del título (A1 -> últimaColumna1)
            const merge = {
                s: { r: 0, c: 0 }, // start row 0 (A1)
                e: { r: 0, c: totalColumnsIndex }, // end same row, last column
            };
            worksheet["!merges"] = worksheet["!merges"] ? [...worksheet["!merges"], merge] : [merge];

            // 6) Crear workbook y descargar
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "reporte.xlsx");
        } catch (error) {
            console.error("Error generando Excel:", error);
        }
    };

    return (
        <div className="flex flex-col items-start justify-start mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="md:ml-0">

                <div className="flex flex-col md:flex-row gap-3 px-3">
                    <Button sx={{ backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/${Apis.PROYECTCURRENT}`)} variant="outlined" color="primary">
                        {"<< Atras"}
                    </Button>

                    <Button sx={{ backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/crearUsuario`)} variant="outlined" color="primary">
                        {"+ Agregar Usuario"}
                    </Button>

                    <input placeholder="Buscar por Nombre o DNI..." className=" p-2 border rounded w-full max-w-md bg-white" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

                    <div className='flex flex-row gap-2 w-[200px] px-2 py-0 border rounded-lg border-blue-100 bg-blue-50'>
                        {/* <div>
                                                        {"Buses 50:"}
                                                    </div> */}
                        <div onClick={handleDownload} className='cursor-pointer font-bold text-green-400 flex justify-start items-center gap-2'>
                            <File className="h-5 w-5 text-green-400" />
                            <div>
                                Excel_Pasajeros
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-0 md:ml-[000px] base:ml-[000px] ml-[00px]">
                    {
                        datosFiltrados?.length > 0 ?
                            <div className="p-4">
                                {/* <h2 className="text-xl font-semibold mb-4">Pedidos Programados</h2> */}
                                <div className="w-[98vw] max-h-[60vh] overflow-y-auto overflow-x-auto">
                                    <table className="w-[96vw] bg-white border border-gray-200 rounded-lg shadow-md">
                                        <thead className="sticky top-0 z-10 bg-[#005c5c]">
                                            <tr className="bg-[#005c5c] text-left text-sm text-gray-50">
                                                <th className="p-3 border-b">Status</th>
                                                <th className="p-3 border-b">Usuario</th>
                                                <th className="p-3 border-b">Contraseña</th>
                                                <th className="p-3 border-b"># Membresias EMPRESARIO</th>
                                                <th className="p-3 border-b"># Membresias EMPRENDEDOR</th>
                                                <th className="p-3 border-b">Celular</th>
                                                <th className="p-3 border-b">Direccion</th>
                                                <th className="p-3 border-b">Cobra Utilidad</th>
                                                <th className="p-3 border-b">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datosFiltrados?.map((usuario: any, index: number) => (
                                                <tr key={usuario._id} style={{ backgroundColor: index % 2 == 0 ? "#f2f2f2" : "#ffffff" }} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="flex justify-start items-center gap-1">
                                                            <button
                                                                className={`text-xs ${usuario.statusActive == "2" ? "bg-yellow-500 hover:bg-yellow-700" : usuario.statusActive == "1" ? "bg-green-500 hover:bg-green-700" : usuario.statusActive == "0" ? "bg-red-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"} text-white px-2 py-1 rounded-lg`}
                                                            // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                            >
                                                                {usuario.statusActive == "0" ? "Inactivo" : usuario.statusActive == "1" ? "Activo" : usuario.statusActive == "2" ? "Retirado" : usuario.status == "3" && "Rechazado"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {`${usuario?.nombres} ${usuario?.apellidoPaterno ?? ""} ${usuario?.apellidoMaterno} - DNI: ${usuario?.documentoUsuario ?? ""}`}
                                                    </td>
                                                    <td className="p-3">
                                                        {`${usuario?.password ?? ""}`}
                                                    </td>
                                                    <td className="p-3">
                                                        {`${usuario?.membresia500 ?? ""}`}
                                                    </td>
                                                    <td className="p-3">
                                                        {`${usuario?.menbresia200 ?? ""}`}
                                                    </td>
                                                    <td className="p-3">
                                                        {`${usuario?.celular ?? ""}`}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-row gap-1 justify-start items-center">
                                                            <div>
                                                                {`${usuario.direccion ?? ""} - ${usuario.distrito ?? ""} - ${usuario.provincia ?? ""} - ${usuario.departamento ?? ""}`}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="grid grid-cols-2 justify-start items-center gap-2">
                                                            <div>
                                                                <button
                                                                    className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                                    // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                                    // disabled={loading == usuario._id}
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            title: `¿${usuario?.nombres} ${usuario?.apellidoPaterno ?? ""} ${usuario?.apellidoMaterno ?? ""} corresponde cobrar utilidad?`,
                                                                            icon: 'question',
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Sí',
                                                                            cancelButtonText: 'No',
                                                                            confirmButtonColor: '#3085d6',
                                                                            cancelButtonColor: '#d33',
                                                                            showLoaderOnConfirm: true,
                                                                            allowOutsideClick: () => !Swal.isLoading(),
                                                                            preConfirm: async () => {
                                                                                try {
                                                                                    // ✅ Si presiona "Sí"
                                                                                    setValue("isCobrar", "1");
                                                                                    await handleCobraUtilidad(usuario);
                                                                                } catch (error) {
                                                                                    Swal.showValidationMessage(`Error al actualizar: ${error}`);
                                                                                }
                                                                            }
                                                                        }).then(async (result) => {
                                                                            // ✅ Si presiona "No"
                                                                            if (result.dismiss === Swal.DismissReason.cancel) {
                                                                                setValue("isCobrar", "0");
                                                                                await handleCobraUtilidad(usuario);
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    {loading == usuario._id ? (
                                                                        <Loader2Icon size={15} className="animate-spin" />
                                                                    ) : (
                                                                        <PencilLineIcon size={15} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div>
                                                                {`${usuario?.isCobrar == "0" ? "NO" : usuario?.isCobrar == "1" ? "SI" : "NO"}`}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-row gap-1 justify-start items-center">
                                                            <div>
                                                                <button
                                                                    className={`${usuario?.banco !== "" && usuario?.banco !== undefined && usuario?.banco !== null && usuario?.banco !== " "
                                                                        &&
                                                                        usuario?.numeroCuenta !== "" && usuario?.numeroCuenta !== undefined && usuario?.numeroCuenta !== null && usuario?.numeroCuenta !== " "
                                                                        &&
                                                                        usuario?.cciCuenta !== "" && usuario?.cciCuenta !== undefined && usuario?.cciCuenta !== null && usuario?.cciCuenta !== " "
                                                                        &&
                                                                        usuario?.titularCuenta !== "" && usuario?.titularCuenta !== undefined && usuario?.titularCuenta !== null && usuario?.titularCuenta !== " "
                                                                        &&
                                                                        usuario?.utilidad1 != "0" && usuario?.utilidad1 != "" && usuario?.utilidad1 != undefined && usuario?.utilidad1 != null //aqui cuando sea segundo trimestre agregar utiliadad2
                                                                        ?
                                                                        "bg-yellow-500 hover:bg-yellow-700"
                                                                        :
                                                                        usuario?.banco !== "" && usuario?.banco !== undefined && usuario?.banco !== null && usuario?.banco !== " "
                                                                            &&
                                                                            usuario?.numeroCuenta !== "" && usuario?.numeroCuenta !== undefined && usuario?.numeroCuenta !== null && usuario?.numeroCuenta !== " "
                                                                            &&
                                                                            usuario?.cciCuenta !== "" && usuario?.cciCuenta !== undefined && usuario?.cciCuenta !== null && usuario?.cciCuenta !== " "
                                                                            &&
                                                                            usuario?.titularCuenta !== "" && usuario?.titularCuenta !== undefined && usuario?.titularCuenta !== null && usuario?.titularCuenta !== " "
                                                                            &&
                                                                            usuario?.utilidad1 == "0" //aqui cuando sea segundo trimestre agregar utiliadad2
                                                                            ?
                                                                            "bg-blue-500 hover:bg-blue-700"
                                                                            :
                                                                            "bg-green-500 hover:bg-green-700"
                                                                        } text-white font-bold px-2 py-1 rounded-lg cursor-pointer`}
                                                                    color="primary"
                                                                    onClick={() => {
                                                                        setPopup({
                                                                            status: true,
                                                                            title: `${usuario?.nombres} ${usuario?.apellidoPaterno ?? ""} ${usuario?.apellidoMaterno} - DNI: ${usuario?.documentoUsuario ?? ""}`,
                                                                            infoUsuario: usuario,
                                                                            action: usuario?.isCobrar ?? "0",
                                                                        })
                                                                        handleVouchersUser(usuario);
                                                                    }}
                                                                >
                                                                    {"UTILIDADES"}
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded-lg cursor-pointer"
                                                                    color="primary"
                                                                    onClick={() => router.push(`/dashboard/editarUsuario/${usuario._id}`)}
                                                                >
                                                                    {"Editar"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            :
                            <div className="flex flex-col items-center justify-center gap-2 w-full md:ml-1">
                                <div className="font-bold text-xl text-red-300">{"No existen usuarios"}</div>
                            </div>
                    }
                </div>
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
                        <div className="flex flex-col justify-start items-start gap-1 mb-3">
                            <div>
                                {`Habilitado para cobrar utilidad: ${popup?.action == "1" ? "SI" : "NO"}`}
                            </div>
                            {
                                popup?.action == "1" &&
                                <>
                                    <div>
                                        {`Banco: ${popup?.infoUsuario?.banco ?? "No ingresado por el cliente"}`}
                                    </div>
                                    <div>
                                        {`Numero de cta: ${popup?.infoUsuario?.numeroCuenta ?? "No ingresado por el cliente"}`}
                                    </div>
                                    <div>
                                        {`CCI: ${popup?.infoUsuario?.cciCuenta ?? "No ingresado por el cliente"}`}
                                    </div>
                                    <div>
                                        {`Titular Cuenta: ${popup?.infoUsuario?.titularCuenta ?? "No ingresado por el cliente"}`}
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre1: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad1 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 1',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad1", result.value);
                                                            setValue("keyForVoucher", "utilidad1");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad1");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre2: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad2 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 2',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad2", result.value);
                                                            setValue("keyForVoucher", "utilidad2");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad2");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre3: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad3 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 3',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad3", result.value);
                                                            setValue("keyForVoucher", "utilidad3");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad3");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre4: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad4 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 4',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad4", result.value);
                                                            setValue("keyForVoucher", "utilidad4");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad4");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre5: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad5 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 5',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad5", result.value);
                                                            setValue("keyForVoucher", "utilidad5");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad5");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre6: S/. ${changeDecimales(popup?.infoUsuario?.utilidad6 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 6',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad6", result.value);
                                                            setValue("keyForVoucher", "utilidad6");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad6");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre7: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad7 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 7',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad7", result.value);
                                                            setValue("keyForVoucher", "utilidad7");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad7");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        {`Monto a Cobrar trimestre8: S/.  ${changeDecimales(popup?.infoUsuario?.utilidad8 ?? "0") ?? "No Corresponde"}`}
                                        <div>
                                            <button
                                                className={`text-xs text-white px-2 py-1 rounded-lg bg-green-500 hover:bg-green-700 flex items-center justify-center`}
                                                // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                // disabled={loading == usuario._id}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Escribe cuanto corresponde cobrar utilidad de trimestre 8',
                                                        text: 'Escribe el monto solo en numeros',
                                                        input: 'text',
                                                        inputPlaceholder: 'S/...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Aceptar',
                                                        cancelButtonText: 'Cancelar',
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        allowOutsideClick: false,
                                                        preConfirm: (valor) => {
                                                            if (!valor) {
                                                                Swal.showValidationMessage('Debes escribir algo');
                                                                return false;
                                                            }
                                                            return valor;
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            console.log('Texto ingresado:', result.value);
                                                            setValue("utilidad8", result.value);
                                                            setValue("keyForVoucher", "utilidad8");
                                                            handleUtilidad(popup?.infoUsuario, result.value, "utilidad8");
                                                        }
                                                    });
                                                }}
                                            >
                                                {loading ? (
                                                    <Loader2Icon size={15} className="animate-spin" />
                                                ) : (
                                                    <PencilLineIcon size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`${getValues()?.VouchersAll?.length > 0 ? "flex flex-col" : "flex flex-row"} gap-2 w-full`}>
                                        {`Vouchers Subidos:`}
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
                                                                    if (item.status === "0" || item.status === "2" || item.status === "1") {
                                                                        const { isConfirmed } = await Swal.fire({
                                                                            title: `Cambiar Status de voucher`,
                                                                            html: `
                                                                                                        <select id="status" class="swal2-input">
                                                                                                          <option value="">Selecciona un estado</option>
                                                                                                          <option value="1">Verificado Correctamente</option>
                                                                                                          <option value="2">Eliminar</option>
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
                                                                                    await handleEditVoucher(item._id, item.codPedido, popup?.infoUsuario?._id);
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
                                                                {
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
                                                                }
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

                                    <div>
                                        {`Subir nuevo Voucher:`}
                                        <div>
                                            <div className="flex justify-start items-center gap-1">
                                                <Controller
                                                    name="filePago"
                                                    control={control}
                                                    rules={{ required: "Se requiere al menos un archivo de imagen" }}
                                                    render={({ field }) => {
                                                        const [previews, setPreviews] = useState<string[]>([]);

                                                        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const files = Array.from(e.target.files ?? []);
                                                            if (files.length > 0) {
                                                                // Guardar los archivos en RHF
                                                                setValue("dataVoucher", files);
                                                                field.onChange(files);

                                                                // Crear previews
                                                                const newPreviews = files.map((file) => URL.createObjectURL(file));
                                                                setPreviews(newPreviews);
                                                            }
                                                        };

                                                        const removeFile = (index: number) => {
                                                            const updatedPreviews = previews.filter((_, i) => i !== index);

                                                            // Remover archivo de React Hook Form
                                                            const currentFiles: File[] = (field.value as File[]) || [];
                                                            const updatedFiles = currentFiles.filter((_, i) => i !== index);

                                                            setPreviews(updatedPreviews);
                                                            setValue("dataVoucher", updatedFiles);
                                                            field.onChange(updatedFiles);
                                                        };

                                                        return (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <label className="cursor-pointer flex justify-center items-center gap-2">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        onChange={handleFileChange}
                                                                        className="hidden"
                                                                    />
                                                                    <div
                                                                        className={`text-xs bg-red-500 hover:bg-blue-700 text-white px-2 py-1 rounded-lg flex items-center`}
                                                                    >
                                                                        <div>Seleccione Vouchers</div>
                                                                    </div>
                                                                    {previews.length > 0 && (
                                                                        <div><CheckCheck color="green" size={20} /></div>
                                                                    )}
                                                                </label>

                                                                {previews.length > 0 && (
                                                                    <>
                                                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                                                            {previews.map((previewUrl, index) => (
                                                                                <div key={index} className="relative flex flex-col items-center">
                                                                                    <div
                                                                                        className="absolute top-0 right-0 cursor-pointer bg-white rounded-full p-1 shadow"
                                                                                        onClick={() => removeFile(index)}
                                                                                    >
                                                                                        <X color="red" size={18} />
                                                                                    </div>
                                                                                    <img
                                                                                        src={previewUrl}
                                                                                        alt={`Vista previa ${index + 1}`}
                                                                                        className="w-32 h-32 object-cover rounded-lg border cursor-pointer"
                                                                                        onClick={() => window.open(previewUrl, "_blank")}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div>
                                                                            <button
                                                                                className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-700 text-white font-bold px-2 py-1 rounded-lg cursor-pointer"
                                                                                color="primary"
                                                                                onClick={() => handleSubirVouchers(popup?.infoUsuario?.[`${getValues()?.keyForVoucher}`], getValues()?.keyForVoucher, popup?.infoUsuario)}
                                                                            >
                                                                                ACEPTAR<Send color="white" size={18} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </>
                            }

                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default verUsuarios