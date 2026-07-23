const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// Target file locations (checking vr_core and vr_code)
const possiblePaths = [
  path.join(rootDir, 'frontend', 'public', 'vr_core', 'index.htm'),
  path.join(rootDir, 'frontend', 'public', 'vr_code', 'index.htm'),
  path.join(rootDir, 'vr_core', 'index.htm'),
  path.join(rootDir, 'vr_code', 'index.htm'),
];

// Target script tag to inject
const BRIDGE_SCRIPT_TAG = '    <script src="inject/bridge.js"></script>';

function getTargetPath() {
  // If user passed a file argument, use it
  if (process.argv[2]) {
    const customPath = path.resolve(rootDir, process.argv[2]);
    if (fs.existsSync(customPath)) {
      return customPath;
    }
  }
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function injectBridgeScript(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if bridge.js is already injected (with or without query string)
  const hasBridgeScript = /<script\s+[^>]*src=["']inject\/bridge\.js(\?.*)?["'][^>]*><\/script>/i.test(content);

  if (hasBridgeScript) {
    console.log(`[INFO] bridge.js tag already present in ${path.relative(rootDir, filePath)}.`);
    return false;
  }

  // Inject before </head> if present
  if (content.includes('</head>')) {
    content = content.replace('</head>', `${BRIDGE_SCRIPT_TAG}\n  </head>`);
  } else if (content.includes('<head>')) {
    content = content.replace('<head>', `<head>\n${BRIDGE_SCRIPT_TAG}`);
  } else {
    // Fallback: prepend to top if no head tag found
    content = `${BRIDGE_SCRIPT_TAG}\n${content}`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[SUCCESS] Injected bridge.js script tag into ${path.relative(rootDir, filePath)}.`);
  return true;
}

function getBuildCount() {
  const counterFile = path.join(__dirname, '.build_counter');
  let count = 0;
  if (fs.existsSync(counterFile)) {
    const raw = fs.readFileSync(counterFile, 'utf8').trim();
    count = parseInt(raw, 10) || 0;
  }
  count += 1;
  fs.writeFileSync(counterFile, String(count), 'utf8');
  return count;
}

function runGitOperations(buildCount) {
  try {
    console.log('[GIT] Staging changes...');
    execSync('git add -A', { cwd: rootDir, stdio: 'inherit' });

    // Check if there are staged changes to commit
    const statusOutput = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' }).trim();

    if (!statusOutput) {
      console.log('[GIT] No changes to commit.');
      return;
    }

    const commitMsg = `Rebuild VR #${buildCount}: Inject bridge.js and sync VR files`;
    console.log(`[GIT] Committing: "${commitMsg}"`);
    execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir, stdio: 'inherit' });

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    console.log(`[GIT] Pushing to origin/${branch}...`);
    execSync(`git push origin ${branch}`, { cwd: rootDir, stdio: 'inherit' });

    console.log(`[SUCCESS] Build #${buildCount} committed and pushed successfully!`);
  } catch (err) {
    console.error('[ERROR] Git operations failed:', err.message);
  }
}

function main() {
  console.log('--- VR Build Post-Processing & Git Sync ---');
  const targetPath = getTargetPath();
  if (!targetPath) {
    console.error('[ERROR] Could not find index.htm in vr_core or vr_code folder.');
    process.exit(1);
  }

  console.log(`Target file: ${path.relative(rootDir, targetPath)}`);
  const injected = injectBridgeScript(targetPath);

  const buildCount = getBuildCount();
  console.log(`Current Build Count: #${buildCount}`);

  runGitOperations(buildCount);
}

main();
