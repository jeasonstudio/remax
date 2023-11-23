const { getExtension } = require('@codeblitzjs/ide-cli/lib/extension/scanner');
// const path = require('path');
const fs = require('fs');

module.exports = async (extPath) => {
  if (!fs.existsSync(extPath)) {
    throw new Error(`Extension not found: ${extPath}`);
  }
  const metadata = await getExtension(extPath, 'local');
  return metadata;
};
