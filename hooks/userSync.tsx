"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthSync() {
    const { userId } = useAuth();
    const { user } = useUser();
    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);

    useEffect(() => {
        if (userId && user?.primaryEmailAddress?.emailAddress) {
            createUserIfNotExists({
                clerkId: userId,
                email: user.primaryEmailAddress.emailAddress,
                nombre: user.firstName ?? "",
                apellido: user.lastName ?? "",
            });
        }
    }, [userId, user, createUserIfNotExists]);

    return null;
}
