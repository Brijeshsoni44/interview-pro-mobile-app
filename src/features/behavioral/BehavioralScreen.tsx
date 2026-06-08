import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

interface BehavioralQuestion {
  id: string;
  category: string;
  question: string;
}

export const BehavioralScreen = () => {
  const { behavioralAnswers, saveBehavioralAnswer, refreshBehavioralAnswers } = useDashboardStore();

  const categories = ['Leadership', 'Conflict Resolution', 'Ownership', 'Teamwork', 'Communication'];
  const [activeCategory, setActiveCategory] = useState('Leadership');
  
  // Active Question Edit State
  const [selectedQuestion, setSelectedQuestion] = useState<BehavioralQuestion | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Standard Questions list
  const standardQuestions: BehavioralQuestion[] = [
    { id: '1', category: 'Leadership', question: 'Describe a time when you took the lead on a project with ambiguous requirements.' },
    { id: '2', category: 'Leadership', question: 'Tell me about a time you mentored a junior engineer and saw their performance improve.' },
    
    { id: '3', category: 'Conflict Resolution', question: 'Describe a time when you had a major technical disagreement with another engineer.' },
    { id: '4', category: 'Conflict Resolution', question: 'Tell me about a time you disagreed with your Product Manager regarding a timeline.' },

    { id: '5', category: 'Ownership', question: 'Describe a time when you noticed a critical bug in production and took charge of solving it.' },
    { id: '6', category: 'Ownership', question: 'Tell me about a time you took ownership of refactoring a complex legacy codebase.' },

    { id: '7', category: 'Teamwork', question: 'Describe a project where you collaborated with cross-functional members (designers, backends).' },
    { id: '8', category: 'Teamwork', question: 'Tell me about a time a teammate was underperforming and how you handled the situation.' },

    { id: '9', category: 'Communication', question: 'Explain a complex technical concept (e.g. event loop) to a non-technical manager.' },
    { id: '10', category: 'Communication', question: 'Describe a situation where you had to present technical trade-offs to executives.' }
  ];

  useEffect(() => {
    refreshBehavioralAnswers();
  }, []);

  const filteredQuestions = standardQuestions.filter(q => q.category === activeCategory);

  const getSavedAnswer = (questionText: string) => {
    const record = behavioralAnswers.find(ans => ans.question === questionText);
    return record ? record.answer : '';
  };

  const handleSelectQuestion = (q: BehavioralQuestion) => {
    setSelectedQuestion(q);
    setAnswerInput(getSavedAnswer(q.question));
    setIsSaved(false);
  };

  const handleSaveAnswer = async () => {
    if (!selectedQuestion) return;
    await saveBehavioralAnswer(selectedQuestion.category, selectedQuestion.question, answerInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Behavioral Prep
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Formulate your answers using the STAR method: Situation, Task, Action, and Result.
        </Typography>
      </View>

      {/* Category Scroll */}
      <View style={{ marginVertical: theme.spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                activeCategory === cat && styles.chipActive
              ]}
              onPress={() => {
                setActiveCategory(cat);
                setSelectedQuestion(null);
              }}
            >
              <Typography 
                variant="small" 
                color={activeCategory === cat ? theme.colors.background : theme.colors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                {cat}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {!selectedQuestion ? (
          // Display questions list in this category
          <View>
            <Typography variant="h3" style={styles.sectionTitle}>
              Questions ({activeCategory})
            </Typography>
            {filteredQuestions.map((q) => {
              const answered = getSavedAnswer(q.question).length > 0;
              return (
                <PremiumCard
                  key={q.id}
                  style={styles.questionCard}
                  onPress={() => handleSelectQuestion(q)}
                  borderColor={answered ? theme.colors.success : theme.colors.border}
                >
                  <Typography variant="body" style={styles.questionText}>
                    {q.question}
                  </Typography>
                  <View style={styles.cardFooter}>
                    <Typography variant="caption" color={answered ? theme.colors.success : theme.colors.textSecondary}>
                      {answered ? 'Answer Completed ✓' : 'Practice Answer'}
                    </Typography>
                    <SvgIcon 
                      name={answered ? 'check-circle' : 'chevron-right'} 
                      size={16} 
                      color={answered ? theme.colors.success : theme.colors.textSecondary} 
                    />
                  </View>
                </PremiumCard>
              );
            })}
          </View>
        ) : (
          // Display editor for selected question
          <View>
            <TouchableOpacity onPress={() => setSelectedQuestion(null)} style={styles.backButton}>
              <SvgIcon name="useful-links" size={16} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              <Typography variant="body" style={{ fontWeight: '600' }}>Back to questions</Typography>
            </TouchableOpacity>

            <PremiumCard style={styles.promptCard} backgroundColor="#1e1b4b" borderColor="#312e81">
              <Typography variant="h3" style={styles.promptText}>
                {selectedQuestion.question}
              </Typography>
            </PremiumCard>

            <Typography variant="body" style={styles.starHelper}>
              STAR Template Helper:
              {'\n'}• <Typography variant="caption" style={{ fontWeight: '700' }} color={theme.colors.primaryLight}>Situation:</Typography> Context and challenge.
              {'\n'}• <Typography variant="caption" style={{ fontWeight: '700' }} color={theme.colors.primaryLight}>Task:</Typography> What needed to be done.
              {'\n'}• <Typography variant="caption" style={{ fontWeight: '700' }} color={theme.colors.primaryLight}>Action:</Typography> What you did specifically.
              {'\n'}• <Typography variant="caption" style={{ fontWeight: '700' }} color={theme.colors.primaryLight}>Result:</Typography> Concrete outcomes and metrics.
            </Typography>

            <TextInput
              placeholder="Situation: I was tasked to...\nTask: We had to...\nAction: I created a demo...\nResult: The dashboard speeds improved by 40%..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={10}
              value={answerInput}
              onChangeText={setAnswerInput}
              style={styles.editorInput}
            />

            <CustomButton
              title={isSaved ? 'Response Saved! ✓' : 'Save Response to SQLite'}
              variant={isSaved ? 'secondary' : 'primary'}
              onPress={handleSaveAnswer}
              style={styles.saveBtn}
            />
          </View>
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
  chipScroll: {
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
  scrollContainer: {
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  questionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  questionText: {
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  promptCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  starHelper: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  editorInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 22,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
});
export default BehavioralScreen;
