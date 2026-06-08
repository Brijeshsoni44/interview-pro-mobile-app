import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { theme } from '../app/theme';
import { Typography } from '../shared/components/Typography';

interface LogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, showText = true, style }) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.primaryLight} />
            <Stop offset="100%" stopColor={theme.colors.primary} />
          </LinearGradient>
        </Defs>
        
        {/* Glowing Background Hexagon */}
        <Path
          d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z"
          fill="url(#logoGrad)"
          opacity="0.15"
        />
        
        {/* Core Icon: Shield with Checkmark/Terminal */}
        <Path
          d="M50 12 L85 32 L85 68 L50 88 L15 68 L15 32 Z"
          fill="url(#logoGrad)"
        />

        {/* Dynamic Terminal prompt '>' and checkmark inside */}
        <Path
          d="M38 40 L48 50 L38 60"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <Path
          d="M54 50 L64 60 L78 38"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Small Glowing Star */}
        <Circle cx="80" cy="20" r="6" fill={theme.colors.secondary} />
      </Svg>
      {showText && (
        <View>
          <Typography variant="h2" color={theme.colors.text} style={{ letterSpacing: 0.5, fontWeight: '800' }}>
            Prep<Typography variant="h2" color={theme.colors.primaryLight}>Ace</Typography>
          </Typography>
          <Typography variant="small" color={theme.colors.textSecondary} style={{ marginTop: -2 }}>
            INTERVIEW ARCHITECT
          </Typography>
        </View>
      )}
    </View>
  );
};
