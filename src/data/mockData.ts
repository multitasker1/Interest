export interface User {
  id: string;
  username: string;
  avatar: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  role: "user" | "admin";
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type?: "image" | "video";
  videoUrl?: string;
  width: number;
  height: number;
  authorId: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  nsfw: boolean;
  hidden: boolean;
}

export const CATEGORIES = [
  "Hindu Gods", "Lord Shiva", "Lord Krishna", "Shri Ram", "Hanuman Ji", "Ganesha",
  "Goddess Lakshmi", "Saraswati", "Durga Mata", "Nature 4K", "Tech Hacks", "Art HD",
  "Architecture", "Street Food", "Fashion Trends", "Travel World", "Anime 4K",
  "Super Cars", "Inspirational Quotes", "Fitness Motivation", "Decor Ideas",
  "Gaming Setup", "Music Legends", "Photography Tips", "Love Feelings", "Meditation"
];

export const mockUsers: Record<string, User> = {
  "user_1": {
    id: "user_1",
    username: "john_doe",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=user_1",
    bio: "Photography enthusiast.",
    followers: 120,
    following: 45,
    role: "user",
  },
  "admin_1": {
    id: "admin_1",
    username: "admin_master",
    name: "Admin User",
    avatar: "https://i.pravatar.cc/150?u=admin_1",
    bio: "Platform Administrator",
    followers: 99999,
    following: 1,
    role: "admin",
  },
};

export const generateMockPins = (): Pin[] => {
  const pins: Pin[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const isPortrait = Math.random() > 0.4;
    const width = 800;
    const height = isPortrait ? Math.floor(Math.random() * (1200 - 900) + 900) : Math.floor(Math.random() * (700 - 500) + 500);
    
    // Mix Hindu Gods with random Picsum
    const isGod = i % 3 === 0;
    const imageUrl = isGod 
       ? `https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=${width}&h=${height}&random=${i}`
       : `https://picsum.photos/seed/${i + 100}/${width}/${height}`;
    
    const cat1 = isGod ? CATEGORIES[Math.floor(Math.random() * 6)] : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const cat2 = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    pins.push({
      id: "pin_" + i,
      title: (isGod ? "Divine " : "Inspiring ") + cat1 + " " + i,
      description: "A beautiful high quality HD wallpaper of " + cat1,
      imageUrl,
      width,
      height,
      authorId: i % 10 === 0 ? "admin_1" : "user_1",
      tags: [...new Set([cat1, cat2, "HD", "Wallpaper"])],
      likes: Math.floor(Math.random() * 5000),
      comments: [
        {
          id: "c_" + i + "_1",
          userId: "user_1",
          text: "Love this so much!",
          createdAt: new Date(Date.now() - 10000000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      nsfw: false,
      hidden: false
    });
  }
  return pins;
};

export const initialMockPins = generateMockPins();