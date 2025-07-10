
"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Autocomplete, Button, Card, CardContent, CardHeader, IconButton, InputAdornment, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Badge, Calendar, CheckCircle, Clock, Loader2, MapPin, Package, PencilLine, RotateCcw, ScrollText, SearchIcon, X } from "lucide-react";
import moment from "moment-timezone";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import { FormCrearUsuario } from "@/app/components/usuarios/FormCrearUsuario";

const editarUsuario = () => {

    const params = useParams();

    const refFecthUsers = useRef(true);

    console.log("params", params.id);

    const router = useRouter();
    const { apiCall, loading, error } = useApi()
    const { getValues, setValue, handleSubmit, control } = useForm()

    const fetchUsuarioUnique = async () => {
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getUserById`;
        const response = await apiCall({
            method: "get", endpoint: url, data: null, params: { id: params.id }
        });
        console.log("response", response);
        setValue("statusActive", response?.data?.statusActive);
        setValue("nombres", response?.data?.nombres);
        setValue("apellidoPaterno", response?.data?.apellidoPaterno);
        setValue("apellidoMaterno", response?.data?.apellidoMaterno);
        setValue("documentoUsuario", response?.data?.documentoUsuario);
        setValue("password", response?.data?.password);
        setValue("membresia500", response?.data?.membresia500 ?? "0");
        setValue("menbresia200", response?.data?.menbresia200 ?? response?.data?.membresia200 ?? "0");
        setValue("celular", response?.data?.celular);
        setValue("direccion", response?.data?.direccion);
        setValue("distrito", response?.data?.distrito);
        setValue("provincia", response?.data?.provincia);
        setValue("departamento", response?.data?.departamento);
    }

    useEffect(() => {
        if (refFecthUsers.current) {
            fetchUsuarioUnique();
            refFecthUsers.current = false;
        }
    }, [])

    const onSubmit = async (data: any) => {
        console.log(data)

        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/editarUsuarioId`
        const response = await apiCall({
            method: "put", endpoint: url, data: { ...data, role: "user client", userType: "client", id: params.id }
        })
        console.log("responsefuianl: ", response)
        if (response.status === 201) {
            Swal.fire({
                title: 'Usuario creado',
                text: 'Se ha creado el usuario',
                icon: 'success',
                confirmButtonText: 'OK',
                // showCancelButton: true,
                confirmButtonColor: '#3085d6',
                // cancelButtonColor: '#d33',
                // cancelButtonText: 'No',
                showLoaderOnConfirm: true,
                allowOutsideClick: false,
                preConfirm: () => {
                    router.push(`/dashboard/verUsuarios`);
                    // window.location.href = `/dashboard/${Apis.PROYECTCURRENT}`;
                    return
                },
            });
        } else {
            Swal.fire({
                title: 'Error al crear usuario',
                text: 'No se ha podido crear el usuario',
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
        <>
            <Button sx={{ backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }} onClick={() => router.push(`/dashboard/verUsuarios`)} variant="outlined" color="primary">
                {"<< Atras"}
            </Button>
            <div className="flex flex-col gap-2 bg-[rgba(255,255,255,0.8)] rounded-lg p-3 px-3 mt-1 w-[350px] mx-2">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-3">
                        <div className="uppercase text-center text-base font-bold text-black">
                            {"Crear Usuario"}
                        </div>
                        <div className="flex flex-col gap-3">
                            <FormCrearUsuario {...{ getValues, setValue, handleSubmit, control, apiCall, loading, error }} />
                        </div>
                        <div className="flex flex-row gap-3 px-3">
                            <Button
                                sx={{ width: "100%", backgroundColor: "#22b2aa", fontWeight: "bold", color: "black", ":hover": { backgroundColor: "#006060", color: "white" } }}
                                variant="outlined"
                                color="primary"
                                type="submit"
                            >
                                Editar Usuario
                            </Button>
                        </div>
                    </div>
                </form >
            </div >
        </>
    )
}

export default editarUsuario