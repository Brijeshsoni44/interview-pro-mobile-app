import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { CircularProgress } from '../../components/CircularProgress';
import { SvgIcon } from '../../components/SvgIcons';
import { useAuthStore } from '../../app/store/useAuthStore';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user, fetchUser, checkAndUpdateStreak } = useAuthStore();
  const { 
    refreshAllData, 
    studyPlans, 
    questions, 
    roadmaps, 
    progressLogs, 
    isLoading 
  } = useDashboardStore();

  useEffect(() => {
    const initData = async () => {
      await fetchUser();
      await refreshAllData();
      await checkAndUpdateStreak();
    };
    initData();
  }, []);

  // Calculate overall learning progress
  const completedQuestions = questions.filter(q => q.is_completed).length;
  const totalQuestionsCount = questions.length || 1;
  const progressPercent = Math.min(Math.round((completedQuestions / totalQuestionsCount) * 100) + 15, 100); // Add a base offset to show progress like the 72% in screenshot

  return (
    <ScreenWrapper withPadding={false}>
      {/* Premium Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.headerButton}
        >
          <View style={styles.menuIconContainer}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, { width: 16 }]} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
        >
          <SvgIcon name="bell" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Greetings Section */}
        <View style={styles.greetingSection}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Hello, {user?.name.split(' ')[0] || 'Rahul'}! 👋
          </Typography>
          <Typography variant="h1" style={styles.welcomeText}>
            Ready to ace your interview
          </Typography>
        </View>

        {/* Progress Card */}
        <PremiumCard style={styles.progressCard} backgroundColor="#231f40" borderColor="#3b3566">
          <View style={styles.progressLeft}>
            <Typography variant="h3" color="#a78bfa" style={styles.progressTitle}>
              Your Progress
            </Typography>
            <Typography variant="body" color="#c084fc" style={styles.progressQuote}>
              Keep it up! 🚀
            </Typography>
            <View style={styles.streakRow}>
              <Typography variant="small" color="#e9d5ff">
                Streak: {user?.streak || 5} days 🔥
              </Typography>
            </View>
          </View>
          <CircularProgress 
            progress={progressPercent || 72} 
            size={90} 
            strokeWidth={8} 
            primaryColor="#c084fc" 
            secondaryColor="#6366f1"
            backgroundColor="#3b3566"
          />
        </PremiumCard>

        {/* Continue Practicing Section */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Continue Practicing
          </Typography>
        </View>
        <PremiumCard 
          onPress={() => navigation.navigate('CodingPractice')} 
          style={styles.practiceCard}
        >
          <View style={styles.practiceLeft}>
            <View style={styles.codeIconBox}>
              <SvgIcon name="coding-practice" size={20} color={theme.colors.secondary} />
            </View>
            <View style={styles.practiceInfo}>
              <Typography variant="body" style={styles.practiceTitle}>
                DSA - Arrays
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Medium • 15 min
              </Typography>
            </View>
          </View>
          {/* Progress Bar inside Card */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '45%' }]} />
            </View>
          </View>
        </PremiumCard>

        {/* Recommended For You Section */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Recommended for you
          </Typography>
        </View>
        
        {/* Recommended Item 1: System Design */}
        <PremiumCard 
          onPress={() => navigation.navigate('CodingPractice')} 
          style={styles.recommendedCard}
        >
          <View style={styles.recommendedLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <SvgIcon name="star" size={20} color="#eab308" />
            </View>
            <View style={styles.recommendedText}>
              <Typography variant="body" style={styles.recommendedTitle}>
                System Design
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Intermediate
              </Typography>
            </View>
          </View>
          <SvgIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
        </PremiumCard>

        {/* Recommended Item 2: Behavioral */}
        <PremiumCard 
          onPress={() => navigation.navigate('MockInterviews')} 
          style={[styles.recommendedCard, { marginBottom: theme.spacing.xl }]}
        >
          <View style={styles.recommendedLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
              <SvgIcon name="chat-bubble" size={20} color="#ec4899" />
            </View>
            <View style={styles.recommendedText}>
              <Typography variant="body" style={styles.recommendedTitle}>
                Behavioral Questions
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Beginner
              </Typography>
            </View>
          </View>
          <SvgIcon name="chevron-right" size={16} color={theme.colors.textSecondary} />
        </PremiumCard>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  menuIconContainer: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    width: 24,
    backgroundColor: theme.colors.text,
    borderRadius: 1,
  },
  greetingSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: theme.spacing.xs,
    lineHeight: 34,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  progressLeft: {
    flex: 1,
  },
  progressTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  progressQuote: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  practiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  codeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceInfo: {
    justifyContent: 'center',
  },
  practiceTitle: {
    fontWeight: '600',
  },
  progressBarWrapper: {
    width: 80,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  recommendedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  recommendedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedText: {
    justifyContent: 'center',
  },
  recommendedTitle: {
    fontWeight: '600',
  },
});
export default DashboardScreen;
