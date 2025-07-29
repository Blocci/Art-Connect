const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cleanupUploads = async () => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stat = await fs.stat(filePath);

      if (now - stat.mtimeMs > ONE_DAY_MS) {
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted old file: ${file}`);
      }
    }
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  }
};

module.exports = cleanupUploads;