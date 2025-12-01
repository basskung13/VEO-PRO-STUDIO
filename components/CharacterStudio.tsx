
import React, { useState, useEffect } from 'react';
import { Character, CharacterAttributes, CustomOption } from '../types';
import { User, Save, Trash2, RefreshCw, Sparkles, Wand2, Palette, Smile, Shirt, Scissors, Dna, Crown, Sword, MessagesSquare, ChevronLeft, ChevronRight, Plus, Tag, Filter } from 'lucide-react';

interface CharacterStudioProps {
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onBack: () => void;
  customOptions: CustomOption[]; // New prop
  onAddCustomOption: (option: CustomOption) => void; // New prop
  onRemoveCustomOption: (id: string) => void; // New prop
}

// These are now purely for `defaultAttributes` initialization and constants (like GENDERS, AGES)
// All options for selection/randomization are fetched from `customOptions` prop via getCombinedOptions/getCombinedTagOptions
const GENDERS = ['Male (ชาย)', 'Female (หญิง)', 'Non-binary (ไม่ระบุเพศ)', 'Robot/Android (หุ่นยนต์)', 'Monster (สัตว์ประหลาด)'];
const AGES = ['Infant (ทารก 0-2)', 'Child (เด็ก 3-12)', 'Teenager (วัยรุ่น 13-19)', 'Young Adult (วัยหนุ่มสาว 20-35)', 'Middle Aged (วัยกลางคน 36-55)', 'Elderly (ผู้สูงอายุ 60+)'];
const SKINS = ['Pale (ขาวซีด)', 'Fair (ขาวอมชมพู)', 'Light (ขาวเหลือง)', 'Tan (ผิวแทน)', 'Olive (ผิวสองสี)', 'Brown (ผิวคล้ำ)', 'Dark (ผิวดำเข้ม)', 'Blue (น้ำเงิน/เอเลี่ยน)', 'Green (เขียว/ออร์ค)', 'Metallic (โลหะ/หุ่นยนต์)'];
const FACES = ['Oval (รูปไข่)', 'Round (หน้ากลม)', 'Square (หน้าเหลี่ยม)', 'Diamond (หน้ารูปเพชร)', 'Chiseled (กรามชัด)', 'Gaunt (แก้มตอบ)', 'Scarred (มีแผลเป็น)'];
const EYES_COLORS = ['Brown (น้ำตาล)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Hazel (น้ำตาลอ่อน)', 'Grey (เทา)', 'Black (ดำ)', 'Red (แดง)', 'Purple (ม่วง)', 'Glowing (เรืองแสง)', 'Heterochromia (ตาสองสี)'];


// Map of attribute keys to their Thai display names for custom option categories
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
const CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS: (keyof CharacterAttributes)[] = [
  'gender', 'ageGroup', 'skinTone', 'faceShape', 'eyeShape', 'eyeColor',
  'hairStyle', 'hairColor', 'hairTexture', 'facialFeatures', 'bodyType',
  'clothingStyle', 'clothingColor', 'clothingDetail', 'accessories', 'weapons',
  'personality', 'currentMood',
];

// Map of attribute keys to their placeholder text suggestions for adding custom options
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


