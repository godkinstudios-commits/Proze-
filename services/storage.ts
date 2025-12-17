import { Document } from '../types';

const STORAGE_KEY = 'prozess_notes_data_v2';

const generateId = () => Math.random().toString(36).substring(2, 9);

const SEED_DATA: Document[] = [
  {
    id: 'welcome-msg',
    title: 'Hi',
    content: "Hi! This is a warm welcome as we begin our work together on this document. I'm excited to dive into the details and look forward to our collaboration. Let's ensure we cover all the necessary points and achieve our goals efficiently.",
    author: 'admin',
    isPublished: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Welcome'],
    likes: 0,
    likedBy: []
  }
];

export const getDocuments = (): Document[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const saveDocument = (doc: Document): void => {
  const docs = getDocuments();
  const existingIndex = docs.findIndex(d => d.id === doc.id);
  
  if (existingIndex >= 0) {
    // Preserve likes and likedBy if not provided in the update
    const existing = docs[existingIndex];
    docs[existingIndex] = { 
      ...doc, 
      likes: existing.likes,
      likedBy: existing.likedBy || [],
      updatedAt: Date.now() 
    };
  } else {
    docs.unshift({ ...doc, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export const getDocumentById = (id: string): Document | undefined => {
  const docs = getDocuments();
  return docs.find(d => d.id === id);
};

export const deleteDocument = (id: string): void => {
  const docs = getDocuments();
  const filtered = docs.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const createNewDocument = (): Document => {
  return {
    id: generateId(),
    title: '',
    content: '',
    author: 'You',
    isPublished: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: [],
    likes: 0,
    likedBy: []
  };
};

export const toggleLike = (docId: string, userId: string): void => {
  const docs = getDocuments();
  const doc = docs.find(d => d.id === docId);
  
  if (doc) {
    // Initialize likedBy if it doesn't exist (migration for old data)
    if (!doc.likedBy) doc.likedBy = [];

    const userIndex = doc.likedBy.indexOf(userId);
    
    if (userIndex === -1) {
      // User hasn't liked it yet -> Add like
      doc.likedBy.push(userId);
    } else {
      // User already liked it -> Remove like
      doc.likedBy.splice(userIndex, 1);
    }
    
    // Sync likes count
    doc.likes = doc.likedBy.length;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }
};