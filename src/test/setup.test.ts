import * as assert from 'assert'
import {spawn, ChildProcess} from 'child_process'

class ApiServer {
  private static _spawn: ChildProcess;
  
  static start(): void {
    
    console.log('Starting API server...');
    
    this._spawn = spawn('node', ['--use_strict', '../bin/server.js'], {
      cwd: process.cwd(),
      env: { PORT: 12123 }
    })
  
    this._spawn.stdout.setEncoding('utf8');
    this._spawn.stderr.setEncoding('utf8');
  
    this._spawn.stdout.on('data', console.log);
    this._spawn.stderr.on('data', console.error);
  
    this._spawn.on('close', function (code) {
      if (code !== 0) return console.error(new Error('API finished with non-zero exit code (' + code + ')'));
      console.log('API closed.');
    });
  
    this._spawn.on('error', (err) => {
      throw new Error('Unable to start API: ' + err.message);
    });
  }
  
  static stop(): void {
    console.log('Stopping API server...');
    this._spawn.kill('SIGINT');
  }
}

class MongoDb {
  private static _spawn: ChildProcess;
  
  static start(): void {
    
    console.log('Starting MongoDB server...');
    
    this._spawn = spawn('mongod');
  
    this._spawn.stdout.setEncoding('utf8');
    this._spawn.stderr.setEncoding('utf8');
  
    this._spawn.stdout.on('data', console.log);
    this._spawn.stderr.on('data', console.error);
  
    this._spawn.on('close', function (code) {
      if (code !== 0) return console.error(new Error('MongoDB finished with non-zero exit code (' + code + ')'));
      console.log('MongoDB closed.');
    });
  
    this._spawn.on('error', (err) => {
      throw new Error('Unable to start MongoDB: ' + err.message);
    });
  }
  
  static stop(): void {
    console.log('Stopping MongoDB server...');
    this._spawn.kill('SIGINT');
  }
}


before(() => {
  MongoDb.start();
  ApiServer.start();
});

after(() => {
  ApiServer.stop();
  MongoDb.stop();
});