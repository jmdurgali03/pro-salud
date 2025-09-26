import { Sidebar } from "./_components/sidebar";

export default function RecepcionistaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Mesa de Entrada</h1>
                {children}
            </main>
        </div>
    );
}
