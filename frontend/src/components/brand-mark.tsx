import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export function BrandMark({ size = 40, label }: { size?: number; label?: string }) {
  const radius = size * 0.22;
  return (
    <View accessible accessibilityLabel={label || "Jarvis AI logo"} style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Defs>
          <LinearGradient id="jarvisBrand" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#FF5E00" />
            <Stop offset="1" stopColor="#FF9D45" />
          </LinearGradient>
        </Defs>
        <Rect x="1" y="1" width="46" height="46" rx={radius} fill="url(#jarvisBrand)" />
        <Circle cx="24" cy="24" r="13" stroke="#FFF7F0" strokeWidth="2.8" opacity="0.95" />
        <Path d="M16 25.5C18.4 21.4 21.1 19.3 24 19.3c3 0 5.7 2.1 8 6.2" stroke="#FFF7F0" strokeWidth="2.8" strokeLinecap="round" />
        <Path d="M15 31.5c2.5 2 5.5 3 9 3s6.5-1 9-3" stroke="#FFF7F0" strokeWidth="2.8" strokeLinecap="round" />
        <Circle cx="24" cy="24" r="2.4" fill="#FFF7F0" />
      </Svg>
    </View>
  );
}
