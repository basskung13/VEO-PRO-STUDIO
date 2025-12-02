
import React, { useState, useEffect } from 'react';
import { Character, CharacterAttributes, CustomOption, ApiKey } from '../types';
import { generateCharacterImage, handleAistudioApiKeySelection } from '../services/geminiService';
import { User, Save, Trash2, RefreshCw, Sparkles, Wand2, Palette, Smile, Shirt, Scissors, Dna, Crown, Sword, MessagesSquare, ChevronLeft, ChevronRight, Plus, Tag, Filter, Loader2, Download, X, AlertCircle, Key } from 'lucide-react';

interface CharacterStudioProps {
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onBack: () => void;
  customOptions: CustomOption[];
  onAddCustomOption: (option: CustomOption) => void;
  onRemoveCustomOption: (id: string) => void;
  activeCharacterApiKey: ApiKey | null;
  onOpenApiKeyManager: () => void;
}

// These are now purely for `defaultAttributes` initialization and constants (like GENDERS, AGES)
// All options for selection/randomization are fetched from `customOptions` prop via getCombinedOptions/getCombinedTagOptions
const GENDERS = ['Male (ชาย)', 'Female (หญิง)', 'Non-binary (ไม่ระบุเพศ)', 'Robot/Android (หุ่นยนต์)', 'Monster (สัตว์ประหลาด)'];
const AGES = ['Infant (ทารก 0-2)', 'Child (เด็ก 3-12)', 'Teenager (วัยรุ่น 13-19)', 'Young Adult (วัยหนุ่มสาว 20-35)', 'Middle Aged (วัยกลางคน 36-55)', 'Elderly (ผู้สูงอายุ 60+)'];
const SKINS = ['Pale (ขาวซีด)', 'Fair (ขาวอมชมพู)', 'Light (ขาวเหลือง)', 'Tan (ผิวแทน)', 'Olive (ผิวสองสี)', 'Brown (ผิวคล้ำ)', 'Dark (ผิวดำเข้ม)', 'Blue (น้ำเงิน/เอเลี่ยน)', 'Green (เขียว/ออร์ค)', 'Metallic (โลหะ/หุ่นยนต์)'];
const FACES = ['Oval (รูปไข่)', 'Round (หน้ากลม)', 'Square (หน้าเหลี่ยม)', 'Diamond (หน้ารูปเพชร)', 'Chiseled (กรามชัด)', 'Gaunt (แก้มตอบ)', 'Scarred (มีแผลเป็น)'];
const EYES_COLORS = ['Brown (น้ำตาล)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Hazel (น้ำตาลอ่อน)', 'Grey (เทา)', 'Black (ดำ)', 'Red (แดง)', 'Purple (ม่วง)', 'Glowing (เรืองแสง)', 'Heterochromia (ตาสองสี)'];


// Map of attribute keys to their Thai display names for custom option categories
// REMOVED: environmentElement
const ATTRIBUTE_CATEGORIES_MAP: { [K in keyof CharacterAttributes]: string } = {
  gender: 'เพศ (Gender)',
  ageGroup: 'กลุ่มอายุ (Age Group)',
  skinTone: 'สีผิว (Skin Tone)',
  faceShape: 'รูปหน้า (Face Shape)',
  eyeShape: 'รูปร่างตา (Eye Shape)',
  eyeColor: 'สีตา (Eye Color)',
  hairStyle: 'ทรงผม (Hair Style)',
  hairColor: 'สีผม (Hair Color)',
  hairTexture: 'ลักษณะเส้นผม (Hair Texture)',
  facialFeatures: 'จุดเด่นบนใบหน้า (Facial Features)',
  bodyType: 'รูปร่าง (Body Type)',
  clothingStyle: 'สไตล์ชุด (Clothing Style)',
  clothingColor: 'สีชุด (Color)',
  clothingDetail: 'รายละเอียดชุด (Detail)',
  accessories: 'เครื่องประดับ (Accessories)',
  weapons: 'อาวุธ/ของถือ (Weapons)',
  personality: 'บุคลิกภาพ (Personality)',
  currentMood: 'อารมณ์ปัจจุบัน (Current Mood)',
};

// Keys for attributes that are fully managed via custom options
// REMOVED: environmentElement
const CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS: (keyof CharacterAttributes)[] = [
  'gender', 'ageGroup', 'skinTone', 'faceShape', 'eyeShape', 'eyeColor',
  'hairStyle', 'hairColor', 'hairTexture', 'facialFeatures', 'bodyType',
  'clothingStyle', 'clothingColor', 'clothingDetail', 'accessories', 'weapons',
  'personality', 'currentMood',
];

