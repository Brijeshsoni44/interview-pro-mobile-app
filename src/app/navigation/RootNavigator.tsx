import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { DrawerNavigator } from './DrawerNavigator';
import { QuizScreen } from '../../features/questions/screens/QuizScreen';
import { ResultScreen } from '../../features/questions/screens/ResultScreen';
import { RoadmapDetailScreen } from '../../features/roadmap/RoadmapDetailScreen';
import { QuestionDetailScreen } from '../../features/practice/QuestionDetailScreen';
import { MockInterviewRunnerScreen } from '../../features/mock/MockInterviewRunnerScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // Handle headers locally inside screens for premium custom visuals
      }}
    >
      <Stack.Screen 
        name="MainDrawer" 
        component={DrawerNavigator} 
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen} 
        options={{ headerShown: true, title: 'Active Quiz' }} 
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{ 
          headerShown: true,
          title: 'Quiz Result',
          headerBackVisible: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen
        name="RoadmapDetail"
        component={RoadmapDetailScreen}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
      />
      <Stack.Screen
        name="MockInterviewRunner"
        component={MockInterviewRunnerScreen}
      />
    </Stack.Navigator>
  );
};
export default RootNavigator;
