import type { ComponentPropsWithoutRef } from "react";
import { Fragment, forwardRef } from "react";

import styles from "./Input.module.css";

type InputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "className" | "form"
> & {
  field?: {
    name: string;
  };
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ disabled, field, id, name, ...rest }, ref) => {
    const resolvedName = field?.name ?? name;
    const props = Object.assign({}, field, rest);

    const className = [styles.Input, disabled && styles.disabled]
      .filter(Boolean)
      .join(" ");

    const Wrapper = Fragment;

    return (
      <Wrapper>
        <input
          type="text"
          {...props}
          name={resolvedName}
          disabled={disabled}
          id={id}
          className={className}
          ref={ref}
        />
      </Wrapper>
    );
  }
);

export default Input;
