import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { CustomSidebarContent } from './CustomSidebarContent';
import { RoadmapScreen } from '../../features/roadmap/RoadmapScreen';
import { StudyPlanScreen } from '../../features/planner/StudyPlanScreen';
import { CodingPracticeScreen } from '../../features/practice/CodingPracticeScreen';
import { MockInterviewScreen } from '../../features/mock/MockInterviewScreen';
import { BehavioralScreen } from '../../features/behavioral/BehavioralScreen';
import { ResumeTrackerScreen } from '../../features/resume/ResumeTrackerScreen';
import { AnalyticsScreen } from '../../features/analytics/AnalyticsScreen';
import { SettingsScreen } from '../../features/dashboard/SettingsScreen';
import { BrowseScreen } from '../../features/questions/screens/BrowseScreen'; // existing Quiz starter
import { theme } from '../theme';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
          backgroundColor: theme.colors.background,
        },
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Roadmap" component={RoadmapScreen} />
      <Drawer.Screen name="StudyPlan" component={StudyPlanScreen} />
      <Drawer.Screen name="Progress" component={AnalyticsScreen} />
      <Drawer.Screen name="Bookmarks" component={CodingPracticeScreen} />
      <Drawer.Screen name="History" component={MockInterviewScreen} />
      <Drawer.Screen name="CodingPractice" component={CodingPracticeScreen} />
      <Drawer.Screen name="MockInterviews" component={MockInterviewScreen} />
      <Drawer.Screen name="Quizzes" component={BrowseScreen} />
      
      {/* Fallbacks or Shared Feature Screens mapping sidebar items */}
      <Drawer.Screen name="TopInterviewQuestions" component={CodingPracticeScreen} />
      <Drawer.Screen name="Notes" component={CodingPracticeScreen} />
      <Drawer.Screen name="VideoTutorials" component={CodingPracticeScreen} />
      <Drawer.Screen name="Courses" component={CodingPracticeScreen} />
      <Drawer.Screen name="UsefulLinks" component={CodingPracticeScreen} />
      
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="HelpSupport" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};
export default DrawerNavigator;
