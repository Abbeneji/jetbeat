import { LoginForm2 } from "./components/login-form-2"
import { Logo } from "@/components/logo"
import Link from "next/link"
import Image from "next/image"
import sign from "../../../../public/sign.png"
import jetbeat_logo from "../../../../public/jetbeat_logo.png"
import logo_gradient from "../../../../public/logo_gradient.png"
import logo_gradient_transparent from "../../../../public/logo_gradient_transparent.png"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
        <Link href="/dashboard">
        <img src={jetbeat_logo.src} alt="Jetbeat" className="h-10 w-10" />
<div className="grid flex-1 text-left text-sm leading-tight">
</div>
              </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm2 />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={sign}
          alt="Image"
          fill
          className="object-cover dark:brightness-[0.95]"
        />
      </div>
    </div>
  )
}
