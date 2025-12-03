

import React, { useState, useEffect } from 'react';
import { Character, CharacterAttributes, CustomOption, ApiKey } from '../types';
import { generateCharacterImage, handleAistudioApiKeySelection } from '../services/geminiService';
import { User, Save, Trash2, RefreshCw, Sparkles, Wand2, Palette, Smile, Shirt, Dna, Plus, Filter, Loader2, Download, X, AlertCircle, Key, Upload, ImageIcon, Bird } from 'lucide-react';

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

const ATTRIBUTE_CATEGORIES_MAP: { [K in keyof CharacterAttributes]: string } = {
  species: 'เผ่าพันธุ์ (Species)',
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

const CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS: (keyof CharacterAttributes)[] = [
  'species', 'gender', 'ageGroup', 'skinTone', 'faceShape', 'eyeShape', 'eyeColor',
  'hairStyle', 'hairColor', 'hairTexture', 'facialFeatures', 'bodyType',
  'clothingStyle', 'clothingColor', 'clothingDetail', 'accessories', 'weapons',
  'personality', 'currentMood',
];

const DEFAULT_CHARACTER_OPTIONS: { [K in keyof CharacterAttributes]: string[] } = {
  species: ['Human (มนุษย์)', 'Elf (เอลฟ์)', 'Robot/Android (หุ่นยนต์)', 'Cat (แมว)', 'Dog (สุนัข)', 'Alien (เอเลี่ยน)', 'Demon (ปีศาจ)', 'Angel (นางฟ้า)'],
  gender: ['Male (ชาย)', 'Female (หญิง)', 'Non-binary (ไม่ระบุเพศ)'],
  ageGroup: ['Child (วัยเด็ก)', 'Teenager (วัยรุ่น)', 'Young Adult (วัยหนุ่มสาว)', 'Adult (ผู้ใหญ่)', 'Elderly (ผู้สูงอายุ)'],
  skinTone: ['Fair (ขาวอมชมพู)', 'Medium (ผิวสองสี)', 'Olive (ผิวสีน้ำผึ้ง)', 'Brown (ผิวน้ำตาล)', 'Dark (ผิวดำ)', 'Pale (ซีด)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Metal (โลหะ)'],
  faceShape: ['Oval (รูปไข่)', 'Round (กลม)', 'Square (เหลี่ยม)', 'Heart (รูปหัวใจ)', 'Diamond (รูปเพชร)', 'Long (ยาว)'],
  eyeShape: ['Almond (อัลมอนด์)', 'Round (กลม)', 'Narrow (เรียวเล็ก)', 'Wide (กว้าง)', 'Hooded (หนังตาตก)'],
  eyeColor: ['Brown (น้ำตาล)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Hazel (น้ำตาลอ่อน)', 'Gray (เทา)', 'Black (ดำ)', 'Red (แดง)', 'Purple (ม่วง)', 'Gold (ทอง)', 'Glowing (เรืองแสง)'],
  hairStyle: ['Short (สั้น)', 'Medium (ประบ่า)', 'Long (ยาว)', 'Bald (หัวล้าน)', 'Buzz Cut (สกินเฮด)', 'Bob (บ๊อบ)', 'Ponytail (หางม้า)', 'Braids (ถักเปีย)', 'Messy (ยุ่งๆ)', 'Spiky (ชี้ตั้ง)'],
  hairColor: ['Black (ดำ)', 'Brown (น้ำตาล)', 'Blonde (บลอนด์)', 'Red (แดง)', 'White (ขาว)', 'Gray (เทา)', 'Blue (ฟ้า)', 'Pink (ชมพู)', 'Purple (ม่วง)', 'Green (เขียว)', 'Rainbow (สีรุ้ง)'],
  hairTexture: ['Straight (ตรง)', 'Wavy (เป็นคลื่น)', 'Curly (หยิก)', 'Coily (ขดเป็นวง)'],
  facialFeatures: ['None (ไม่มี)', 'Freckles (กระ)', 'Scar (แผลเป็น)', 'Mole (ไฝ)', 'Beard (เครา)', 'Mustache (หนวด)', 'Tattoos (รอยสัก)', 'Glasses (แว่นตา)'],
  bodyType: ['Average (ทั่วไป)', 'Slim (ผอมบาง)', 'Athletic (สมส่วน/นักกีฬา)', 'Muscular (กล้ามเนื้อ)', 'Curvy (อวบอั๋น)', 'Heavy (ท้วม)', 'Robotic (หุ่นยนต์)'],
  clothingStyle: ['Casual (ลำลอง)', 'Formal (ทางการ)', 'Sport (กีฬา)', 'Fantasy (แฟนตาซี)', 'Sci-Fi (ไซไฟ)', 'Vintage (วินเทจ)', 'Streetwear (สตรีท)', 'Traditional (ชุดประจำชาติ)', 'Armor (เกราะ)'],
  clothingColor: ['White (ขาว)', 'Black (ดำ)', 'Red (แดง)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Yellow (เหลือง)', 'Orange (ส้ม)', 'Purple (ม่วง)', 'Pink (ชมพู)', 'Gold (ทอง)', 'Silver (เงิน)'],
  clothingDetail: ['Plain (เรียบๆ)', 'Patterned (มีลวดลาย)', 'Striped (ลายทาง)', 'Floral (ลายดอก)', 'Leather (หนัง)', 'Denim (ยีนส์)', 'Silk (ไหม)', 'Cybernetic Parts (ชิ้นส่วนจักรกล)'],
  accessories: ['None (ไม่มี)', 'Necklace (สร้อยคอ)', 'Earrings (ต่างหู)', 'Hat (หมวก)', 'Scarf (ผ้าพันคอ)', 'Headphones (หูฟัง)', 'Backpack (กระเป๋าเป้)', 'Cape (ผ้าคลุม)'],
  weapons: ['None (ไม่มี)', 'Sword (ดาบ)', 'Gun (ปืน)', 'Staff (คทา)', 'Bow (ธนู)', 'Shield (โล่)', 'Dagger (มีดสั้น)'],
  personality: ['Brave (กล้าหาญ)', 'Shy (ขี้อาย)', 'Cheerful (ร่าเริง)', 'Serious (จริงจัง)', 'Funny (ตลก)', 'Grumpy (ขี้หงุดหงิด)', 'Mysterious (ลึกลับ)', 'Evil (ชั่วร้าย)'],
  currentMood: ['Neutral (ปกติ)', 'Happy (มีความสุข)', 'Sad (เศร้า)', 'Angry (โกรธ)', 'Surprised (ตกใจ)', 'Scared (กลัว)', 'Determined (มุ่งมั่น)'],
};

const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, onSaveCharacter, onDeleteCharacter, onBack, customOptions, onAddCustomOption, onRemoveCustomOption, activeCharacterApiKey, onOpenApiKeyManager }) => {
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [newCustomOptionValue, setNewCustomOptionValue] = useState('');
  const [selectedManageCategory, setSelectedManageCategory] = useState<keyof CharacterAttributes>( 
    CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS[0]
  );

  // Image Generation States
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Reference Image Upload State
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // API Key States
  const [aistudioKeySelected, setAistudioKeySelected] = useState(false);
  const [aistudioKeyCheckCompleted, setAistudioKeyCheckCompleted] = useState(false);
  const [aistudioAvailable, setAistudioAvailable] = useState(false);


  const defaultAttributes: CharacterAttributes = {
    species: 'Human (มนุษย์)',
    gender: 'Male (ชาย)',
    ageGroup: 'Young Adult (วัยหนุ่มสาว 20-35)',
    skinTone: 'Fair (ขาวอมชมพู)',
    faceShape: 'Oval (รูปไข่)',
    eyeShape: 'Almond (อัลมอนด์)',
    eyeColor: 'Brown (น้ำตาล)',
    hairStyle: 'Short / Side Part (สั้น/แสกข้าง)',
    hairColor: 'Black (ดำ)',
    hairTexture: 'Straight (ตรง)',
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

  useEffect(() => {
    const checkAistudioKey = async () => {
      // Cast window to any to avoid typescript errors with custom properties
      if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        setAistudioAvailable(true);
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setAistudioKeySelected(hasKey);
      } else {
        setAistudioAvailable(false);
        setAistudioKeySelected(true); 
        console.warn("window.aistudio object or hasSelectedApiKey function not found. Assuming API Key is managed externally.");
      }
      setAistudioKeyCheckCompleted(true);
    };
    checkAistudioKey();
  }, []);

  useEffect(() => {
    if (activeCharId) {
      const char = characters.find(c => c.id === activeCharId);
      if (char) {
        setForm({
          name: char.name,
          nameEn: char.nameEn,
          seed: char.seed,
          attr: { ...defaultAttributes, ...char.attributes },
          visualDescriptionOverride: char.visualDescriptionOverride || '',
          dialogueExample: char.dialogueExample || ''
        });
        setCharacterImageUrl(char.imageUrl || null);
        setImageError(null);
        setReferenceImage(null); // Reset ref image when switching chars
      }
    } else {
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
      setReferenceImage(null);
    }
  }, [activeCharId, characters]);

  const cleanVal = (val: string) => {
    if (!val) return '';
    if (val.includes('(') && val.includes(')')) {
      return val.split('(')[0].trim();
    }
    return val.trim();
  };

  const toggleTag = (category: keyof CharacterAttributes, value: string) => {
    setForm(prev => {
      const currentList = prev.attr[category] as string[];
      const newList = currentList.includes(value) 
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, attr: { ...prev.attr, [category]: newList } };
    });
  };

  const generateDescription = () => {
    const { attr, nameEn, visualDescriptionOverride } = form;

    if (visualDescriptionOverride.trim()) {
      return visualDescriptionOverride.trim();
    }

    const species = cleanVal(attr.species) || 'Human';
    const gender = cleanVal(attr.gender);
    const age = cleanVal(attr.ageGroup).split(' ')[0];
    const skin = cleanVal(attr.skinTone);
    const hair = `${cleanVal(attr.hairColor)} ${cleanVal(attr.hairStyle)}`;
    const clothes = `${attr.clothingColor} ${cleanVal(attr.clothingStyle)} ${attr.clothingDetail}`;
    const eyes = `${cleanVal(attr.eyeColor)} eyes`;
    
    // Updated Logic: Include Species in the prompt
    let desc = `A ${age} ${gender} ${species} named ${nameEn}, ${skin} skin, ${eyes}, ${hair} hair, ${cleanVal(attr.bodyType)} body.`;
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

  const getCombinedOptions = (key: keyof CharacterAttributes) => { 
    // Merge defaults with custom options
    const defaults = DEFAULT_CHARACTER_OPTIONS[key] || [];
    const customs = customOptions.filter(opt => opt.attributeKey === key).map(opt => opt.value);
    // Remove duplicates
    return Array.from(new Set([...defaults, ...customs]));
  };

  const handleRandomize = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomItems = (arr: string[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.floor(Math.random() * (count + 1)));
    };
    
    const getOpts = (k: keyof CharacterAttributes) => getCombinedOptions(k);

    setForm(prev => ({
      ...prev,
      seed: Math.random().toString(36).substring(7).toUpperCase(),
      visualDescriptionOverride: '',
      dialogueExample: '',
      attr: {
        ...prev.attr,
        species: getOpts('species').length > 0 ? randomItem(getOpts('species')) : defaultAttributes.species,
        gender: getOpts('gender').length > 0 ? randomItem(getOpts('gender')) : defaultAttributes.gender,
        ageGroup: getOpts('ageGroup').length > 0 ? randomItem(getOpts('ageGroup')) : defaultAttributes.ageGroup,
        skinTone: getOpts('skinTone').length > 0 ? randomItem(getOpts('skinTone')) : defaultAttributes.skinTone,
        faceShape: getOpts('faceShape').length > 0 ? randomItem(getOpts('faceShape')) : defaultAttributes.faceShape,
        eyeColor: getOpts('eyeColor').length > 0 ? randomItem(getOpts('eyeColor')) : defaultAttributes.eyeColor,
        hairStyle: getOpts('hairStyle').length > 0 ? randomItem(getOpts('hairStyle')) : defaultAttributes.hairStyle,
        hairColor: getOpts('hairColor').length > 0 ? randomItem(getOpts('hairColor')) : defaultAttributes.hairColor,
        bodyType: getOpts('bodyType').length > 0 ? randomItem(getOpts('bodyType')) : defaultAttributes.bodyType,
        clothingStyle: getOpts('clothingStyle').length > 0 ? randomItem(getOpts('clothingStyle')) : defaultAttributes.clothingStyle,
        clothingColor: Math.random() > 0.5 && getOpts('clothingColor').length > 0 ? randomItem(getOpts('clothingColor')) : '',
        clothingDetail: Math.random() > 0.7 && getOpts('clothingDetail').length > 0 ? randomItem(getOpts('clothingDetail')) : '',
        personality: getOpts('personality').length > 0 ? randomItem(getOpts('personality')) : defaultAttributes.personality,
        currentMood: getOpts('currentMood').length > 0 ? randomItem(getOpts('currentMood')) : defaultAttributes.currentMood,
        accessories: getOpts('accessories').length > 0 ? randomItems(getOpts('accessories'), 2) : [],
        facialFeatures: getOpts('facialFeatures').length > 0 ? randomItems(getOpts('facialFeatures'), 1) : [],
        weapons: Math.random() > 0.7 && getOpts('weapons').length > 0 ? [randomItem(getOpts('weapons'))] : [],
        eyeShape: getOpts('eyeShape').length > 0 ? randomItem(getOpts('eyeShape')) : defaultAttributes.eyeShape,
        hairTexture: getOpts('hairTexture').length > 0 ? randomItem(getOpts('hairTexture')) : defaultAttributes.hairTexture,
      }
    }));
    setCharacterImageUrl(null);
    setImageError(null);
  };

  const handleCreateNewCharacter = () => {
    setActiveCharId(null);
    setReferenceImage(null);
  };

  const handleAddCustomOptionClick = () => {
    if (newCustomOptionValue.trim() && selectedManageCategory) {
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

  // Image Upload Handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setReferenceImage(base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClearReferenceImage = () => {
      setReferenceImage(null);
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
      if (aistudioAvailable) {
        const selectedViaAistudio = await handleAistudioApiKeySelection('gemini-3-pro-image-preview');
        if (!selectedViaAistudio) {
          setImageError("การเลือก API Key ผ่าน AI Studio ถูกยกเลิกหรือไม่สำเร็จ.");
          setIsImageGenerating(false);
          setAistudioKeySelected(false);
          return;
        }
        setAistudioKeySelected(true);
      } 
      
      const prompt = generateDescription();
      // Pass referenceImage if available
      const imageUrl = await generateCharacterImage(prompt, activeCharacterApiKey.key, referenceImage || undefined);
      setCharacterImageUrl(imageUrl);

    } catch (e: any) {
      console.error("Error generating character image:", e);
      setImageError(e.message || "ไม่สามารถสร้างภาพได้. โปรดตรวจสอบ API Key หรือลองอีกครั้ง.");
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

  const isGenerateImageButtonDisabled = isImageGenerating || !aistudioKeyCheckCompleted || (aistudioAvailable && !aistudioKeySelected) || !activeCharacterApiKey?.key;


  // Pre-fetch combined options using the helper
  const combinedSpecies = getCombinedOptions('species');
  const combinedGenders = getCombinedOptions('gender');
  const combinedAgeGroups = getCombinedOptions('ageGroup');
  const combinedSkinTones = getCombinedOptions('skinTone');
  const combinedFaceShapes = getCombinedOptions('faceShape');
  const combinedEyeShapes = getCombinedOptions('eyeShape');
  const combinedEyeColors = getCombinedOptions('eyeColor');
  const combinedHairStyles = getCombinedOptions('hairStyle');
  const combinedHairColors = getCombinedOptions('hairColor');
  const combinedHairTextures = getCombinedOptions('hairTexture');
  const combinedFacialFeatures = getCombinedOptions('facialFeatures');
  const combinedBodyTypes = getCombinedOptions('bodyType');
  const combinedClothingStyles = getCombinedOptions('clothingStyle');
  const combinedClothingColors = getCombinedOptions('clothingColor');
  const combinedClothingDetails = getCombinedOptions('clothingDetail');
  const combinedAccessories = getCombinedOptions('accessories');
  const combinedWeapons = getCombinedOptions('weapons');
  const combinedPersonalities = getCombinedOptions('personality');
  const combinedMoods = getCombinedOptions('currentMood');


  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[80vh]">
      
      {/* Sidebar: Character List */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-64' : 'w-14'} bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col shrink-0`}>
        {/* ... Sidebar content same as before ... */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            {isSidebarOpen && <h3 className="text-white font-bold flex items-center gap-2"><User size={18}/> ตัวละครของคุณ ({characters.length})</h3>}
            {/* ... */}
        </div>
        {/* ... Character List ... */}
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
              <User size={16}/> ไปที่ Storyboard
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
              
              {/* Image Generation Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-auto bg-slate-800 rounded-lg flex items-center justify-center p-4 min-h-[250px] relative overflow-hidden group">
                   {/* Reference Image Overlay (small) */}
                   {referenceImage && !isImageGenerating && !characterImageUrl && (
                      <div className="absolute top-2 right-2 w-20 h-20 bg-black/50 rounded-md border border-slate-600 overflow-hidden z-20">
                          <img src={referenceImage} alt="Ref" className="w-full h-full object-cover opacity-80" />
                          <button onClick={handleClearReferenceImage} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
                      </div>
                   )}

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
                    <div className="flex flex-col items-center text-slate-500 gap-2">
                        {!referenceImage ? (
                            <p className="text-sm">ไม่มีภาพพรีวิว</p>
                        ) : (
                            <div className="flex flex-col items-center">
                                <img src={referenceImage} alt="Ref Main" className="max-w-[150px] max-h-[150px] rounded border border-slate-600 mb-2 opacity-80" />
                                <p className="text-xs text-emerald-400">ใช้ภาพนี้เป็นต้นแบบ + Attributes</p>
                                <button onClick={handleClearReferenceImage} className="text-xs text-red-400 underline mt-1">ลบภาพต้นแบบ</button>
                            </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Reference Image Upload Control */}
                {!isImageGenerating && (
                    <div className="w-full flex justify-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            id="ref-image-upload"
                            className="hidden"
                        />
                        <label 
                            htmlFor="ref-image-upload"
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white cursor-pointer bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition-all"
                        >
                            <ImageIcon size={14} />
                            {referenceImage ? "เปลี่ยนภาพต้นแบบ (Change Reference)" : "อัปโหลดภาพต้นแบบ (Image-to-Character)"}
                        </label>
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
                      <Wand2 size={16}/> {referenceImage ? "สร้างตัวละครจากภาพ (Generate)" : "สร้างภาพตัวละคร (Generate)"}
                    </>
                  )}
                </button>
                {/* Warnings about keys ... same as before */}
              </div>
            </div>

            {/* ... Rest of the form (Basics, Custom Options) ... */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
               {/* ... Basics Fields ... */}
               <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Dna size={16}/> ข้อมูลพื้นฐาน (Basics)
              </h3>
              {/* Fields */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ชื่อตัวละคร (ไทย)</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="ชื่อตัวละคร"/>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">ชื่อตัวละคร (อังกฤษ)</label>
                <input type="text" value={form.nameEn} onChange={e => setForm(prev => ({ ...prev, nameEn: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="Name"/>
              </div>
               {/* ... Other basic fields ... */}
               <button onClick={handleRandomize} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2">
                <RefreshCw size={16}/> สุ่มคุณลักษณะทั้งหมด
              </button>
            </div>
            
            {/* Custom Options */}
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Filter size={16}/> จัดการตัวเลือกเอง (Custom Options)
              </h3>
               {/* ... Custom Options UI ... */}
               <div className="mb-4 mt-2">
                <select value={selectedManageCategory} onChange={(e) => setSelectedManageCategory(e.target.value as keyof CharacterAttributes)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                  {CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS.map(key => (
                    <option key={key} value={key}>{ATTRIBUTE_CATEGORIES_MAP[key]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newCustomOptionValue} onChange={e => setNewCustomOptionValue(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="เพิ่มตัวเลือก..."/>
                <button onClick={handleAddCustomOptionClick} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg"><Plus size={16}/></button>
              </div>
              <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                {customOptions.filter(opt => opt.attributeKey === selectedManageCategory).map(opt => (
                  <div key={opt.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-300 text-sm">{opt.value}</span>
                    <button onClick={() => onRemoveCustomOption(opt.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
             </div>
          </div>

          {/* Right Panel: Detailed Attributes */}
          <div className="space-y-6 overflow-y-auto pr-2 pb-6">
             {/* SPECIES (New) */}
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                 <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2"><Bird size={16}/> เผ่าพันธุ์ (Species)</h3>
                 <div><label className="block text-slate-400 text-xs font-semibold mb-1">เผ่าพันธุ์</label>
                 <select value={form.attr.species} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, species: e.target.value}}))} className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 font-bold text-sm outline-none">
                     {combinedSpecies.map(o => <option key={o} value={o}>{o}</option>)}
                 </select></div>
             </div>

             {/* APPEARANCE */}
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                 <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2"><Palette size={16}/> รูปลักษณ์ (Appearance)</h3>
                 
                 <div><label className="block text-slate-400 text-xs font-semibold mb-1">เพศ</label>
                 <select value={form.attr.gender} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, gender: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                     {combinedGenders.map(o => <option key={o} value={o}>{o}</option>)}
                 </select></div>

                 <div><label className="block text-slate-400 text-xs font-semibold mb-1">อายุ</label>
                 <select value={form.attr.ageGroup} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, ageGroup: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                     {combinedAgeGroups.map(o => <option key={o} value={o}>{o}</option>)}
                 </select></div>

                 <div><label className="block text-slate-400 text-xs font-semibold mb-1">สีผิว</label>
                 <select value={form.attr.skinTone} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, skinTone: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                     {combinedSkinTones.map(o => <option key={o} value={o}>{o}</option>)}
                 </select></div>

                 <div><label className="block text-slate-400 text-xs font-semibold mb-1">รูปหน้า</label>
                 <select value={form.attr.faceShape} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, faceShape: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                     {combinedFaceShapes.map(o => <option key={o} value={o}>{o}</option>)}
                 </select></div>
                 
                  {/* Eyes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">รูปร่างตา</label>
                    <select value={form.attr.eyeShape} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, eyeShape: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedEyeShapes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">สีตา</label>
                    <select value={form.attr.eyeColor} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, eyeColor: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedEyeColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                  </div>

                  {/* Hair */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3"><label className="block text-slate-400 text-xs font-semibold mb-1">ทรงผม</label>
                    <select value={form.attr.hairStyle} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, hairStyle: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedHairStyles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                    <div className="col-span-2"><label className="block text-slate-400 text-xs font-semibold mb-1">สีผม</label>
                    <select value={form.attr.hairColor} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, hairColor: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedHairColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                     <div><label className="block text-slate-400 text-xs font-semibold mb-1">ลักษณะผม</label>
                    <select value={form.attr.hairTexture} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, hairTexture: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedHairTextures.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                  </div>
             </div>

             {/* Clothing Section */}
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2"><Shirt size={16}/> เครื่องแต่งกาย</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2"><label className="block text-slate-400 text-xs font-semibold mb-1">สไตล์</label>
                    <select value={form.attr.clothingStyle} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, clothingStyle: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedClothingStyles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">สีหลัก</label>
                    <select value={form.attr.clothingColor} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, clothingColor: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedClothingColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">รายละเอียด</label>
                    <select value={form.attr.clothingDetail} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, clothingDetail: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                         <option value="">(ไม่มี)</option>
                        {combinedClothingDetails.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                </div>
                <div><label className="block text-slate-400 text-xs font-semibold mb-1">เครื่องประดับ</label>
                    <div className="flex flex-wrap gap-2">
                        {combinedAccessories.map(acc => (
                            <span key={acc} onClick={() => toggleTag('accessories', acc)} className={`cursor-pointer px-2 py-1 text-xs rounded border ${form.attr.accessories.includes(acc) ? 'bg-emerald-900 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{acc}</span>
                        ))}
                    </div>
                </div>
             </div>

             {/* Personality Section */}
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-slate-300 font-bold uppercase text-xs tracking-wider flex items-center gap-2"><Smile size={16}/> อุปนิสัย</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">บุคลิกภาพ</label>
                    <select value={form.attr.personality} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, personality: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedPersonalities.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                    <div><label className="block text-slate-400 text-xs font-semibold mb-1">อารมณ์ปัจจุบัน</label>
                    <select value={form.attr.currentMood} onChange={e => setForm(prev => ({...prev, attr: {...prev.attr, currentMood: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {combinedMoods.map(o => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterStudio;
