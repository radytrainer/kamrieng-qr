import Image from "next/image";
import { SCHOOL_INFO } from "@/lib/constants/school";
import { cn } from "@/lib/utils";

interface SchoolLogoProps {
  size?: number;
  className?: string;
}

export function SchoolLogo({ size = 32, className }: SchoolLogoProps) {
  return (
    <Image
      src="/logo/logo.png"
      alt={SCHOOL_INFO.name}
      width={size}
      height={size}
      // logo.png's canvas (886x1122) isn't square — it has ~120px of
      // transparent padding above/below the circular badge itself. With
      // object-contain that padding shrinks the badge to fit, leaving
      // visible gaps inside the rounded-full clip. object-cover crops the
      // padding away instead, so the badge fills the circle edge-to-edge.
      className={cn("shrink-0 rounded-full object-cover", className)}
      // Tailwind Preflight's `img { height: auto }` reset overrides the
      // width/height attributes Next's Image sets, so the browser was
      // computing height from the logo's true (non-square) aspect ratio
      // instead of staying size x size — turning rounded-full into an
      // oval. The inline style out-specifies that reset.
      style={{ width: size, height: size }}
    />
  );
}
