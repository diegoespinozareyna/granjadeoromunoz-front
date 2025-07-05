"use client"

import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import "./styleFondoOro.css"
import { FormLogin } from '@/app/components/login/FormLogin';
import useApi from '@/app/hooks/fetchData/useApi';
import { Button } from '@mui/material';
import { Apis } from '@/app/utils/configs/proyectCurrent';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

export const Login = () => {
    // const { user, setUser, loading, setLoading } = useUserStore()
    const { getValues, setValue, handleSubmit, control } = useForm()
    // const [showPassword, setShowPassword] = useState(false)
    const { apiCall, loading, error } = useApi()

    // const [session, setSession] = useState<any>(null);

    const onSubmit = async (data: any) => {
        console.log(data)
        const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/login`
        const jsonData = {
            ...data,
        };

        try {
            const dataLogin = await apiCall({ method: "post", endpoint: url, data: jsonData });
            console.log("dataLogin", dataLogin);
            console.log(error);
            localStorage.setItem("auth-token", dataLogin.token)
            const decoded: any = jwtDecode(dataLogin.token as string);
            console.log('Datos del usuario:', decoded?.user);
            // setSession(decoded?.user);

            Swal.fire({
                title: 'Ingresó con éxito',
                // text: "Esta acción no se puede deshacer",
                icon: 'success',
                showConfirmButton: false,
                // showCancelButton: true,
                // confirmButtonColor: '#3085d6',
                // cancelButtonColor: '#d33',
                // confirmButtonText: 'OK',
                // cancelButtonText: 'No',
                // showLoaderOnConfirm: true,
                // allowOutsideClick: false,
                // preConfirm: () => {
                //     return
                // },
            });
            setTimeout(() => {
                if (decoded?.user?.userType !== "admin") {
                    window.location.href = `/dashboard/${Apis.PROYECTCURRENT}`;
                } else {
                    window.location.href = `/dashboard/pedidosAdmin`;
                }
            }, 500);

        } catch (error) {
            Swal.fire({
                title: 'Ocurrio un error, verifique su usuario y/o contraseña',
                text: '',
                icon: 'warning',
                // showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK',
                // cancelButtonText: 'No',
                showLoaderOnConfirm: true,
                allowOutsideClick: false,
                preConfirm: () => {
                    // window.location.href = '/';
                    localStorage.removeItem("auth-token");
                    return
                },
            });
            console.error("Error al consultar el DNI:", error);
        }

    }

    return (
        <div
            // id='fondo-oro-verde' 
            className="w-full min-h-screen flex items-center justify-center !bg-oro-radial p-4 relative overflow-hidden bg-[#007c7c]"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div
                    // id='fondo-oro-verde' 
                    className="shadow-2xl rounded-lg overflow-hidden bg-[#22b2aa]"
                >
                    <div className="p-8 relative">
                        <div className="text-center mb-8">
                            <div className='rounded-full overflow-hidden relative z-50 flex justify-center items-center mb-4'>
                                <div className='rounded-full overflow-hidden relative z-50 flex'>
                                    <img
                                        src={"/logo.jpg"}
                                        alt="Inmobiliaria Muñoz Logo"
                                        className="h-56 mx-auto relative z-10"
                                    />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Bienvenido a</h2>
                            <h2 className="text-2xl font-bold text-yellow-500">{"Granja de Oro"}</h2>
                            <p className="text-gray-600">Acceda a su cuenta exclusiva</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FormLogin {...{ getValues, setValue, control, apiCall }} />
                            <Button disabled={loading} loading={loading} sx={{ width: "100%" }} variant="contained" color="success" type="submit">
                                Acceder
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
