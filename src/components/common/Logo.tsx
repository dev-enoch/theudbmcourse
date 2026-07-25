import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={256}
      height={256}
      className={cn('h-8 w-auto', className)}
    />
  );
}
