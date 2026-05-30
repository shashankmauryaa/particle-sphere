const fs = require('fs');
const readline = require('readline');

async function run() {
  const logPath = '/Users/shashankmaurya/.gemini/antigravity-ide/brain/ba63ad36-3fbb-4e28-a01c-323ce3134b43/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesToRevert = [
    '/Users/shashankmaurya/Documents/untitled folder/src/index.css',
    '/Users/shashankmaurya/Documents/untitled folder/src/components/ParticleCanvas.jsx',
    '/Users/shashankmaurya/Documents/untitled folder/src/components/GestureController.jsx',
    '/Users/shashankmaurya/Documents/untitled folder/src/components/ControlPanel.jsx',
    '/Users/shashankmaurya/Documents/untitled folder/src/App.jsx'
  ];

  const firstVersions = {};

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.function && call.function.name === 'default_api:write_to_file') {
            const args = JSON.parse(call.function.arguments);
            const target = args.TargetFile;
            if (filesToRevert.includes(target) && !firstVersions[target]) {
              firstVersions[target] = args.CodeContent;
              console.log(`Found first version of ${target}`);
            }
          }
        }
      }
    } catch (err) {
      // ignore parsing errors
    }
  }

  for (const file of filesToRevert) {
    if (firstVersions[file]) {
      fs.writeFileSync(file, firstVersions[file], 'utf8');
      console.log(`Reverted ${file}`);
    } else {
      console.log(`Could not find first version for ${file}`);
    }
  }
}

run();
