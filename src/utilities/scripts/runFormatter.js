import { spawn } from "child_process";

const prettierProcess = spawn(
  "prettier",
  ["--check", "src/**/*.{js,jsx,ts,tsx}"],
  {
    shell: true,
    stdio: "inherit",
  }
);

prettierProcess.on("error", (err) => {
  console.error("Error running Prettier:", err);
});

prettierProcess.on("exit", (code) => {
  if (code === 0) {
    console.log("-------------------------------");
    console.log("Prettier finished successfully.");
  } else {
    console.log("-------------------------------");
    console.error("Prettier exited with code", code);
  }
});
