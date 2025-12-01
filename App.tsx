
import React, { useState, useEffect } from 'react';
import AccountBar from './components/AccountBar';
import VideoHistory from './components/VideoHistory';
import AccountSettingsModal from './components/AccountSettingsModal';
import PromptBuilder from './components/PromptBuilder';
import ApiKeyManager from './components/ApiKeyManager';
import CharacterStudio from './components/CharacterStudio';
import LoginScreen from './components/LoginScreen'; // New import
import SignupScreen from './components/SignupScreen'; // New import
import { constructVeoPrompt, openGeminiWeb } from './services/geminiService';
import { HistoryItem, AspectRatio, AccountUsage, UserProfile, ApiKey, CustomOption, Character, LoggedInUser } from './types';
import { Sparkles, ExternalLink, Command, AlertTriangle, ChevronDown, Video, User, Key } from 'lucide-react';

const STYLES = [
  'Cinematic',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  '3D Render',
  'Vintage',
  'Noir',
  'Watercolor'
];

// Default data for custom options (all modifiable character attributes)
const DEFAULT_CUSTOM_OPTIONS_DATA: CustomOption[] = [
  // Genders (Still static in CS as per last review, but if needed, can move here)
  // Ages (Still static in CS)
  // Skin Tones (Still static in CS)
  // Face Shapes (Still static in CS)
  // Eye Colors (Still static in CS)
  { id: 'opt-g1', value: 'Male (ชาย)', attributeKey: 'gender' },
  { id: 'opt-g2', value: 'Female (หญิง)', attributeKey: 'gender' },
  { id: 'opt-g3', value: 'Non-binary (ไม่ระบุเพศ)', attributeKey: 'gender' },
  { id: 'opt-g4', value: 'Robot/Android (หุ่นยนต์)', attributeKey: 'gender' },
  { id: 'opt-g5', value: 'Monster (สัตว์ประหลาด)', attributeKey: 'gender' },

  { id: 'opt-a1', value: 'Infant (ทารก 0-2)', attributeKey: 'ageGroup' },
  { id: 'opt-a2', value: 'Child (เด็ก 3-12)', attributeKey: 'ageGroup' },
  { id: 'opt-a3', value: 'Teenager (วัยรุ่น 13-19)', attributeKey: 'ageGroup' },
  { id: 'opt-a4', value: 'Young Adult (วัยหนุ่มสาว 20-35)', attributeKey: 'ageGroup' },
  { id: 'opt-a5', value: 'Middle Aged (วัยกลางคน 36-55)', attributeKey: 'ageGroup' },
  { id: 'opt-a6', value: 'Elderly (ผู้สูงอายุ 60+)', attributeKey: 'ageGroup' },

  { id: 'opt-sk1', value: 'Pale (ขาวซีด)', attributeKey: 'skinTone' },
  { id: 'opt-sk2', value: 'Fair (ขาวอมชมพู)', attributeKey: 'skinTone' },
  { id: 'opt-sk3', value: 'Light (ขาวเหลือง)', attributeKey: 'skinTone' },
  { id: 'opt-sk4', value: 'Tan (ผิวแทน)', attributeKey: 'skinTone' },
  { id: 'opt-sk5', value: 'Olive (ผิวสองสี)', attributeKey: 'skinTone' },
  { id: 'opt-sk6', value: 'Brown (ผิวคล้ำ)', attributeKey: 'skinTone' },
  { id: 'opt-sk7', value: 'Dark (ผิวดำเข้ม)', attributeKey: 'skinTone' },
  { id: 'opt-sk8', value: 'Blue (น้ำเงิน/เอเลี่ยน)', attributeKey: 'skinTone' },
  { id: 'opt-sk9', value: 'Green (เขียว/ออร์ค)', attributeKey: 'skinTone' },
  { id: 'opt-sk10', value: 'Metallic (โลหะ/หุ่นยนต์)', attributeKey: 'skinTone' },

  { id: 'opt-fs1', value: 'Oval (รูปไข่)', attributeKey: 'faceShape' },
  { id: 'opt-fs2', value: 'Round (หน้ากลม)', attributeKey: 'faceShape' },
  { id: 'opt-fs3', value: 'Square (หน้าเหลี่ยม)', attributeKey: 'faceShape' },
  { id: 'opt-fs4', value: 'Diamond (หน้ารูปเพชร)', attributeKey: 'faceShape' },
  { id: 'opt-fs5', value: 'Chiseled (กรามชัด)', attributeKey: 'faceShape' },
  { id: 'opt-fs6', value: 'Gaunt (แก้มตอบ)', attributeKey: 'faceShape' },
  { id: 'opt-fs7', value: 'Scarred (มีแผลเป็น)', attributeKey: 'faceShape' },

  { id: 'opt-eyec1', value: 'Brown (น้ำตาล)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec2', value: 'Blue (ฟ้า)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec3', value: 'Green (เขียว)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec4', value: 'Hazel (น้ำตาลอ่อน)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec5', value: 'Grey (เทา)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec6', value: 'Black (ดำ)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec7', value: 'Red (แดง)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec8', value: 'Purple (ม่วง)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec9', value: 'Glowing (เรืองแสง)', attributeKey: 'eyeColor' },
  { id: 'opt-eyec10', value: 'Heterochromia (ตาสองสี)', attributeKey: 'eyeColor' },

  // Hair Styles
  { id: 'opt-hs1', value: 'Short / Side Part (สั้น/แสกข้าง)', attributeKey: 'hairStyle' },
  { id: 'opt-hs2', value: 'Long / Straight (ยาว/ตรง)', attributeKey: 'hairStyle' },
  { id: 'opt-hs3', value: 'Curly (หยิก)', attributeKey: 'hairStyle' },
  { id: 'opt-hs4', value: 'Wavy (หยักศก)', attributeKey: 'hairStyle' },
  { id: 'opt-hs5', value: 'Braids (เปีย)', attributeKey: 'hairStyle' },
  { id: 'opt-hs6', value: 'Bald (ศีรษะล้าน)', attributeKey: 'hairStyle' },
  { id: 'opt-hs7', value: 'Spiky (ตั้งชี้)', attributeKey: 'hairStyle' },
  { id: 'opt-hs8', value: 'Ponytail (หางม้า)', attributeKey: 'hairStyle' },
  { id: 'opt-hs9', value: 'Bun (มวยผม)', attributeKey: 'hairStyle' },
  // Hair Colors
  { id: 'opt-hc1', value: 'Black (ดำ)', attributeKey: 'hairColor' },
  { id: 'opt-hc2', value: 'Brown (น้ำตาล)', attributeKey: 'hairColor' },
  { id: 'opt-hc3', value: 'Blonde (บลอนด์)', attributeKey: 'hairColor' },
  { id: 'opt-hc4', value: 'Red (แดง)', attributeKey: 'hairColor' },
  { id: 'opt-hc5', value: 'White (ขาว)', attributeKey: 'hairColor' },
  { id: 'opt-hc6', value: 'Grey (เทา)', attributeKey: 'hairColor' },
  { id: 'opt-hc7', value: 'Blue (ฟ้า)', attributeKey: 'hairColor' },
  { id: 'opt-hc8', value: 'Green (เขียว)', attributeKey: 'hairColor' },
  { id: 'opt-hc9', value: 'Pink (ชมพู)', attributeKey: 'hairColor' },
  { id: 'opt-hc10', value: 'Purple (ม่วง)', attributeKey: 'hairColor' },
  // Hair Textures
  { id: 'opt-ht1', value: 'Straight (ตรง)', attributeKey: 'hairTexture' },
  { id: 'opt-ht2', value: 'Wavy (หยักศก)', attributeKey: 'hairTexture' },
  { id: 'opt-ht3', value: 'Curly (หยิก)', attributeKey: 'hairTexture' },
  { id: 'opt-ht4', value: 'Coily (ขด)', attributeKey: 'hairTexture' },
  { id: 'opt-ht5', value: 'Afro (ฟู)', attributeKey: 'hairTexture' },
  // Eye Shapes
  { id: 'opt-es1', value: 'Almond (อัลมอนด์)', attributeKey: 'eyeShape' },
  { id: 'opt-es2', value: 'Round (กลม)', attributeKey: 'eyeShape' },
  { id: 'opt-es3', value: 'Slanted (ตาเฉียง)', attributeKey: 'eyeShape' },
  { id: 'opt-es4', value: 'Downturned (ตาตก)', attributeKey: 'eyeShape' },
  { id: 'opt-es5', value: 'Upturned (ตาเชิด)', attributeKey: 'eyeShape' },
  { id: 'opt-es6', value: 'Hooded (ตาชั้นเดียว)', attributeKey: 'eyeShape' },
  // Facial Features
  { id: 'opt-ff1', value: 'Scars (แผลเป็น)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff2', value: 'Freckles (กระ)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff3', value: 'Moles (ไฝ)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff4', value: 'Tattoos (รอยสัก)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff5', value: 'Beard (เครา)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff6', value: 'Mustache (หนวด)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff7', value: 'Glasses (แว่นตา)', attributeKey: 'facialFeatures' },
  { id: 'opt-ff8', value: 'Cyborg Implants (อวัยวะไซบอร์ก)', attributeKey: 'facialFeatures' },
  // Body Types
  { id: 'opt-bt1', value: 'Average (ทั่วไป)', attributeKey: 'bodyType' },
  { id: 'opt-bt2', value: 'Athletic (นักกีฬา)', attributeKey: 'bodyType' },
  { id: 'opt-bt3', value: 'Muscular (กล้ามเนื้อ)', attributeKey: 'bodyType' },
  { id: 'opt-bt4', value: 'Slim (ผอมเพรียว)', attributeKey: 'bodyType' },
  { id: 'opt-bt5', value: 'Chubby (ท้วม)', attributeKey: 'bodyType' },
  { id: 'opt-bt6', value: 'Elderly (สูงวัย)', attributeKey: 'bodyType' },
  { id: 'opt-bt7', value: 'Robotic (หุ่นยนต์)', attributeKey: 'bodyType' },
  { id: 'opt-bt8', value: 'Large (ใหญ่โต)', attributeKey: 'bodyType' },
  // Clothing Styles
  { id: 'opt-cs1', value: 'Casual (ลำลอง)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs2', value: 'Formal (เป็นทางการ)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs3', value: 'Sporty (สปอร์ต)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs4', value: 'Fantasy (แฟนตาซี)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs5', value: 'Sci-Fi (ไซไฟ)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs6', value: 'Punk (พังค์)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs7', value: 'Vintage (ย้อนยุค)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs8', value: 'Military (ทหาร)', attributeKey: 'clothingStyle' },
  { id: 'opt-cs9', value: 'Traditional (พื้นเมือง)', attributeKey: 'clothingStyle' },
  // Clothing Colors
  { id: 'opt-cc1', value: 'Red (แดง)', attributeKey: 'clothingColor' },
  { id: 'opt-cc2', value: 'Blue (น้ำเงิน)', attributeKey: 'clothingColor' },
  { id: 'opt-cc3', value: 'Green (เขียว)', attributeKey: 'clothingColor' },
  { id: 'opt-cc4', value: 'Yellow (เหลือง)', attributeKey: 'clothingColor' },
  { id: 'opt-cc5', value: 'Black (ดำ)', attributeKey: 'clothingColor' },
  { id: 'opt-cc6', value: 'White (ขาว)', attributeKey: 'clothingColor' },
  { id: 'opt-cc7', value: 'Grey (เทา)', attributeKey: 'clothingColor' },
  { id: 'opt-cc8', value: 'Purple (ม่วง)', attributeKey: 'clothingColor' },
  { id: 'opt-cc9', value: 'Brown (น้ำตาล)', attributeKey: 'clothingColor' },
  { id: 'opt-cc10', value: 'Orange (ส้ม)', attributeKey: 'clothingColor' },
  // Clothing Details
  { id: 'opt-cd1', value: 'Dragon Pattern (ลายมังกร)', attributeKey: 'clothingDetail' },
  { id: 'opt-cd2', value: 'Torn Fabric (ผ้าขาด)', attributeKey: 'clothingDetail' },
  { id: 'opt-cd3', value: 'Glowing Seams (ตะเข็บเรืองแสง)', attributeKey: 'clothingDetail' },
  { id: 'opt-cd4', value: 'Embroidered (ปัก)', attributeKey: 'clothingDetail' },
  { id: 'opt-cd5', value: 'Leather Straps (สายหนัง)', attributeKey: 'clothingDetail' },
  { id: 'opt-cd6', value: 'Metal Studs (หมุดโลหะ)', attributeKey: 'clothingDetail' },
  // Accessories
  { id: 'opt-ac1', value: 'Necklace (สร้อยคอ)', attributeKey: 'accessories' },
  { id: 'opt-ac2', value: 'Earrings (ต่างหู)', attributeKey: 'accessories' },
  { id: 'opt-ac3', value: 'Hat (หมวก)', attributeKey: 'accessories' },
  { id: 'opt-ac4', value: 'Gloves (ถุงมือ)', attributeKey: 'accessories' },
  { id: 'opt-ac5', value: 'Scarf (ผ้าพันคอ)', attributeKey: 'accessories' },
  { id: 'opt-ac6', value: 'Backpack (เป้)', attributeKey: 'accessories' },
  { id: 'opt-ac7', value: 'Belt (เข็มขัด)', attributeKey: 'accessories' },
  { id: 'opt-ac8', value: 'Wristwatch (นาฬิกาข้อมือ)', attributeKey: 'accessories' },
  { id: 'opt-ac9', value: 'Cape (ผ้าคลุม)', attributeKey: 'accessories' },
  // Weapons
  { id: 'opt-w1', value: 'Sword (ดาบ)', attributeKey: 'weapons' },
  { id: 'opt-w2', value: 'Gun (ปืน)', attributeKey: 'weapons' },
  { id: 'opt-w3', value: 'Bow (ธนู)', attributeKey: 'weapons' },
  { id: 'opt-w4', value: 'Magic Wand (ไม้กายสิทธิ์)', attributeKey: 'weapons' },
  { id: 'opt-w5', value: 'Knife (มีด)', attributeKey: 'weapons' },
  { id: 'opt-w6', value: 'Axe (ขวาน)', attributeKey: 'weapons' },
  { id: 'opt-w7', value: 'Shield (โล่)', attributeKey: 'weapons' },
  { id: 'opt-w8', value: 'Staff (ไม้เท้า)', attributeKey: 'weapons' },
  // Personalities
  { id: 'opt-p1', value: 'Brave (กล้าหาญ)', attributeKey: 'personality' },
  { id: 'opt-p2', value: 'Calm (สงบ)', attributeKey: 'personality' },
  { id: 'opt-p3', value: 'Outgoing (ร่าเริง)', attributeKey: 'personality' },
  { id: 'opt-p4', value: 'Shy (ขี้อาย)', attributeKey: 'personality' },
  { id: 'opt-p5', value: 'Intelligent (ฉลาด)', attributeKey: 'personality' },
  { id: 'opt-p6', value: 'Mysterious (ลึกลับ)', attributeKey: 'personality' },
  { id: 'opt-p7', value: 'Aggressive (ดุดัน)', attributeKey: 'personality' },
  { id: 'opt-p8', value: 'Kind (ใจดี)', attributeKey: 'personality' },
  { id: 'opt-p9', value: 'Sarcastic (ประชดประชัน)', attributeKey: 'personality' },
  // Moods
  { id: 'opt-m1', value: 'Neutral (ปกติ)', attributeKey: 'currentMood' },
  { id: 'opt-m2', value: 'Happy (มีความสุข)', attributeKey: 'currentMood' },
  { id: 'opt-m3', value: 'Sad (เศร้า)', attributeKey: 'currentMood' },
  { id: 'opt-m4', value: 'Angry (โกรธ)', attributeKey: 'currentMood' },
  { id: 'opt-m5', value: 'Surprised (ประหลาดใจ)', attributeKey: 'currentMood' },
  { id: 'opt-m6', value: 'Scared (กลัว)', attributeKey: 'currentMood' },
  { id: 'opt-m7', value: 'Confused (สับสน)', attributeKey: 'currentMood' },
  { id: 'opt-m8', value: 'Excited (ตื่นเต้น)', attributeKey: 'currentMood' },
  { id: 'opt-m9', value: 'Determined (มุ่งมั่น)', attributeKey: 'currentMood' },
];

