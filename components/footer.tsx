export function Footer() {
    return (
        <footer className="relative bg-white/80 backdrop-blur-md border-t">
            <div className="container mx-auto px-6 py-12">
                <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-3 items-start">
                    {/* Columna izquierda */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="ProSalud Logo" className="h-10 w-auto" />
                            <span className="font-bold text-lg text-gray-800">ProSalud</span>
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Plataforma integral para optimizar la administración de pacientes,
                            citas y recursos en tu centro de atención médica.
                        </p>
                    </div>

                    {/* Columna centro */}
                    <div className="flex flex-col items-center text-center">
                        <h3 className="font-semibold text-gray-800 mb-4">Enlaces rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { href: "#inicio", label: "Inicio" },
                                { href: "#servicios", label: "Servicios" },
                                { href: "#acerca", label: "Acerca de" },
                                { href: "#contacto", label: "Contacto" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="hover:text-gray-900 hover:underline underline-offset-4 transition"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna derecha */}
                    <div className="flex flex-col items-center md:items-end text-center md:text-right">
                        <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-gray-900 hover:underline underline-offset-4 transition">
                                    Política de Privacidad
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-gray-900 hover:underline underline-offset-4 transition">
                                    Términos de Servicio
                                </a>
                            </li>
                        </ul>
                        <div className="flex gap-4 mt-6">
                            {[
                                { icon: "🔗", label: "LinkedIn" },
                                { icon: "🐦", label: "Twitter" },
                                { icon: "📘", label: "Facebook" },
                            ].map((item, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    aria-label={item.label}
                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t text-center text-sm py-4 text-gray-500">
                © {new Date().getFullYear()} ProSalud. Todos los derechos reservados.
            </div>
        </footer>
    )
}
