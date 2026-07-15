import { defineConfig } from "cypress";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { plugin: grep } = require("@cypress/grep/plugin");

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      overwrite: false,
      html: false,
      json: true,
    },
    setupNodeEvents(on, config) {
      grep(config);
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
  },

  env: {
    testUserEmail: "qa.automation.test@bronza.com",
    testUserPassword: "TestPassword123!",
  },
});
