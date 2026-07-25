import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 md:p-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center justify-between gap-12 lg:flex-row">
        
        {/* Left Content */}
        <div className="flex w-full flex-col space-y-6 lg:w-1/2 lg:pr-12 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-6xl font-serif tracking-tight text-slate-800 dark:text-slate-100 md:text-7xl lg:text-8xl">
              Sorry!
            </h1>
            <h2 className="text-2xl font-light text-slate-600 dark:text-slate-400 md:text-3xl">
              We're doing some maintenance
            </h2>
          </div>
          
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            We are currently performing some scheduled maintenance to improve our platform. 
            Please check back shortly. Thank you for your patience!
          </p>
        </div>

        {/* Right Illustration */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <Image
            src="/images/maintenance-illustration.png"
            alt="Maintenance in progress"
            width={700}
            height={600}
            className="w-full max-w-[600px] h-auto object-contain drop-shadow-sm hue-rotate-[-150deg] saturate-150"
            priority
          />
        </div>

      </div>
    </div>
  );
}
