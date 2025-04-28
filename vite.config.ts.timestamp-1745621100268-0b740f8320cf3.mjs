// vite.config.ts
import react from "file:///Users/patricktaylor/Documents/Senior_Project/Cowboy_Cards/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { componentTagger } from "file:///Users/patricktaylor/Documents/Senior_Project/Cowboy_Cards/node_modules/lovable-tagger/dist/index.js";
import path from "path";
import { defineConfig } from "file:///Users/patricktaylor/Documents/Senior_Project/Cowboy_Cards/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/Users/patricktaylor/Documents/Senior_Project/Cowboy_Cards";
function manualChunks(id) {
  if (id.includes("node_modules")) {
    return "nm";
  } else {
    return "main";
  }
}
var vite_config_default = defineConfig(({ mode }) => {
  console.log("mode: ", mode);
  const res = {
    base: "./",
    preview: {
      port: 8080
    },
    server: {
      host: "::",
      port: 8080
    },
    build: {},
    publicDir: "static",
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
  if (mode === "development" || mode === "staging" || mode === "mobile") {
    res.build = {
      outDir: "public",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    };
  } else if (mode === "production") {
    res.build = {
      outDir: "/var/www/cowboy_cards/html",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    };
  }
  return res;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGF0cmlja3RheWxvci9Eb2N1bWVudHMvU2VuaW9yX1Byb2plY3QvQ293Ym95X0NhcmRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcGF0cmlja3RheWxvci9Eb2N1bWVudHMvU2VuaW9yX1Byb2plY3QvQ293Ym95X0NhcmRzL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXRyaWNrdGF5bG9yL0RvY3VtZW50cy9TZW5pb3JfUHJvamVjdC9Db3dib3lfQ2FyZHMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gJ2xvdmFibGUtdGFnZ2VyJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmZ1bmN0aW9uIG1hbnVhbENodW5rcyhpZDogc3RyaW5nKSB7XG4gIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICByZXR1cm4gJ25tJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ21haW4nO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc29sZS5sb2coXCJtb2RlOiBcIixtb2RlKTtcbiAgY29uc3QgcmVzID0ge1xuICAgIGJhc2U6ICcuLycsXG4gICAgcHJldmlldzoge1xuICAgICAgcG9ydDogODA4MCxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzo6JyxcbiAgICAgIHBvcnQ6IDgwODAsXG4gICAgfSxcbiAgICBidWlsZDoge30sXG4gICAgcHVibGljRGlyOiAnc3RhdGljJyxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKFxuICAgICAgQm9vbGVhblxuICAgICksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBpZiAobW9kZSA9PT0gJ2RldmVsb3BtZW50JyB8fCBtb2RlID09PSAnc3RhZ2luZycgfHwgbW9kZSA9PT0gJ21vYmlsZScpIHtcbiAgICByZXMuYnVpbGQgPSB7XG4gICAgICBvdXREaXI6ICdwdWJsaWMnLFxuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3MsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG4gIH0gZWxzZSBpZiAobW9kZSA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgcmVzLmJ1aWxkID0ge1xuICAgICAgb3V0RGlyOiAnL3Zhci93d3cvY293Ym95X2NhcmRzL2h0bWwnLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9XG4gIHJldHVybiByZXM7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csT0FBTyxXQUFXO0FBQ2xYLFNBQVMsdUJBQXVCO0FBQ2hDLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUg3QixJQUFNLG1DQUFtQztBQUt6QyxTQUFTLGFBQWEsSUFBWTtBQUNoQyxNQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsV0FBTztBQUFBLEVBQ1QsT0FBTztBQUNMLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxVQUFRLElBQUksVUFBUyxJQUFJO0FBQ3pCLFFBQU0sTUFBTTtBQUFBLElBQ1YsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPLENBQUM7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRTtBQUFBLE1BQzlEO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLFNBQVMsaUJBQWlCLFNBQVMsYUFBYSxTQUFTLFVBQVU7QUFDckUsUUFBSSxRQUFRO0FBQUEsTUFDVixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsV0FBVyxTQUFTLGNBQWM7QUFDaEMsUUFBSSxRQUFRO0FBQUEsTUFDVixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxTQUFPO0FBQ1QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
