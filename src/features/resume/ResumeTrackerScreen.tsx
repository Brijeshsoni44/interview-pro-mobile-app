import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const ResumeTrackerScreen = () => {
  const { 
    applications, 
    addApplication, 
    updateApplicationStatus, 
    deleteApplication, 
    refreshAllData 
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<'applications' | 'resumes'>('applications');
  const [modalVisible, setModalVisible] = useState(false);

  // Form States
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Applied' | 'Interview Scheduled' | 'Rejected' | 'Offer Received'>('Applied');

  // Static Resume Versions
  const [resumes, setResumes] = useState([
    { id: '1', version: 'v1.4 - Lead Mobile Architect', description: 'Tailored for senior architecture roles, focusing on offline sync, engineering scale, and native bridging.', updated: '2026-06-05' },
    { id: '2', version: 'v1.2 - React Native Specialist', description: 'Focused heavily on performance tuning, Reanimated UI, and TypeScript SOLID principles.', updated: '2026-05-20' },
    { id: '3', version: 'v1.0 - Core Javascript/Frontend', description: 'General frontend resume covering SPA systems, CSS engines, and Webpack configuration.', updated: '2026-04-12' }
  ]);

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleAddApplication = async () => {
    if (!company.trim() || !role.trim()) return;
    
    await addApplication({
      company,
      role,
      status,
      applied_date: new Date().toISOString().split('T')[0],
      notes,
    });

    // Reset fields
    setCompany('');
    setRole('');
    setNotes('');
    setStatus('Applied');
    setModalVisible(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Offer Received': return theme.colors.success;
      case 'Interview Scheduled': return theme.colors.primaryLight;
      case 'Rejected': return theme.colors.danger;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Career & Resume
        </Typography>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'applications' && styles.tabBtnActive]}
            onPress={() => setActiveTab('applications')}
          >
            <Typography variant="body" color={activeTab === 'applications' ? theme.colors.background : theme.colors.textSecondary}>
              Applications
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'resumes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('resumes')}
          >
            <Typography variant="body" color={activeTab === 'resumes' ? theme.colors.background : theme.colors.textSecondary}>
              Resume Versions
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {activeTab === 'applications' ? (
          // Applications List
          <View style={styles.listContainer}>
            {applications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Typography variant="body" color={theme.colors.textSecondary}>
                  No interview applications tracked yet. Keep records above!
                </Typography>
              </View>
            ) : (
              applications.map((app) => (
                <PremiumCard key={app.id} style={styles.appCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.appTitleWrapper}>
                      <Typography variant="h3" style={styles.companyName}>
                        {app.company}
                      </Typography>
                      <Typography variant="body" color={theme.colors.textSecondary}>
                        {app.role}
                      </Typography>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => deleteApplication(app.id)}>
                        <SvgIcon name="trash" size={18} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    {/* Status badge toggler */}
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(app.status)}15`, borderColor: getStatusColor(app.status), borderWidth: 1 }]}>
                      <Typography variant="small" color={getStatusColor(app.status)} style={{ fontWeight: '600' }}>
                        {app.status}
                      </Typography>
                    </View>
                    
                    {/* Dropdown replacement - cycles status */}
                    <TouchableOpacity 
                      style={styles.cycleBtn}
                      onPress={() => {
                        const states: Array<typeof app.status> = ['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'];
                        const nextIdx = (states.indexOf(app.status) + 1) % states.length;
                        updateApplicationStatus(app.id, states[nextIdx]);
                      }}
                    >
                      <Typography variant="small" color={theme.colors.primaryLight}>Change Status</Typography>
                    </TouchableOpacity>
                  </View>

                  {app.notes ? (
                    <Typography variant="caption" color={theme.colors.textSecondary} style={styles.appNotes}>
                      Notes: {app.notes}
                    </Typography>
                  ) : null}

                  <Typography variant="small" color={theme.colors.textSecondary} style={styles.appDate}>
                    Applied: {app.applied_date}
                  </Typography>
                </PremiumCard>
              ))
            )}
          </View>
        ) : (
          // Resumes List
          <View style={styles.listContainer}>
            {resumes.map((res) => (
              <PremiumCard key={res.id} style={styles.appCard}>
                <View style={styles.cardHeader}>
                  <Typography variant="h3" style={styles.companyName}>
                    {res.version}
                  </Typography>
                  <SvgIcon name="notes" size={18} color={theme.colors.primaryLight} />
                </View>
                <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.xs, lineHeight: 20 }}>
                  {res.description}
                </Typography>
                <Typography variant="small" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>
                  Last modified: {res.updated}
                </Typography>
              </PremiumCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Floating Action Button for applications */}
      {activeTab === 'applications' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <SvgIcon name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Add Application Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <PremiumCard style={styles.modalContent}>
            <Typography variant="h2" style={styles.modalTitle}>
              Track New Job
            </Typography>

            <TextInput
              placeholder="Company Name..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
              value={company}
              onChangeText={setCompany}
            />

            <TextInput
              placeholder="Role Title..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
              value={role}
              onChangeText={setRole}
            />

            <Typography variant="body" style={styles.label}>
              Initial Status
            </Typography>
            <View style={styles.chipRow}>
              {(['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, status === s && styles.chipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Typography variant="small" color={status === s ? theme.colors.text : theme.colors.textSecondary}>
                    {s}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Resume notes, links, or context..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setModalVisible(false)}
              />
              <CustomButton
                title="Add Application"
                style={{ flex: 1, marginLeft: theme.spacing.md }}
                onPress={handleAddApplication}
              />
            </View>
          </PremiumCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 4,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  listContainer: {
    paddingVertical: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  appCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  appTitleWrapper: {
    flex: 1,
  },
  companyName: {
    fontWeight: '800',
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  cycleBtn: {
    padding: 4,
  },
  appNotes: {
    marginTop: theme.spacing.sm,
    lineHeight: 16,
  },
  appDate: {
    marginTop: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    padding: theme.spacing.md,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});
export default ResumeTrackerScreen;