const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, onSaveCharacter, onDeleteCharacter, onBack, customOptions, onAddCustomOption, onRemoveCustomOption }) => {
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar visibility
  
  const [newCustomOptionValue, setNewCustomOptionValue] = useState('');
  
  // selectedManageCategory will now also serve as the category for new additions
  const [selectedManageCategory, setSelectedManageCategory] = useState<keyof CharacterAttributes>(
    CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS[0] // Default to the first category
  );


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
    visualDescriptionOverride: string; // New state for override
    dialogueExample: string; // New state field
  }>({
    name: '',
    nameEn: '',
    seed: Math.random().toString(36).substring(7).toUpperCase(),
    attr: { ...defaultAttributes },
    visualDescriptionOverride: '', // Initialize
    dialogueExample: '' // Initialize
  });

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
          visualDescriptionOverride: char.visualDescriptionOverride || '', // Load override
          dialogueExample: char.dialogueExample || '' // Load dialogue example
        });
      }
    } else {
      // Clear form for new character
      setForm({
        name: '',
        nameEn: '',
        seed: Math.random().toString(36).substring(7).toUpperCase(),
        attr: { ...defaultAttributes },
        visualDescriptionOverride: '', // Clear for new character
        dialogueExample: '' // Clear for new character
      });
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
      visualDescriptionOverride: form.visualDescriptionOverride.trim(), // Save override
      dialogueExample: form.dialogueExample.trim(), // Save dialogue example
      createdAt: Date.now()
    };

    onSaveCharacter(newChar);
    if (!activeCharId) { // If it was a new character, clear the form for another new one
        setForm({
            name: '',
            nameEn: '',
            seed: Math.random().toString(36).substring(7).toUpperCase(),
            attr: { ...defaultAttributes },
            visualDescriptionOverride: '',
            dialogueExample: ''
        });
        setActiveCharId(null); // Ensure no character is actively selected after saving a new one
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


    setForm(prev => ({
      ...prev, // Use previous state for name, nameEn
      seed: Math.random().toString(36).substring(7).toUpperCase(),
      visualDescriptionOverride: '', // Clear override on randomize
      dialogueExample: '', // Clear dialogue example on randomize
      attr: {
        ...prev.attr,
        gender: randomItem(combinedGenders),
        ageGroup: randomItem(combinedAgeGroups),
        skinTone: randomItem(combinedSkinTones),
        faceShape: randomItem(combinedFaceShapes),
        eyeColor: randomItem(combinedEyeColors),
        hairStyle: randomItem(combinedHairStyles),
        hairColor: randomItem(combinedHairColors),
        bodyType: randomItem(combinedBodyTypes),
        clothingStyle: randomItem(combinedClothingStyles),
        clothingColor: Math.random() > 0.5 ? randomItem(combinedClothingColors) : '',
        clothingDetail: Math.random() > 0.7 ? randomItem(combinedClothingDetails) : '',
        personality: randomItem(combinedPersonalities),
        currentMood: randomItem(combinedMoods),
        accessories: randomItems(combinedAccessories, 2),
        facialFeatures: randomItems(combinedFacialFeatures, 1),
        weapons: Math.random() > 0.7 ? [randomItem(combinedWeapons)] : [],
        eyeShape: randomItem(combinedEyeShapes),
        hairTexture: randomItem(combinedHairTextures),
      }
    }));
  };

  const handleCreateNewCharacter = () => {
    setActiveCharId(null); // This will trigger the useEffect to load a blank form
  };

  const handleAddCustomOptionClick = () => {
    if (newCustomOptionValue.trim() && selectedManageCategory) { // Use selectedManageCategory as the key
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
        attributeKey: selectedManageCategory // Use selectedManageCategory as the attributeKey
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
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {activeCharId ? <User className="text-emerald-400"/> : <Sparkles className="text-emerald-400"/>}
                {activeCharId ? 'แก้ไขตัวละคร' : 'สร้างตัวละครใหม่'}
             </h2>
             <div className="flex gap-2">
                {activeCharId && ( // Only show 'Create New' button when an existing character is being edited
                    <button 
                        onClick={handleCreateNewCharacter} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition-colors flex items-center gap-1"
                        title="สร้างตัวละครใหม่"
                    >
                        <Plus size={14} />
                        <span className="text-sm font-semibold">สร้างใหม่</span>
                    </button>
                )}
                <button 
                    onClick={handleRandomize}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700"
                >
                    <Wand2 size={14} /> สุ่มลักษณะ (Randomize)
                </button>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 0. Character Name */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-white border-b border-slate-800 pb-2">
                    <Tag size={18} />
                    <h3 className="font-bold">ชื่อตัวละคร (Character Name)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mb-1">ชื่อตัวละคร (ไทย)</label>
                        <input 
                            value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                            placeholder="ชื่อตัวละคร (ไทย)" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mb-1">Character Name (English)</label>
                        <input 
                            value={form.nameEn} onChange={e => setForm(p => ({...p, nameEn: e.target.value}))}
                            placeholder="Character Name (English)" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* 1. Basics */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <User size={18} />
                    <h3 className="font-bold">ข้อมูลพื้นฐาน (Basics)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.attr.gender} onChange={e => setForm(p => ({...p, attr: {...p.attr, gender: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedGenders.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.ageGroup} onChange={e => setForm(p => ({...p, attr: {...p.attr, ageGroup: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedAgeGroups.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.skinTone} onChange={e => setForm(p => ({...p, attr: {...p.attr, skinTone: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedSkinTones.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.bodyType} onChange={e => setForm(p => ({...p, attr: {...p.attr, bodyType: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedBodyTypes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                
                {/* Visual Description Override */}
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 block mb-1">คำบรรยายลักษณะตัวละครโดยละเอียด (Override)</label>
                    <textarea
                        value={form.visualDescriptionOverride}
                        onChange={e => setForm(p => ({ ...p, visualDescriptionOverride: e.target.value }))}
                        placeholder="เช่น 'ตัวละครนี้มีรอยแผลเป็นรูปมังกรที่แก้มซ้าย, สวมชุดเกราะสีดำขลับที่สลักด้วยอักษรรูนเรืองแสงสีฟ้าอ่อน, ถือดาบยาวที่มีออร่าสีม่วง.'"
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">หากมีข้อมูลในช่องนี้ ระบบจะใช้คำบรรยายนี้เป็นหลักแทนการสร้างจากตัวเลือกด้านล่าง</p>
                </div>
            </div>

            {/* 2. Face & Hair */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Dna size={18} />
                    <h3 className="font-bold">หน้าตา & ทรงผม (Face & Hair)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.attr.faceShape} onChange={e => setForm(p => ({...p, attr: {...p.attr, faceShape: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedFaceShapes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.eyeShape} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, eyeShape: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedEyeShapes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.eyeColor} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, eyeColor: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedEyeColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.hairStyle} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, hairStyle: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedHairStyles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.hairColor} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, hairColor: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedHairColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.hairTexture} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, hairTexture: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedHairTextures.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 block mb-1">จุดเด่นบนใบหน้า (Facial Features)</label>
                    <div className="flex flex-wrap gap-2">
                        {combinedFacialFeatures.map(feature => (
                            <button
                                key={feature}
                                onClick={() => toggleTag('facialFeatures', feature)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${
                                    form.attr.facialFeatures.includes(feature) 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {feature}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Clothing */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Shirt size={18} />
                    <h3 className="font-bold">เสื้อผ้า (Clothing)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.attr.clothingStyle} onChange={e => setForm(p => ({...p, attr: {...p.attr, clothingStyle: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedClothingStyles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.clothingColor} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, clothingColor: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedClothingColors.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 block mb-1">รายละเอียดชุด (Detail)</label>
                    <select value={form.attr.clothingDetail} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, clothingDetail: e.target.value}}))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        <option value="">ไม่มี</option>
                        {combinedClothingDetails.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* 4. Accessories */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Crown size={18} />
                    <h3 className="font-bold">เครื่องประดับ (Accessories)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {combinedAccessories.map(accessory => (
                        <button
                            key={accessory}
                            onClick={() => toggleTag('accessories', accessory)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                form.attr.accessories.includes(accessory) 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {accessory}
                        </button>
                    ))}
                </div>
            </div>

            {/* 5. Weapons */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Sword size={18} />
                    <h3 className="font-bold">อาวุธ/ของถือ (Weapons)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {combinedWeapons.map(weapon => (
                        <button
                            key={weapon}
                            onClick={() => toggleTag('weapons', weapon)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                form.attr.weapons.includes(weapon) 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {weapon}
                        </button>
                    ))}
                </div>
            </div>

            {/* 6. Personality & Dialogue */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <MessagesSquare size={18} />
                    <h3 className="font-bold">บุคลิกภาพ & บทพูด (Personality & Dialogue)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.attr.personality} onChange={e => setForm(p => ({...p, attr: {...p.attr, personality: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedPersonalities.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={form.attr.currentMood} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, currentMood: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors">
                        {combinedMoods.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 block mb-1">ตัวอย่างบทพูด (Dialogue Example)</label>
                    <textarea
                        value={form.dialogueExample}
                        onChange={e => setForm(p => ({ ...p, dialogueExample: e.target.value }))}
                        placeholder="เช่น 'ข้าจะแสดงให้เจ้าเห็นถึงพลังที่แท้จริง!' หรือ 'วันนี้อากาศดีจังเลยเนอะ?'"
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">บทพูดตัวอย่างที่สะท้อนบุคลิกภาพของตัวละคร (ใช้ AI สร้างเสียงเมื่อสร้างวิดีโอ)</p>
                </div>
            </div>


            {/* 7. Character Seed */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Sparkles size={18} />
                    <h3 className="font-bold">CHARACTER SEED</h3>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 block mb-1">Seed (ใช้สำหรับสร้างภาพตัวละคร)</label>
                    <input 
                        value={form.seed} 
                        onChange={e => setForm(p => ({...p, seed: e.target.value}))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                        placeholder="Automatic seed"
                    />
                </div>
            </div>

            {/* 8. Attribute Options Management */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <Filter size={18} />
                    <h3 className="font-bold">เลือกหมวดหมู่เพื่อเพิ่ม/จัดการตัวเลือก</h3>
                </div>

                <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mb-1">เลือกหมวดหมู่</label>
                        <select
                            value={selectedManageCategory}
                            onChange={e => setSelectedManageCategory(e.target.value as keyof CharacterAttributes)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                        >
                            {CHARACTER_ATTRIBUTE_KEYS_FOR_CUSTOM_OPTIONS.map(key => (
                                <option key={key} value={key}>
                                    {ATTRIBUTE_CATEGORIES_MAP[key]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mb-1">เพิ่มตัวเลือกใหม่</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCustomOptionValue}
                                onChange={e => setNewCustomOptionValue(e.target.value)}
                                placeholder={ATTRIBUTE_PLACEHOLDER_MAP[selectedManageCategory] || "เพิ่มตัวเลือกใหม่..."}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button
                                onClick={handleAddCustomOptionClick}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                                title="เพิ่มตัวเลือกที่กำหนดเอง"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Display filtered custom options */}
                    <div className="pt-4 border-t border-slate-800 mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {customOptions.filter(opt => opt.attributeKey === selectedManageCategory).length === 0 ? (
                            <p className="text-slate-500 text-sm italic text-center py-4">
                                ยังไม่มีตัวเลือกที่กำหนดเองสำหรับ '{ATTRIBUTE_CATEGORIES_MAP[selectedManageCategory]}'
                            </p>
                        ) : (
                            customOptions
                                .filter(opt => opt.attributeKey === selectedManageCategory)
                                .map(opt => (
                                    <div 
                                        key={opt.id} 
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center group"
                                    >
                                        <span className="text-slate-300 text-sm flex-1 truncate">{opt.value}</span>
                                        <div className="flex gap-1 items-center ml-2 shrink-0">
                                            <button
                                                onClick={() => setNewCustomOptionValue(opt.value)} // Populate input with current value
                                                className="p-1 text-slate-600 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
                                                title="นำค่านี้ไปแก้ไข"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button
                                                onClick={() => onRemoveCustomOption(opt.id)}
                                                className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                                                title="ลบตัวเลือกนี้"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
          >
            ย้อนกลับ
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Save size={16} /> บันทึกตัวละคร
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterStudio;
