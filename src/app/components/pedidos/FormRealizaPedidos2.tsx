"use client"

import { formRealizaPedidos } from "@/app/utils/dataforms/dataForms";
import { handleApiReniec } from "@/app/utils/functions/handleApiReniec";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import moment from "moment-timezone";
import { useState } from "react";
import { Controller } from "react-hook-form";

export const FormRealizaPedidos2 = ({ getValues, setValue, control, apiCall }: any) => {

    const [direccionObligatoria, setDireccionObligatoria] = useState(false);

    const handleGenerarArray = (cantidad: any) => {
        if (!cantidad || isNaN(cantidad)) return [];
        return Array.from({ length: cantidad }, (_, i) => ({
            value: String(i + 1),  // <-- asegúrate de que sean strings
            label: String(i + 1),
        }));
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-2 w-full">
                <div className="mt-3 w-12/12">

                    <div className="grid grid-cols-2 justify-start items-start gap-1 w-full mt-3">
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Fecha de Pedido"}</div>
                            <Controller
                                name={`fechaPedido`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"date"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        className="w-full bg-cyan-200"
                                        sx={{
                                            input: {
                                                color: '#000', // texto negro
                                                WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                border: 'none',
                                                borderRadius: '10px',
                                                // backgroundColor: '#efefef',
                                            },
                                            '.Mui-disabled': {
                                                WebkitTextFillColor: '#000 !important',
                                                color: '#000 !important',
                                                opacity: 1, // elimina el desvanecido
                                            },
                                        }}
                                        onChange={(e: any) => {
                                            let value = e.target.value;
                                            // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Fecha Entrega"}</div>
                            <Controller
                                name={`fechaEntregaPedido`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"date"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        className="w-full bg-cyan-200"
                                        sx={{
                                            input: {
                                                color: '#000', // texto negro
                                                WebkitTextFillColor: '#000', // asegura que los navegadores lo muestren
                                                border: 'none',
                                                borderRadius: '10px',
                                                // backgroundColor: '#efefef',
                                            },
                                            '.Mui-disabled': {
                                                WebkitTextFillColor: '#000 !important',
                                                color: '#000 !important',
                                                opacity: 1, // elimina el desvanecido
                                            },
                                        }}
                                        onChange={(e: any) => {
                                            let value = e.target.value;
                                            // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-0 w-full mt-3">
                        <div className="flex flex-col justify-center items-center w-3/4">
                            <div className="uppercase text-sm font-bold text-white">{"Cantidad de Paquetes"}</div>
                            <div className="!w-full -mt-2">
                                <Controller
                                    name={`cantidadPaquetes`}
                                    control={control}
                                    rules={true ? { required: `Cantidad de Paquetes es obligatorio` } : {}}
                                    render={({ field, fieldState }) => (
                                        <Autocomplete
                                            // disabled={(item.disabled)}
                                            options={handleGenerarArray(getValues()?.limitePedidos)}
                                            getOptionLabel={(option) => option?.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={handleGenerarArray(getValues()?.limitePedidos).find(opt => opt.value === String(field.value)) || null}
                                            onChange={(_, selectedOption) => {
                                                field.onChange(selectedOption?.value ?? null);
                                                setValue(`kilos`, (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0));
                                                // if (getValues()?.medioPago == "2") {
                                                //     setValue(`precio`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)} + ${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0))?.toFixed(2)} (18% IGV)`);
                                                //     setValue(`pagoTotal`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0) + (Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) + (getValues()?.lugarEntrega == "1" ? Number(6) : Number(0)))?.toFixed(2));
                                                // }
                                                // else if (getValues()?.medioPago == "1") {
                                                // }
                                                setValue(`precio`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)}`);

                                                setValue(`pagoTotal`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) + Number(6))?.toFixed(2));

                                                setValue(`entregaDomicilio`, Number(getValues(`cantidadPaquetes`)) <= 3 ? Number(6) : Number(getValues(`cantidadPaquetes`)) <= 6 ? Number(10) : Number(getValues(`cantidadPaquetes`)) <= 10 ? Number(12) : Number(12));

                                                // if (getValues()?.lugarEntrega == "1") {
                                                //     setDireccionObligatoria(true);
                                                // }
                                                // else if (getValues()?.lugarEntrega == "2") {
                                                //     setDireccionObligatoria(false);
                                                // }
                                                // setValue(`precioSinFactura`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2));
                                                // setValue(`precioConFactura`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)} + ${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0))?.toFixed(2)} (18% IGV)`);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    // disabled={(item.disabled)}
                                                    // label={item.label}
                                                    margin="dense"
                                                    // placeholder={item.placeholder}
                                                    placeholder={"seleccione cantidad"}
                                                    className="!w-full bg-slate-100 rounded-lg h-[40px]"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    required={true}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error ? fieldState.error.message : ""}
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


                    <div className="grid grid-cols-2 justify-start items-start gap-1 w-full mt-3">
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Precio"}</div>
                            <Controller
                                name={`precioSemanal`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                        }}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"number"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
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
                                            value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Kilos"}</div>
                            <Controller
                                name={`kilos`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"number"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        className="w-full"
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
                                            value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 justify-start items-start gap-1 w-full mt-3">
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Precio S/."}</div>
                            <Controller
                                name={`precio`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"number"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                        }}
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
                                            value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"A Domicilio"}</div>
                            <Controller
                                name={`entregaDomicilio`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"number"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                        }}
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
                                            value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* <div className="grid grid-cols-1 justify-start items-start gap-1 w-full mt-3">
                    </div> */}

                    <div className="grid grid-cols-1 justify-start items-start gap-1 w-full mt-3">
                        <div>
                            <div className="uppercase text-sm font-bold text-white">{"Dirección de Entrega"}</div>
                            <Controller
                                name={`direccionEntrega`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={false}
                                        required={true}
                                        type={"text"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        multiline={true}
                                        minRows={2}
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
                                            // value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-1 w-full mt-3">
                        <div className="flex flex-col justify-center items-center w-1/2">
                            <div className="uppercase text-sm font-bold text-white">{"Total a Pagar S/."}</div>
                            <Controller
                                name={`pagoTotal`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error ? fieldState.error.message : ""}
                                        // label={item.label}
                                        variant="outlined"
                                        // placeholder={item.placeholder}
                                        size="small"
                                        // defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                        disabled={true}
                                        // required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                        type={"number"}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // multiline={item.multiline}
                                        // minRows={item.rows}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">S/.</InputAdornment>,
                                        }}
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
                                            value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex flex-col justify-center items-center w-full text-xs text-center text-white font-bold">
                            Pago Contraentrega: Efectivo/yape/transferencia
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}