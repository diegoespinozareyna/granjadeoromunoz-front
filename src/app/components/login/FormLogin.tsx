import { formLogin } from "@/app/utils/dataforms/dataForms";
import { handleApiReniec } from "@/app/utils/functions/handleApiReniec";
import { Autocomplete, TextField } from "@mui/material";
import moment from "moment-timezone";
import { Controller } from "react-hook-form";

export const FormLogin = ({ getValues, setValue, control, apiCall }: any) => {
    return (
        <>
            <div className="flex flex-col justify-center items-center gap-2 w-full">
                {
                    formLogin?.map((item, index) => {
                        return (
                            <>
                                {
                                    (item.type === "text" || item.type === "number" || item.type === "date" || item.type === "password") &&
                                    <div key={item.id} className="mt-1 w-full">
                                        <div className="flex flex-col justify-start items-start gap-0 w-full">
                                            <div className="uppercase text-sm font-bold text-white">{item.label}</div>
                                            <Controller
                                                name={`${item.name}`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        // label={item.label}
                                                        variant="outlined"
                                                        size="small"
                                                        defaultValue={item.type === "date" ? moment.tz("America/Lima").format("YYYY-MM-DDTHH:mm") : ""}
                                                        disabled={item.disabled}
                                                        required={item.required}
                                                        type={item.type === "date" ? "datetime-local" : item.type}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        multiline={item.multiline}
                                                        minRows={item.rows}
                                                        className="w-full"
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
                                    item.type === "select" && item.name === "nombreProducto" &&
                                    <div key={item.id} className="mt-2 w-5/12">
                                        <Controller
                                            name={`${item.name}`}
                                            control={control}
                                            rules={item.required ? { required: `${item.label} es obligatorio` } : {}}
                                            render={({ field, fieldState }) => (
                                                <Autocomplete
                                                    disabled={(item.disabled)}
                                                    options={item.options}
                                                    getOptionLabel={(option) => option.label}
                                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                                    value={item.options.find(opt => opt.value === field.value) || null}
                                                    onChange={(_, selectedOption) => {
                                                        field.onChange(selectedOption?.value ?? null);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            disabled={(item.disabled)}
                                                            label={item.label}
                                                            margin="dense"
                                                            fullWidth
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error ? fieldState.error.message : ""}
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </div>
                                }
                            </>
                        )
                    })
                }
            </div >
        </>
    )
}