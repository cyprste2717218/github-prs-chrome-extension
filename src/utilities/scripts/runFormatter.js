import { spawn } from "child_process";

const prettierProcess = spawn(
  "prettier",
  ["--write", "src/**/*.{js,jsx,ts,tsx}"],
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
    console.clear(); // clear prettier check/format commands outputs
    console.log('-------------------------------')
    console.log("Prettier finished successfully.");
  } else {
    console.log('-------------------------------')
    console.error("Prettier exited with code", code);
  }
});