// Map of attribute keys to their placeholder text suggestions for adding custom options
// REMOVED: environmentElement
const ATTRIBUTE_PLACEHOLDER_MAP: { [K in keyof CharacterAttributes]: string } = {
  gender: "เช่น 'เพศหุ่นยนต์', 'เพศเอเลี่ยน'",
  ageGroup: "เช่น 'วัยทารกวิวัฒนาการ', 'วัยผู้ใหญ่โบราณ'",
  skinTone: "เช่น 'ผิวสีเงิน', 'ผิวสีฟ้าอ่อน'",
  faceShape: "เช่น 'หน้ารูปเพชรเหลี่ยมคม', 'หน้ายาวเรียว'",
  eyeShape: "เช่น 'ตาคมแบบปีศาจ', 'ตากลมโตน่ารัก'",
  eyeColor: "เช่น 'ตาสีทองส่องแสง', 'ตาสีรุ้ง'",
  hairStyle: "เช่น 'ผมทรงรากไม้', 'ผมทรงเมือก'",
  hairColor: "เช่น 'ผมสีคริสตัล', 'ผมสีเปลวไฟ'",
  hairTexture: "เช่น 'ผมเป็นหนามแหลม', 'ผมเป็นเกล็ด'",
  facialFeatures: "เช่น 'หนวดปลาหมึก', 'รอยสักเผ่า'",
  bodyType: "เช่น 'รูปร่างเพรียวลม', 'รูปร่างหินผา'",
  clothingStyle: "เช่น 'ชุดอวกาศวินเทจ', 'ชุดกิโมโนอนาคต'",
  clothingColor: "เช่น 'สีดำสนิท', 'สีม่วงเรืองแสง'",
  clothingDetail: "เช่น 'มีปีกขนนก', 'มีโซ่ตรวน'",
  accessories: "เช่น 'มงกุฎดอกไม้', 'เข็มขัดพลังงาน'",
  weapons: "เช่น 'ดาบแสง', 'ปืนเลเซอร์'",
  personality: "เช่น 'ขี้เล่นแต่จริงจัง', 'เงียบขรึมแต่ฉลาด'",
  currentMood: "เช่น 'คลุ้มคลั่ง', 'สงบนิ่งอย่างประหลาด'",
};


