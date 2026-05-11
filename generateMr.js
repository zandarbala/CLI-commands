#!/usr/bin/env node
/**
 * Method used to create merge request using gitlab api
 * NOTE: Please replace the TOKEN variable with your gitlab token before running the script
 */
import https from "https";
import { execSync } from "child_process";
try {
  const TOKEN = 'YOUR-GITTOKEN';
  let [assign, targetBranch = 'PRE_DEVELOPMENT', sourceBranch = ''] = process.argv.splice(2);
  console.log('data', assign, targetBranch, sourceBranch);
  let remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).replace(".git", "");
  const url = new URL(remote);
  const projectPath = encodeURIComponent(url.pathname.replace("/", ""));
  if (!sourceBranch)
    sourceBranch = executeCommands("git branch --show-current");
  let checkSourceBranch = executeCommands(`git branch -r --list origin/${sourceBranch}`);
  let checkTargetBranch = executeCommands(`git branch -r --list origin/${targetBranch}`);
  if (!checkSourceBranch) {
    throw new Error('Source Branch not found. Please create or push it');
  }
  if (!checkTargetBranch) {
    throw new Error('Target Branch not found.');
  }
  if (sourceBranch === targetBranch) {
    throw new Error('Both branch are same unable to create MR');
  }

  const body = JSON.stringify({
    assignee_ids: [assign],
    source_branch: sourceBranch,
    target_branch: targetBranch,
    title: `MR: ${sourceBranch}`
  });
  const options = {
    hostname: url.hostname,
    path: `/api/v4/projects/${projectPath}/merge_requests`,
    method: "POST",
    headers: {
      "PRIVATE-TOKEN": TOKEN,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  };
  const req = https.request(options, res => {
    let data = "";
    res.on("data", d => data += d);
    res.on("end", () => {
      const json = JSON.parse(data);
      if (!json.web_url) {
        console.error("❌ Failed:", json);
        return;
      }
      console.log("\n✅ Merge Request Created:");
      console.log(json.web_url);
      executeCommands(`start "" "${json.web_url}"`);
    });
  });
  req.write(body);
  req.end();
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