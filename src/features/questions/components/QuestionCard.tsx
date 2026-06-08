import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../../../shared/components/Typography';
import { CustomButton } from '../../../shared/components/CustomButton';
import { theme } from '../../../app/theme';
import { Question } from '../../../shared/types';

interface QuestionCardProps {
  question: Question;
  isRevealed: boolean;
  onReveal: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isRevealed,
  onReveal,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="caption" color={theme.colors.primaryLight}>
          {question.topic} • {question.difficulty}
        </Typography>
      </View>
      <Typography variant="h2" style={styles.questionText}>
        {question.question}
      </Typography>

      {!isRevealed ? (
        <View style={styles.revealContainer}>
          <CustomButton 
            title="Reveal Answer" 
            variant="outline"
            onPress={onReveal} 
          />
        </View>
      ) : (
        <View style={styles.answerContainer}>
          {question.code_snippet ? (
            <View style={styles.codeBox}>
              <Typography variant="small" color={theme.colors.secondary} style={styles.codeFont}>
                {question.code_snippet}
              </Typography>
            </View>
          ) : null}
          
          <View style={styles.explanationBox}>
            <Typography variant="body" color={theme.colors.text} style={{ lineHeight: 26 }}>
              {question.detailed_answer}
            </Typography>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  questionText: {
    marginBottom: theme.spacing.xl,
  },
  revealContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  answerContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  codeBox: {
    backgroundColor: '#000000',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  codeFont: {
    fontFamily: 'Courier',
  },
  explanationBox: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
});
