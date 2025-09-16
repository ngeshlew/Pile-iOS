#!/bin/bash

# Script to generate iOS app icons from the original Pile icon
# This script uses sips (macOS built-in image processing tool)

ICON_SOURCE="/Users/lewinimu/Documents/GitHub/Pile-iOS/assets/icon.png"
ICON_DIR="/Users/lewinimu/Documents/GitHub/Pile-iOS/PileiOS/PileiOS/Assets.xcassets/AppIcon.appiconset"

# Create the directory if it doesn't exist
mkdir -p "$ICON_DIR"

# Generate different sizes for iOS app icons
# 1024x1024 (App Store)
sips -z 1024 1024 "$ICON_SOURCE" --out "$ICON_DIR/icon-1024.png"

# 180x180 (iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X, XS, XS Max, XR, 11, 11 Pro, 11 Pro Max, 12, 12 Pro, 12 Pro Max, 13, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max)
sips -z 180 180 "$ICON_SOURCE" --out "$ICON_DIR/icon-180.png"

# 167x167 (iPad Pro 12.9-inch)
sips -z 167 167 "$ICON_SOURCE" --out "$ICON_DIR/icon-167.png"

# 152x152 (iPad Pro 11-inch)
sips -z 152 152 "$ICON_SOURCE" --out "$ICON_DIR/icon-152.png"

# 120x120 (iPhone 6, 6s, 7, 8, SE 2nd gen, 12 mini, 13 mini, 14, 15)
sips -z 120 120 "$ICON_SOURCE" --out "$ICON_DIR/icon-120.png"

# 87x87 (iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X, XS, XS Max, XR, 11, 11 Pro, 11 Pro Max, 12, 12 Pro, 12 Pro Max, 13, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max)
sips -z 87 87 "$ICON_SOURCE" --out "$ICON_DIR/icon-87.png"

# 80x80 (iPad, iPad 2, iPad mini, iPad Air, iPad Air 2, iPad mini 2, iPad mini 3, iPad mini 4, iPad Air 3, iPad mini 5, iPad Air 4, iPad mini 6, iPad Air 5, iPad 10.2-inch, iPad 10.9-inch, iPad 11-inch, iPad 12.9-inch)
sips -z 80 80 "$ICON_SOURCE" --out "$ICON_DIR/icon-80.png"

# 76x76 (iPad, iPad 2, iPad mini, iPad Air, iPad Air 2, iPad mini 2, iPad mini 3, iPad mini 4, iPad Air 3, iPad mini 5, iPad Air 4, iPad mini 6, iPad Air 5, iPad 10.2-inch, iPad 10.9-inch, iPad 11-inch, iPad 12.9-inch)
sips -z 76 76 "$ICON_SOURCE" --out "$ICON_DIR/icon-76.png"

# 60x60 (iPhone 6, 6s, 7, 8, SE 2nd gen, 12 mini, 13 mini, 14, 15)
sips -z 60 60 "$ICON_SOURCE" --out "$ICON_DIR/icon-60.png"

# 58x58 (iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X, XS, XS Max, XR, 11, 11 Pro, 11 Pro Max, 12, 12 Pro, 12 Pro Max, 13, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max)
sips -z 58 58 "$ICON_SOURCE" --out "$ICON_DIR/icon-58.png"

# 40x40 (iPad, iPad 2, iPad mini, iPad Air, iPad Air 2, iPad mini 2, iPad mini 3, iPad mini 4, iPad Air 3, iPad mini 5, iPad Air 4, iPad mini 6, iPad Air 5, iPad 10.2-inch, iPad 10.9-inch, iPad 11-inch, iPad 12.9-inch)
sips -z 40 40 "$ICON_SOURCE" --out "$ICON_DIR/icon-40.png"

# 29x29 (iPhone 6, 6s, 7, 8, SE 2nd gen, 12 mini, 13 mini, 14, 15)
sips -z 29 29 "$ICON_SOURCE" --out "$ICON_DIR/icon-29.png"

# 20x20 (iPad, iPad 2, iPad mini, iPad Air, iPad Air 2, iPad mini 2, iPad mini 3, iPad mini 4, iPad Air 3, iPad mini 5, iPad Air 4, iPad mini 6, iPad Air 5, iPad 10.2-inch, iPad 10.9-inch, iPad 11-inch, iPad 12.9-inch)
sips -z 20 20 "$ICON_SOURCE" --out "$ICON_DIR/icon-20.png"

echo "Icons generated successfully!"
