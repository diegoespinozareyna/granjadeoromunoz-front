"use client"

import { FormRealizaPedidos } from "@/app/components/pedidos/FormRealizaPedidos";
import { FormRealizaPedidos2 } from "@/app/components/pedidos/FormRealizaPedidos2";
import useApi from "@/app/hooks/fetchData/useApi";
import { useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material"
import { jwtDecode } from "jwt-decode";
import { Loader2, PencilLine } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const verUsuarios = () => {

    const { apiCall, loading } = useApi()

    const refFetch = useRef(true);

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
    console.log("datosFiltrados", datosFiltrados);

    useEffect(() => {
        if (refFetch.current) {
            fetchData();
            refFetch.current = false;
        }
    }, [])

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

                </div>

                <div className="mt-0 md:ml-[000px] base:ml-[000px] ml-[00px]">
                    {
                        datosFiltrados?.length > 0 ?
                            <div className="p-4">
                                {/* <h2 className="text-xl font-semibold mb-4">Pedidos Programados</h2> */}
                                <div className="w-[90vw] max-h-[70vh] overflow-y-auto overflow-x-auto">
                                    <table className="w-[90vw] bg-white border border-gray-200 rounded-lg shadow-md">
                                        <thead className="sticky top-0 z-10 bg-[#005c5c]">
                                            <tr className="bg-[#005c5c] text-left text-sm text-gray-50">
                                                <th className="p-3 border-b">Status</th>
                                                <th className="p-3 border-b">Usuario</th>
                                                <th className="p-3 border-b">Contraseña</th>
                                                <th className="p-3 border-b"># Membresias EMPRESARIO</th>
                                                <th className="p-3 border-b"># Membresias EMPRENDEDOR</th>
                                                <th className="p-3 border-b">Celular</th>
                                                <th className="p-3 border-b">Direccion</th>
                                                <th className="p-3 border-b">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datosFiltrados?.map((usuario: any, index: number) => (
                                                <tr key={usuario._id} style={{ backgroundColor: index % 2 == 0 ? "#f2f2f2" : "#ffffff" }} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="flex justify-start items-center gap-1">
                                                            <button
                                                                className={`text-xs ${usuario.statusActive == "2" ? "bg-yellow-500 hover:bg-yellow-700" : usuario.statusActive == "1" ? "bg-green-500 hover:bg-green-700" : usuario.statusActive == "0" ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"} text-white px-2 py-1 rounded-lg`}
                                                            // onClick={() => handleChangeState(usuario._id, usuario?.documentoUsuario, usuario?.nombresUsuario)}
                                                            >
                                                                {usuario.statusActive == "0" ? "Inactivo" : usuario.statusActive == "1" ? "Activo" : usuario.status == "2" ? "En Ruta" : usuario.status == "3" && "Rechazado"}
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
                                                        <div className="flex flex-row gap-1 justify-start items-center">
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
                                                    {/* <td className="p-3">
                                                        <div className="grid grid-cols-2 justify-start items-center gap-1">
                                                            <div>
                                                                {usuario.cantidadPaquetes}
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className={`text-xs text-white px-2 py-1 rounded-lg bg-blue-500 hover:bg-blue-700 flex items-center justify-center`}
                                                                    // onClick={() => handleEditClick(usuario._id)}
                                                                    disabled={loading == usuario._id}
                                                                >
                                                                    {loading == usuario._id ? (
                                                                        <Loader2 size={15} className="animate-spin" />
                                                                    ) : (
                                                                        <PencilLine size={15} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">{usuario.kilos}</td>
                                                    <td className="p-3 font-semibold text-green-600">S/. {usuario.pagoTotal}</td>
                                                    <td className="p-3 !max-w-full">{`${usuario.direccionEntrega ?? ""} - ${usuario.distritoEntrega ?? ""} - ${usuario.provinciaEntrega ?? ""} - ${usuario.departamentoEntrega ?? ""} - ${usuario.celularEntrega ?? ""}`}</td> */}
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
        </div>
    )
}

export default verUsuarios