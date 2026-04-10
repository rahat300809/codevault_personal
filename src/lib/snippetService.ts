import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Snippet, NewSnippet, Folder, NewFolder } from "../types";

const SNIPPETS = "snippets";
const FOLDERS = "folders";

// ─── Folder Service ────────────────────────────────────────

export const folderService = {
  subscribeToFolders: (
    callback: (folders: Folder[]) => void,
    onError?: (error: Error) => void
  ) => {
    const q = query(collection(db, FOLDERS), orderBy("createdAt", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const folders = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: (d.data().createdAt as Timestamp)?.toMillis() || Date.now(),
        })) as Folder[];
        callback(folders);
      },
      (error) => {
        console.error("Firestore folder subscription error:", error);
        if (onError) onError(error);
      }
    );
  },

  addFolder: async (folder: NewFolder) => {
    return await addDoc(collection(db, FOLDERS), {
      ...folder,
      createdAt: serverTimestamp(),
    });
  },

  deleteFolder: async (id: string) => {
    const folderRef = doc(db, FOLDERS, id);
    return await deleteDoc(folderRef);
  },
};

// ─── Snippet Service ───────────────────────────────────────
// Always fetches ALL snippets — folder filtering is done client-side
// to avoid needing a Firestore composite index on folderId + createdAt.

export const snippetService = {
  subscribeToSnippets: (
    callback: (snippets: Snippet[]) => void,
    onError?: (error: Error) => void
  ) => {
    const q = query(collection(db, SNIPPETS), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const snippets = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          folderId: d.data().folderId || '',
          createdAt: (d.data().createdAt as Timestamp)?.toMillis() || Date.now(),
          updatedAt: (d.data().updatedAt as Timestamp)?.toMillis() || Date.now(),
        })) as Snippet[];
        callback(snippets);
      },
      (error) => {
        console.error("Firestore snippet subscription error:", error);
        if (onError) onError(error);
      }
    );
  },

  addSnippet: async (snippet: NewSnippet) => {
    return await addDoc(collection(db, SNIPPETS), {
      ...snippet,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  updateSnippet: async (id: string, snippet: Partial<Snippet>) => {
    const snippetRef = doc(db, SNIPPETS, id);
    return await updateDoc(snippetRef, {
      ...snippet,
      updatedAt: serverTimestamp(),
    });
  },

  deleteSnippet: async (id: string) => {
    const snippetRef = doc(db, SNIPPETS, id);
    return await deleteDoc(snippetRef);
  }
};
