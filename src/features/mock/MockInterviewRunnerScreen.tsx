import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const MockInterviewRunnerScreen = () => {
  const navigation = useNavigation();
  const { addMockInterview, questions } = useDashboardStore();

  // Timer States
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  // Active Questions State
  const [activeQuestion, setActiveQuestion] = useState('');
  
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [selfScore, setSelfScore] = useState(80); // Default score out of 100
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Start stopwatch timer
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    // Pick a random question from practice database to interview on
    if (questions.length > 0) {
      const idx = Math.floor(Math.random() * questions.length);
      setActiveQuestion(questions[idx].title);
    } else {
      setActiveQuestion('Explain prototype inheritance and the JS Event Loop in detail.');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleFinishInterview = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const durationMins = Math.max(Math.round(secondsElapsed / 60), 1);
    
    await addMockInterview({
      title: `Practice Session: ${activeQuestion.slice(0, 40)}...`,
      date: new Date().toISOString(),
      duration: durationMins,
      score: selfScore,
      feedback: `Response: ${answerText}\nSelf notes: ${feedback}`,
      status: 'Completed'
    });

    navigation.goBack();
  };

  return (
    <ScreenWrapper withPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Typography variant="body" color={theme.colors.textSecondary}>Exit</Typography>
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          Active Mock Interview
        </Typography>
        <View style={styles.timerContainer}>
          <Typography variant="body" color={theme.colors.danger} style={{ fontWeight: '700' }}>
            {formatTime(secondsElapsed)}
          </Typography>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Prompt Card */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Question Prompt
        </Typography>
        <PremiumCard style={styles.promptCard} backgroundColor="#1e1b4b" borderColor="#312e81">
          <Typography variant="h3" style={styles.promptText}>
            {activeQuestion}
          </Typography>
        </PremiumCard>

        {/* Answer Simulation Area */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Your Response
        </Typography>
        
        {/* simulated recording panel */}
        <PremiumCard style={styles.recordCard}>
          <View style={styles.recordRow}>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={handleToggleRecord}
            >
              <View style={[styles.innerRecordBtn, isRecording && styles.innerRecordBtnActive]} />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {isRecording ? 'Recording Answer... (Pulsing)' : 'Click to record microphone'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Simulate voice answer recording or type below.
              </Typography>
            </View>
          </View>
          
          {isRecording && <View style={styles.pulseBar} />}

          <TextInput
            placeholder="Type your outline, pseudocode, or full response here..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={5}
            value={answerText}
            onChangeText={setAnswerText}
            style={styles.answerInput}
          />
        </PremiumCard>

        {/* Self Rating */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Self Assessment
        </Typography>
        <PremiumCard style={styles.ratingCard}>
          <View style={styles.scoreRow}>
            <Typography variant="body">Self Rating Score:</Typography>
            <Typography variant="h2" color={theme.colors.primaryLight} style={{ fontWeight: '800' }}>
              {selfScore}%
            </Typography>
          </View>

          {/* Simple Slider UI using buttons */}
          <View style={styles.sliderButtons}>
            {[40, 60, 80, 95].map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.scoreBtn,
                  selfScore === score && styles.scoreBtnActive
                ]}
                onPress={() => setSelfScore(score)}
              >
                <Typography variant="small" color={selfScore === score ? theme.colors.background : theme.colors.text}>
                  {score}% {score >= 80 ? 'Ace' : score >= 60 ? 'Okay' : 'Review'}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Technical gap notes (e.g. forgot call stack order...)"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
          />
        </PremiumCard>

        <CustomButton
          title="Submit & End Session"
          onPress={handleFinishInterview}
          style={styles.finishBtn}
        />
      </ScrollView>
    </ScreenWrapper>
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
  closeBtn: {
    paddingVertical: theme.spacing.xs,
  },
  headerTitle: {
    fontWeight: '700',
  },
  timerContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  promptCard: {
    padding: theme.spacing.lg,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  recordCard: {
    padding: theme.spacing.md,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  recordButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  innerRecordBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.danger,
  },
  innerRecordBtnActive: {
    borderRadius: 3,
  },
  pulseBar: {
    height: 3,
    backgroundColor: theme.colors.danger,
    borderRadius: 1.5,
    marginBottom: theme.spacing.md,
    width: '100%',
    opacity: 0.8,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    padding: theme.spacing.md,
    height: 140,
    textAlignVertical: 'top',
    fontSize: 15,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  ratingCard: {
    padding: theme.spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  scoreBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  scoreBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  finishBtn: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});
export default MockInterviewRunnerScreen;
