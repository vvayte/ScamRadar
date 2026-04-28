import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", children, ...rest }: CardProps): React.JSX.Element {
  return (
    <div className={`${elevated ? "card-elevated" : "card"} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export default Card;
