import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const QuestionDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { questionId } = route.params;
  const { questions, updateQuestionNotes, toggleQuestionBookmark, toggleQuestionComplete } = useDashboardStore();

  const question = questions.find(q => q.id === questionId);

  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (question) {
      setNotes(question.notes || '');
    }
  }, [question]);

  if (!question) {
    return (
      <ScreenWrapper>
        <Typography variant="body">Question not found.</Typography>
      </ScreenWrapper>
    );
  }

  const handleSaveNotes = async () => {
    await updateQuestionNotes(question.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Advanced': return theme.colors.danger;
      case 'Intermediate': return theme.colors.primaryLight;
      default: return theme.colors.secondary;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper withPadding={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <SvgIcon name="useful-links" size={20} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
            <Typography variant="body" style={{ fontWeight: '600' }}>Back</Typography>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => toggleQuestionBookmark(question.id, !question.is_bookmarked)}>
              <SvgIcon
                name="star"
                size={22}
                color={question.is_bookmarked ? '#eab308' : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => toggleQuestionComplete(question.id, !question.is_completed)}
              style={{ marginLeft: theme.spacing.md }}
            >
              <SvgIcon
                name="check-circle"
                size={22}
                color={question.is_completed ? theme.colors.success : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Question Meta */}
          <View style={styles.metaRow}>
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

          {/* Question Title */}
          <Typography variant="h2" style={styles.title}>
            {question.title}
          </Typography>

          {/* Code Snippet (if any) */}
          {question.code_snippet ? (
            <View style={styles.codeContainer}>
              <View style={styles.codeHeader}>
                <Typography variant="small" color="#9ca3af" style={{ fontWeight: '600' }}>JS / TS Code</Typography>
              </View>
              <View style={styles.codeContent}>
                <Typography variant="body" style={styles.codeText}>
                  {question.code_snippet}
                </Typography>
              </View>
            </View>
          ) : null}

          {/* Solution Section */}
          <Typography variant="h3" style={styles.solutionHeader}>
            Detailed Answer
          </Typography>
          <PremiumCard style={styles.solutionCard} backgroundColor="rgba(255,255,255,0.01)">
            <Typography variant="body" style={styles.solutionText}>
              {question.solution}
            </Typography>
          </PremiumCard>

          {/* Personal Notes Section */}
          <Typography variant="h3" style={styles.notesHeader}>
            Personal Study Notes
          </Typography>
          <TextInput
            placeholder="Type your summary, code blocks, or mnemonics here..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            style={styles.notesInput}
          />
          <CustomButton
            title={isSaved ? 'Notes Saved! ✓' : 'Save Personal Notes'}
            variant={isSaved ? 'secondary' : 'primary'}
            onPress={handleSaveNotes}
            style={styles.saveNotesBtn}
          />
        </ScrollView>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
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
  title: {
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
    marginBottom: theme.spacing.xl,
  },
  codeContainer: {
    backgroundColor: '#0f172a',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  codeHeader: {
    backgroundColor: '#1e293b',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  codeContent: {
    padding: theme.spacing.md,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  solutionHeader: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  solutionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  solutionText: {
    lineHeight: 22,
  },
  notesHeader: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  saveNotesBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
});
export default QuestionDetailScreen;
