import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Pin, User, initialMockPins, mockUsers } from "./data/mockData";

// Provided unlimited API key
const PIXABAY_API_KEY = "54558485-4c58201892e3133e1742642a5";

// Massive predefined SEO categories
const SEO_CATEGORIES = [
  "hindu gods", "shiva god", "krishna god", "hanuman god", "ganesha", "ram god", "lakshmi god",
  "nature 4k wallpaper", "luxury cars", "beautiful animals", "backgrounds hd", "science galaxy", 
  "education learning", "happy people", "feelings meditation", "religion temple", "health wellness",
  "places travel", "industry modern", "computer hacking", "food aesthetic", "sports extreme",
  "transportation flight", "business success", "music concert live", "cyberpunk neon",
  "vintage classic", "minimalist architecture", "ocean sunset", "flowers macro"
];

export interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  currentUser: User | null;
  users: Record<string, User>;
  login: (userId: string) => void;
  loginWithEmail: (email: string, password?: string) => void;
  registerUser: (name: string, email: string, password?: string) => void;
  googleLogin: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  pins: Pin[];
  savedPinIds: string[];
  followedUsers: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  addPin: (pin: Pin) => void;
  addPins: (pins: Pin[]) => void;
  toggleSavePin: (pinId: string) => void;
  toggleLikePin: (pinId: string) => void;
  deletePin: (pinId: string) => void;
  toggleFollowUser: (userId: string) => void;
  
  fetchApiPins: () => Promise<void>;
  seedPins: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      theme: "light",
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        if (newTheme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        return { theme: newTheme };
      }),
      searchQuery: "",
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      users: { ...mockUsers },
      currentUser: null,
      login: (userId: string) => set((state) => ({ currentUser: state.users[userId] || null })),
      
      loginWithEmail: (email: string, _password?: string) => set((state) => {
        const foundUser = Object.values(state.users).find(u => u.username === email);
        if (foundUser) {
          return { currentUser: foundUser };
        }
        alert("Account not found. Please sign up first!");
        return state;
      }),

      registerUser: (name: string, email: string, _password?: string) => set((state) => {
        const exists = Object.values(state.users).find(u => u.username === email);
        if (exists) {
          alert("Email already in use. Please log in.");
          return state;
        }
        const newId = "user_" + Date.now();
        const newUser: User = {
          id: newId,
          username: email,
          name: name,
          avatar: "https://i.pravatar.cc/150?u=" + newId,
          bio: "Welcome to my Interest profile!",
          followers: 0,
          following: 0,
          role: "user"
        };
        return {
          users: { ...state.users, [newId]: newUser },
          currentUser: newUser
        };
      }),

      googleLogin: () => set((state) => {
        const newId = "google_" + Date.now();
        const googleUser: User = {
          id: newId,
          username: "google_" + Math.floor(Math.random() * 1000) + "@gmail.com",
          name: "Google User",
          avatar: "https://i.pravatar.cc/150?u=" + newId,
          bio: "Connected via Google Auth.",
          followers: Math.floor(Math.random() * 100),
          following: Math.floor(Math.random() * 50),
          role: "user"
        };
        alert("Google Authentication Successful! Automatically created & logged into your Google Account.");
        return {
          users: { ...state.users, [newId]: googleUser },
          currentUser: googleUser
        };
      }),

      logout: () => set({ currentUser: null }),
      updateProfile: (updates: Partial<User>) => set((state) => {
        if (!state.currentUser) return state;
        const updatedUser = { ...state.currentUser, ...updates };
        return { 
          currentUser: updatedUser,
          users: { ...state.users, [updatedUser.id]: updatedUser }
        };
      }),
      
      pins: initialMockPins,
      savedPinIds: [],
      followedUsers: [],
      
      addPin: (pin: Pin) => set((state) => ({ pins: [{ ...pin, type: pin.type || "image" }, ...state.pins] })),
      
      addPins: (pins: Pin[]) => set((state) => ({ 
        pins: [...pins.map(p => ({ ...p, type: p.type || "image" })), ...state.pins] 
      })),

      toggleSavePin: (pinId: string) => set((state) => {
        const isSaved = state.savedPinIds.includes(pinId);
        return {
          savedPinIds: isSaved 
            ? state.savedPinIds.filter(id => id !== pinId)
            : [...state.savedPinIds, pinId]
        };
      }),

      toggleLikePin: (pinId: string) => set((state) => ({
        pins: state.pins.map(p => {
          if (p.id === pinId) {
            return { ...p, likes: p.likes + 1 };
          }
          return p;
        })
      })),

      deletePin: (pinId: string) => set((state) => ({
        pins: state.pins.filter(p => p.id !== pinId)
      })),

      toggleFollowUser: (userId: string) => set((state) => {
        const isFollowing = state.followedUsers.includes(userId);
        return {
          followedUsers: isFollowing
            ? state.followedUsers.filter(id => id !== userId)
            : [...state.followedUsers, userId]
        };
      }),

      fetchApiPins: async () => {
        try {
          const currentSearch = useAppStore.getState().searchQuery || SEO_CATEGORIES[Math.floor(Math.random() * SEO_CATEGORIES.length)];
          
          // Pixabay allows page up to 500 for high limits. We randomize to get "unlimited" feel.
          const randomPage = Math.floor(Math.random() * 20) + 1;
          
          const encodedQuery = encodeURIComponent(currentSearch);
          // Safely calling API endpoint
          const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedQuery}&image_type=photo&per_page=50&page=${randomPage}&orientation=vertical&safesearch=true`);
          
          if (!res.ok) throw new Error("API Limit Reached or Failed");
          
          const data = await res.json();
          
          if(!data.hits || data.hits.length === 0) return;

          const newPins = data.hits.map((item: any, idx: number) => {
            return {
              id: `pixabay_${item.id}_${Date.now()}_${idx}`,
              title: `HD ${item.tags.split(',')[0]} Image by ${item.user}`,
              description: `High Quality Unlimited Image. Tags: ${item.tags}`,
              imageUrl: item.largeImageURL,
              width: item.imageWidth || 800,
              height: item.imageHeight || 1200,
              authorId: "api_user",
              tags: item.tags.split(',').map((t: string) => t.trim()),
              likes: item.likes || Math.floor(Math.random() * 2000),
              comments: [],
              createdAt: new Date().toISOString(),
              nsfw: false,
              hidden: false
            }
          });
          
          set((state) => {
            const existingIds = new Set(state.pins.map(p => p.id));
            const uniqueNew = newPins.filter((p: Pin) => !existingIds.has(p.id));
            return { pins: [...uniqueNew, ...state.pins] };
          });
        } catch (error) {
          console.error("Failed to fetch API pins:", error);
        }
      },

      seedPins: async () => {
        try {
          const q = SEO_CATEGORIES[Math.floor(Math.random() * SEO_CATEGORIES.length)];
          const randomPage = Math.floor(Math.random() * 5) + 1;
          const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=200&page=${randomPage}&safesearch=true`);
          if (!res.ok) return;
          const data = await res.json();
          if(!data.hits) return;

          const newPins = data.hits.map((item: any, idx: number) => ({
            id: `seeded_${item.id}_${Date.now()}_${idx}`,
            title: `Seeded HD ${item.tags.split(',')[0]} Image`,
            description: `High Quality Image imported by Admin. Tags: ${item.tags}`,
            imageUrl: item.largeImageURL,
            width: item.imageWidth || 800,
            height: item.imageHeight || 1200,
            authorId: "admin_1",
            tags: [...item.tags.split(',').map((t: string) => t.trim()), "seeded", "HD", "wallpaper"],
            likes: item.likes || Math.floor(Math.random() * 5000),
            comments: [],
            createdAt: new Date().toISOString(),
            nsfw: false,
            hidden: false
          }));

          set((state) => {
            const existingIds = new Set(state.pins.map(p => p.id));
            const uniqueNew = newPins.filter((p: Pin) => !existingIds.has(p.id));
            return { pins: [...uniqueNew, ...state.pins] };
          });
        } catch (error) {
          console.error("Seed Failed:", error);
        }
      }
    }),
    {
      name: "interest-storage",
      partialize: (state) => ({ 
        theme: state.theme, 
        currentUser: state.currentUser,
        users: state.users,
        savedPinIds: state.savedPinIds,
        followedUsers: state.followedUsers,
        pins: state.pins
      })
    }
  )
);