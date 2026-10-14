import config from "./config.json" with { type:"json" };
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

process.env.VITE_API_SERVER_HOST = config.API_SERVER_HOST;
process.env.VITE_API_SERVER_PORT = config.API_SERVER_PORT.toString();
process.env.VITE_STATIC_SERVER_HOST = config.STATIC_SERVER_HOST;
process.env.VITE_STATIC_SERVER_PORT = config.STATIC_SERVER_PORT.toString();
process.env.VITE_SWF_URL = config.SWF_URL;
process.env.VITE_STORE_URL = config.STORE_URL;
process.env.VITE_CLIENT_URL = config.CLIENT_URL;
process.env.VITE_WRAPPER_VER = config.WRAPPER_VER;

export default defineConfig({
	base: "",
	esbuild: {
		target: "es2020"
	},
	build: {
		assetsDir: "r_assets",
		target: "es2020",
		commonjsOptions: {
			esmExternals: true
		},
		outDir: "./dist/renderer",
		rollupOptions: {
			input: ["./index.html"],
		},
		cssTarget: "chrome86",
	},
	plugins: [
		vue(),
	],
	server: {
		port: 5173,
	},
});
