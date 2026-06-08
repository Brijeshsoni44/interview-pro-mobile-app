import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const MockInterviewScreen = () => {
  const navigation = useNavigation<any>();
  const { mockInterviews, refreshAllData } = useDashboardStore();

  useEffect(() => {
    refreshAllData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 50) return theme.colors.primaryLight;
    return theme.colors.danger;
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Mock Interviews
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Assess your interview readiness. Run timed simulated coding or behavioral loops, rate your answers, and keep a progress log.
        </Typography>
      </View>

      <CustomButton
        title="Start New Mock Session"
        onPress={() => navigation.navigate('MockInterviewRunner', {})}
        style={styles.startBtn}
      />

      <Typography variant="h3" style={styles.historyTitle}>
        Interview History
      </Typography>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {mockInterviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No mock sessions completed yet. Start your first session above!
            </Typography>
          </View>
        ) : (
          mockInterviews.map((session) => (
            <PremiumCard key={session.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Typography variant="h3" style={styles.cardTitle}>
                  {session.title}
                </Typography>
                <Typography variant="h3" color={getScoreColor(session.score)} style={{ fontWeight: '800' }}>
                  {session.score}%
                </Typography>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <SvgIcon name="clock" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    {session.duration} mins
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <SvgIcon name="study-plan" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    {new Date(session.date).toLocaleDateString()}
                  </Typography>
                </View>
              </View>

              {session.feedback ? (
                <View style={styles.feedbackContainer}>
                  <Typography variant="caption" color={theme.colors.textSecondary} style={styles.feedbackLabel}>
                    Feedback & Notes:
                  </Typography>
                  <Typography variant="body" color={theme.colors.text} style={styles.feedbackText}>
                    {session.feedback}
                  </Typography>
                </View>
              ) : null}
            </PremiumCard>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: theme.spacing.md,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  startBtn: {
    marginVertical: theme.spacing.lg,
  },
  historyTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  scrollContainer: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontWeight: '700',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  feedbackContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedbackLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
export default MockInterviewScreen;
