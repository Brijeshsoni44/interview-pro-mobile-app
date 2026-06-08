import { create } from 'zustand';
import { User, UserRepository } from '../../repositories';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<User | null>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await UserRepository.getUser();
      set({ user, isLoading: false });
      return user;
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch user', isLoading: false });
      return null;
    }
  },

  updateProfile: async (profile) => {
    const { user } = get();
    if (!user) return;
    try {
      const updatedUser = { ...user, ...profile };
      await UserRepository.updateUser(profile);
      set({ user: updatedUser });
    } catch (e: any) {
      set({ error: e.message || 'Failed to update profile' });
    }
  },

  checkAndUpdateStreak: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastActive = user.last_active_date;

      if (!lastActive) {
        // First time active
        await UserRepository.updateStreak(1, todayStr);
        set({ user: { ...user, streak: 1, last_active_date: todayStr } });
        return;
      }

      if (lastActive === todayStr) {
        // Already active today, streak remains same
        return;
      }

      const lastActiveDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = user.streak;
      if (diffDays === 1) {
        // Logged in consecutive day, increment streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day, reset streak to 1
        newStreak = 1;
      }

      await UserRepository.updateStreak(newStreak, todayStr);
      set({ user: { ...user, streak: newStreak, last_active_date: todayStr } });
    } catch (e: any) {
      console.warn('Failed to update streak:', e);
    }
  }
}));
