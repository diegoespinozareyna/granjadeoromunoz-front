
"use client"

import useApi from "@/app/hooks/fetchData/useApi";
import { Apis } from "@/app/utils/configs/proyectCurrent";
import { Autocomplete, Button, Card, CardContent, CardHeader, IconButton, InputAdornment, TextField } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Badge, Calendar, CheckCircle, Clock, Loader2, MapPin, Package, PencilLine, RotateCcw, ScrollText, SearchIcon, X } from "lucide-react";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import { FormCrearUsuario } from "@/app/components/usuarios/FormCrearUsuario";

const CrearUsuario = () => {

    const router = useRouter();
    const { apiCall, loading, error } = useApi()
    const { getValues, setValue, handleSubmit, control } = useForm()

    useEffect(() => {
        setValue("membresia500", "0");
        setValue("menbresia200", "0");
        setValue("statusActive", "1");
    }, [])

    const onSubmit = async (data: any) => {
        console.log(data)

        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/registroUsuario`
        const response = await apiCall({
            method: "post", endpoint: url, data: { ...data, role: "user client", userType: "client" }
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
                                Crear Usuario
                            </Button>
                        </div>
                    </div>
                </form >
            </div >
        </>
    )
}

export default CrearUsuario