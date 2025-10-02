import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <SignUp
            appearance={{
                elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 p-0",
                    formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm normal-case",
                    formFieldInput: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    footerActionLink: "text-blue-600 hover:text-blue-700",
                }
            }}
        />
    )
}