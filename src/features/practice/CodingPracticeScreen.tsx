import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { TOPICS, DIFFICULTIES } from '../../shared/constants';
import { theme } from '../../app/theme';

export const CodingPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const { questions, refreshQuestions, toggleQuestionBookmark, toggleQuestionComplete } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  useEffect(() => {
    refreshQuestions(activeTopic, activeDifficulty, searchQuery);
  }, [activeTopic, activeDifficulty, searchQuery]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Advanced': return theme.colors.danger;
      case 'Intermediate': return theme.colors.primaryLight;
      default: return theme.colors.secondary;
    }
  };

  return (
    <ScreenWrapper withPadding={false}>
      {/* Search Bar Header */}
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Coding Practice
        </Typography>
        <View style={styles.searchContainer}>
          <SvgIcon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search questions, solutions, companies..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        {/* Topics Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[
                styles.chip,
                activeTopic === topic && styles.chipActive
              ]}
              onPress={() => setActiveTopic(topic)}
            >
              <Typography 
                variant="small" 
                color={activeTopic === topic ? theme.colors.background : theme.colors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                {topic}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Difficulty Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipScroll, { marginTop: theme.spacing.sm }]}>
          {DIFFICULTIES.map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.chip,
                activeDifficulty === diff && styles.chipActive
              ]}
              onPress={() => setActiveDifficulty(diff)}
            >
              <Typography 
                variant="small" 
                color={activeDifficulty === diff ? theme.colors.background : theme.colors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                {diff}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Questions List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No questions match your current filters.
            </Typography>
          </View>
        ) : (
          questions.map((question) => (
            <PremiumCard 
              key={question.id} 
              style={styles.card}
              onPress={() => navigation.navigate('QuestionDetail', { questionId: question.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardBadges}>
                  <View style={[styles.diffBadge, { backgroundColor: `${getDifficultyColor(question.difficulty)}15` }]}>
                    <Typography variant="small" color={getDifficultyColor(question.difficulty)} style={{ fontWeight: '600' }}>
                      {question.difficulty}
                    </Typography>
                  </View>
                  <View style={styles.topicBadge}>
                    <Typography variant="small" color={theme.colors.textSecondary}>
                      {question.topic}
                    </Typography>
                  </View>
                </View>

                {/* Star & Complete Toggles */}
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => toggleQuestionBookmark(question.id, !question.is_bookmarked)}>
                    <SvgIcon
                      name="star"
                      size={20}
                      color={question.is_bookmarked ? '#eab308' : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => toggleQuestionComplete(question.id, !question.is_completed)}
                    style={{ marginLeft: theme.spacing.sm }}
                  >
                    <SvgIcon
                      name="check-circle"
                      size={20}
                      color={question.is_completed ? theme.colors.success : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Typography variant="body" style={[styles.cardTitle, question.is_completed && styles.titleCompleted]}>
                {question.title}
              </Typography>

              {question.company_tags ? (
                <Typography variant="small" color={theme.colors.primaryLight} style={styles.companyTags}>
                  Tags: {question.company_tags}
                </Typography>
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
  filterSection: {
    marginVertical: theme.spacing.sm,
  },
  chipScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
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
    marginBottom: theme.spacing.sm,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  diffBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  topicBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  companyTags: {
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
});
export default CodingPracticeScreen;
