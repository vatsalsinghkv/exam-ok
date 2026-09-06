import Image from "next/image";
import {
  UnstyledLink,
  type UnstyledLinkProps,
} from "@/components/shared/unstyled-link";
import { cn } from "@/lib/utils";

interface Props extends Omit<UnstyledLinkProps, "href" | "children"> {
  href?: string;
  textClassName?: string;
}

export const Logo = ({
  className,
  href = "/",
  textClassName,
  ...rest
}: Props) => {
  return (
    <UnstyledLink
      href={href}
      className={cn(
        "group flex max-w-max items-center gap-2 rounded outline-none",
        "p-1",
        className,
      )}
      {...rest}
    >
      <Image
        src="/logo.svg"
        alt="Examok"
        width={24}
        height={24}
        className="shrink-0 rounded-md"
      />
      <span
        className={cn(
          "text-foreground tracking-tighter capitalize text-lg font-bold",
          textClassName,
        )}
      >
        Examok
      </span>
    </UnstyledLink>
  );
};
