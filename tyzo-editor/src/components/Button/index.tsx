import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import s from "./style.module.css";
import { classNames } from "../../util/classNames";

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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size = undefined, ...props }, ref) => {
    const Comp = "button";
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
