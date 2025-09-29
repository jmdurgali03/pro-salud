import { Navbar } from "./_components/navbar";

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <main>{children}</main>
        </div>
    )
}
