import {
  BookOpen,
  ChartBar,
  Headphones,
  Home,
  Library,
  type LucideIcon,
  Settings,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export type MenuItem = {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export const mainMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: ROUTES.dashboard.home,
    icon: Home,
  },
  {
    title: "Create Test",
    url: ROUTES.dashboard.create,
    icon: BookOpen,
  },
  {
    title: "Explore Tests",
    url: ROUTES.dashboard.library,
    icon: Library,
  },
  {
    title: "Analytics",
    url: ROUTES.dashboard.analytics,
    icon: ChartBar,
  },
];

export const othersMenuItems: MenuItem[] = [
  {
    title: "Settings",
    url: ROUTES.dashboard.settings,
    icon: Settings,
  },
  {
    title: "Help and support",
    url: "mailto:vatsalsinghkv@gmail.com",
    icon: Headphones,
  },
];
