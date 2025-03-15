import classNames from 'classnames'
import { cva, type VariantProps } from "class-variance-authority"
import React from 'react'

const textVairants = cva(
    "text-xs font-roboto-mono font-medium text-xs",
    {
        variants: {
            variant: {
                default: "text-label-primary",
                secondary: "text-label-secondary",
                tertiary: "text-label-tertiary"
            }
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: "default" | "secondary";
    vCenter?: boolean
}

export const Text: React.FC<TextProps> = ({ children, className, variant, vCenter = false, ...rest }) => {
    return (
        <p className={classNames(
            textVairants({ variant }),
            { "h-auto my-auto": vCenter },
            className
        )} {...rest}>
            {children}
        </p>
    )
}

export const BooleanText = ({value}: {value: boolean}) => {
    return (
        <p className={`${value ? "text-green-400" : "text-red-500"} font-roboto-mono text-xs font-bold`}>{value ? "true" : "false"}</p>
    )
}
