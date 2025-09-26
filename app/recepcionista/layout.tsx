import { Navbar } from "./_components/navbar"

export default function RecepcionistaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main className="mt-20">
                {children}
            </main>
        </div>
    )
}
