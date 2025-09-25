import { Navbar } from "./_components/navbar";

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main>{children}</main>
        </div>
    )
}
