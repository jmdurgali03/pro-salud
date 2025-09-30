import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar-admin";


export default function GerenteLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex w-full h-screen">
                <AppSidebar />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
