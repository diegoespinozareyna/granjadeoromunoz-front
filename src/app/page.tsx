import { Login } from "./containers/login/Login";
import "./styleFondoOro.css"

export default function Home() {

  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div
      // id="fondo-oro-verde"
      className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] font-[family-name:var(--font-geist-sans)] !overflow-x-hidden bg-[#007c7c]"
    >
      <Login />
    </div>
  );
}
