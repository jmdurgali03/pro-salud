import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <SignIn
            appearance={{
                elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 p-0",
                    formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm normal-case",
                }
            }}
        />
    )
}
