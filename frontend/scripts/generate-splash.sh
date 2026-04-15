#!/usr/bin/env bash
# Generate Apple Touch Startup Images for iOS PWA launch from
# public/images/splash-master.svg. One PNG per supported device size.
# Rerun after editing the master SVG or adding new device dimensions.

set -euo pipefail
cd "$(dirname "$0")/.."

SRC="public/images/splash-master.svg"
OUT="public/images/splash"
mkdir -p "$OUT"

# Portrait sizes only — iOS ignores landscape startup-image tags anyway.
# Pairs: "width height  devicewidth deviceheight  pixelratio  label"
# deviceWidth/Height are CSS points; pixelRatio multiplies them to physical px.
devices=(
    "640 1136  320 568 2 iphone-se1"
    "750 1334  375 667 2 iphone-8"
    "828 1792  414 896 2 iphone-xr"
    "1125 2436 375 812 3 iphone-x"
    "1170 2532 390 844 3 iphone-14"
    "1179 2556 393 852 3 iphone-15-pro"
    "1242 2208 414 736 3 iphone-8-plus"
    "1242 2688 414 896 3 iphone-xs-max"
    "1284 2778 428 926 3 iphone-13-pro-max"
    "1290 2796 430 932 3 iphone-15-pro-max"
    "1488 2266 744 1133 2 ipad-mini-6"
    "1536 2048 768 1024 2 ipad-9-3"
    "1620 2160 810 1080 2 ipad-10-2"
    "1640 2360 820 1180 2 ipad-air-11"
    "1668 2224 834 1112 2 ipad-pro-10-5"
    "1668 2388 834 1194 2 ipad-pro-11"
    "2048 2732 1024 1366 2 ipad-pro-12-9"
)

for row in "${devices[@]}"; do
    read -r w h dw dh pr label <<< "$row"
    rsvg-convert -w "$w" -h "$h" "$SRC" -o "$OUT/$label-${w}x${h}.png"
    printf "  generated %-22s  %sx%s\n" "$label" "$w" "$h"
done

echo "done: $(ls "$OUT"/*.png | wc -l | tr -d ' ') splash images"
