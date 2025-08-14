import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, inputMode, autoComplete, ...props }, ref) => {
  const getInputMode = () => {
    if (inputMode) return inputMode;
    if (type === 'email') return 'email';
    if (type === 'tel') return 'tel';
    if (type === 'number') return 'numeric';
    if (type === 'url') return 'url';
    return 'text';
  };

  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (type === 'email') return 'email';
    if (type === 'password') return 'current-password';
    if (type === 'tel') return 'tel';
    return undefined;
  };

  return (
    (<input
      type={type}
      inputMode={getInputMode()}
      autoComplete={getAutoComplete()}
      className={cn(
        "flex min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
