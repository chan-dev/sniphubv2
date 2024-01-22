const { writeFile } = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");

const ENVIRONMENT = process.env.NODE_ENV;
let filePath = "";
let envFile = "";

if (ENVIRONMENT === "development") {
  filePath = path.resolve(
    __dirname + "/../environments/environment.development.ts",
  );
  envFile = `.env.development`;
} else {
  filePath = path.resolve(
    __dirname + "/../environments/environment.production.ts",
  );
  envFile = `.env.production`;
}

dotenv.config({
  path: envFile,
});

// Only access the environment variables after dotenv is loaded.
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL;

(async () => {
  const fileContent = `// NOTE: this file will be autofilled by the build script.
// Do not edit it directly.
export const environment = {
  production: ${ENVIRONMENT === "development" ? "false" : "true"},
  supabase: {
    apiKey: '${SUPABASE_KEY}',
    projectUrl: '${SUPABASE_PROJECT_URL}',
  },
};`;

  try {
    await writeFile(filePath, fileContent);
    console.log(`File ${filePath} has been successfully updated.`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
})();
