const { writeFile } = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
const ENVIRONMENT = process.env.NODE_ENV;
let filePath = "";

if (ENVIRONMENT === "development") {
  filePath = path.resolve(
    __dirname + "/../environments/environment.development.ts",
  );
} else {
  filePath = path.resolve(
    __dirname + "/../environments/environment.production.ts",
  );
}

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
