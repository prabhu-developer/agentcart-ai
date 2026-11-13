import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5.5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md px-2 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-[#F2EDFC] text-[#5125A8] border border-[#E0D7F5]",
        purple:
          "bg-[#F2EDFC] text-[#6D45D9] border border-[#E0D7F5]",
        pink:
          "bg-[#FDF2F4] text-[#E11D48] border border-[#FDE2E7]",
        mint:
          "bg-[#EDFAF2] text-[#16A34A] border border-[#D5F5E3]",
        blue:
          "bg-[#EEF4FF] text-[#2563EB] border border-[#DBEAFE]",
        yellow:
          "bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A]",
        dark:
          "bg-[#211B2E] text-white",
        outline:
          "border-[#EAE6F2] text-[#777181] bg-white",
        destructive:
          "bg-[#FDF2F2] text-[#D64545] border border-[#FCDADA]",
        secondary:
          "bg-[#F8F7FB] text-[#777181] border border-[#EAE6F2]",
        ghost:
          "text-[#777181] hover:bg-[#F2EDFC]/50",
        link: "text-[#5125A8] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
