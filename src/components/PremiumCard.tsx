import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { theme } from '../app/theme';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  borderTint?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  onPress,
  borderTint = false,
  backgroundColor = theme.colors.surface,
  borderColor = theme.colors.border,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor,
    borderColor: borderTint ? theme.colors.primaryLight : borderColor,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  };

  if (onPress) {
    return (
      <Pressable 
        style={({ pressed }) => [
          cardStyle, 
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, 
          style
        ]} 
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});