const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, onSaveCharacter, onDeleteCharacter, onBack, customOptions, onAddCustomOption, onRemoveCustomOption, activeCharacterApiKey, onOpenApiKeyManager }) => {
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar visibility
  
  const [newCustomOptionValue, setNewCustomOptionValue] = useState('');
  
  // selectedManageCategory will now also serve as the category for new additions
  const [selectedManageCategory, setSelectedManageCategory] = useState<keyof CharacterAttributes>( 
    CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS[0] // Default to the first category
  );

  // New state for image generation
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // New state for aistudio API Key management (specific to Character Image Generation)
  const [aistudioKeySelected, setAistudioKeySelected] = useState(false);
  const [aistudioKeyCheckCompleted, setAistudioKeyCheckCompleted] = useState(false);
  const [aistudioAvailable, setAistudioAvailable] = useState(false); // New state to track if window.aistudio is available


  const defaultAttributes: CharacterAttributes = {
    gender: 'Male (ชาย)',
    ageGroup: 'Young Adult (วัยหนุ่มสาว 20-35)',
    skinTone: 'Fair (ขาวอมชมพู)',
    faceShape: 'Oval (รูปไข่)',
    eyeShape: 'Almond (อัลมอนด์)', // Default eyeShape
    eyeColor: 'Brown (น้ำตาล)',
    hairStyle: 'Short / Side Part (สั้น/แสกข้าง)',
    hairColor: 'Black (ดำ)',
    hairTexture: 'Straight (ตรง)', // Default hairTexture
    facialFeatures: [],
    bodyType: 'Average (ทั่วไป)',
    clothingStyle: 'Casual (ลำลอง)',
    clothingColor: 'White (ขาว)',
    clothingDetail: '',
    accessories: [],
    weapons: [],
    personality: 'Brave (กล้าหาญ)',
    currentMood: 'Neutral (ปกติ)'
  };

  const [form, setForm] = useState<{
    name: string;
    nameEn: string;
    seed: string;
    attr: CharacterAttributes;
    visualDescriptionOverride: string;
    dialogueExample: string;
  }>({
    name: '',
    nameEn: '',
    seed: Math.random().toString(36).substring(7).toUpperCase(),
    attr: { ...defaultAttributes },
    visualDescriptionOverride: '',
    dialogueExample: ''
  });

  // --- Effect to check aistudio API Key status ---
  useEffect(() => {
    const checkAistudioKey = async () => {
      // Check if window.aistudio exists and if hasSelectedApiKey is a function
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        setAistudioAvailable(true); // aistudio is available
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setAistudioKeySelected(hasKey);
      } else {
        // window.aistudio is not available, assume API key is managed externally via activeApiKey
        setAistudioAvailable(false);
        // Optimistically assume key is set via ApiKeyManager if aistudio isn't present
        // Actual key validity will be checked on API call via activeCharacterApiKey
        setAistudioKeySelected(true); 
        console.warn("window.aistudio object or hasSelectedApiKey function not found. Assuming API Key is managed externally.");
      }
      setAistudioKeyCheckCompleted(true);
    };
    checkAistudioKey();
  }, []); // Run once on mount
  // -----------------------------------------------

  // Load character into form
  useEffect(() => {
    if (activeCharId) {
      const char = characters.find(c => c.id === activeCharId);
      if (char) {
        setForm({
          name: char.name,
          nameEn: char.nameEn,
          seed: char.seed,
          attr: { ...defaultAttributes, ...char.attributes }, // Merge to ensure new fields exist
          visualDescriptionOverride: char.visualDescriptionOverride || '',
          dialogueExample: char.dialogueExample || ''
        });
        setCharacterImageUrl(char.imageUrl || null);
        setImageError(null);
      }
    } else {
      // Clear form for new character
      setForm({
        name: '',
        nameEn: '',
        seed: Math.random().toString(36).substring(7).toUpperCase(),
        attr: { ...defaultAttributes },
        visualDescriptionOverride: '',
        dialogueExample: ''
      });
      setCharacterImageUrl(null);
      setImageError(null);
    }
  }, [activeCharId, characters]);

  const cleanVal = (val: string) => {
    // If the value contains parentheses, assume it's a combined English (Thai) string and take the English part.
    if (val.includes('(') && val.includes(')')) {
      return val.split('(')[0].trim();
    }
    // Otherwise, return as is.
    return val.trim();
  };

  const toggleTag = (category: keyof CharacterAttributes, value: string) => {
    setForm(prev => {
      const currentList = prev.attr[category] as string[];
      const newList = currentList.includes(value) 
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      // Correct way to update nested state:
      return { ...prev, attr: { ...prev.attr, [category]: newList } };
    });
  };

  const generateDescription = () => {
    const { attr, nameEn, visualDescriptionOverride } = form;

    if (visualDescriptionOverride.trim()) {
      return visualDescriptionOverride.trim(); // Use override if provided
    }

    const gender = cleanVal(attr.gender);
    const age = cleanVal(attr.ageGroup).split(' ')[0];
    const skin = cleanVal(attr.skinTone);
    const hair = `${cleanVal(attr.hairColor)} ${cleanVal(attr.hairStyle)}`;
    const clothes = `${attr.clothingColor} ${cleanVal(attr.clothingStyle)} ${attr.clothingDetail}`;
    const eyes = `${cleanVal(attr.eyeColor)} eyes`;
    
    let desc = `A ${age} ${gender} named ${nameEn}, ${skin} skin, ${eyes}, ${hair} hair, ${cleanVal(attr.bodyType)} body.`;
    desc += ` Wearing ${clothes}.`;
    
    if (attr.facialFeatures.length > 0) desc += ` Facial features: ${attr.facialFeatures.map(cleanVal).join(', ')}.`;
    if (attr.accessories.length > 0) desc += ` Accessories: ${attr.accessories.map(cleanVal).join(', ')}.`;
    if (attr.weapons.length > 0) desc += ` Holding: ${attr.weapons.map(cleanVal).join(', ')}.`;
    desc += ` Personality: ${cleanVal(attr.personality)}. Mood: ${cleanVal(attr.currentMood)}.`;

    return desc;
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("กรุณาตั้งชื่อตัวละคร");
      return;
    }

    const newChar: Character = {
      id: activeCharId || Date.now().toString(),
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || form.name.trim(),
      description: generateDescription(),
      attributes: form.attr,
      seed: form.seed,
      visualDescriptionOverride: form.visualDescriptionOverride.trim(),
      dialogueExample: form.dialogueExample.trim(),
      imageUrl: characterImageUrl || undefined,
      createdAt: activeCharId ? (characters.find(c => c.id === activeCharId)?.createdAt || Date.now()) : Date.now()
    };

    onSaveCharacter(newChar);
    if (!activeCharId) {
        setActiveCharId(newChar.id); 
    }
    alert("บันทึกตัวละครเรียบร้อย!");
  };

  const handleRandomize = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomItems = (arr: string[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.floor(Math.random() * (count + 1)));
    };
    
    // Get combined options for randomization from customOptions
    // Note: getCombinedOptions helper is removed, doing inline filter.
    const getOpts = (k: keyof CharacterAttributes) => customOptions.filter(o => o.attributeKey === k).map(o => o.value);

    const combinedGenders = getOpts('gender');
    const combinedAgeGroups = getOpts('ageGroup');
    const combinedSkinTones = getOpts('skinTone');
    const combinedFaceShapes = getOpts('faceShape');
    const combinedEyeShapes = getOpts('eyeShape');
    const combinedEyeColors = getOpts('eyeColor');
    const combinedHairStyles = getOpts('hairStyle');
    const combinedHairColors = getOpts('hairColor');
    const combinedHairTextures = getOpts('hairTexture');
    const combinedFacialFeatures = getOpts('facialFeatures');
    const combinedBodyTypes = getOpts('bodyType');
    const combinedClothingStyles = getOpts('clothingStyle');
    const combinedClothingColors = getOpts('clothingColor');
    const combinedClothingDetails = getOpts('clothingDetail');
    const combinedAccessories = getOpts('accessories');
    const combinedWeapons = getOpts('weapons');
    const combinedPersonalities = getOpts('personality');
    const combinedMoods = getOpts('currentMood');


    setForm(prev => ({
      ...prev,
      seed: Math.random().toString(36).substring(7).toUpperCase(),
      visualDescriptionOverride: '',
      dialogueExample: '',
      attr: {
        ...prev.attr,
        gender: combinedGenders.length > 0 ? randomItem(combinedGenders) : defaultAttributes.gender,
        ageGroup: combinedAgeGroups.length > 0 ? randomItem(combinedAgeGroups) : defaultAttributes.ageGroup,
        skinTone: combinedSkinTones.length > 0 ? randomItem(combinedSkinTones) : defaultAttributes.skinTone,
        faceShape: combinedFaceShapes.length > 0 ? randomItem(combinedFaceShapes) : defaultAttributes.faceShape,
        eyeColor: combinedEyeColors.length > 0 ? randomItem(combinedEyeColors) : defaultAttributes.eyeColor,
        hairStyle: combinedHairStyles.length > 0 ? randomItem(combinedHairStyles) : defaultAttributes.hairStyle,
        hairColor: combinedHairColors.length > 0 ? randomItem(combinedHairColors) : defaultAttributes.hairColor,
        bodyType: combinedBodyTypes.length > 0 ? randomItem(combinedBodyTypes) : defaultAttributes.bodyType,
        clothingStyle: combinedClothingStyles.length > 0 ? randomItem(combinedClothingStyles) : defaultAttributes.clothingStyle,
        clothingColor: Math.random() > 0.5 && combinedClothingColors.length > 0 ? randomItem(combinedClothingColors) : '',
        clothingDetail: Math.random() > 0.7 && combinedClothingDetails.length > 0 ? randomItem(combinedClothingDetails) : '',
        personality: combinedPersonalities.length > 0 ? randomItem(combinedPersonalities) : defaultAttributes.personality,
        currentMood: combinedMoods.length > 0 ? randomItem(combinedMoods) : defaultAttributes.currentMood,
        accessories: combinedAccessories.length > 0 ? randomItems(combinedAccessories, 2) : [],
        facialFeatures: combinedFacialFeatures.length > 0 ? randomItems(combinedFacialFeatures, 1) : [],
        weapons: Math.random() > 0.7 && combinedWeapons.length > 0 ? [randomItem(combinedWeapons)] : [],
        eyeShape: combinedEyeShapes.length > 0 ? randomItem(combinedEyeShapes) : defaultAttributes.eyeShape,
        hairTexture: combinedHairTextures.length > 0 ? randomItem(combinedHairTextures) : defaultAttributes.hairTexture,
      }
    }));
    setCharacterImageUrl(null);
    setImageError(null);
  };

  const handleCreateNewCharacter = () => {
    setActiveCharId(null);
  };

  const handleAddCustomOptionClick = () => {
    if (newCustomOptionValue.trim() && selectedManageCategory) {
      // Check for duplicate value within the same attributeKey
      const isDuplicate = customOptions.some(
        opt => opt.value.trim() === newCustomOptionValue.trim() && opt.attributeKey === selectedManageCategory
      );
      if (isDuplicate) {
        alert('ตัวเลือกนี้มีอยู่แล้วในหมวดหมู่เดียวกัน!');
        return;
      }

      onAddCustomOption({
        id: Date.now().toString(),
        value: newCustomOptionValue.trim(),
        attributeKey: selectedManageCategory
      });
      setNewCustomOptionValue('');
    }
  };

  // Helper to get options from customOptions prop based on attribute key
  const getCombinedOptions = (key: keyof CharacterAttributes) => { 
    return customOptions
      .filter(opt => opt.attributeKey === key)
      .map(opt => opt.value);
  };

  // Helper to get tag options from customOptions prop based on attribute key
  const getCombinedTagOptions = (key: keyof CharacterAttributes) => {
    return customOptions
      .filter(opt => opt.attributeKey === key)
      .map(opt => opt.value);
  };

  // New: Image generation handlers
  const handleGenerateImage = async () => {
    setIsImageGenerating(true);
    setImageError(null);
    setCharacterImageUrl(null);

    if (!activeCharacterApiKey?.key) {
      onOpenApiKeyManager();
      setImageError("ไม่พบ API Key. โปรดตั้งค่า API Key เพื่อสร้างภาพ.");
      setIsImageGenerating(false);
      return;
    }

    try {
      // Step 1: Conditionally check and open aistudio API key selection if window.aistudio is available
      if (aistudioAvailable) {
        // handleAistudioApiKeySelection will prompt user and return true if selection happened, false if aistudio not available
        const selectedViaAistudio = await handleAistudioApiKeySelection('gemini-3-pro-image-preview');
        if (!selectedViaAistudio) {
          // If aistudio was available but key selection failed or user cancelled, stop here
          setImageError("การเลือก API Key ผ่าน AI Studio ถูกยกเลิกหรือไม่สำเร็จ.");
          setIsImageGenerating(false);
          setAistudioKeySelected(false);
          return;
        }
        // If selection happened, we optimistically assume it's good and proceed.
        // The service function will create a new instance and pick up the updated process.env.API_KEY if applicable.
        setAistudioKeySelected(true);
      } 
      // If aistudio is not available, or selection completed, proceed with API call using activeCharacterApiKey.key
      
      const prompt = generateDescription();
      const imageUrl = await generateCharacterImage(prompt, activeCharacterApiKey.key);
      setCharacterImageUrl(imageUrl);

    } catch (e: any) {
      console.error("Error generating character image:", e);
      setImageError(e.message || "ไม่สามารถสร้างภาพได้. โปรดตรวจสอบ API Key หรือลองอีกครั้ง.");
      // Specific handling for "Requested entity was not found." as per guidelines
      if (e.message && e.message.includes("Requested entity was not found.") && aistudioAvailable) {
        setAistudioKeySelected(false);
      }
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleClearImage = () => {
    setCharacterImageUrl(null);
    setImageError(null);
  };

  const handleDownloadImage = () => {
    if (characterImageUrl) {
      const link = document.createElement('a');
      link.href = characterImageUrl;
      link.download = `${form.nameEn || 'character'}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Determine if the "Generate Image" button should be interactable
  const isGenerateImageButtonDisabled = isImageGenerating || !aistudioKeyCheckCompleted || (aistudioAvailable && !aistudioKeySelected) || !activeCharacterApiKey?.key;


  // Pre-fetch combined options for rendering
  const combinedGenders = getCombinedOptions('gender');
  const combinedAgeGroups = getCombinedOptions('ageGroup');
  const combinedSkinTones = getCombinedOptions('skinTone');
  const combinedFaceShapes = getCombinedOptions('faceShape');
  const combinedEyeShapes = getCombinedOptions('eyeShape');
  const combinedEyeColors = getCombinedOptions('eyeColor');
  const combinedHairStyles = getCombinedOptions('hairStyle');
  const combinedHairColors = getCombinedOptions('hairColor');
  const combinedHairTextures = getCombinedOptions('hairTexture');
  const combinedFacialFeatures = getCombinedTagOptions('facialFeatures');
  const combinedBodyTypes = getCombinedOptions('bodyType');
  const combinedClothingStyles = getCombinedOptions('clothingStyle');
  const combinedClothingColors = getCombinedOptions('clothingColor');
  const combinedClothingDetails = getCombinedOptions('clothingDetail');
  const combinedAccessories = getCombinedTagOptions('accessories');
  const combinedWeapons = getCombinedTagOptions('weapons');
  const combinedPersonalities = getCombinedOptions('personality');
  const combinedMoods = getCombinedOptions('currentMood');


  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[80vh]">
      
      {/* Sidebar: Character List */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-64' : 'w-14'} bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col shrink-0`}>
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            {isSidebarOpen && <h3 className="text-white font-bold flex items-center gap-2"><User size={18}/> ตัวละครของคุณ ({characters.length})</h3>}
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors"
                title={isSidebarOpen ? "ซ่อนรายการตัวละคร" : "แสดงรายการตัวละคร"}
              >
                {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
        </div>
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {characters.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-8">
                      ยังไม่มีตัวละคร
                  </div>
              )}
              {characters.map(char => (
                  <div 
                      key={char.id}
                      onClick={() => setActiveCharId(char.id)}
                      className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${
                          activeCharId === char.id 
                          ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-100' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                  >
                      <div className="font-bold text-sm truncate">{char.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{char.nameEn}</div>
                      <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char.id); }}
                          className="absolute right-2 top-2 text-slate-600 hover:text-red-400 transition-colors"
                          title="ลบตัวละครนี้"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
              ))}
          </div>
        )}
      </div>

      {/* Main Form */}
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl flex flex-col relative z-[1000]">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-bold">
              {activeCharId ? `แก้ไขตัวละคร: ${form.name}` : "สร้างตัวละครใหม่"}
            </h2>
            <button 
              onClick={handleCreateNewCharacter}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-2"
              title="สร้างตัวละครเปล่า"
            >
              <Plus size={14}/> ใหม่
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center gap-2"
            >
              <Save size={16}/> บันทึกตัวละคร
            </button>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-2"
            >
              <ChevronLeft size={16}/> ย้อนกลับ
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Panel: Character Attributes */}
          <div className="space-y-6">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Sparkles size={16}/> ภาพตัวละคร (Character Visual Preview)
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-auto bg-slate-800 rounded-lg flex items-center justify-center p-4 min-h-[250px] relative overflow-hidden">
                  {isImageGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-emerald-400 z-10 animate-pulse">
                      <Loader2 size={36} className="animate-spin mb-2" />
                      <p className="text-sm">กำลังสร้างภาพ...</p>
                      <p className="text-xs text-slate-400 mt-1">อาจใช้เวลาสักครู่</p>
                    </div>
                  )}
                  {imageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 text-red-300 z-10 p-4 text-center">
                      <AlertCircle size={36} className="mb-2" />
                      <p className="text-sm font-bold">เกิดข้อผิดพลาด</p>
                      <p className="text-xs">{imageError}</p>
                      <a 
                          href="https://ai.google.dev/gemini-api/docs/billing" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-red-200 hover:underline mt-2"
                      >
                          ข้อมูลเพิ่มเติมเกี่ยวกับการเรียกเก็บเงิน
                      </a>
                    </div>
                  )}
                  {characterImageUrl ? (
                    <>
                      <img 
                        src={characterImageUrl} 
                        alt="Generated Character" 
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button 
                          onClick={handleDownloadImage}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors"
                          title="ดาวน์โหลดภาพ"
                        >
                          <Download size={16}/>
                        </button>
                        <button 
                          onClick={handleClearImage}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors"
                          title="ลบภาพ"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">ไม่มีภาพพรีวิว (คลิก 'สร้างภาพตัวละคร')</p>
                  )}
                </div>
                {!aistudioKeyCheckCompleted && (
                  <div className="text-center p-2 bg-slate-800 rounded-lg text-amber-400 text-xs flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin"/>
                    กำลังตรวจสอบสถานะ API Key สำหรับสร้างภาพ...
                  </div>
                )}
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerateImageButtonDisabled}
                  className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isGenerateImageButtonDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20'
                  }`}
                >
                  {isImageGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin"/> กำลังสร้างภาพ...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16}/> สร้างภาพตัวละคร (Generate Image)
                    </>
                  )}
                </button>
                {aistudioKeyCheckCompleted && aistudioAvailable && !aistudioKeySelected && !isImageGenerating && (
                  <button 
                    onClick={onOpenApiKeyManager}
                    className="text-xs text-center text-amber-500 cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <Key size={12} />
                    <AlertCircle size={12} className="inline mr-1"/>
                    สำหรับ `gemini-3-pro-image-preview` ต้องเลือก API Key ที่มีการเรียกเก็บเงิน
                  </button>
                )}
                {aistudioKeyCheckCompleted && !aistudioAvailable && !activeCharacterApiKey?.key && !isImageGenerating && (
                  <button 
                    onClick={onOpenApiKeyManager}
                    className="text-xs text-center text-amber-500 cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <Key size={12} />
                    <AlertCircle size={12} className="inline mr-1"/>
                    ไม่พบ `window.aistudio`. โปรดตั้งค่า API Key (Character) ผ่านตัวจัดการ API Key
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Dna size={16}/> ข้อมูลพื้นฐาน (Basics)
              </h3>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ชื่อตัวละคร (ไทย)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ชื่อตัวละคร (อังกฤษ)</label>
                <input 
                  type="text" 
                  value={form.nameEn} 
                  onChange={e => setForm(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="Character Name (English)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Seed (เพื่อสุ่มซ้ำ)</label>
                <input 
                  type="text" 
                  value={form.seed} 
                  readOnly
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-sm font-mono outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">รายละเอียดภาพ (Visual Description Override)</label>
                <textarea 
                  value={form.visualDescriptionOverride} 
                  onChange={e => setForm(prev => ({ ...prev, visualDescriptionOverride: e.target.value }))}
                  placeholder="หากต้องการเขียนรายละเอียดภาพเองทั้งหมด (ระบบจะใช้ข้อความนี้แทนการสร้างอัตโนมัติ)"
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">บทพูดตัวอย่าง (Dialogue Example)</label>
                <textarea 
                  value={form.dialogueExample} 
                  onChange={e => setForm(prev => ({ ...prev, dialogueExample: e.target.value }))}
                  placeholder="เช่น 'โลกนี้มันช่างน่าเบื่อจริงๆ...'"
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                />
              </div>
              <button 
                onClick={handleRandomize}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw size={16}/> สุ่มคุณลักษณะทั้งหมด
              </button>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Filter size={16}/> จัดการตัวเลือกเอง (Custom Options)
              </h3>
              <div className="mb-4">
                <label className="block text-slate-400 text-xs font-semibold mb-1">เลือกหมวดหมู่</label>
                <select 
                  value={selectedManageCategory}
                  onChange={(e) => setSelectedManageCategory(e.target.value as keyof CharacterAttributes)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS.map(key => (
                    <option key={key} value={key}>{ATTRIBUTE_CATEGORIES_MAP[key]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newCustomOptionValue}
                  onChange={e => setNewCustomOptionValue(e.target.value)}
                  placeholder={ATTRIBUTE_PLACEHOLDER_MAP[selectedManageCategory] || "เพิ่มตัวเลือกใหม่..."}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                />
                <button 
                  onClick={handleAddCustomOptionClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center gap-2"
                >
                  <Plus size={16}/> เพิ่ม
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                {customOptions.filter(opt => opt.attributeKey === selectedManageCategory).map(opt => (
                  <div key={opt.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-300 text-sm">{opt.value}</span>
                    <button 
                      onClick={() => onRemoveCustomOption(opt.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Detailed Attributes */}
          <div className="space-y-6 overflow-y-auto pr-2 pb-6">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Palette size={16}/> รูปลักษณ์ (Appearance)
              </h3>
              
              {/* Gender */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">เพศ (Gender)</label>
                <select 
                  value={form.attr.gender} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, gender: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedGenders.length > 0 ? (
                    combinedGenders.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">กลุ่มอายุ (Age Group)</label>
                <select 
                  value={form.attr.ageGroup} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, ageGroup: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedAgeGroups.length > 0 ? (
                    combinedAgeGroups.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">สีผิว (Skin Tone)</label>
                <select 
                  value={form.attr.skinTone} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, skinTone: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedSkinTones.length > 0 ? (
                    combinedSkinTones.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>
              
              {/* Face Shape */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">รูปหน้า (Face Shape)</label>
                <select 
                  value={form.attr.faceShape} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, faceShape: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedFaceShapes.length > 0 ? (
                    combinedFaceShapes.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Eye Shape */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">รูปร่างตา (Eye Shape)</label>
                <select 
                  value={form.attr.eyeShape} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, eyeShape: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedEyeShapes.length > 0 ? (
                    combinedEyeShapes.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Eye Color */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">สีตา (Eye Color)</label>
                <select 
                  value={form.attr.eyeColor} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, eyeColor: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedEyeColors.length > 0 ? (
                    combinedEyeColors.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ทรงผม (Hair Style)</label>
                <select 
                  value={form.attr.hairStyle} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, hairStyle: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedHairStyles.length > 0 ? (
                    combinedHairStyles.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">สีผม (Hair Color)</label>
                <select 
                  value={form.attr.hairColor} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, hairColor: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedHairColors.length > 0 ? (
                    combinedHairColors.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Hair Texture */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ลักษณะเส้นผม (Hair Texture)</label>
                <select 
                  value={form.attr.hairTexture} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, hairTexture: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedHairTextures.length > 0 ? (
                    combinedHairTextures.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Facial Features (Tags) */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">จุดเด่นบนใบหน้า (Facial Features)</label>
                <div className="flex flex-wrap gap-2">
                  {combinedFacialFeatures.length > 0 ? (
                    combinedFacialFeatures.map(option => (
                      <span 
                        key={option} 
                        onClick={() => toggleTag('facialFeatures', option)}
                        className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-all ${
                          form.attr.facialFeatures.includes(option) 
                            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-100' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {option}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">(ไม่มีตัวเลือก)</p>
                  )}
                </div>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">รูปร่าง (Body Type)</label>
                <select 
                  value={form.attr.bodyType} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, bodyType: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedBodyTypes.length > 0 ? (
                    combinedBodyTypes.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Shirt size={16}/> เครื่องแต่งกาย & ของใช้ (Attire & Items)
              </h3>
              
              {/* Clothing Style */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">สไตล์ชุด (Clothing Style)</label>
                <select 
                  value={form.attr.clothingStyle} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, clothingStyle: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedClothingStyles.length > 0 ? (
                    combinedClothingStyles.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Clothing Color */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">สีชุด (Color)</label>
                <select 
                  value={form.attr.clothingColor} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, clothingColor: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  <option value="">(ไม่ระบุ)</option>
                  {combinedClothingColors.length > 0 ? (
                    combinedClothingColors.map(option => <option key={option} value={option}>{option}</option>)
                  ) : null}
                </select>
              </div>

              {/* Clothing Detail */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">รายละเอียดชุด (Detail)</label>
                <select 
                  value={form.attr.clothingDetail} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, clothingDetail: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  <option value="">(ไม่ระบุ)</option>
                  {combinedClothingDetails.length > 0 ? (
                    combinedClothingDetails.map(option => <option key={option} value={option}>{option}</option>)
                  ) : null}
                </select>
              </div>

              {/* Accessories (Tags) */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">เครื่องประดับ (Accessories)</label>
                <div className="flex flex-wrap gap-2">
                  {combinedAccessories.length > 0 ? (
                    combinedAccessories.map(option => (
                      <span 
                        key={option} 
                        onClick={() => toggleTag('accessories', option)}
                        className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-all ${
                          form.attr.accessories.includes(option) 
                            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-100' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {option}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">(ไม่มีตัวเลือก)</p>
                  )}
                </div>
              </div>

              {/* Weapons (Tags) */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">อาวุธ/ของถือ (Weapons)</label>
                <div className="flex flex-wrap gap-2">
                  {combinedWeapons.length > 0 ? (
                    combinedWeapons.map(option => (
                      <span 
                        key={option} 
                        onClick={() => toggleTag('weapons', option)}
                        className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-all ${
                          form.attr.weapons.includes(option) 
                            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-100' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {option}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">(ไม่มีตัวเลือก)</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Smile size={16}/> อุปนิสัย & อารมณ์ (Personality & Mood)
              </h3>
              
              {/* Personality */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">บุคลิกภาพ (Personality)</label>
                <select 
                  value={form.attr.personality} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, personality: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedPersonalities.length > 0 ? (
                    combinedPersonalities.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>

              {/* Current Mood */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">อารมณ์ปัจจุบัน (Current Mood)</label>
                <select 
                  value={form.attr.currentMood} 
                  onChange={e => setForm(prev => ({ ...prev, attr: { ...prev.attr, currentMood: e.target.value } }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  {combinedMoods.length > 0 ? (
                    combinedMoods.map(option => <option key={option} value={option}>{option}</option>)
                  ) : (
                    <option value="">(ไม่มีตัวเลือก)</option>
                  )}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterStudio;
