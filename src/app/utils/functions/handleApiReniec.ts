import { Apis } from "../configs/proyectCurrent"

// interface Reniec {
//     dni: string
//     key: string
//     setValue: any
//     getValues: any
//     apiCall: any
//     loading: any
//     error: any
//     registroIndex: any
// }

export const handleApiReniec = async (dni: number, key: string, setValue: any, apiCall: any, registroIndex: string) => {

    // const url = "http://localhost:3001/api/auth/reniec" // dev
    const url = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/reniec`; // prd

// const urlDataMe = "http://localhost:3001/api/auth/getUser" // dev 
    const urlDataMe = `${Apis.URL_APOIMENT_BACKEND_DEV}/api/auth/getUser`; // prd

    try {

        const apiReniecMe = await apiCall("POST", urlDataMe, { documentoUsuario: dni });
        const existe = apiReniecMe?.data !== null ? true : false;
        console.log("existe usuario1?: ", existe);
        console.log("existe usuario2?: ", apiReniecMe);

        if (!existe || key === "dniConyugue") {
            const apiReniec = await apiCall("post", url, {
                dni: dni,
            });

            console.log(apiReniec);
            if (apiReniec !== undefined && key === "dniCliente") {
                console.log("apiReniec?.data?.data?.nombres1: ", apiReniec);
                setValue(`cliente.${registroIndex}.nombresCliente`, apiReniec?.data?.data?.nombres || apiReniec?.data?.nombres);
                setValue(`cliente.${registroIndex}.apellidoPaternoCliente`, apiReniec?.data?.data?.apellido_paterno || apiReniec?.data?.apellidoPaterno);
                setValue(`cliente.${registroIndex}.apellidoMaternoCliente`, apiReniec?.data?.data?.apellido_materno || apiReniec?.data?.apellidoMaterno);

                return;
            }
            else if (!apiReniec?.data?.success) {
                console.log("apiReniec?.data?.success3: ", apiReniec);
                setValue(`cliente.${registroIndex}.nombresCliente`, "");
                setValue(`cliente.${registroIndex}.apellidoPaternoCliente`, "");
                setValue(`cliente.${registroIndex}.apellidoMaternoCliente`, "");
                setValue(`cliente.${registroIndex}.celular`, "");

            }
        }
        else if (existe) {
            console.log("existe usuario3?: ", apiReniecMe?.data?.nombres);
            if (key === "dniCliente") {
                console.log("existe usuario44?: ", apiReniecMe?.data?.nombres);
                setValue(`cliente.${registroIndex}.nombresCliente`, apiReniecMe?.data?.nombres);
                setValue(`cliente.${registroIndex}.apellidoPaternoCliente`, apiReniecMe?.data?.apellidoPaterno);
                setValue(`cliente.${registroIndex}.apellidoMaternoCliente`, apiReniecMe?.data?.apellidoMaterno);
                setValue(`cliente.${registroIndex}.celular`, apiReniecMe?.data?.celular);

            }
            else {
                console.log("existe usuario77?: ", apiReniecMe?.data?.nombres);
                setValue(`cliente.${registroIndex}.nombresCliente`, apiReniecMe?.data?.nombres);
                setValue(`cliente.${registroIndex}.apellidoPaternoCliente`, apiReniecMe?.data?.apellidoPaterno);
                setValue(`cliente.${registroIndex}.apellidoMaternoCliente`, apiReniecMe?.data?.apellidoMaterno);
                setValue(`cliente.${registroIndex}.celular`, apiReniecMe?.data?.celular);
            }
        }

    } catch (error) {
        console.error("Error al consultar el DNI:", error);
    }
}