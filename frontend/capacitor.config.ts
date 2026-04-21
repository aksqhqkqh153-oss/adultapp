
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.adultapp",
  appName: "PlayCat",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
