import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';

interface EvolvingAvatarProps {
  level: number;
  size?: number;
}

export default function EvolvingAvatar({ level, size = 60 }: EvolvingAvatarProps) {
  const getAvatarColors = (level: number): [string, string] => {
    if (level < 5) return ['#94A3B8', '#64748B'];
    if (level < 10) return ['#3B82F6', '#2563EB'];
    if (level < 20) return ['#8B5CF6', '#7C3AED'];
    if (level < 30) return ['#EC4899', '#DB2777'];
    if (level < 50) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  const getAvatarShape = (level: number) => {
    const [color1, color2] = getAvatarColors(level);
    const center = size / 2;
    const radius = size / 2.5;

    if (level < 5) {
      return (
        <>
          <Circle cx={center} cy={center} r={radius} fill={color1} />
          <Circle cx={center - radius * 0.3} cy={center - radius * 0.2} r={radius * 0.15} fill={color2} />
          <Circle cx={center + radius * 0.3} cy={center - radius * 0.2} r={radius * 0.15} fill={color2} />
          <Path
            d={`M ${center - radius * 0.4} ${center + radius * 0.3} Q ${center} ${center + radius * 0.5} ${center + radius * 0.4} ${center + radius * 0.3}`}
            stroke={color2}
            strokeWidth={2}
            fill="none"
          />
        </>
      );
    }

    if (level < 10) {
      return (
        <>
          <Polygon
            points={`${center},${center - radius} ${center + radius * 0.9},${center + radius * 0.3} ${center + radius * 0.3},${center + radius} ${center - radius * 0.3},${center + radius} ${center - radius * 0.9},${center + radius * 0.3}`}
            fill={color1}
          />
          <Circle cx={center} cy={center} r={radius * 0.6} fill={color2} />
          <Path
            d={`M ${center - radius * 0.3} ${center} L ${center + radius * 0.3} ${center} M ${center} ${center - radius * 0.3} L ${center} ${center + radius * 0.3}`}
            stroke={color1}
            strokeWidth={3}
          />
        </>
      );
    }

    if (level < 20) {
      return (
        <>
          <Rect x={center - radius} y={center - radius} width={radius * 2} height={radius * 2} fill={color1} rx={radius * 0.3} />
          <Circle cx={center} cy={center - radius * 0.3} r={radius * 0.4} fill={color2} />
          <Polygon
            points={`${center - radius * 0.5},${center + radius * 0.2} ${center},${center + radius * 0.8} ${center + radius * 0.5},${center + radius * 0.2}`}
            fill={color2}
          />
          <Path
            d={`M ${center - radius * 0.7} ${center - radius * 0.8} L ${center - radius * 0.3} ${center - radius * 1.2} M ${center + radius * 0.7} ${center - radius * 0.8} L ${center + radius * 0.3} ${center - radius * 1.2}`}
            stroke={Colors.accent}
            strokeWidth={3}
          />
        </>
      );
    }

    if (level < 30) {
      return (
        <>
          <Circle cx={center} cy={center} r={radius} fill={color1} />
          <Path
            d={`M ${center} ${center - radius * 1.2} L ${center - radius * 0.3} ${center - radius * 0.7} L ${center + radius * 0.3} ${center - radius * 0.7} Z`}
            fill={Colors.accent}
          />
          <Circle cx={center - radius * 0.3} cy={center - radius * 0.2} r={radius * 0.12} fill={color2} />
          <Circle cx={center + radius * 0.3} cy={center - radius * 0.2} r={radius * 0.12} fill={color2} />
          <Path
            d={`M ${center - radius * 0.4} ${center + radius * 0.3} Q ${center} ${center + radius * 0.5} ${center + radius * 0.4} ${center + radius * 0.3}`}
            stroke={color2}
            strokeWidth={2}
            fill="none"
          />
          <Path
            d={`M ${center - radius * 0.8} ${center} Q ${center - radius * 1.2} ${center - radius * 0.5} ${center - radius * 0.8} ${center - radius * 0.8}`}
            stroke={Colors.accent}
            strokeWidth={2}
            fill="none"
          />
          <Path
            d={`M ${center + radius * 0.8} ${center} Q ${center + radius * 1.2} ${center - radius * 0.5} ${center + radius * 0.8} ${center - radius * 0.8}`}
            stroke={Colors.accent}
            strokeWidth={2}
            fill="none"
          />
        </>
      );
    }

    if (level < 50) {
      return (
        <>
          <Defs>
            <SvgLinearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color1} />
              <Stop offset="100%" stopColor={color2} />
            </SvgLinearGradient>
          </Defs>
          <Circle cx={center} cy={center} r={radius} fill="url(#crownGradient)" />
          <Path
            d={`M ${center - radius * 0.8} ${center - radius * 0.5} L ${center - radius * 0.5} ${center - radius * 1.1} L ${center - radius * 0.2} ${center - radius * 0.6} L ${center} ${center - radius * 1.3} L ${center + radius * 0.2} ${center - radius * 0.6} L ${center + radius * 0.5} ${center - radius * 1.1} L ${center + radius * 0.8} ${center - radius * 0.5} L ${center + radius * 0.8} ${center - radius * 0.2} L ${center - radius * 0.8} ${center - radius * 0.2} Z`}
            fill={Colors.accent}
            stroke={color2}
            strokeWidth={2}
          />
          <Circle cx={center} cy={center - radius * 1.3} r={radius * 0.15} fill={Colors.accent} />
          <Circle cx={center - radius * 0.5} cy={center - radius * 1.1} r={radius * 0.12} fill={Colors.accent} />
          <Circle cx={center + radius * 0.5} cy={center - radius * 1.1} r={radius * 0.12} fill={Colors.accent} />
        </>
      );
    }

    return (
      <>
        <Defs>
          <SvgLinearGradient id="legendaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.accent} />
            <Stop offset="50%" stopColor={color1} />
            <Stop offset="100%" stopColor={color2} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={center} cy={center} r={radius} fill="url(#legendaryGradient)" />
        <Path
          d={`M ${center} ${center - radius * 1.3} L ${center - radius * 0.2} ${center - radius * 0.5} L ${center - radius * 1.1} ${center - radius * 0.3} L ${center - radius * 0.4} ${center + radius * 0.1} L ${center - radius * 0.6} ${center + radius * 0.9} L ${center} ${center + radius * 0.4} L ${center + radius * 0.6} ${center + radius * 0.9} L ${center + radius * 0.4} ${center + radius * 0.1} L ${center + radius * 1.1} ${center - radius * 0.3} L ${center + radius * 0.2} ${center - radius * 0.5} Z`}
          fill={Colors.accent}
          stroke={color2}
          strokeWidth={2}
        />
        <Circle cx={center} cy={center} r={radius * 0.3} fill={color2} />
      </>
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {getAvatarShape(level)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
