import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { PinCard } from '../components/PinCard';
import Masonry from 'react-masonry-css';
import { useSeo } from '../hooks/useSeo';

export const Profile = () => {
  const { username } = useParams();
  const { currentUser, pins, savedPinIds } = useAppStore();

  const isOwnProfile = currentUser?.username === username || currentUser?.id === username;
  
  // To keep it simple, if it's the current user, show their saved pins.
  // Otherwise, show pins authored by this user id.
  const displayPins = isOwnProfile 
    ? pins.filter(p => savedPinIds.includes(p.id))
    : pins.filter(p => p.authorId === username);

  const user = isOwnProfile ? currentUser : {
    id: username || "unknown",
    username: username || "unknown",
    name: "User " + username,
    avatar: "https://i.pravatar.cc/150?u=" + username,
    bio: "Passionate collector and creator.",
    followers: Math.floor(Math.random() * 1000),
    following: Math.floor(Math.random() * 500),
    role: "user"
  };

  const breakpointColumnsObj = {
    default: 5,
    1536: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 2,
    500: 2
  };

  useSeo({
    title: `${user?.name} (@${user?.username}) - Intrest Profile`,
    description: user?.bio || `View the profile, boards, and pins of ${user?.name} on Intrest.`
  });

  if (!user) return <div className="text-center py-20">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-white dark:border-slate-800">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">@{user.username}</p>
        <p className="text-center text-slate-700 dark:text-slate-300 max-w-md mb-6">{user.bio}</p>
        
        <div className="flex gap-6 mb-8 text-slate-900 dark:text-white">
          <div className="text-center">
            <span className="font-bold block">{user.followers}</span>
            <span className="text-sm text-slate-500">followers</span>
          </div>
          <div className="text-center">
            <span className="font-bold block">{user.following}</span>
            <span className="text-sm text-slate-500">following</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Profile link copied!");
            }}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full font-semibold transition-colors text-slate-900 dark:text-white"
          >
            Share
          </button>
          {isOwnProfile ? (
            <button 
              onClick={() => {
                const newBio = prompt("Enter new bio:", user.bio);
                if (newBio !== null) {
                  useAppStore.getState().updateProfile({ bio: newBio });
                }
                const newAvatar = prompt("Enter new profile image URL:", user.avatar);
                if (newAvatar !== null && newAvatar.trim() !== '') {
                  useAppStore.getState().updateProfile({ avatar: newAvatar });
                }
              }}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full font-semibold transition-colors text-slate-900 dark:text-white"
            >
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => {
                if (!useAppStore.getState().currentUser) return alert("Please login");
                useAppStore.getState().toggleFollowUser(user.id);
              }}
              className={"px-6 py-3 rounded-full font-semibold transition-colors " + (useAppStore.getState().followedUsers.includes(user.id) ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" : "bg-red-600 hover:bg-red-700 text-white")}
            >
              {useAppStore.getState().followedUsers.includes(user.id) ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-8 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button className="pb-4 font-semibold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white">
          {isOwnProfile ? "Saved Pins" : "Created Pins"}
        </button>
        <button className="pb-4 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          Boards
        </button>
      </div>

      {/* Pins Grid */}
      {displayPins.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          No pins found.
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {displayPins.map(pin => (
            <PinCard key={pin.id} pin={pin} />
          ))}
        </Masonry>
      )}

    </div>
  );
};