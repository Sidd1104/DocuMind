let envChecked = false;

export function checkEnvOnStartup() {
  if (envChecked) return;
  envChecked = true;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("================== [DocuMind Startup Env Check] ==================");
  console.log(
    `  ANTHROPIC_API_KEY: ${
      anthropicKey
        ? `Present (length: ${anthropicKey.length})`
        : "MISSING"
    }`
  );
  console.log(
    `  GEMINI_API_KEY:    ${
      geminiKey
        ? `Present (length: ${geminiKey.length})`
        : "MISSING"
    }`
  );
  console.log("==================================================================");
}

// Automatically invoke on module load
checkEnvOnStartup();
