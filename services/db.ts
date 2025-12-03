
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, addDoc, orderBy, getDoc } from 'firebase/firestore';
import { Project, Character, Announcement, AppUser } from '../types';

const isDemo = !db;

// --- PROTOTYPE LOCAL STORAGE FALLBACKS ---
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// --- PROJECTS ---
export const fetchProjects = async (userId: string): Promise<Project[]> => {
    if (isDemo) {
        const projects = getLocal('veo_projects');
        return projects; // Return all in demo
    }
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)).sort((a,b) => b.updatedAt - a.updatedAt);
};

export const saveProject = async (project: Project) => {
    if (isDemo) {
        const projects = getLocal('veo_projects');
        const index = projects.findIndex((p: Project) => p.id === project.id);
        if (index >= 0) projects[index] = project;
        else projects.unshift(project);
        setLocal('veo_projects', projects);
        return;
    }
    await setDoc(doc(db, 'projects', project.id), project);
};

export const deleteProjectDb = async (projectId: string) => {
    if (isDemo) {
        const projects = getLocal('veo_projects').filter((p: Project) => p.id !== projectId);
        setLocal('veo_projects', projects);
        return;
    }
    await deleteDoc(doc(db, 'projects', projectId));
};

// --- CHARACTERS ---
export const fetchCharacters = async (userId: string): Promise<Character[]> => {
    if (isDemo) return getLocal('veo_characters');
    // Using a subcollection 'characters' under 'users' ensures privacy and better organization
    const userCharRef = collection(db, 'users', userId, 'characters');
    const snapshot = await getDocs(userCharRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Character));
};

export const saveCharacterDb = async (userId: string, character: Character) => {
    if (isDemo) {
        const chars = getLocal('veo_characters');
        const index = chars.findIndex((c: Character) => c.id === character.id);
        if (index >= 0) chars[index] = character;
        else chars.push(character);
        setLocal('veo_characters', chars);
        return;
    }
    await setDoc(doc(db, 'users', userId, 'characters', character.id), character);
};

export const deleteCharacterDb = async (userId: string, charId: string) => {
     if (isDemo) {
        const chars = getLocal('veo_characters').filter((c: Character) => c.id !== charId);
        setLocal('veo_characters', chars);
        return;
    }
    await deleteDoc(doc(db, 'users', userId, 'characters', charId));
};

// --- ANNOUNCEMENTS (ADMIN) ---
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
    if (isDemo) return [];
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
};

export const createAnnouncement = async (announcement: Announcement) => {
    if (isDemo) return;
    await setDoc(doc(db, 'announcements', announcement.id), announcement);
};

export const deleteAnnouncement = async (id: string) => {
    if (isDemo) return;
    await deleteDoc(doc(db, 'announcements', id));
};

// --- USER MANAGEMENT (ADMIN) ---
export const fetchAllUsers = async (): Promise<AppUser[]> => {
    if (isDemo) return [];
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(d => d.data() as AppUser);
};

export const updateUserStatus = async (uid: string, data: Partial<AppUser>) => {
    if (isDemo) return;
    await updateDoc(doc(db, 'users', uid), data);
};
