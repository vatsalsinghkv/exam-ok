import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ConsoleFunction = "log" | "dir" | "error" | "warn" | "info" | "debug";
export function logger(text: string | object, fn: ConsoleFunction = "log") {
  if (process.env.NODE_ENV !== "production") {
    console[fn](text);
  }
}
