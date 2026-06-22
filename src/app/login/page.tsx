import { Logo } from "@/components/common/Logo";
import { LoginForm } from "./_components/login-form";
import Link from "next/link";

import { getSettings } from "@/lib/settings";

export default async function LoginPage() {
  const settings = await getSettings();
  return (
    <div className="flex min-h-full flex-col justify-center items-center px-6 py-12 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Logo className="h-12 w-auto mx-auto" />
        <h1 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-foreground">
          Blueprint to Automated Gains
        </h1>
        <h2 className="mt-2 text-center text-xl leading-9 tracking-tight text-muted-foreground">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href={settings?.supportWhatsApp || "https://wa.me/2349038633816"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold leading-6 text-primary hover:text-primary/80"
          >
            Contact Support on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
