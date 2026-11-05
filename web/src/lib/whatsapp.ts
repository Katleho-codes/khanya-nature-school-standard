import { defaultWhatsappNumber } from "./site";

export function whatsappLink(number: string | null | undefined, message: string): string {
  const digits = (number ?? defaultWhatsappNumber()).replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function branchWhatsappMessage(branchName: string): string {
  return `Hello ${branchName}, I would like to ask about a place at Khanya Nature School.`;
}

export function programmeWhatsappMessage(programmeName: string): string {
  return `Hello Khanya Nature School, I would like to know more about the ${programmeName} programme.`;
}
