import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  Home, 
  Book, 
  Edit3, 
  Globe, 
  ChevronLeft, 
  Save, 
  Share2, 
  Sparkles, 
  Loader2, 
  Trash2,
  Heart,
  Eye,
  Menu,
  LogOut,
  User as UserIcon,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Document, ViewState, EditorState, ReaderState } from './types';
import * as storage from './services/storage';
import * as gemini from './services/gemini';

// --- Globals ---
declare const google: any;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

// --- Components ---

interface ButtonProps { 
  children?: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; 
  className?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon
}) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-subtle hover:shadow-float transition-all duration-300 cursor-pointer ${className}`}
  >
    {children}
  </div>
);

const BrowserChrome: React.FC<{ user: any }> = ({ user }) => {
  const isGuest = !user || user.email === 'guest@example.com';
  const url = isGuest ? 'my-web.com' : 'm.my-web.com';

  return (
    <div className="sticky top-0 z-[60] bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-center py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="w-full max-w-md bg-gray-100/50 hover:bg-gray-100 transition-colors rounded-xl px-4 py-2 flex items-center justify-center gap-2 group cursor-default">
         <Lock size={12} className="text-gray-400 group-hover:text-green-600 transition-colors" />
         <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors tracking-tight selection:bg-transparent">{url}</span>
      </div>
    </div>
  );
};

// --- Login View ---

interface LoginViewProps {
  onLogin: (user: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const tokenClient = useRef<any>(null);

  const initClient = () => {
     if (typeof google === 'undefined') return;
     
     try {
       tokenClient.current = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid profile email",
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
             try {
               const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                 headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
               });
               const userData = await userInfoResponse.json();
               localStorage.setItem('prozess_user', JSON.stringify(userData));
               onLogin(userData);
             } catch (error) {
               console.error("Failed to fetch user profile", error);
               alert("Failed to retrieve user information.");
             }
          }
        },
      });
     } catch (e) {
       console.error("Google Login Initialization Error:", e);
     }
  };

  useEffect(() => {
    const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
            initClient();
            clearInterval(interval);
        }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleClick = () => {
    if (typeof google === 'undefined') {
      alert("Google scripts are still loading. Please check your internet connection.");
      return;
    }
    
    if (!tokenClient.current) {
        initClient();
    }

    if (tokenClient.current) {
        tokenClient.current.requestAccessToken();
    } else {
        alert("Failed to initialize Google Login. Please reload the page.");
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: "Guest Writer",
      email: "guest@example.com",
      picture: null
    };
    localStorage.setItem('prozess_user', JSON.stringify(guestUser));
    onLogin(guestUser);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 animate-in fade-in duration-700">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
           <h1 className="text-4xl font-light tracking-tight text-gray-900">
            Prozeß <span className="font-serif italic font-bold">Note</span>
          </h1>
          <p className="text-gray-400 text-sm">Minimalist document creation for the modern mind.</p>
        </div>
        
        <div className="pt-8 space-y-4">
           <button 
             id="loginBtn"
             onClick={handleGoogleClick}
             className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-subtle hover:shadow-float font-medium group"
           >
             <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
               <path fill="#EA4335" d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Sign in with Google
           </button>

           <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-300">Or</span>
              </div>
           </div>

           <button 
             onClick={handleGuestLogin}
             className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-gray-200 font-medium"
           >
             Continue as Guest
           </button>

           <p className="mt-6 text-xs text-gray-300">
             By continuing, you agree to our Terms of Service and Privacy Policy.
           </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<ViewState>('feed');
  const [editorState, setEditorState] = useState<EditorState>({ docId: null });
  const [readerState, setReaderState] = useState<ReaderState | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userDocs, setUserDocs] = useState<Document[]>([]);
  const [feedDocs, setFeedDocs] = useState<Document[]>([]);

  // Editor specific state
  const [activeDoc, setActiveDoc] = useState<Document>(storage.createNewDocument());
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('prozess_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDocs();
    }
  }, [view, user]);

  const loadDocs = () => {
    const allDocs = storage.getDocuments();
    setDocuments(allDocs);
    const userName = user?.name || 'You';
    const isGuest = user?.email === 'guest@example.com';

    // Match docs by author name if it matches user name, or if it was created locally as 'You' (legacy support)
    // Also include 'Anonymous' docs if the user is a guest, so they don't lose access to their published works
    setUserDocs(allDocs.filter(d => 
      d.author === userName || 
      d.author === 'You' || 
      d.author === 'Guest Writer' || 
      (isGuest && d.author === 'Anonymous')
    ).sort((a, b) => b.updatedAt - a.updatedAt));

    setFeedDocs(allDocs.filter(d => d.isPublished).sort((a, b) => b.likes - a.likes));
  };

  const handleCreate = () => {
    const newDoc = storage.createNewDocument();
    if (user?.name) {
      newDoc.author = user.name;
    }
    setActiveDoc(newDoc);
    setEditorState({ docId: null });
    setView('editor');
  };

  const handleEdit = (doc: Document) => {
    setActiveDoc(doc);
    setEditorState({ docId: doc.id });
    setView('editor');
  };

  const handleRead = (doc: Document) => {
    setReaderState({ docId: doc.id });
    setView('reader');
  };

  const handleLogout = () => {
    localStorage.removeItem('prozess_user');
    setUser(null);
  };

  const saveActiveDoc = () => {
    setIsSaving(true);
    // basic validation
    const title = activeDoc.title.trim() || 'Untitled Prozeß';
    
    // Automatically set author to "Anonymous" if a guest publishes the document
    let finalAuthor = activeDoc.author;
    if (user?.email === 'guest@example.com' && activeDoc.isPublished) {
      finalAuthor = 'Anonymous';
    }

    const docToSave = { ...activeDoc, title, author: finalAuthor };
    storage.saveDocument(docToSave);
    
    // Update local state if author changed to ensure UI consistency
    if (finalAuthor !== activeDoc.author) {
      setActiveDoc(prev => ({ ...prev, author: finalAuthor }));
    }
    
    setTimeout(() => {
      setIsSaving(false);
      loadDocs(); // refresh lists
    }, 600);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await gemini.generateText(aiPrompt, activeDoc.content);
      const newContent = activeDoc.content ? activeDoc.content + '\n\n' + result : result;
      setActiveDoc(prev => ({ ...prev, content: newContent }));
      setShowAiModal(false);
      setAiPrompt('');
    } catch (err) {
      alert("Failed to generate text. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiPolish = async () => {
    if (!activeDoc.content.trim()) return;
    setIsAiLoading(true);
    try {
      const polished = await gemini.polishText(activeDoc.content);
      setActiveDoc(prev => ({ ...prev, content: polished }));
    } catch (err) {
      alert("Polish failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      storage.deleteDocument(activeDoc.id);
      loadDocs();
      setView('library');
    }
  };

  const handleTogglePublish = () => {
    setActiveDoc(prev => ({ ...prev, isPublished: !prev.isPublished }));
  };

  const handleToggleLike = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation(); // Prevent opening the doc when clicking like
    if (!user) return;
    storage.toggleLike(docId, user.email || 'guest@example.com');
    loadDocs();
  };

  // --- Views ---

  const renderFeed = () => (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="px-6 pt-6 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Discover <span className="font-serif italic font-bold">Prozeß</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Curated thoughts from the collective.</p>
        </div>
        <div className="flex items-center gap-2">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-gray-100" />
            ) : (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-gray-500"/>
              </div>
            )}
        </div>
      </header>

      <div className="px-4 space-y-4">
        {feedDocs.map(doc => {
          const isLiked = doc.likedBy?.includes(user?.email || 'guest@example.com');
          return (
            <Card key={doc.id} onClick={() => handleRead(doc)} className="group relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{doc.author}</span>
                <span className="text-xs text-gray-300">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{doc.title}</h3>
              <p className="text-gray-500 line-clamp-3 leading-relaxed text-sm">{doc.content}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400">
                  <button 
                    onClick={(e) => handleToggleLike(e, doc.id)}
                    className={`flex items-center gap-1 transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                    <span className="text-xs">{doc.likes}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span className="text-xs">Read</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {feedDocs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Globe className="mx-auto mb-4 opacity-20" size={48} />
            <p>No published documents yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="px-6 pt-6 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">My Work</h1>
          <p className="text-gray-400 mt-2 text-sm">Your drafts and masterpieces.</p>
        </div>
        <Button onClick={handleCreate} className="rounded-full w-12 h-12 !px-0 flex items-center justify-center shadow-xl">
          <Plus size={24} />
        </Button>
      </header>
      
      {/* User Info / Logout */}
      <div className="px-6 mb-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            {user?.picture ? (
              <img src={user.picture} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                 <UserIcon size={12} className="text-gray-500" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
         </div>
         <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
           <LogOut size={12} /> Sign out
         </button>
      </div>

      <div className="px-4 space-y-4">
        {userDocs.map(doc => (
          <div key={doc.id} className="relative group">
            <Card onClick={() => handleEdit(doc)}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ${doc.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                  {doc.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-300">{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{doc.title || 'Untitled'}</h3>
              <p className="text-gray-400 line-clamp-2 text-sm">{doc.content || 'No content'}</p>
            </Card>
          </div>
        ))}
        {userDocs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Book className="mx-auto mb-4 opacity-20" size={48} />
            <p>You haven't created anything yet.</p>
            <Button variant="ghost" className="mt-4" onClick={handleCreate}>Start writing</Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderReader = () => {
    const doc = documents.find(d => d.id === readerState?.docId);
    if (!doc) return <div>Document not found</div>;
    const isLiked = doc.likedBy?.includes(user?.email || 'guest@example.com');

    return (
      <div className="min-h-full bg-white animate-in slide-in-from-bottom-10 duration-500">
        <nav className="sticky top-[52px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView('feed')} icon={ChevronLeft}>Back</Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className={isLiked ? "text-red-500" : ""}
              onClick={() => {
                storage.toggleLike(doc.id, user?.email || 'guest@example.com');
                loadDocs();
              }}>
              <Heart size={18} className={isLiked ? "fill-current" : ""} />
              <span className="ml-2">{doc.likes}</span>
            </Button>
          </div>
        </nav>
        
        <article className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{doc.title}</h1>
          <div className="flex items-center gap-2 mb-10 text-sm text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
              {doc.author[0]}
            </div>
            <span>{doc.author}</span>
            <span>•</span>
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="prose prose-lg prose-slate max-w-none text-gray-800 leading-8 whitespace-pre-wrap">
            {doc.content}
          </div>
        </article>
      </div>
    );
  };

  const renderEditor = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-white animate-in zoom-in-95 duration-300">
      {/* Editor Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <Button variant="ghost" onClick={() => { saveActiveDoc(); setView('library'); }} icon={ChevronLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-300 hidden sm:block">
            {isSaving ? 'Saving...' : 'Saved locally'}
           </span>
           <Button 
            variant="ghost" 
            onClick={handleTogglePublish}
            className={activeDoc.isPublished ? 'text-green-600 bg-green-50' : 'text-gray-400'}
            icon={Globe}
          >
            {activeDoc.isPublished ? 'Public' : 'Private'}
          </Button>
           <Button variant="primary" onClick={saveActiveDoc} icon={Save}>
             Save
           </Button>
        </div>
      </nav>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="max-w-2xl mx-auto px-6 py-12 pb-32">
          <input
            type="text"
            placeholder="Untitled Prozeß"
            value={activeDoc.title}
            onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })}
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 mb-6 bg-transparent"
          />
          <textarea
            placeholder="Start writing..."
            value={activeDoc.content}
            onChange={(e) => setActiveDoc({ ...activeDoc, content: e.target.value })}
            className="w-full h-[60vh] text-lg leading-relaxed text-gray-700 placeholder-gray-300 border-none focus:ring-0 p-0 resize-none bg-transparent"
          />
        </div>
      </div>

      {/* Editor Toolbar (Bottom Sticky) */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
           <div className="flex gap-2">
             <Button variant="secondary" onClick={() => setShowAiModal(true)} icon={Sparkles} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
               Magic
             </Button>
             <Button variant="ghost" onClick={handleAiPolish} disabled={isAiLoading || !activeDoc.content} className="hidden sm:flex">
               {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : 'Polish'}
             </Button>
           </div>
           <Button variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50">
             <Trash2 size={18} />
           </Button>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} />
              AI Assistant
            </h3>
            <p className="text-sm text-gray-500 mb-4">Describe what you want to write or add.</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
              rows={4}
              placeholder="e.g., Write a paragraph about the importance of silence..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAiModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAiGenerate} disabled={isAiLoading || !aiPrompt.trim()}>
                {isAiLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Mobile Navigation ---
  
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center z-40 h-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => setView('feed')} 
        className={`flex flex-col items-center gap-1 ${view === 'feed' ? 'text-black' : 'text-gray-400'}`}
      >
        <Globe size={24} strokeWidth={view === 'feed' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Explore</span>
      </button>

      {/* Floating Action Button for Create handled in Library view, but we can add a quick one here */}
       <div className="relative -top-6">
        <button 
          onClick={handleCreate}
          className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-gray-400 hover:scale-105 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      <button 
        onClick={() => setView('library')} 
        className={`flex flex-col items-center gap-1 ${view === 'library' ? 'text-black' : 'text-gray-400'}`}
      >
        <Book size={24} strokeWidth={view === 'library' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Library</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-gray-200 flex flex-col">
      <BrowserChrome user={user} />
      
      {!user ? (
        <LoginView onLogin={setUser} />
      ) : (
        <div className="flex-1 flex flex-col relative min-h-0">
          {view === 'editor' && renderEditor()}
          {view === 'reader' && renderReader()}
          {(view === 'feed' || view === 'library') && (
            <>
              <main className="max-w-md mx-auto w-full flex-1 bg-white relative">
                {view === 'feed' ? renderFeed() : renderLibrary()}
              </main>
              <MobileNav />
            </>
          )}
        </div>
      )}
    </div>
  );
}