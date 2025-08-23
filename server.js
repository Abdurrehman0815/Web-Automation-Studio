import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { code, language } = JSON.parse(message);
    const fileExtension = language === 'python' ? 'py' : 'js';
    const dirPath = 'testing';
    const filePath = path.join(dirPath, `test_run.${fileExtension}`);

    // Create the testing directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath, code);

    const command = language === 'python' ? 'python' : 'node';
    const child = spawn(command, [filePath]);

    child.stdout.on('data', (data) => {
      ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
    });

    child.stderr.on('data', (data) => {
      ws.send(JSON.stringify({ type: 'error', data: data.toString() }));
    });

    child.on('close', (code) => {
      ws.send(JSON.stringify({ type: 'status', data: `Process exited with code ${code}` }));
      ws.close();
    });
  });
});

console.log('WebSocket server started on port 3001');
