import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function AuthCard({
  eyebrow = 'CUENTA STUDENT NOTES',
  title,
  description,
  icon,
  children,
}: AuthCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[28px] border border-white/80 bg-card p-6 shadow-[0_24px_90px_-40px_rgba(27,35,67,.28)] backdrop-blur-xl sm:p-9 dark:border-white/[.07]"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {icon ? (
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-primary">
          {icon}
        </div>
      ) : null}
      <p className="text-[10px] font-semibold tracking-[.19em] text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-[29px] font-semibold leading-[1.13] tracking-[-.045em] sm:text-[34px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[42ch] text-sm leading-6 text-muted sm:text-[15px]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </motion.section>
  );
}
