import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-1.5 relative">
        {label && (
          <label className={cn(
            "text-sm font-medium transition-colors",
            isFocused ? "text-reachinbox-600" : "text-slate-700"
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            className={cn(
              "flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all outline-none",
              "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                : "border-slate-300 focus:border-reachinbox-500 focus:ring-1 focus:ring-reachinbox-500 focus:shadow-[0_0_0_4px_rgba(75,101,246,0.1)]",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = 'Input';
