"use client"

import { useRouter } from "next/navigation";

const Dashboard = () => {

    const images = [
        {
            src: "/realizarpedido.jpg",
            action: "REALIZAR PEDIDO",
            push: "realizarPedidos",
            alt: "Inmobiliaria Muñoz Logo",
            width: 56,
            height: 56,
        },
        {
            src: "/Tú decides Instagram post (1).png",
            action: "VER PEDIDOS",
            push: "pedidosClientes",
            alt: "Inmobiliaria Muñoz Logo",
            width: 56,
            height: 56,
        },
        // {
        //     src: "/utilidadtrimestral.jpg",
        //     action: "VER UTILIDADES",
        //     push: "verUtilidades",
        //     alt: "Inmobiliaria Muñoz Logo",
        //     width: 56,
        //     height: 56,
        // },
        {
            src: "/COBRARUTILIDA2.png",
            action: "COBRAR UTILIDAD",
            push: "cobrarUtilidad",
            alt: "Inmobiliaria Muñoz Logo",
            width: 56,
            height: 56,
        },
    ]

    const router = useRouter();

    return (
        <>
            <div className="grid grid-cols-1 gap-2 mt-5 !overflow-x-hidden">
                {images.map((image, index) => (
                    <div key={index} className="flex justify-center items-center">
                        <div onClick={() => router.push(`/dashboard/${image.push}`)} className="relative w-80 h-w-80 overflow-hidden shadow-lg group cursor-pointer">
                            <img
                                src={image.src}
                                alt="Imagen"
                                className="w-full h-full object-cover object-[center_10%] opacity-80 group-hover:opacity-100 transition-transform duration-300 scale-90 group-hover:scale-100"
                            />
                            {/* <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-green-500 hover:bg-green-700 font-bold px-4 py-2 rounded-xl font-bblueold text-slate-50 text-sm text-center cursor-pointer">
                                    {image.action}
                                </button>
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Dashboard