import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. 
            Velit officia consequat duis enim velit mollit.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 w-full max-w-md mx-auto lg:mx-0">
            <Input 
              type="email" 
              placeholder="Enter Your Email" 
              className="h-14 w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
            />
            <Button className="h-14 w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base">
              Notify Me
            </Button>
          </div>
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
