import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ScreenWrapper } from '../../shared/components/ScreenWrapper';
import { Typography } from '../../shared/components/Typography';
import { PremiumCard } from '../../components/PremiumCard';
import { SvgIcon } from '../../components/SvgIcons';
import { CustomButton } from '../../shared/components/CustomButton';
import { useDashboardStore } from '../../app/store/useDashboardStore';
import { theme } from '../../app/theme';

export const StudyPlanScreen = () => {
  const { studyPlans, addStudyPlan, togglePlanComplete, deleteStudyPlan, refreshAllData } = useDashboardStore();
  
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DSA');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleCreatePlan = async () => {
    if (!title.trim()) return;
    await addStudyPlan({
      title,
      start_date: startDate,
      end_date: endDate,
      priority,
      category,
    });
    // Reset Form
    setTitle('');
    setModalVisible(false);
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'High': return theme.colors.danger;
      case 'Medium': return theme.colors.primaryLight;
      default: return theme.colors.secondary;
    }
  };

  // Render Custom Calendar
  const renderCalendar = () => {
    const today = new Date();
    const daysInWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    // Generate simple week view (7 days) starting from today
    const weekDays = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      weekDays.push(d);
    }

    return (
      <View style={styles.calendarContainer}>
        <Typography variant="h3" style={styles.calendarTitle}>
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>

        <View style={styles.weekHeader}>
          {daysInWeek.map((day, i) => (
            <Typography key={i} variant="small" color={theme.colors.textSecondary} style={styles.weekDayHeader}>
              {day}
            </Typography>
          ))}
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today.toISOString().split('T')[0];
            const activePlans = studyPlans.filter(p => !p.is_completed && dateStr >= p.start_date && dateStr <= p.end_date);
            
            return (
              <View key={i} style={styles.dayCellWrapper}>
                <View style={[
                  styles.dayCell,
                  isToday && styles.dayCellToday
                ]}>
                  <Typography variant="body" color={isToday ? theme.colors.background : theme.colors.text} style={{ fontWeight: isToday ? '700' : '400' }}>
                    {day.getDate()}
                  </Typography>
                </View>
                {/* Visual Indicators for items planned today */}
                <View style={styles.dotsRow}>
                  {activePlans.slice(0, 3).map((plan) => (
                    <View key={plan.id} style={[styles.dot, { backgroundColor: getPriorityColor(plan.priority) }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <Typography variant="h3" style={styles.agendaTitle}>
          Planned Tasks For Today
        </Typography>

        {studyPlans.filter(p => {
          const todayStr = today.toISOString().split('T')[0];
          return todayStr >= p.start_date && todayStr <= p.end_date;
        }).map(plan => (
          <PremiumCard key={plan.id} style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(plan.priority)}20`, borderColor: getPriorityColor(plan.priority), borderWidth: 1 }]}>
                <Typography variant="small" color={getPriorityColor(plan.priority)} style={{ fontWeight: '600' }}>
                  {plan.priority} Priority
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {plan.category}
              </Typography>
            </View>
            <Typography variant="body" style={styles.planTitle}>
              {plan.title}
            </Typography>
          </PremiumCard>
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h1" color={theme.colors.primaryLight}>
          Study Planner
        </Typography>
        
        {/* Toggle Segment */}
        <View style={styles.toggleSegment}>
          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'timeline' && styles.segmentBtnActive]}
            onPress={() => setViewMode('timeline')}
          >
            <Typography variant="body" color={viewMode === 'timeline' ? theme.colors.background : theme.colors.textSecondary}>
              Timeline
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'calendar' && styles.segmentBtnActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Typography variant="body" color={viewMode === 'calendar' ? theme.colors.background : theme.colors.textSecondary}>
              Calendar
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {viewMode === 'timeline' ? (
          <View style={styles.timelineContainer}>
            {studyPlans.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Typography variant="body" color={theme.colors.textSecondary}>
                  No plans created yet. Start planning!
                </Typography>
              </View>
            ) : (
              studyPlans.map((plan) => (
                <PremiumCard key={plan.id} style={styles.planCard}>
                  <View style={styles.planCardHeader}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(plan.priority)}15` }]}>
                        <Typography variant="small" color={getPriorityColor(plan.priority)} style={{ fontWeight: '600' }}>
                          {plan.priority}
                        </Typography>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Typography variant="small" color={theme.colors.textSecondary}>
                          {plan.category}
                        </Typography>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => togglePlanComplete(plan.id, !plan.is_completed)}>
                        <SvgIcon
                          name="check-circle"
                          size={22}
                          color={plan.is_completed ? theme.colors.success : theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteStudyPlan(plan.id)} style={{ marginLeft: theme.spacing.sm }}>
                        <SvgIcon name="trash" size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Typography variant="body" style={[styles.planTitle, plan.is_completed && styles.titleCompleted]}>
                    {plan.title}
                  </Typography>

                  <Typography variant="caption" color={theme.colors.textSecondary} style={styles.planDates}>
                    Range: {plan.start_date} to {plan.end_date}
                  </Typography>
                </PremiumCard>
              ))
            )}
          </View>
        ) : (
          renderCalendar()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <SvgIcon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Plan Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <PremiumCard style={styles.modalContent}>
            <Typography variant="h2" style={styles.modalTitle}>
              Create Study Plan
            </Typography>

            <TextInput
              placeholder="Study Goal Title..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Typography variant="body" style={styles.label}>
              Category
            </Typography>
            <View style={styles.chipRow}>
              {['DSA', 'React Native', 'System Design', 'Behavioral', 'JS/TS'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Typography variant="small" color={category === cat ? theme.colors.text : theme.colors.textSecondary}>
                    {cat}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            <Typography variant="body" style={styles.label}>
              Priority
            </Typography>
            <View style={styles.chipRow}>
              {(['High', 'Medium', 'Low'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.chip,
                    priority === lvl && { backgroundColor: getPriorityColor(lvl) + '20', borderColor: getPriorityColor(lvl) }
                  ]}
                  onPress={() => setPriority(lvl)}
                >
                  <Typography variant="small" color={priority === lvl ? getPriorityColor(lvl) : theme.colors.textSecondary}>
                    {lvl}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" color={theme.colors.textSecondary}>Start Date</Typography>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Typography variant="caption" color={theme.colors.textSecondary}>End Date</Typography>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setModalVisible(false)}
              />
              <CustomButton
                title="Create"
                style={{ flex: 1, marginLeft: theme.spacing.md }}
                onPress={handleCreatePlan}
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
  toggleSegment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 4,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  timelineContainer: {
    paddingVertical: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  planCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  planDates: {
    marginTop: theme.spacing.xs,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    height: 36,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  calendarContainer: {
    paddingVertical: theme.spacing.md,
  },
  calendarTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  weekDayHeader: {
    width: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  dayCellWrapper: {
    alignItems: 'center',
    width: 40,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellToday: {
    backgroundColor: theme.colors.primaryLight,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  agendaTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
export default StudyPlanScreen;
