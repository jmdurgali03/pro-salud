import { HeartPulse } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex">
            {/* Panel izquierdo - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                            <HeartPulse className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-4xl tracking-tight">ProSalud</span>
                    </div>

                    {/* Mensaje de bienvenida */}
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Bienvenido a tu<br />
                        sistema de gestión<br />
                        médica
                    </h1>

                    <p className="text-xl text-blue-100 leading-relaxed max-w-md">
                        Gestiona turnos, pacientes y profesionales de manera eficiente y segura.
                    </p>

                    {/* Features */}
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-lg text-blue-50">Gestión de turnos simplificada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-lg text-blue-50">Base de datos de pacientes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-lg text-blue-50">Control de profesionales</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}