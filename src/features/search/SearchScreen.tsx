import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { useSearchStore } from '../../app/store/useSearchStore';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const { searchQuery, setSearchQuery, searchResults } = useSearchStore();
  const { refreshAllData } = useDashboardStore();

  useEffect(() => {
    // Refresh local store datasets to ensure search includes latest notes
    refreshAllData();
  }, []);

  const totalResults = 
    searchResults.questions.length + 
    searchResults.roadmaps.length + 
    searchResults.interviews.length;

  return (
    <ScreenWrapper withPadding={false}>
      {/* Search Bar Header */}
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Global Search
        </Typography>
        <View style={styles.searchContainer}>
          <SvgIcon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search questions, roadmaps, interviews, notes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Typography variant="body" color={theme.colors.textSecondary}>Clear</Typography>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {!searchQuery.trim() ? (
          <View style={styles.emptyContainer}>
            <SvgIcon name="search" size={48} color={theme.colors.border} />
            <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>
              Start typing to search globally across the app.
            </Typography>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No matching records found.
            </Typography>
          </View>
        ) : (
          <View>
            {/* 1. Roadmaps Section */}
            {searchResults.roadmaps.length > 0 && (
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Learning Roadmaps ({searchResults.roadmaps.length})
                </Typography>
                {searchResults.roadmaps.map((r) => (
                  <PremiumCard
                    key={r.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('RoadmapDetail', { roadmapId: r.id, title: r.title })}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                        <SvgIcon name="roadmap" size={18} color={theme.colors.primaryLight} />
                      </View>
                      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                        <Typography variant="body" style={{ fontWeight: '700' }}>{r.title}</Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>{r.description}</Typography>
                      </View>
                    </View>
                  </PremiumCard>
                ))}
              </View>
            )}

            {/* 2. Questions Section */}
            {searchResults.questions.length > 0 && (
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Practice Questions ({searchResults.questions.length})
                </Typography>
                {searchResults.questions.map((q) => (
                  <PremiumCard
                    key={q.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('QuestionDetail', { questionId: q.id })}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <SvgIcon name="coding-practice" size={18} color={theme.colors.secondary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                        <Typography variant="body" style={{ fontWeight: '700' }}>{q.title}</Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>{q.topic} • {q.difficulty}</Typography>
                      </View>
                    </View>
                  </PremiumCard>
                ))}
              </View>
            )}

            {/* 3. Mock Interviews Section */}
            {searchResults.interviews.length > 0 && (
              <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Mock Interviews ({searchResults.interviews.length})
                </Typography>
                {searchResults.interviews.map((i) => (
                  <PremiumCard
                    key={i.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('MockInterviews')}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <SvgIcon name="mock-interviews" size={18} color={theme.colors.danger} />
                      </View>
                      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                        <Typography variant="body" style={{ fontWeight: '700' }}>{i.title}</Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>Score: {i.score}% • Duration: {i.duration}m</Typography>
                      </View>
                    </View>
                  </PremiumCard>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    marginLeft: theme.spacing.sm,
    paddingVertical: 0,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default SearchScreen;
