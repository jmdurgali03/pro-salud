import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

export default function ContactSection() {
    return (
        <section className="py-28" id="contacto">
            <div className="mx-auto max-w-3xl px-8 lg:px-0">
                <h1 className="text-center text-4xl font-semibold lg:text-5xl">
                    Contacto
                </h1>
                <p className="mt-4 text-center text-muted-foreground max-w-xl mx-auto">
                    En <span className="font-semibold text-primary">Pro Salud</span>,
                    estamos comprometidos con brindar la mejor atención médica en Salta.
                    Completa el formulario y nuestro equipo se comunicará contigo a la brevedad.
                </p>

                <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Estamos aquí para ayudarte 🩺
                        </h2>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Déjanos tus datos y cuéntanos cómo podemos acompañarte en la
                            gestión de turnos, consultas o cualquier necesidad relacionada
                            con nuestros servicios en Salta.
                        </p>
                    </div>

                    <form
                        action=""
                        className="**:[&>label]:block mt-4 space-y-6 *:space-y-3"
                    >
                        <div>
                            <Label htmlFor="name">Nombre y Apellido</Label>
                            <Input type="text" id="name" required />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" required />
                        </div>

                        <div>
                            <Label htmlFor="phone">Teléfono (opcional)</Label>
                            <Input type="tel" id="phone" />
                        </div>

                        <div>
                            <Label>Motivo de contacto</Label>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona el motivo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="turnos">Solicitar turno</SelectItem>
                                    <SelectItem value="informacion">Más información</SelectItem>
                                    <SelectItem value="servicios">Consultas sobre servicios</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="msg">Mensaje</Label>
                            <Textarea id="msg" rows={3} />
                        </div>

                        <Button className="w-full">Enviar</Button>
                    </form>
                </Card>
            </div>
        </section>
    )
}
