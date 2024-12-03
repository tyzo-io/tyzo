import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function saveAuthToken(token: string) {
  localStorage.setItem("tyzo:local:token", token);
}

export function getAuthToken() {
  const token = localStorage.getItem("tyzo:local:token");
  return token;
}
