// Hostinger's Express preset starts this file without guaranteeing NODE_ENV.
// Set it before loading the compiled server so Next uses the production build.
process.env.NODE_ENV ||= "production";

await import("./server/dist/index.js");
