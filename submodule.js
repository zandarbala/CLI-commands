#!/usr/bin/env node

import { execSync } from "child_process";
import { clearInterval } from "timers";
import readline from 'readline';
try {
  let param = process.argv[2];
  let branch = 'PRE_DEVELOPMENT';
  if (param) {
    const result = executeCommands(`git branch -r --list origin/${param}`);
    if (result?.trim()) branch = param;
    else {
      const ans = await askQn('Branch not found. Continue with default branch? (y/n):')
      console.log('and', ans);
    }

  }
  await executeCommands(`git submodule foreach "git pull origin ${branch} ; git push"`);
  console.log('interval :');
} catch (err) {
  console.log('Error occure :', err);
}

/**
 * Function used to execute terminal command using execSync
 * @param {*} command git commandssss 
 * @returns the command response
 */
function executeCommands(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}

function askQn(qn) {
  const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    readLine.question(qn, (ans) => {
      readLine.close();
      resolve(ans.trim());
    })
  })
}

// const spinnerChars = ['/', '-', '\\', '|'];
// let i = 0;
// let interval = setInterval(() => {
//   let loader = spinnerChars[i % 4];
//   process.stdout.write(
//     `\rPulling all submodules from parent branch ${branch}.... ${loader}`
//   );
//   i++;
// }, 500);
// clearInterval(interval);