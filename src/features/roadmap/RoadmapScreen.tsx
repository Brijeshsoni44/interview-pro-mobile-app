import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const RoadmapScreen = () => {
  const navigation = useNavigation<any>();
  const { roadmaps, roadmapSteps, refreshAllData, isLoading } = useDashboardStore();

  useEffect(() => {
    refreshAllData();
  }, []);

  // Helper to calculate progress percentage for a roadmap
  const getRoadmapProgress = (roadmapId: number) => {
    const steps = roadmapSteps[roadmapId] || [];
    if (steps.length === 0) return 0;
    const completedCount = steps.filter(s => s.is_completed).length;
    return Math.round((completedCount / steps.length) * 100);
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Typography variant="h1" color={theme.colors.primaryLight}>
            Learning Roadmaps
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Follow these structured steps to master mobile architectures and frontend design.
          </Typography>
        </View>

        {roadmaps.map((roadmap) => {
          const progress = getRoadmapProgress(roadmap.id);
          return (
            <PremiumCard
              key={roadmap.id}
              style={styles.card}
              onPress={() => navigation.navigate('RoadmapDetail', { roadmapId: roadmap.id, title: roadmap.title })}
            >
              <View style={styles.cardHeader}>
                <Typography variant="h3" style={styles.title}>
                  {roadmap.title}
                </Typography>
                <View style={[styles.badge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Typography variant="small" color={theme.colors.primaryLight} style={styles.badgeText}>
                    {roadmap.difficulty}
                  </Typography>
                </View>
              </View>

              <Typography variant="body" color={theme.colors.textSecondary} style={styles.desc}>
                {roadmap.description}
              </Typography>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <SvgIcon name="clock" size={16} color={theme.colors.textSecondary} />
                  <Typography variant="small" color={theme.colors.textSecondary}>
                    {roadmap.estimated_time}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <SvgIcon name="check-circle" size={16} color={progress === 100 ? theme.colors.success : theme.colors.textSecondary} />
                  <Typography variant="small" color={progress === 100 ? theme.colors.success : theme.colors.textSecondary}>
                    {progress}% Complete
                  </Typography>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </PremiumCard>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontWeight: '600',
  },
  desc: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  progressContainer: {
    height: 6,
    width: '100%',
  },
  progressBg: {
    height: '100%',
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});
export default RoadmapScreen;
