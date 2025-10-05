"use client"

import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs';
import Link from 'next/link'

export default function CallToAction() {
    const { isSignedIn } = useUser();

    return (
        <section className="py-8">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
                        Reserve su turno por internet
                    </h2>
                    <p className="mt-4">Fácil, rápido y cómodo</p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {isSignedIn ? (
                            <Button
                                asChild
                                size="lg"
                                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            >
                                <Link href="/">
                                    <span>Turno Online</span>
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href="/sign-up">
                                        <span>Registrar</span>
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline">
                                    <Link href="/sign-in">
                                        <span>Iniciar Sesion</span>
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}