const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, '../public/videos');
const outputDir = path.join(videosDir, 'compressed');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all mp4 files
const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));

console.log(`Found ${videoFiles.length} video files to compress...\n`);

videoFiles.forEach((file, index) => {
  const inputPath = path.join(videosDir, file);
  const outputPath = path.join(outputDir, file);

  const inputSize = fs.statSync(inputPath).size;

  console.log(`[${index + 1}/${videoFiles.length}] Compressing: ${file}`);
  console.log(`  Input size: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Compress with ffmpeg:
    // - CRF 28 (higher = more compression, 23 is default)
    // - preset: slower = better compression
    // - scale to max 720p width while maintaining aspect ratio
    execSync(`ffmpeg -i "${inputPath}" -vcodec libx264 -crf 28 -preset slower -vf "scale='min(720,iw)':-2" -an -y "${outputPath}"`, {
      stdio: 'pipe'
    });

    const outputSize = fs.statSync(outputPath).size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`  Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Saved: ${savings}%\n`);
  } catch (error) {
    console.error(`  Error compressing ${file}:`, error.message);
  }
});

console.log('Done! Compressed files are in public/videos/compressed/');
console.log('\nTo replace originals, run:');
console.log('  mv public/videos/compressed/*.mp4 public/videos/');
console.log('  rm -r public/videos/compressed');
