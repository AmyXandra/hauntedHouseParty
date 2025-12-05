#!/bin/bash

# Script to create placeholder audio files for development
# These are silent audio files that can be replaced with actual sound effects later
# Requires ffmpeg to be installed: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)

set -e

SOUNDS_DIR="public/sounds"

echo "Creating placeholder audio files..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
    exit 1
fi

# Create sounds directory if it doesn't exist
mkdir -p "$SOUNDS_DIR"

# Create door-creak.mp3 (1.5 seconds of silence)
echo "Creating door-creak.mp3..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.5 -q:a 9 -acodec libmp3lame "$SOUNDS_DIR/door-creak.mp3" -y

# Create bone-rattle.mp3 (0.8 seconds of silence)
echo "Creating bone-rattle.mp3..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.8 -q:a 9 -acodec libmp3lame "$SOUNDS_DIR/bone-rattle.mp3" -y

# Create whoosh.mp3 (1.2 seconds of silence)
echo "Creating whoosh.mp3..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.2 -q:a 9 -acodec libmp3lame "$SOUNDS_DIR/whoosh.mp3" -y

echo "✓ Placeholder audio files created successfully!"
echo ""
echo "Files created:"
echo "  - $SOUNDS_DIR/door-creak.mp3 (1.5s)"
echo "  - $SOUNDS_DIR/bone-rattle.mp3 (0.8s)"
echo "  - $SOUNDS_DIR/whoosh.mp3 (1.2s)"
echo ""
echo "Note: These are silent placeholder files. Replace them with actual sound effects."
echo "See public/sounds/README.md for sourcing recommendations."
