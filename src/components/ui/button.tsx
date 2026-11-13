import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[#6D45D9]/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#5125A8] text-white hover:bg-[#431E8C] shadow-[0_2px_8px_rgba(81,37,168,0.2)] active:scale-[0.99]",
        primary:
          "bg-[#5125A8] text-white hover:bg-[#431E8C] shadow-[0_2px_8px_rgba(81,37,168,0.2)] active:scale-[0.99]",
        dark:
          "bg-[#211B2E] text-white hover:bg-[#2F2742] shadow-xs active:scale-[0.99]",
        outline:
          "border-[#EAE6F2] bg-white text-[#211B2E] hover:border-[#8B6CE8]/50 hover:bg-[#F2EDFC]/60 hover:text-[#5125A8] shadow-2xs",
        secondary:
          "bg-[#F2EDFC] text-[#5125A8] hover:bg-[#EAE4FA] font-medium",
        ghost:
          "hover:bg-[#F2EDFC]/60 hover:text-[#211B2E] text-[#777181]",
        destructive:
          "bg-[#D64545]/10 text-[#D64545] hover:bg-[#D64545]/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-[#5125A8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9.5 gap-2 px-3.5",
        xs: "h-6.5 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs",
        lg: "h-11 gap-2 rounded-xl px-5 text-sm font-semibold",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6.5 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-xl",
        pill: "h-9 gap-2 rounded-full px-4 text-xs font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