type View = 'generator' | 'characters';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('generator');
  
  // --- Authentication State ---
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState<'login' | 'signup' | 'none'>('login');
  // ----------------------------

  // Account & Quota Management
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(2);
  const [accountUsage, setAccountUsage] = useState<AccountUsage>({});
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfile>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // API Key Management
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isKeyManagerOpen, setIsKeyManagerOpen] = useState(false);

  // Characters
  const [characters, setCharacters] = useState<Character[]>([]);

  // Custom Options
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  
  const MAX_DAILY_COUNT = 2;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastCopied, setLastCopied] = useState<boolean>(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedUsage = localStorage.getItem('veo_account_usage');
      const savedProfiles = localStorage.getItem('veo_user_profiles');
      const savedSlotCount = localStorage.getItem('veo_active_slot_count');
      const savedApiKeys = localStorage.getItem('veo_api_keys');
      const savedActiveKey = localStorage.getItem('veo_active_key_id');
      const savedCharacters = localStorage.getItem('veo_characters');
      const savedLoggedInUser = localStorage.getItem('veo_logged_in_user'); // New: Load loggedInUser
      const savedCustomOptions = localStorage.getItem('veo_custom_options'); // New: Load custom options
      
      if (savedUsage) setAccountUsage(JSON.parse(savedUsage));
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      if (savedSlotCount) setActiveSlotCount(parseInt(savedSlotCount, 10));
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      if (savedActiveKey) setActiveKeyId(savedActiveKey);
      if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
      if (savedCustomOptions) {
        setCustomOptions(JSON.parse(savedCustomOptions)); // Load custom options
      } else {
        setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA); // Initialize with defaults if not found
      }

      // New: Initialize loggedInUser and auth screen state
      if (savedLoggedInUser) {
        setLoggedInUser(JSON.parse(savedLoggedInUser));
        setShowAuthScreen('none'); // User is already logged in
      } else {
        setShowAuthScreen('login'); // Show login screen if not logged in
      }

    } catch (e) {
      console.error("Failed to load settings", e);
      // If any error, reset auth state to login
      setLoggedInUser(null);
      setShowAuthScreen('login');
      setCustomOptions(DEFAULT_CUSTOM_OPTIONS_DATA); // Also reset custom options if error
    }
  }, []);

  // Save data to localStorage
  useEffect(() => { localStorage.setItem('veo_account_usage', JSON.stringify(accountUsage)); }, [accountUsage]);
  useEffect(() => { localStorage.setItem('veo_user_profiles', JSON.stringify(userProfiles)); }, [userProfiles]);
  useEffect(() => { localStorage.setItem('veo_active_slot_count', activeSlotCount.toString()); }, [activeSlotCount]);
  useEffect(() => { localStorage.setItem('veo_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { if(activeKeyId) localStorage.setItem('veo_active_key_id', activeKeyId); }, [activeKeyId]);
  useEffect(() => { localStorage.setItem('veo_characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('veo_custom_options', JSON.stringify(customOptions)); }, [customOptions]); // Save custom options
  
  // New: Save loggedInUser to localStorage
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('veo_logged_in_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('veo_logged_in_user');
    }
  }, [loggedInUser]);

  const addToHistory = (original: string, final: string) => {
     const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      originalPrompt: original,
      finalPrompt: final,
      createdAt: Date.now(),
      accountIndex: currentAccountIndex
    };
    setHistory(prev => [newItem, ...prev]);
  };

  // Launch specific prompt from Storyboard
  const handleDirectLaunch = (promptStr: string) => {
    if (!promptStr.trim()) return;
    
    // Add default style/aspect ratio logic if needed, currently raw prompt
    const finalPrompt = constructVeoPrompt({
      prompt: promptStr,
      aspectRatio: '16:9', // Default for storyboard scenes
      style: 'Cinematic' // Default style
    });

    navigator.clipboard.writeText(finalPrompt).then(() => {
       setLastCopied(true);
       setTimeout(() => setLastCopied(false), 3000);
    }).catch(err => console.error('Failed to copy: ', err));

    addToHistory(promptStr, finalPrompt);

    setAccountUsage(prev => ({
        ...prev,
        [currentAccountIndex]: (prev[currentAccountIndex] || 0) + 1
    }));

    openGeminiWeb(currentAccountIndex);
  };

  const handleCopyOnly = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetCurrentAccount = () => {
      setAccountUsage(prev => ({ ...prev, [currentAccountIndex]: 0 }));
  };

  const updateProfile = (index: number, data: Partial<UserProfile>) => {
    setUserProfiles(prev => ({
      ...prev,
      [index]: { ...(prev[index] || { name: `Account ${index + 1}` }), ...data }
    }));
  };

  const updateProfileName = (index: number, name: string) => {
    updateProfile(index, { name });
  };

  const handleAddCustomOption = (option: CustomOption) => {
    setCustomOptions(prev => [...prev, option]);
  };

  const handleRemoveCustomOption = (id: string) => {
    setCustomOptions(prev => prev.filter(opt => opt.id !== id));
  };


  const activeApiKeyObj = apiKeys.find(k => k.id === activeKeyId) || null;
  const currentUsage = accountUsage[currentAccountIndex] || 0;
  const isLimitReached = currentUsage >= MAX_DAILY_COUNT;

  // --- Auth Handlers (Client-side simulation) ---
  const handleLogin = (username: string, password: string) => {
    // In a real app, this would call a backend API to authenticate
    if (username && password) { // Simple validation
      setLoggedInUser({ username });
      setShowAuthScreen('none');
      console.log(`User '${username}' logged in (simulated)`);
    } else {
      alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน");
    }
  };

  const handleSignup = (username: string, password: string) => {
    // In a real app, this would call a backend API to create a user
    if (username && password) { // Simple validation
      setLoggedInUser({ username }); // Automatically log in after signup for demo
      setShowAuthScreen('none');
      console.log(`User '${username}' signed up and logged in (simulated)`);
      alert("สมัครสมาชิกเรียบร้อย! เข้าสู่ระบบแล้ว");
    } else {
      alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setShowAuthScreen('login');
    console.log("User logged out (simulated)");
  };
  // ------------------------------------------------

  // If not logged in, show auth screens
  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        {showAuthScreen === 'login' && (
          <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setShowAuthScreen('signup')} />
        )}
        {showAuthScreen === 'signup' && (
          <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setShowAuthScreen('login')} />
        )}
      </div>
    );
  }

  // If logged in, show the main application content
  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans">
      <AccountBar 
        currentAccountIndex={currentAccountIndex}
        activeSlotCount={activeSlotCount}
        usageMap={accountUsage}
        userProfiles={userProfiles}
        maxCount={MAX_DAILY_COUNT}
        onAccountSelect={setCurrentAccountIndex}
        onResetCurrent={resetCurrentAccount}
        onUpdateProfileName={updateProfileName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        loggedInUser={loggedInUser} // Pass loggedInUser
        onLogout={handleLogout} // Pass logout handler
      />

      <AccountSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfiles={userProfiles}
        onUpdateProfile={updateProfile}
        activeSlotCount={activeSlotCount}
        onUpdateSlotCount={setActiveSlotCount}
      />

      <ApiKeyManager
        isOpen={isKeyManagerOpen}
        onClose={() => setIsKeyManagerOpen(false)}
        apiKeys={apiKeys}
        activeKeyId={activeKeyId}
        onAddKey={(k) => {
          setApiKeys(prev => [...prev, k]);
          if (!activeKeyId) setActiveKeyId(k.id);
        }}
        onRemoveKey={(id) => {
          setApiKeys(prev => prev.filter(k => k.id !== id));
          if (activeKeyId === id) setActiveKeyId(null);
        }}
        onSelectKey={setActiveKeyId}
      />

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 mt-6 flex justify-center">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg">
             <button
               onClick={() => setCurrentView('generator')}
               className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'generator' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
                <Video size={16} /> Storyboard Pro
             </button>
             <button
               onClick={() => setCurrentView('characters')}
               className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${currentView === 'characters' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
                <User size={16} /> Character Studio
             </button>
          </div>
      </nav>

      <main className="container mx-auto px-4 pt-6 flex flex-col items-center">
        
        {currentView === 'characters' ? (
             <div className="w-full max-w-6xl animate-fade-in-up">
                 <CharacterStudio 
                    characters={characters}
                    onSaveCharacter={(newChar) => {
                        setCharacters(prev => {
                            const exists = prev.find(c => c.id === newChar.id);
                            if (exists) return prev.map(c => c.id === newChar.id ? newChar : c);
                            return [...prev, newChar];
                        });
                    }}
                    onDeleteCharacter={(id) => setCharacters(prev => prev.filter(c => c.id !== id))}
                    onBack={() => setCurrentView('generator')}
                    customOptions={customOptions}
                    onAddCustomOption={handleAddCustomOption}
                    onRemoveCustomOption={handleRemoveCustomOption}
                 />
             </div>
        ) : (
            <>
                <div className="w-full max-w-7xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 animate-fade-in">
                
                {isLimitReached && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2 text-red-300 text-xs z-20">
                        <AlertTriangle size={12} />
                        <span>โควต้าบัญชีนี้เต็มแล้ว กรุณาสลับบัญชีด้านบน</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-emerald-500" />
                        Veo Storyboard Pro
                    </h2>

                    <button 
                        onClick={() => setIsKeyManagerOpen(true)}
                        className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeApiKeyObj ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-900/10 text-amber-500 border-amber-500/30 hover:bg-amber-900/20'}`}
                    >
                        <Key size={12} />
                        {activeApiKeyObj ? activeApiKeyObj.name : 'ตั้งค่า API Key'}
                    </button>
                </div>

                <div className="relative z-10">
                    {/* Storyboard Interface is now the ONLY interface */}
                    <PromptBuilder 
                        characters={characters}
                        activeApiKey={activeApiKeyObj}
                        onOpenApiKeyManager={() => setIsKeyManagerOpen(true)}
                        onLaunchScene={handleDirectLaunch}
                        onNavigateToCharacterStudio={() => setCurrentView('characters')}
                    />
                </div>
                </div>

                <VideoHistory items={history} onCopy={handleCopyOnly} />
            </>
        )}
      </main>
    </div>
  );
};

export default App;
