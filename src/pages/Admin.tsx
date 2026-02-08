import { useState } from 'react';
import { useAppStore } from '../store';
import { Activity, Database, Server, Trash2, Edit2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const Admin = () => {
  const { currentUser, pins, seedPins, deletePin } = useAppStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'users' | 'sql'>('images');

  // Require admin
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedPins(); 
      alert("Successfully imported 200+ API images directly to your Database!");
    } catch (e) {
      alert("Failed to run seed script.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 font-mono">
      
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-slate-800 text-white p-6 rounded-t-xl border-b-4 border-amber-500">
        <div className="flex items-center gap-4">
          <Server size={32} className="text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">InterestMyAdmin Control Panel</h1>
            <p className="text-slate-300 text-sm">Server: Localhost via Blogger SPA • Database: LocalStorageDB</p>
          </div>
        </div>
        
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2 rounded font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
        >
          {isSeeding ? <Activity className="animate-spin" size={18} /> : <Database size={18} />}
          {isSeeding ? "Executing query..." : "Run Infinite API Script (Import Images)"}
        </button>
      </div>

      {/* Tabs like phpMyAdmin */}
      <div className="flex gap-1 mb-6 border-b border-slate-300 dark:border-slate-700 pb-px">
        <button onClick={() => setActiveTab('images')} className={`px-4 py-2 text-sm font-bold rounded-t-md ${activeTab === 'images' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          Browse `interest_images`
        </button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-bold rounded-t-md ${activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          Browse `interest_users`
        </button>
        <button onClick={() => setActiveTab('sql')} className={`px-4 py-2 text-sm font-bold rounded-t-md ${activeTab === 'sql' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          SQL Command
        </button>
      </div>

      {activeTab === 'images' && (
        <div className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 font-sans text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span>Showing rows 0 - {Math.min(pins.length, 50)} (~{pins.length} total, Query took 0.0004 sec)</span>
            <span className="font-mono text-xs">SELECT * FROM `interest_images` ORDER BY id DESC</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold w-24">Action</th>
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold">id</th>
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold">title</th>
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold">authorId</th>
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold">tags</th>
                  <th className="px-4 py-2 border-r border-slate-300 dark:border-slate-600 font-semibold">imageUrl</th>
                </tr>
              </thead>
              <tbody>
                {pins.slice(0, 50).map((pin, index) => (
                  <tr key={pin.id} className={index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-900 hover:bg-yellow-50 dark:hover:bg-slate-800 transition-colors'}>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => deletePin(pin.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 size={16} /></button>
                    </td>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-xs">{pin.id.substring(0, 8)}...</td>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white truncate max-w-[150px]">{pin.title}</td>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">{pin.authorId}</td>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 max-w-[150px] truncate">{pin.tags.join(', ')}</td>
                    <td className="px-4 py-2 border-r border-b border-slate-200 dark:border-slate-700 text-blue-500 hover:underline cursor-pointer"><a href={pin.imageUrl} target="_blank" rel="noreferrer">Open Blob</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 font-sans text-sm p-10 text-center">
           <h2 className="text-xl font-bold mb-4">Users Table</h2>
           <p className="text-slate-500">SELECT * FROM `interest_users` limit 1000;</p>
           <p className="mt-4 text-emerald-600">Admin Account Connected (Total Users Mocked: ~2.5k, Active Logged In: 1)</p>
           <div className="flex justify-center gap-4 mt-8">
             <div className="px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded shadow">User: admin_master (Active)</div>
             <div className="px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded shadow">User: john_doe (Active)</div>
           </div>
        </div>
      )}

      {activeTab === 'sql' && (
        <div className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 font-sans p-6 text-sm">
           <h2 className="font-bold mb-2">Run SQL query/queries on database <span className="text-amber-600">interest_db</span>:</h2>
           <textarea 
             className="w-full h-40 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-4 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
             defaultValue="SELECT * FROM `interest_images` WHERE category='Hindu Gods' ORDER BY likes DESC LIMIT 100;"
           />
           <button className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-900 transition-colors shadow">Go</button>
        </div>
      )}

    </div>
  );
};