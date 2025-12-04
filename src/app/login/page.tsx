import { Logo } from "@/components/common/Logo";
import { LoginForm } from "./_components/login-form";
import Link from "next/link";

export default function LoginPage() {
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
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold leading-6 text-primary hover:text-primary/80"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
