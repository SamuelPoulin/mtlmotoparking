import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mtlmotoparking.ca",
      lastModified: new Date(),
      alternates: {
        languages: {
          en: "https://mtlmotoparking.ca/en",
          fr: "https://mtlmotoparking.ca/fr",
        },
      },
    },
    {
      url: "https://mtlmotoparking.ca/map",
      lastModified: new Date(),
      alternates: {
        languages: {
          en: "https://mtlmotoparking.ca/en/map",
          fr: "https://mtlmotoparking.ca/fr/map",
        },
      },
    },
  ];
}
