import { SidebarProvider } from "@/components/ui/sidebar";

export default function ProfesionalLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex w-full h-screen">
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
