"use client"

import { formRealizaPedidos } from "@/app/utils/dataforms/dataForms";
import { handleApiReniec } from "@/app/utils/functions/handleApiReniec";
import { Autocomplete, TextField } from "@mui/material";
import moment from "moment-timezone";
import { useState } from "react";
import { Controller } from "react-hook-form";

export const FormRealizaPedidos = ({ getValues, setValue, control, apiCall }: any) => {

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
                {
                    formRealizaPedidos?.map((item, index) => {
                        return (
                            <>
                                {
                                    (item.type === "text" || item.type === "number" || item.type === "date" || item.type === "password") &&
                                    <div key={item.id} className="mt-2 w-full">
                                        <div className="flex flex-col justify-start items-start gap-0 w-full">
                                            <div className="uppercase text-sm font-bold text-white">{item.label}</div>
                                            <Controller
                                                name={`${item.name}`}
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
                                                        defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                        disabled={item.disabled}
                                                        required={(item.name == "direccionEntrega" && direccionObligatoria == true) ? true : item.required}
                                                        type={item.type === "date" ? "datetime-local" : item.type}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        multiline={item.multiline}
                                                        minRows={item.rows}
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
                                                            if (item.type === "date") {
                                                                // Convertir valor del input a zona horaria "America/Lima"
                                                                const limaTime = moment.tz(value, "YYYY-MM-DDTHH:mm", "America/Lima");
                                                                field.onChange(limaTime.format()); // ISO string con zona Lima (sin Z al final)
                                                            } else if (item.name === "documentoCliente") {
                                                                value = value.replace(/[^0-9.,]/g, "");// Permite solo números
                                                                if (value?.length > 12) value = value.slice(0, 12); // Máximo 12 caracteres
                                                                if (value.length === 8) {
                                                                    console.log("reniec");
                                                                    handleApiReniec(value, "dniCliente", setValue, apiCall, "0");
                                                                }
                                                            } else if (item?.type === "number") {
                                                                value = value.replace(/(?!^)-|[^0-9.,-]/g, "");// positivos y negativos
                                                                if (value?.length > 12) value = value.slice(0, 12); // Máximo 12 caracteres
                                                                // setChange(!change)
                                                                if (item.name === "precioUnitario") {
                                                                    // Si es el campo precio, actualizamos el valor en el array
                                                                    setValue(`precioVenta`, (Number(getValues(`cantidad`)) ?? 0) * (Number(value) ?? 0));
                                                                }
                                                                else if (item.name === "cantidad") {
                                                                    // Si es el campo precio, actualizamos el valor en el array
                                                                    setValue(`precioVenta`, (Number(getValues(`precioUnitario`)) ?? 0) * (Number(value) ?? 0));
                                                                }
                                                            }
                                                            // setChange(!change)
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    item.type === "select" &&
                                    <div key={item.id} className="mt-3 w-12/12">
                                        <div className="flex flex-col justify-start items-start gap-0 w-full">
                                            <div className="uppercase text-sm font-bold text-white">{item.label}</div>
                                            <div className="!w-full -mt-2">
                                                <Controller
                                                    name={`${item.name}`}
                                                    control={control}
                                                    rules={item.required ? { required: `${item.label} es obligatorio` } : {}}
                                                    render={({ field, fieldState }) => (
                                                        <Autocomplete
                                                            disabled={(item.disabled)}
                                                            options={item.name == "cantidadPaquetes" ?
                                                                handleGenerarArray(getValues()?.limitePedidos)
                                                                :
                                                                item.options
                                                            }
                                                            getOptionLabel={(option) => option?.label}
                                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                                            value={item.options.find(opt => opt.value === String(field.value)) || null}
                                                            onChange={(_, selectedOption) => {
                                                                field.onChange(selectedOption?.value ?? null);
                                                                setValue(`kilos`, (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0));
                                                                if (getValues()?.medioPago == "2") {
                                                                    setValue(`precio`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)} + ${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0))?.toFixed(2)} (18% IGV)`);
                                                                    setValue(`pagoTotal`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0) + (Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) + (getValues()?.lugarEntrega == "1" ? Number(6) : Number(0)))?.toFixed(2));
                                                                }
                                                                else if (getValues()?.medioPago == "1") {
                                                                    setValue(`precio`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)} + 0`);
                                                                    setValue(`pagoTotal`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) + (getValues()?.lugarEntrega == "1" ? Number(6) : Number(0)))?.toFixed(2));
                                                                }

                                                                if (getValues()?.lugarEntrega == "1") {
                                                                    setDireccionObligatoria(true);
                                                                }
                                                                else if (getValues()?.lugarEntrega == "2") {
                                                                    setDireccionObligatoria(false);
                                                                }
                                                                // setValue(`precioSinFactura`, ((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2));
                                                                // setValue(`precioConFactura`, `${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0))?.toFixed(2)} + ${((Number(getValues(`precioSemanal`)) ?? 0) * (Number(getValues(`cantidadPaquetes`)) ?? 0) * (Number(11) ?? 0) * (Number(0.18) ?? 0))?.toFixed(2)} (18% IGV)`);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    disabled={(item.disabled)}
                                                                    // label={item.label}
                                                                    margin="dense"
                                                                    // placeholder={item.placeholder}
                                                                    className="!w-full bg-slate-100 rounded-lg h-[40px]"
                                                                    fullWidth
                                                                    InputLabelProps={{
                                                                        shrink: true,
                                                                    }}
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
                                }
                            </>
                        )
                    })
                }
            </div>
        </>
    )
}