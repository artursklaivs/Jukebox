const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');

class Player extends EventEmitter {
  constructor(playerCommand) {
    super();
    this.playerCommand = playerCommand;
    this.currentProcess = null;
  }

  play(track) {
    return new Promise((resolve) => {
      const args = ['--no-video', track.url];
      const child = spawn(this.playerCommand, args, {
        stdio: ['ignore', 'inherit', 'inherit'],
        windowsHide: true,
      });

      this.currentProcess = child;
      this.emit('started', track);

      child.on('error', (error) => {
        this.emit('error', error, track);
        this.currentProcess = null;
        resolve({ code: null, error });
      });

      child.on('close', (code) => {
        this.currentProcess = null;
        this.emit('finished', track, code);
        resolve({ code });
      });
    });
  }

  skip() {
    if (!this.currentProcess) {
      return false;
    }

    this.currentProcess.kill();
    return true;
  }
}

module.exports = {
  Player,
};
