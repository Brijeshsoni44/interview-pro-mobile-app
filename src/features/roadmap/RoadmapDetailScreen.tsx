import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const RoadmapDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { roadmapId, title } = route.params;
  const { roadmapSteps, toggleRoadmapStep, refreshAllData } = useDashboardStore();

  useEffect(() => {
    refreshAllData();
  }, []);

  const steps = roadmapSteps[roadmapId] || [];

  const handleToggleStep = async (stepId: number, currentStatus: boolean) => {
    await toggleRoadmapStep(stepId, roadmapId, !currentStatus);
  };

  return (
    <ScreenWrapper withPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SvgIcon name="useful-links" size={20} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          <Typography variant="body" style={{ fontWeight: '600' }}>Back</Typography>
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {steps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No steps found for this roadmap.
            </Typography>
          </View>
        ) : (
          steps.map((step, index) => {
            const isCompleted = step.is_completed;
            return (
              <PremiumCard
                key={step.id}
                style={isCompleted ? [styles.stepCard, styles.stepCardCompleted] : styles.stepCard}
                borderColor={isCompleted ? theme.colors.success : theme.colors.border}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepBadge}>
                    <Typography variant="small" color={theme.colors.primaryLight} style={{ fontWeight: '700' }}>
                      STEP {index + 1}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleStep(step.id, isCompleted)}
                    style={[
                      styles.checkButton,
                      isCompleted && styles.checkButtonCompleted
                    ]}
                  >
                    <SvgIcon
                      name="check-circle"
                      size={20}
                      color={isCompleted ? theme.colors.background : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <Typography
                  variant="h3"
                  style={[
                    styles.stepTitle,
                    isCompleted && styles.textCompleted
                  ]}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body"
                  color={theme.colors.textSecondary}
                  style={[
                    styles.stepDesc,
                    isCompleted && styles.textCompleted
                  ]}
                >
                  {step.description}
                </Typography>

                <View style={styles.metaRow}>
                  <SvgIcon name="clock" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    {step.estimated_time || '1 week'}
                  </Typography>
                </View>
              </PremiumCard>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerTitle: {
    fontWeight: '700',
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  stepCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  stepCardCompleted: {
    opacity: 0.8,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  checkButtonCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  stepTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  stepDesc: {
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
export default RoadmapDetailScreen;
