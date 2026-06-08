import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../../shared/components/ScreenWrapper';
import { Typography } from '../../../shared/components/Typography';
import { CustomButton } from '../../../shared/components/CustomButton';
import { useQuizStore } from '../../../app/store/useQuizStore';
import { TOPICS, DIFFICULTIES } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { theme } from '../../../app/theme';

type BrowseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainDrawer'>;

export const BrowseScreen = () => {
  const navigation = useNavigation<BrowseScreenNavigationProp>();
  const { activeTopic, activeDifficulty, setFilter, startQuiz } = useQuizStore();

  const handleStartQuiz = () => {
    startQuiz();
    navigation.navigate('Quiz');
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h1" color={theme.colors.primaryLight}>
            Prepare for Interview
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Select a topic and difficulty to begin your mock quiz.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Topic
          </Typography>
          <View style={styles.chipContainer}>
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.chip,
                  activeTopic === topic && styles.chipActive
                ]}
                onPress={() => setFilter(topic, activeDifficulty)}
              >
                <Typography 
                  variant="body" 
                  color={activeTopic === topic ? theme.colors.text : theme.colors.textSecondary}
                >
                  {topic}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Difficulty
          </Typography>
          <View style={styles.chipContainer}>
            {DIFFICULTIES.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.chip,
                  activeDifficulty === difficulty && styles.chipActive
                ]}
                onPress={() => setFilter(activeTopic, difficulty)}
              >
                <Typography 
                  variant="body" 
                  color={activeDifficulty === difficulty ? theme.colors.text : theme.colors.textSecondary}
                >
                  {difficulty}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Start Mock Quiz" 
            onPress={handleStartQuiz} 
          />
        </View>
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
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
  },
  footer: {
    marginTop: theme.spacing.xxl,
  },
});
