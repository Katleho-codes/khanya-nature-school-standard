import { cache } from "react";
import { getNav as fetchNav, type NavData } from "./api";

const FALLBACK: NavData = {
  settings: {
    id: "site",
    schoolName: "Khanya Nature School",
    tagline: "Room to grow in the light.",
    defaultSeoTitle:
      "Khanya Nature School | Nature-based preschool in Randburg and Fourways",
    defaultSeoDescription:
      "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors.",
    socialFacebook: null,
    socialInstagram: null,
    socialYoutube: null,
    ogImageId: null,
    ogImage: null,
    whatsappDefaultMessage:
      "Hello Khanya Nature School, I would like to know more about your programmes and how to arrange a visit.",
    createdAt: "",
    updatedAt: "",
  },
  branches: [],
  programmes: [],
};

export const getNav = cache(async (): Promise<NavData> => {
  try {
    return await fetchNav();
  } catch {
    return FALLBACK;
  }
});

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
}

export function defaultWhatsappNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "27825550100";
}
