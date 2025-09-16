#!/bin/bash

# Pile iOS Build Script
# This script helps build and test the Pile iOS app

echo "🚀 Pile iOS Build Script"
echo "========================"

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

# Build the project
echo "🔨 Building project..."
if xcodebuild build -project PileiOS.xcodeproj -scheme PileiOS -destination 'platform=iOS Simulator,name=iPhone 15' > /dev/null 2>&1; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    echo "Run 'xcodebuild build -project PileiOS.xcodeproj -scheme PileiOS' for detailed error information"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if xcodebuild test -project PileiOS.xcodeproj -scheme PileiOS -destination 'platform=iOS Simulator,name=iPhone 15' > /dev/null 2>&1; then
    echo "✅ All tests passed!"
else
    echo "⚠️  Some tests failed. Check the test results in Xcode."
fi

cd ..

echo ""
echo "🎉 Build process completed!"
echo ""
echo "📱 Next steps:"
echo "1. Open PileiOS.xcodeproj in Xcode"
echo "2. Select iPhone 15 simulator or your device"
echo "3. Press Cmd + R to run the app"
echo ""
echo "✨ Features ready to test:"
echo "   • Create and manage journal piles"
echo "   • Write and edit entries"
echo "   • Add tags and attachments"
echo "   • AI chat and responses"
echo "   • Advanced search functionality"
echo "   • Secure API key storage"
