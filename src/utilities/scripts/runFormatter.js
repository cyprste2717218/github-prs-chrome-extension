import { spawn } from 'child_process';

const prettierProcess = spawn('prettier', ['--write', 'src/**/*.{js,jsx,ts,tsx}'], {
  shell: true,
  stdio: 'inherit',
});

prettierProcess.on('error', (err) => {
  console.error('Error running Prettier:', err);
});