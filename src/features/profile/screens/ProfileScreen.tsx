import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/ScreenWrapper';
import { Typography } from '../../../shared/components/Typography';
import { useQuizStore } from '../../../app/store/useQuizStore';
import { theme } from '../../../app/theme';

export const ProfileScreen = () => {
  const { quizHistory } = useQuizStore();

  const totalQuizzes = quizHistory.length;
  const totalCorrect = quizHistory.reduce((acc, session) => acc + session.score, 0);
  const totalQuestions = quizHistory.reduce((acc, session) => acc + session.total, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Typography variant="h1" color={theme.colors.primaryLight} style={styles.headerTitle}>
          My Progress
        </Typography>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Typography variant="h2" color={theme.colors.primary}>{totalQuizzes}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Quizzes Taken</Typography>
          </View>
          <View style={styles.statBox}>
            <Typography variant="h2" color={theme.colors.success}>{averageScore}%</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>Avg Score</Typography>
          </View>
        </View>

        <Typography variant="h3" style={styles.historyTitle}>
          Recent History
        </Typography>

        {quizHistory.length === 0 ? (
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.emptyText}>
            You haven't completed any quizzes yet. Start practicing!
          </Typography>
        ) : (
          [...quizHistory].reverse().map((session) => (
            <View key={session.id} style={styles.historyCard}>
              <View>
                <Typography variant="body" color={theme.colors.text}>
                  {session.topic}
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {new Date(session.date).toLocaleDateString()} • {session.difficulty}
                </Typography>
              </View>
              <Typography variant="h3" color={session.score / session.total >= 0.7 ? theme.colors.success : theme.colors.danger}>
                {session.score}/{session.total}
              </Typography>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    marginBottom: theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyTitle: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
