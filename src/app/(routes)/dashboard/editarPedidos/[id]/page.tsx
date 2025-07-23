"use client"

import { FormEditarPedidos } from "@/app/components/pedidos/FormEditarPedidos";
import { FormRealizaPedidos2 } from "@/app/components/pedidos/FormRealizaPedidos2";
import useApi from "@/app/hooks/fetchData/useApi";
import { useUserStore } from "@/app/store/userStore";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Button } from "@mui/material"
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const EditarPedidos = () => {
    const router = useRouter();
    const { id } = useParams();
    console.log("el id es: ", id)

    const { getValues, setValue, handleSubmit, control } = useForm()
    // const [showPassword, setShowPassword] = useState(false)
    const { apiCall, loading, error } = useApi()

    const [session, setSession] = useState<any>(null);

    const [limitePEdidos, setLimitePEdidos] = useState<any>(null);
    const user = useUserStore((state) => state.user);
    console.log("user", user);

    const fechaLimaFormateada = (fechaUTC: any) => {
        return moment(fechaUTC).tz("America/Lima").format("YYYY-MM-DD");
    }

    const distritos = [
        //norte
        { value: "Santa Rosa", label: "Santa Rosa", zona: "Norte" },
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
    ]

    const fetchDataPedido = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getpedido`;
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: {
                id: id
            }
        });
        console.log("response", response);
        setValue("nombreClientePedido", response?.data?.nombresUsuario);
        setValue("apellidoPaternoClientePedido", response?.data?.apellidoPaternoUsuario ?? "");
        setValue("apellidoMaternoClientePedido", response?.data?.apellidoMaternoUsuario ?? "");
        setValue("documentoClientePedido", response?.data?.documentoUsuario);
        setValue("direccionEntregaPedido", response?.data?.direccionEntrega);
        setValue("kilos", response?.data?.kilos);
        setValue("precio", response?.data?.precio);
        setValue("pagoTotal", response?.data?.pagoTotal);
        setValue("celularEntrega", response?.data?.celularEntrega);
        setValue("cantidadPaquetes", response?.data?.cantidadPaquetes);
        Number(response?.data?.cantidadPaquetes) <= 3 ? setValue("entregaDomicilio", 6) : Number(response?.data?.cantidadPaquetes) <= 6 ? setValue("entregaDomicilio", 10) : Number(response?.data?.cantidadPaquetes) <= 10 ? setValue("entregaDomicilio", 12) : setValue("entregaDomicilio", 12)
        setValue("precioSemanal", response?.data?.precioSemanal);
        setValue("direccionEntrega", response?.data?.direccionEntrega);
        const match = distritos?.find((opt: any) => opt.value?.toLowerCase() === response?.data?.distritoEntrega?.toLowerCase());
        console.log("match", match);
        if (match) {
            setValue("distritoEntrega", match?.value);
            setValue("zona", match?.zona);
        }
        // setValue("distritoEntrega", response?.data?.distritoEntrega);
        setValue("provinciaEntrega", response?.data?.provinciaEntrega);
        setValue("departamentoEntrega", response?.data?.departamentoEntrega);
        setValue("fechaPedido", fechaLimaFormateada(response?.data?.fechaPedido));
        setValue("fechaEntregaPedido", fechaLimaFormateada(response?.data?.fechaEntregaPedido));
        // setDatos(response?.data);
    }

    useEffect(() => {
        fetchDataPedido()
    }, [])

    const onSubmit = async (data: any) => {
        console.log(data)
        const json = {
            id: id,
            cantidadPaquetes: getValues()?.cantidadPaquetes,
            kilos: getValues()?.kilos,
            precio: getValues()?.precio,
            pagoTotal: getValues()?.pagoTotal,
            direccionEntrega: getValues()?.direccionEntrega,
            distritoEntrega: getValues()?.distritoEntrega,
            provinciaEntrega: getValues()?.provinciaEntrega,
            departamentoEntrega: getValues()?.departamentoEntrega,
            celularEntrega: getValues()?.celularEntrega,
            zona: getValues()?.zona,
        }
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/editarPedido`
        const response = await apiCall({
            method: "patch", endpoint: url, data: json
        })
        console.log("responsefuianl: ", response)
        if (response.status === 201) {
            Swal.fire({
                title: 'Pedido editado',
                text: 'Se ha editado el pedido',
                icon: 'success',
                confirmButtonText: 'OK',
                // showCancelButton: true,
                confirmButtonColor: '#3085d6',
                // cancelButtonColor: '#d33',
                // cancelButtonText: 'No',
                showLoaderOnConfirm: true,
                allowOutsideClick: false,
                preConfirm: () => {
                    router.push(`/dashboard/pedidosAdmin`);
                    // window.location.href = `/dashboard/${Apis.PROYECTCURRENT}`;
                    return
                },
            });
        } else {
            Swal.fire({
                title: 'Error al editar pedido',
                text: 'No se ha podido editar el pedido',
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

    return (
        <div className="flex flex-col items-start justify-start mt-10 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
            <div className="md:ml-0">
                <Button sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/pedidosAdmin`)} variant="outlined" color="primary">
                    {"<< Atras"}
                </Button>
            </div>
            <div className="md:ml-0 border-0 border-[#006060] rounded-lg p-3 px-10 mt-1 bg-[rgba(255,255,255,0.1)]">
                {/* <h2 className="text-xl font-bold text-gray-800 my-4 uppercase text-center">Datos de Pedido</h2> */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
                    <div className="font-bold text-white">
                        {`Cliente: ${getValues()?.nombreClientePedido ?? ""} ${getValues()?.apellidoPaternoClientePedido ?? ""} ${getValues()?.apellidoMaternoClientePedido ?? ""}`}
                    </div>
                    <div className="font-bold text-white">
                        {`DNI: ${getValues()?.documentoClientePedido ?? ""}`}
                    </div>
                    <div className="font-bold text-white">
                        {`Celular: ${getValues()?.celularEntrega ?? ""}`}
                    </div>
                    <FormEditarPedidos {...{ getValues, setValue, control, apiCall, distritos }} />
                    <Button disabled={loading} loading={loading} sx={{ width: "100%", backgroundColor: "#22b2aa", ":hover": { backgroundColor: "#006060", color: "white" }, fontWeight: "bold", color: "black" }} variant="contained" color="success" type="submit">
                        Editar Pedido
                    </Button>
                </form>
            </div>
        </div>
    )

}
export default EditarPedidos