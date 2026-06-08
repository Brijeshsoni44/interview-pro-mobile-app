import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../../shared/components/ScreenWrapper';
import { Typography } from '../../../shared/components/Typography';
import { CustomButton } from '../../../shared/components/CustomButton';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import { useQuizStore } from '../../../app/store/useQuizStore';
import { RootStackParamList } from '../../../app/navigation/types';
import { theme } from '../../../app/theme';

type QuizScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

export const QuizScreen = () => {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    markRevealed, 
    nextQuestion, 
    isFinished 
  } = useQuizStore();

  const currentQuestion = questions[currentQuestionIndex];
  const isRevealed = !!answers[currentQuestion?.id];

  useEffect(() => {
    if (isFinished) {
      navigation.replace('Result');
    }
  }, [isFinished, navigation]);

  if (!currentQuestion) return null;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </View>
        <ProgressBar progress={(currentQuestionIndex + (isRevealed ? 1 : 0)) / questions.length} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <QuestionCard 
          question={currentQuestion} 
          isRevealed={isRevealed}
          onReveal={() => markRevealed(currentQuestion.id)}
        />
      </ScrollView>

      {isRevealed && (
        <View style={styles.footer}>
          <CustomButton 
            title={currentQuestionIndex === questions.length - 1 ? 'Finish Study Session' : 'Next Question'} 
            onPress={nextQuestion} 
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  footer: {
    paddingTop: theme.spacing.md,
  },
});
