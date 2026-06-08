import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../../shared/components/ScreenWrapper';
import { Typography } from '../../../shared/components/Typography';
import { CustomButton } from '../../../shared/components/CustomButton';
import { useQuizStore } from '../../../app/store/useQuizStore';
import { RootStackParamList } from '../../../app/navigation/types';
import { theme } from '../../../app/theme';

type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export const ResultScreen = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const { score, questions, resetQuiz } = useQuizStore();

  const handleDone = () => {
    resetQuiz();
    navigation.navigate('MainDrawer');
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Typography variant="h1" color={theme.colors.primary} style={styles.title}>
            Session Complete!
          </Typography>
          
          <View style={styles.scoreCircle}>
            <Typography variant="h2" color={theme.colors.text}>
              {percentage}%
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {score} / {questions.length} Reviewed
            </Typography>
          </View>

          <Typography variant="body" color={theme.colors.textSecondary} style={styles.message}>
            You successfully reviewed {score} key concepts in this study session! Keep practicing.
          </Typography>
        </View>

        <CustomButton
          title="Back to Topics"
          onPress={handleDone}
          style={styles.button}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 'auto',
  },
});
