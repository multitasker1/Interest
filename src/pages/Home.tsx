import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { useAppStore } from '../store';
import { PinCard } from '../components/PinCard';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { Loader2 } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

export const Home = () => {
  const { pins, fetchApiPins, searchQuery } = useAppStore();
  useSeo({
    title: searchQuery ? `Search results for ${searchQuery}` : "Explore Amazing HD Wallpapers & Hindu Gods",
    description: "Discover and download unlimited high-quality images, aesthetic pins, Hindu Gods wallpapers, and daily inspiration for free on Interest.",
    keywords: "HD wallpapers, Hindu Gods, Shiva, Krishna, nature photography, unlimited image download, Adsterra monetization, free images"
  });
  const [displayedPins, setDisplayedPins] = useState(pins.slice(0, 20));
  const [isLoading, setIsLoading] = useState(false);

  // Breakpoints for masonry columns
  const breakpointColumnsObj = {
    default: 5,
    1536: 4, // 2xl
    1280: 4, // xl
    1024: 3, // lg
    768: 2,  // md
    640: 2,  // sm
    500: 2
  };

  // Filter pins based on search query
  const filteredPins = searchQuery 
    ? pins.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pins;

  // Mock infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 500
      ) {
        if (!isLoading && displayedPins.length < filteredPins.length) {
          setIsLoading(true);
          setTimeout(() => {
            const currentLen = displayedPins.length;
            setDisplayedPins(filteredPins.slice(0, currentLen + 20));
            setIsLoading(false);
          }, 800);
        } else if (!isLoading && displayedPins.length === filteredPins.length && !searchQuery) {
          // Fetch real API images when we run out of locally generated mock data
          setIsLoading(true);
          fetchApiPins().then(() => {
            setIsLoading(false);
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedPins, isLoading, filteredPins, fetchApiPins, searchQuery]);

  // Update displayed when global pins change (e.g. seeding) or search changes
  useEffect(() => {
    // If the search query changed and we don't have enough local results, try fetching from Pixabay automatically
    if (searchQuery && filteredPins.length < 10 && !isLoading) {
      setIsLoading(true);
      fetchApiPins().then(() => setIsLoading(false));
    }
    setDisplayedPins(filteredPins.slice(0, Math.max(20, displayedPins.length)));
  }, [filteredPins.length, searchQuery]); // re-run when pins or search changes

  // Inject ads every 10th item
  const renderItems = () => {
    const items = [];
    for (let i = 0; i < displayedPins.length; i++) {
      if (i > 0 && i % 12 === 0) {
        items.push(
          <div key={"ad_" + i} className="mb-4">
             <AdPlaceholder height="h-[300px]" type="banner" />
          </div>
        );
      }
      items.push(<PinCard key={displayedPins[i].id} pin={displayedPins[i]} />);
    }
    return items;
  };

  return (
    <div className="max-w-[1600px] mx-auto pt-6 px-4 sm:px-6 lg:px-8">
      {/* SEO Categories Bar */}
      <div className="w-full overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <div className="flex gap-2 min-w-max px-2">
          {["Hindu Gods", "Shiva", "Krishna 4K", "Hanuman", "Nature Wallpaper", "Luxury Cars", "Cyberpunk", "Space", "Anime Backgrounds", "Quotes", "Aesthetic Dark", "Minimalist"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                useAppStore.getState().setSearchQuery(cat);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm
                ${searchQuery.toLowerCase() === cat.toLowerCase() 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Home Feed Banner Ad */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <AdPlaceholder height="h-[90px]" type="banner" />
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {renderItems()}
      </Masonry>

      {isLoading && (
        <div className="w-full flex justify-center py-8">
          <Loader2 className="animate-spin text-red-500" size={32} />
        </div>
      )}
    </div>
  );
};
