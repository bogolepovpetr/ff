import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

const SITE_URL = process.env.SITE_URL || "https://wiki.fomofighters.xyz";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "never",
  build: {
    format: "directory",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [vue(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
