import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import styles from "./Label.module.css";
import { classNames } from "../../util/classNames";

type LabelProps = ComponentPropsWithoutRef<"label">;

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...rest }, ref) => {
    return (
      <label
        {...rest}
        className={classNames(styles.Input, className)}
        ref={ref}
      />
    );
  }
);

export default Label;
