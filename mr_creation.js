#!/usr/bin/env node
/**
| Parameter                             | Description               |
| ------------------------------------- | ------------------------- |
| `merge_request[assignee_id]`          | Numeric user ID           |
| `merge_request[target_branch]`        | Target branch             |
if need can add the below param
| `merge_request[source_branch]`        | Source branch (required)  |
| `merge_request[title]`                | Pre-fill MR title         |
| `merge_request[description]`          | Pre-fill MR description   |
| `merge_request[remove_source_branch]` | `true` / `false`          |
| `merge_request[label_ids]`            | Comma-separated label IDs |
| `merge_request[draft]`                | `true` to mark as draft   |
 */

import { execSync } from "child_process";
try {
  const param = process.argv.splice(2);
  console.log('param :', param);
  let assign = param[0] ? `&merge_request[assignee_ids][]=${param[0]}` : '';
  let targetBranch = param[1] ? `&merge_request[target_branch]=${param[1]}` : '&merge_request[target_branch]=PRE_DEVELOPMENT'
  const currentBranch = executeCommands("git branch --show-current");
  let checkSourceBranch = executeCommands(`git branch -r --list origin/${currentBranch}`);
  let checkTargetBranch = executeCommands(`git branch -r --list origin/${targetBranch.split('=').at(-1)}`);
  if (!checkSourceBranch) {
    throw new Error('Source Branch not found. Please create or push it');
  }
  if (!checkTargetBranch) {
    throw new Error('Target Branch not found.');
  }
  if (currentBranch === targetBranch.split('=').at(-1)) {
    throw new Error('Both branch are same unable to create MR');
  }
  let repoUrl = executeCommands('git remote get-url origin');
  if (repoUrl.endsWith(".git")) {
    repoUrl = repoUrl.slice(0, -4);
  }
  repoUrl += `/-/merge_requests/new?merge_request[source_branch]=${currentBranch + assign + targetBranch}`
  console.log('Merge Url :', repoUrl);
} catch (error) {
  console.error("Error❌:", error.message);
}
/**
 * Function used to execute terminal command using execSync
 * @param {*} command git commandssss 
 * @returns the command response
 */
function executeCommands(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}