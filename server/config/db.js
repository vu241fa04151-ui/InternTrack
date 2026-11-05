const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mongodProcess = null;

const startLocalMongoProcess = async () => {
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  ];

  const binPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!binPath) {
    console.warn('[MongoDB] mongod binary not found in standard paths.');
    return false;
  }

  // Prefer D:\ drive because C:\ drive may have 0 free space
  let dbDir = 'D:\\mongodb_interntrack\\data\\db';
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      dbDir = path.resolve(__dirname, '../data/db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }
  }

  console.log(`[MongoDB] Starting local mongod at ${binPath} with dbpath ${dbDir}...`);
  try {
    mongodProcess = spawn(binPath, ['--dbpath', dbDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      detached: false,
      stdio: 'ignore',
    });

    mongodProcess.on('error', (err) => {
      console.error('[MongoDB] Local mongod process error:', err.message);
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    return true;
  } catch (err) {
    console.error('[MongoDB] Failed to spawn mongod:', err.message);
    return false;
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interntrack';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[MongoDB] Initial connection to ${uri} failed: ${primaryErr.message}`);

    // If local 127.0.0.1, try spawning the installed mongod process
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      const started = await startLocalMongoProcess();
      if (started) {
        try {
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`[MongoDB] Connected after starting local mongod: ${conn.connection.host}/${conn.connection.name}`);
          return conn;
        } catch (secondaryErr) {
          console.error('[MongoDB] Secondary connection failed:', secondaryErr.message);
          throw secondaryErr;
        }
      }
    }
    throw primaryErr;
  }
};

process.on('SIGINT', () => {
  if (mongodProcess) {
    mongodProcess.kill();
  }
  process.exit(0);
});

module.exports = connectDB;
