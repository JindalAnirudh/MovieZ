import { spawn } from 'child_process';

console.log('Testing server startup...');

const serverProcess = spawn('node', ['server.js'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString().trim());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code === 0) {
    console.log('Server started successfully!');
  } else {
    console.log('Server failed to start');
  }
});

// Kill the process after 5 seconds to prevent it from running forever
setTimeout(() => {
  serverProcess.kill();
  console.log('Server process terminated');
}, 5000);
