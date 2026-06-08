import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { theme } from '../theme';
import { Typography } from '../../shared/components/Typography';
import { SvgIcon, IconName } from '../../components/SvgIcons';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

interface SidebarItem {
  label: string;
  icon: IconName;
  routeName: string;
}

interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

export const CustomSidebarContent: React.FC<DrawerContentComponentProps> = ({ navigation, state }) => {
  const { user } = useAuthStore();
  const { themeMode } = useThemeStore();
  const activeRouteName = state.routeNames[state.index];

  // Sidebar sections structure matching the layout
  const groups: SidebarGroup[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Home', icon: 'home', routeName: 'Home' },
        { label: 'Roadmap', icon: 'roadmap', routeName: 'Roadmap' },
        { label: 'Study Plan', icon: 'study-plan', routeName: 'StudyPlan' },
        { label: 'Progress', icon: 'progress', routeName: 'Progress' },
        { label: 'Bookmarks', icon: 'bookmarks', routeName: 'Bookmarks' },
        { label: 'History', icon: 'history', routeName: 'History' },
      ],
    },
    {
      title: 'PRACTICE',
      items: [
        { label: 'Coding Practice', icon: 'coding-practice', routeName: 'CodingPractice' },
        { label: 'Mock Interviews', icon: 'mock-interviews', routeName: 'MockInterviews' },
        { label: 'Quizzes', icon: 'quizzes', routeName: 'Quizzes' },
        { label: 'Top Interview Questions', icon: 'top-questions', routeName: 'TopInterviewQuestions' },
      ],
    },
    {
      title: 'RESOURCES',
      items: [
        { label: 'Notes', icon: 'notes', routeName: 'Notes' },
        { label: 'Video Tutorials', icon: 'video-tutorials', routeName: 'VideoTutorials' },
        { label: 'Courses', icon: 'courses', routeName: 'Courses' },
        { label: 'Useful Links', icon: 'useful-links', routeName: 'UsefulLinks' },
      ],
    },
    {
      items: [
        { label: 'Settings', icon: 'settings', routeName: 'Settings' },
        { label: 'Help & Support', icon: 'help', routeName: 'HelpSupport' },
      ],
    },
  ];

  // Helper to determine if an item is active
  const isItemActive = (item: SidebarItem) => {
    return activeRouteName === item.routeName;
  };

  const handleNavigation = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }}
          style={styles.avatar}
        />
        <View style={styles.profileText}>
          <Typography variant="h3" style={styles.profileName}>
            {user?.name || 'Rahul Sharma'}
          </Typography>
          <Typography variant="small" color={theme.colors.textSecondary} style={styles.profileEmail}>
            {user?.email || 'rahul.sharma@email.com'}
          </Typography>
        </View>
      </View>

      {/* 2. Premium Badge */}
      <TouchableOpacity 
        style={styles.premiumBadge}
        activeOpacity={0.8}
        onPress={() => handleNavigation('Settings')}
      >
        <View style={styles.premiumLeft}>
          <View style={styles.crownCircle}>
            <SvgIcon name="crown" size={16} color="#ffffff" />
          </View>
          <View style={styles.premiumTextContainer}>
            <Typography variant="body" style={styles.premiumTitle}>
              Premium Member
            </Typography>
            <Typography variant="small" color="#c7d2fe" style={styles.premiumSubtitle}>
              Valid till 25 Dec 2024
            </Typography>
          </View>
        </View>
        <SvgIcon name="chevron-right" size={16} color="#c7d2fe" />
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* 3. Navigation Groups */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {groups.map((group, groupIdx) => (
          <View key={groupIdx} style={styles.groupContainer}>
            {group.title && (
              <Typography variant="small" color={theme.colors.textSecondary} style={styles.groupHeader}>
                {group.title}
              </Typography>
            )}
            
            {group.items.map((item, itemIdx) => {
              const active = isItemActive(item);
              return (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.navItem,
                    active && styles.navItemActive
                  ]}
                  onPress={() => handleNavigation(item.routeName)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemLeft}>
                    <SvgIcon
                      name={item.icon}
                      size={20}
                      color={active ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Typography
                      variant="body"
                      color={active ? theme.colors.primary : theme.colors.textSecondary}
                      style={[
                        styles.navLabel,
                        active && styles.navLabelActive
                      ]}
                    >
                      {item.label}
                    </Typography>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* 4. Bottom Banner (Refer & Earn) */}
      <TouchableOpacity 
        style={styles.referCard}
        activeOpacity={0.8}
      >
        <View style={styles.referLeft}>
          <View style={styles.giftIconContainer}>
            <SvgIcon name="gift" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.referTextContainer}>
            <Typography variant="body" color={theme.colors.primary} style={styles.referTitle}>
              Refer & Earn
            </Typography>
            <Typography variant="small" color={theme.colors.textSecondary} style={styles.referSubtitle}>
              Invite your friends and earn premium access!
            </Typography>
          </View>
        </View>
        <SvgIcon name="chevron-right" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
  },
  profileText: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  crownCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTextContainer: {
    justifyContent: 'center',
  },
  premiumTitle: {
    fontWeight: '600',
    color: '#818cf8',
    fontSize: 14,
  },
  premiumSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  groupContainer: {
    marginBottom: theme.spacing.lg,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginVertical: 1,
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    fontWeight: '600',
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  referLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  giftIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referTextContainer: {
    flex: 1,
  },
  referTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  referSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
});
