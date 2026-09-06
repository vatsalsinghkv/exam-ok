import type { LucideIcon } from "lucide-react";

export type LinkType = {
  name: string;
  href: string;
};

export type IconLinkType = {
  icon: string | LucideIcon;
} & LinkType;

export type FeatureType = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};
