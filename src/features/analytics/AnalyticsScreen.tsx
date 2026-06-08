import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { useAuthStore } from '../../app/store/useAuthStore';
import { theme } from '../../app/theme';

export const AnalyticsScreen = () => {
  const { progressLogs, refreshAllData, questions } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    refreshAllData();
  }, []);

  const totalCompletedQuestions = questions.filter(q => q.is_completed).length;
  const totalBookmarkedQuestions = questions.filter(q => q.is_bookmarked).length;
  
  // Prepare data for the Bar Chart (Last 7 days)
  const chartHeight = 160;
  const chartWidth = Dimensions.get('window').width - theme.spacing.lg * 4 - 20; // accounting for padding
  const paddingLeft = 30;
  const paddingBottom = 20;
  const graphWidth = chartWidth - paddingLeft;
  const graphHeight = chartHeight - paddingBottom;

  const barCount = 7;
  const barWidth = 20;
  const barGap = (graphWidth - barCount * barWidth) / (barCount + 1);

  // Extract last 7 days from progress logs
  const last7Logs = progressLogs.slice(-7);
  // Ensure we have at least 7 entries, pad with empty if not
  const paddedLogs = [...Array(7 - last7Logs.length).fill({ date: '', daily_learning_time: 0 }), ...last7Logs];
  
  const maxStudyTime = Math.max(...paddedLogs.map(l => l.daily_learning_time), 60);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDay();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Typography variant="h1" color={theme.colors.primaryLight}>
            Progress Analytics
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Monitor your daily study hours, active learning streaks, and syllabus milestones.
          </Typography>
        </View>

        {/* Highlight Grid */}
        <View style={styles.statsGrid}>
          <PremiumCard style={styles.statItem} backgroundColor="rgba(99, 102, 241, 0.05)">
            <Typography variant="h2" color={theme.colors.primaryLight} style={{ fontWeight: '800' }}>
              {user?.streak || 5}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              Active Streak (Days)
            </Typography>
          </PremiumCard>
          <PremiumCard style={styles.statItem} backgroundColor="rgba(34, 197, 94, 0.05)">
            <Typography variant="h2" color={theme.colors.success} style={{ fontWeight: '800' }}>
              {totalCompletedQuestions}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              Questions Cleared
            </Typography>
          </PremiumCard>
        </View>

        {/* SVG Study Time Chart */}
        <Typography variant="h3" style={styles.chartTitle}>
          Daily Study Minutes
        </Typography>
        
        <PremiumCard style={styles.chartCard}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={theme.colors.primaryLight} />
                <Stop offset="100%" stopColor={theme.colors.primary} />
              </LinearGradient>
            </Defs>

            {/* Grid Lines */}
            <Line x1={paddingLeft} y1={0} x2={chartWidth} y2={0} stroke={theme.colors.border} strokeWidth="1" />
            <Line x1={paddingLeft} y1={graphHeight / 2} x2={chartWidth} y2={graphHeight / 2} stroke={theme.colors.border} strokeWidth="1" strokeDasharray="4 4" />
            <Line x1={paddingLeft} y1={graphHeight} x2={chartWidth} y2={graphHeight} stroke={theme.colors.border} strokeWidth="1.5" />

            {/* Y Axis Labels */}
            <SvgText x={paddingLeft - 8} y={12} fill={theme.colors.textSecondary} fontSize="10" textAnchor="end">
              {Math.round(maxStudyTime)}m
            </SvgText>
            <SvgText x={paddingLeft - 8} y={graphHeight / 2 + 4} fill={theme.colors.textSecondary} fontSize="10" textAnchor="end">
              {Math.round(maxStudyTime / 2)}m
            </SvgText>
            <SvgText x={paddingLeft - 8} y={graphHeight + 4} fill={theme.colors.textSecondary} fontSize="10" textAnchor="end">
              0m
            </SvgText>

            {/* Render Bars */}
            {paddedLogs.map((log, index) => {
              const studyTime = log.daily_learning_time || 0;
              const barHeight = (studyTime / maxStudyTime) * (graphHeight - 10);
              const x = paddingLeft + barGap + index * (barWidth + barGap);
              const y = graphHeight - barHeight;

              return (
                <React.Fragment key={index}>
                  {/* Bar */}
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 4)} // show a tiny sliver for 0m
                    rx="3"
                    fill="url(#barGrad)"
                    opacity={studyTime > 0 ? 1 : 0.25}
                  />
                  {/* X Axis Label */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight - 4}
                    fill={theme.colors.textSecondary}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {log.date ? getDayName(log.date).slice(0, 1) : ''}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </PremiumCard>

        {/* Completion Breakdown */}
        <Typography variant="h3" style={styles.chartTitle}>
          Syllabus Milestones
        </Typography>

        <PremiumCard style={styles.milestoneCard}>
          <View style={styles.milestoneRow}>
            <Typography variant="body" style={{ fontWeight: '600' }}>JS Closures & Scopes</Typography>
            <Typography variant="body" color={theme.colors.success} style={{ fontWeight: '700' }}>100%</Typography>
          </View>
          <View style={styles.milestoneProgressBg}>
            <View style={[styles.milestoneProgressFill, { width: '100%', backgroundColor: theme.colors.success }]} />
          </View>

          <View style={[styles.milestoneRow, { marginTop: theme.spacing.md }]}>
            <Typography variant="body" style={{ fontWeight: '600' }}>React Native Animations</Typography>
            <Typography variant="body" color={theme.colors.primaryLight} style={{ fontWeight: '700' }}>45%</Typography>
          </View>
          <View style={styles.milestoneProgressBg}>
            <View style={[styles.milestoneProgressFill, { width: '45%' }]} />
          </View>

          <View style={[styles.milestoneRow, { marginTop: theme.spacing.md }]}>
            <Typography variant="body" style={{ fontWeight: '600' }}>System Design & Caching</Typography>
            <Typography variant="body" color={theme.colors.danger} style={{ fontWeight: '700' }}>15%</Typography>
          </View>
          <View style={styles.milestoneProgressBg}>
            <View style={[styles.milestoneProgressFill, { width: '15%', backgroundColor: theme.colors.danger }]} />
          </View>
        </PremiumCard>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  chartCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  milestoneCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  milestoneProgressBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
  },
});
export default AnalyticsScreen;
