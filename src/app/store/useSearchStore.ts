import { create } from 'zustand';
import { useDashboardStore } from './useDashboardStore';
import { CodingQuestion, Roadmap, MockInterview } from '../../repositories';

interface SearchResult {
  questions: CodingQuestion[];
  roadmaps: Roadmap[];
  interviews: MockInterview[];
}

interface SearchState {
  searchQuery: string;
  searchResults: SearchResult;
  setSearchQuery: (query: string) => void;
  performSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  searchResults: {
    questions: [],
    roadmaps: [],
    interviews: [],
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().performSearch();
  },

  performSearch: () => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) {
      set({
        searchResults: {
          questions: [],
          roadmaps: [],
          interviews: [],
        }
      });
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const store = useDashboardStore.getState();

    // Filter questions
    const filteredQuestions = store.questions.filter(q => 
      q.title.toLowerCase().includes(query) ||
      q.solution.toLowerCase().includes(query) ||
      q.topic.toLowerCase().includes(query) ||
      q.company_tags.toLowerCase().includes(query) ||
      q.notes.toLowerCase().includes(query)
    );

    // Filter roadmaps
    const filteredRoadmaps = store.roadmaps.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );

    // Filter interviews
    const filteredInterviews = store.mockInterviews.filter(i => 
      i.title.toLowerCase().includes(query) ||
      i.feedback.toLowerCase().includes(query) ||
      i.status.toLowerCase().includes(query)
    );

    set({
      searchResults: {
        questions: filteredQuestions,
        roadmaps: filteredRoadmaps,
        interviews: filteredInterviews
      }
    });
  }
}));
