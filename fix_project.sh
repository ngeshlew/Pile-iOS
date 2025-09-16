#!/bin/bash

# Pile iOS Project Fix Script
# This script helps fix common Xcode project issues

echo "🔧 Pile iOS Project Fix Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "PileiOS/PileiOS.xcodeproj/project.pbxproj" ]; then
    echo "❌ Error: Please run this script from the Pile-iOS directory"
    exit 1
fi

echo "✅ Project structure found"

# Clean build folder
echo "🧹 Cleaning build folder..."
cd PileiOS
xcodebuild clean -project PileiOS.xcodeproj -scheme PileiOS > /dev/null 2>&1

# Reset package caches
echo "📦 Resetting package caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/PileiOS-* > /dev/null 2>&1

# Check project validity
echo "🔍 Checking project validity..."
if xcodebuild -project PileiOS.xcodeproj -list > /dev/null 2>&1; then
    echo "✅ Project is valid and ready to build"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Open PileiOS.xcodeproj in Xcode"
    echo "2. Select a target device (iPhone simulator or physical device)"
    echo "3. Press Cmd+B to build"
    echo "4. Press Cmd+R to run"
    echo ""
    echo "📱 The app includes:"
    echo "   • Local-first journaling with Core Data"
    echo "   • AI integration (OpenAI + Ollama)"
    echo "   • Advanced search capabilities"
    echo "   • File attachment support"
    echo "   • Multiple themes and customization"
else
    echo "❌ Project validation failed"
    echo "Please check the project file for errors"
fi

cd ..
echo "✨ Done!"
