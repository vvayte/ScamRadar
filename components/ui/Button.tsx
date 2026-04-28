import * as React from "react";

type Variant = "brand" | "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...rest }, ref) => {
    const sizeClass = size === "lg" ? " btn-lg" : size === "sm" ? " btn-sm" : "";
    return (
      <button
        ref={ref}
        className={`btn btn-${variant}${sizeClass} ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
