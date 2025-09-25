import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useRoleRedirect() {
    const router = useRouter();

    const goToRolePage = useCallback((role: string) => {
        switch (role) {
            case "usuario":
                router.push("/usuario");
                break;
            case "profesional":
                router.push("/profesional");
                break;
            case "recepcionista":
                router.push("/recepcion/cal-turnos");
                break;
            case "gerente":
                router.push("/gerente/dashboard");
                break;
            default:
                router.push("/");
        }
    }, [router]);

    return { goToRolePage };
}
