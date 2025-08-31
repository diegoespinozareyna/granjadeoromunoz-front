import { Autocomplete, Button, TextField } from "@mui/material";
import { CheckCheck, Eye, X } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import Swal from "sweetalert2";

export const PopUpGeneral = ({ getValues, setValue, control, hangeStatePopUp, handleSubirVouchers, infoOrder, handleEditVoucher, loading2, pagoTransferencia }: any) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(50,50,50,0.1)]">
            <div className="bg-white p-6 rounded-lg shadow-lg m-2 flex flex-col justify-center items-center overflow-y-auto max-h-[90vh] w-full sm:w-[400px] md:w-[500px] lg:w-[600px]">
                <h2 className="text-xl font-bold mb-4">{getValues()?.dataPoUp?.title}</h2>
                {
                    pagoTransferencia &&
                    <div className="flex flex-col justify-center items-center gap-1 mb-3">
                        <div>
                            {`Debe realizar el pago total de S/. ${getValues()?.pagoTotal} por cualquiera de los siguientes medios de pago: `}
                        </div>
                        <img src="/transferenciamunoz.jpg" alt="transferencia" className="w-[80%] h-auto" />
                        <div className="flex flex-col justify-center items-center gap-0 mt-1">
                            <div className="font-bold text-xs text-red-500 mt-1">
                                {`* El voucher que seleccione debe ser de: S/. ${getValues()?.pagoTotal} `}
                            </div>
                            <div className="font-bold text-xs text-red-500 mt-1 uppercase">
                                {`(Caso contrario se rechazará su pedido)`}
                            </div>
                        </div>
                    </div>
                }
                {
                    getValues()?.dataPoUp?.action === "subirVoucher" &&
                    <div className="flex flex-col gap-1">
                        {
                            pagoTransferencia !== true &&
                            <>
                                <div>
                                    <Controller
                                        name={`monto`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error ? fieldState.error.message : ""}
                                                label={"Coloque Monto de voucher"}
                                                variant="outlined"
                                                size="small"
                                                // disabled={true}
                                                required={true}
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
                                                    value = value.replace(/(?!^)-|[^0-9.]/g, "");// positivos y negativos
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Controller
                                        name={`formaPago`}
                                        control={control}
                                        rules={true ? { required: `Medio de Pago es obligatorio` } : {}}
                                        render={({ field, fieldState }) => (
                                            <Autocomplete
                                                options={[
                                                    {
                                                        value: "0", label: "Efectivo",
                                                    },
                                                    {
                                                        value: "1", label: "Yape",
                                                    },
                                                    {
                                                        value: "2", label: "Transferencia",
                                                    },
                                                ]}
                                                getOptionLabel={(option) => option?.label}
                                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                                value={[
                                                    {
                                                        value: "0", label: "Efectivo",
                                                    },
                                                    {
                                                        value: "1", label: "Yape",
                                                    },
                                                    {
                                                        value: "2", label: "Transferencia",
                                                    },
                                                ].find(opt => opt.value === String(field.value)) || null}
                                                onChange={(_, selectedOption) => {
                                                    field.onChange(selectedOption?.value ?? null)
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        margin="dense"
                                                        placeholder={"Seleccione Medio de Pago"}
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
                            </>
                        }
                        <div className="flex justify-start items-center gap-1">
                            <Controller
                                name="filePago"
                                control={control}
                                rules={{ required: "Se requiere un archivo de imagen" }}
                                render={({ field, fieldState }) => {
                                    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

                                    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        setValue("dataVoucher", file); // necesario para React Hook Form
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            setPreviewUrl(url);
                                            field.onChange(file); // necesario para React Hook Form
                                        }
                                    };

                                    return (
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="cursor-pointer flex justify-center items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <div
                                                    className={`text-xs bg-red-500 hover:bg-blue-700 text-white px-2 py-1 rounded-lg flex items-center`}
                                                >
                                                    <div>
                                                        <div>Seleccione Voucher OBLIGATORIO</div>
                                                    </div>
                                                </div>
                                                {
                                                    previewUrl &&
                                                    <>
                                                        <div><CheckCheck color="green" size={20} /></div>
                                                    </>
                                                }
                                            </label>
                                            {previewUrl && (
                                                <>
                                                    {/* <a
                                                        href={previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Ver imagen"
                                                    >
                                                        <Eye size={18} />
                                                    </a> */}
                                                    <>
                                                        <div
                                                            className="relative z-50 cursor-pointer"
                                                            onClick={() => {
                                                                setPreviewUrl(null)
                                                                setValue("dataVoucher", null);
                                                            }}
                                                        >
                                                            <X color="red" size={20} />
                                                        </div>
                                                    </>
                                                    <div
                                                        className="cursor-pointer -mt-3"
                                                        onClick={() => window.open(previewUrl, "_blank")}
                                                    >
                                                        <img
                                                            src={previewUrl}
                                                            alt="Vista previa"
                                                            style={{ width: 200, height: "auto", marginTop: 8, borderRadius: 4 }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                }
                {
                    getValues()?.dataPoUp?.action === "verVouchers" &&
                    (
                        getValues()?.VouchersAll?.length > 0 ?
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-1">
                                {
                                    getValues()?.VouchersAll?.map((item: any, index: number) => (
                                        <div key={index} className="flex flex-col justify-between items-center border-2 border-[#22B2AA] rounded-lg p-3 px-2">
                                            <img
                                                src={item.url}
                                                alt={`Voucher ${index + 1}`}
                                                className="w-full h-auto rounded-lg shadow-md cursor-pointer"
                                                onClick={async () => {
                                                    const { isConfirmed } = await Swal.fire({
                                                        title: `Cambiar Status de voucher`,
                                                        html: `
                                                                <select id="status" class="swal2-input">
                                                                  <option value="">Selecciona un estado</option>
                                                                  <option value="0">Pendiente</option>
                                                                  <option value="1">Aceptado</option>
                                                                  <option value="2">Rechazado</option>
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
                                                                await handleEditVoucher(item._id, item.codPedido);
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
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            :
                            <div className="flex justify-start items-center gap-1">
                                {"Este pedido no cuenta con Vouchers subidos."}
                            </div>
                    )
                }
                <div className="mt-4 flex justify-end">
                    {
                        getValues()?.dataPoUp?.action === "subirVoucher" &&
                        <>
                            <div className="flex gap-2">
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleSubirVouchers(infoOrder)}
                                    disabled={
                                        pagoTransferencia !== true ?
                                            ((getValues()?.monto == undefined || getValues()?.formaPago == undefined || getValues()?.dataVoucher == undefined)
                                                || (getValues()?.monto == null || getValues()?.formaPago == null || getValues()?.dataVoucher == null)
                                                || (getValues()?.monto == "" || getValues()?.formaPago == "" || getValues()?.dataVoucher == "")
                                                || loading2)
                                            :
                                            pagoTransferencia == true &&
                                            ((getValues()?.dataVoucher == undefined)
                                                || (getValues()?.dataVoucher == null)
                                                || (getValues()?.dataVoucher == "")
                                                || loading2)
                                    }
                                >
                                    Subir Voucher
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => {
                                    hangeStatePopUp(false)
                                    setValue("dataVoucher", null);
                                    setValue("monto", null);
                                    setValue("formaPago", null);
                                }}>
                                    Cerrar
                                </Button>
                            </div>
                        </>
                    }
                    {
                        getValues()?.dataPoUp?.action === "verVouchers" &&
                        <div className="flex gap-2">
                            <Button variant="outlined" color="error" onClick={() => {
                                hangeStatePopUp(false)
                            }}>
                                Cerrar
                            </Button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}