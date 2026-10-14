import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
    'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*=size-])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/80',
                outline:
                    'border-input bg-input/30 bg-clip-border text-foreground shadow-xs hover:bg-input/50 aria-expanded:bg-input/50',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
                ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
                destructive:
                    'border-input bg-input/30 bg-clip-border text-destructive shadow-xs hover:bg-destructive/10 focus-visible:ring-destructive/20',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                'default':
                    'h-12 gap-2 px-4 [&_svg:not([class*=size-])]:size-5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                'xs': 'h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*=size-])]:size-3',
                'sm': 'h-12 gap-2 rounded-md px-4 [&_svg:not([class*=size-])]:size-5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
                'lg': 'h-12 gap-2 px-4 [&_svg:not([class*=size-])]:size-5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                'icon': 'size-12 [&_svg:not([class*=size-])]:size-5',
                'icon-xs':
                    'size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*=size-])]:size-3',
                'icon-sm':
                    'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
                'icon-lg': 'size-12 [&_svg:not([class*=size-])]:size-5',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
