"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Hero() {
    return (
        <main>
            {/* Hero Section */}
            <section
                id="inicio"
                className="relative h-[90vh] flex items-center justify-center text-center"
            >
                {/* Background Image */}
                <Image
                    src="/hero-bg.jpg"
                    alt="Hero Background"
                    fill
                    priority
                    className="object-cover"
                />
                {/* Overlay difuminado con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]" />

                {/* Content */}
                <div className="relative z-10 max-w-3xl px-6 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                        Transforma la gestión de tu centro de atención
                    </h1>
                    <p className="text-lg md:text-xl mb-8 text-gray-200">
                        ProSalud te ofrece una plataforma integral para optimizar la
                        administración de pacientes, citas y recursos, mejorando la
                        eficiencia y la calidad del servicio.
                    </p>
                </div>
            </section>

            {/* Funcionalidades Clave */}
            <section
                id="servicios"
                className="py-20 bg-gray-50"
            >
                <div className="container mx-auto text-center mb-12 px-6">
                    <h2 className="text-3xl font-bold mb-4">Funcionalidades clave</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Descubre cómo ProSalud puede revolucionar la gestión de tu centro de atención médica.
                    </p>
                </div>

                <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-6">
                    {[
                        {
                            title: "Gestión de Citas",
                            desc: "Programa y gestiona citas de forma eficiente, con recordatorios automáticos.",
                            icon: "📅",
                        },
                        {
                            title: "Administración de Pacientes",
                            desc: "Mantén un registro completo de cada paciente, incluyendo historial médico.",
                            icon: "👥",
                        },
                        {
                            title: "Registros Médicos",
                            desc: "Accede y actualiza registros médicos de forma segura y organizada.",
                            icon: "📑",
                        },
                        {
                            title: "Facturación y Pagos",
                            desc: "Simplifica el proceso de facturación y permite pagos en línea.",
                            icon: "💳",
                        },
                    ].map((item, idx) => (
                        <Card
                            key={idx}
                            className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <CardHeader>
                                <span className="text-4xl">{item.icon}</span>
                                <CardTitle className="mt-2">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Contacto */}
            <section
                id="contacto"
                className="py-20 container mx-auto px-6"
            >
                <div className="max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8">Contacto</h2>
                    <form className="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre</label>
                            <Input placeholder="Tu nombre" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                            <Input type="email" placeholder="Tu correo electrónico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Mensaje</label>
                            <Textarea placeholder="Tu mensaje" rows={4} />
                        </div>
                        <Button type="submit" className="w-full">
                            Enviar
                        </Button>
                    </form>
                </div>
            </section>
        </main>
    )
}
