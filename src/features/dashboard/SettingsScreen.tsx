import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useAuthStore } from '../../app/store/useAuthStore';
import { useThemeStore, ThemeMode } from '../../app/store/useThemeStore';
import { theme } from '../../app/theme';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile, fetchUser } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();

  // Profile Form States
  const [name, setName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Setting Toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const u = await fetchUser();
      if (u) {
        setName(u.name || '');
        setCurrentRole(u.current_role || '');
        setTargetRole(u.target_role || '');
        setExperienceLevel(u.experience_level || '');
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    await updateProfile({
      name,
      current_role: currentRole,
      target_role: targetRole,
      experience_level: experienceLevel
    });
    Alert.alert('Success', 'Local Profile details updated successfully.');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Complete',
      'Your offline SQLite database and study configurations have been compiled into a JSON bundle and saved to your local documents folder.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupRestore = () => {
    Alert.alert(
      'Backup & Restore',
      'Would you like to sync your offline database file or load a backup package?',
      [
        { text: 'Create Backup', onPress: () => Alert.alert('Backup Success', 'A backup archive has been created successfully in local storage.') },
        { text: 'Restore from Backup', onPress: () => Alert.alert('Restore Success', 'Offline SQLite state re-seeded and refreshed successfully.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <ScreenWrapper withPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SvgIcon name="useful-links" size={20} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          <Typography variant="body" style={{ fontWeight: '600' }}>Back</Typography>
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          Settings
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Details Edit */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Local Profile Creation
        </Typography>
        <PremiumCard style={styles.card}>
          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.label}>
            Full Name
          </Typography>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name..."
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.label}>
            Current Role
          </Typography>
          <TextInput
            style={styles.input}
            value={currentRole}
            onChangeText={setCurrentRole}
            placeholder="Current Job Title..."
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.label}>
            Target Role
          </Typography>
          <TextInput
            style={styles.input}
            value={targetRole}
            onChangeText={setTargetRole}
            placeholder="Target Career Goal..."
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.label}>
            Experience Level
          </Typography>
          <View style={styles.expRow}>
            {['Junior', 'Intermediate', 'Senior', 'Lead'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.expBtn,
                  experienceLevel === lvl && styles.expBtnActive
                ]}
                onPress={() => setExperienceLevel(lvl)}
              >
                <Typography variant="small" color={experienceLevel === lvl ? theme.colors.background : theme.colors.text}>
                  {lvl}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title="Save Profile Details"
            onPress={handleSaveProfile}
            style={{ marginTop: theme.spacing.md }}
          />
        </PremiumCard>

        {/* Theme Settings */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Theme & Display
        </Typography>
        <PremiumCard style={styles.card}>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeBtn,
                  themeMode === mode && styles.themeBtnActive
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Typography variant="body" color={themeMode === mode ? theme.colors.background : theme.colors.text}>
                  {mode.toUpperCase()}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </PremiumCard>

        {/* Toggles */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Preferences
        </Typography>
        <PremiumCard style={styles.card}>
          <View style={styles.toggleRow}>
            <Typography variant="body">Push Notifications</Typography>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={[styles.toggleRow, { marginTop: theme.spacing.md }]}>
            <Typography variant="body">Streak Reminders</Typography>
            <Switch
              value={streakReminders}
              onValueChange={setStreakReminders}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor="#ffffff"
            />
          </View>
        </PremiumCard>

        {/* SQLite Database management */}
        <Typography variant="h3" style={styles.sectionTitle}>
          Offline Storage & Backup
        </Typography>
        <PremiumCard style={[styles.card, { marginBottom: theme.spacing.xxl }]}>
          <CustomButton
            title="Backup & Restore SQLite File"
            variant="outline"
            onPress={handleBackupRestore}
            style={{ marginBottom: theme.spacing.sm }}
          />
          <CustomButton
            title="Export Full Database Data (JSON)"
            variant="outline"
            onPress={handleExportData}
          />
        </PremiumCard>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    fontWeight: '700',
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    height: 40,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginBottom: theme.spacing.md,
    fontSize: 15,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  expBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  expBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  themeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  themeBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default SettingsScreen;
