// Hostinger's Express preset starts this file without guaranteeing NODE_ENV.
// Set it before loading the compiled server so Next uses the production build.
process.env.NODE_ENV ||= "production";

import("./server/dist/index.js").catch((error) => {
    console.error("Failed to start Cloverton Homes:", error);
    process.exit(1);
});
