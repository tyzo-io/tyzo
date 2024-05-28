import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import s from "./style.module.css";

import { cn } from "@/lib/utils";

const buttonVariants = cva(s.Button, {
  variants: {
    variant: {
      default: s.Default,
      destructive: s.Destructive,
      outline: s.Outline,
      secondary: s.Secondary,
      ghost: s.Ghost,
      link: s.Link,
    },
    size: {
      default: s.DefaultSize,
      sm: s.Small,
      lg: s.Large,
      icon: s.Icon,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
