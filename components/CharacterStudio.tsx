
import React, { useState, useEffect } from 'react';
import { Character, CharacterAttributes } from '../types';
import { User, Save, Trash2, RefreshCw, Sparkles, Wand2, Palette, Smile, Shirt, Scissors, Dna, Crown, Sword, MessagesSquare, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CharacterStudioProps {
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onBack: () => void;
}

const GENDERS = ['Male (ชาย)', 'Female (หญิง)', 'Non-binary (ไม่ระบุเพศ)', 'Robot/Android (หุ่นยนต์)', 'Monster (สัตว์ประหลาด)'];
const AGES = ['Infant (ทารก 0-2)', 'Child (เด็ก 3-12)', 'Teenager (วัยรุ่น 13-19)', 'Young Adult (วัยหนุ่มสาว 20-35)', 'Middle Aged (วัยกลางคน 36-55)', 'Elderly (ผู้สูงอายุ 60+)'];
const SKINS = ['Pale (ขาวซีด)', 'Fair (ขาวอมชมพู)', 'Light (ขาวเหลือง)', 'Tan (ผิวแทน)', 'Olive (ผิวสองสี)', 'Brown (ผิวคล้ำ)', 'Dark (ผิวดำเข้ม)', 'Blue (น้ำเงิน/เอเลี่ยน)', 'Green (เขียว/ออร์ค)', 'Metallic (โลหะ/หุ่นยนต์)'];
const FACES = ['Oval (รูปไข่)', 'Round (หน้ากลม)', 'Square (หน้าเหลี่ยม)', 'Diamond (หน้ารูปเพชร)', 'Chiseled (กรามชัด)', 'Gaunt (แก้มตอบ)', 'Scarred (มีแผลเป็น)'];
const EYES_COLORS = ['Brown (น้ำตาล)', 'Blue (ฟ้า)', 'Green (เขียว)', 'Hazel (น้ำตาลอ่อน)', 'Grey (เทา)', 'Black (ดำ)', 'Red (แดง)', 'Purple (ม่วง)', 'Glowing (เรืองแสง)', 'Heterochromia (ตาสองสี)'];
const HAIR_STYLES = ['Bald (หัวล้าน)', 'Short / Buzz Cut (สกินเฮด)', 'Short / Side Part (รองทรง)', 'Medium / Messy (ผมยุ่ง)', 'Long / Straight (ยาวตรง)', 'Long / Wavy (ยาวดัดลอน)', 'Ponytail (หางม้า)', 'Bun (มวยผม)', 'Mohawk (โมฮอว์ก)', 'Braids (ถักเปีย)', 'Afro (ทรงแอฟโฟร)'];
const HAIR_COLORS = ['Black (ดำสนิท)', 'Dark Brown (น้ำตาลเข้ม)', 'Blonde (บลอนด์)', 'Red/Ginger (แดง)', 'White/Grey (ขาว/เทา)', 'Pink (ชมพู)', 'Blue (น้ำเงิน)', 'Green (เขียว)', 'Rainbow (สายรุ้ง)'];
const BODY_TYPES = ['Slim (ผอมบาง)', 'Average (สมส่วน)', 'Athletic (นักกีฬา)', 'Muscular (กล้ามใหญ่)', 'Curvy (อวบอั๋น)', 'Plus Size (เจ้าเนื้อ)', 'Giant (ยักษ์)', 'Petite (ตัวเล็ก)'];
const CLOTHING_STYLES = ['Casual (ลำลอง)', 'Formal / Suit (ทางการ/สูท)', 'Streetwear (สตรีท)', 'Vintage (วินเทจ)', 'Cyberpunk (ไซเบอร์พังค์)', 'Fantasy / Armor (ชุดเกราะ)', 'Traditional Thai (ชุดไทย)', 'Uniform (เครื่องแบบ)', 'Sci-Fi (ชุดอวกาศ)', 'Steampunk (สตีมพังค์)'];
const MOODS = ['Neutral (เฉยๆ)', 'Happy (มีความสุข)', 'Angry (โกรธ)', 'Sad (เศร้า)', 'Mysterious (ลึกลับ)', 'Confident (มั่นใจ)', 'Crazy (บ้าคลั่ง)'];

// Tag Lists for Detailed Fields
const ACCESSORIES = ['Glasses (แว่นตา)', 'Sunglasses (แว่นกันแดด)', 'Hat (หมวก)', 'Earrings (ต่างหู)', 'Necklace (สร้อยคอ)', 'Scarf (ผ้าพันคอ)', 'Mask (หน้ากาก)', 'Cape (ผ้าคลุมไหล่)', 'Headphones (หูฟัง)', 'Crown (มงกุฎ)'];
const FACIAL_FEATURES = ['Beard (เครา)', 'Mustache (หนวด)', 'Freckles (กระ)', 'Scar on cheek (แผลเป็นที่แก้ม)', 'Tattoo on face (รอยสักหน้า)', 'Mole (ไฝ)', 'Piercing (เจาะจมูก/ปาก)'];
const WEAPONS = ['Sword (ดาบ)', 'Pistol (ปืนพก)', 'Staff (คทา)', 'Bow (ธนู)', 'Shield (โล่)', 'Dagger (มีดสั้น)', 'Rifle (ปืนยาว)', 'Katana (ดาบซามูไร)'];
const PERSONALITIES = ['Brave (กล้าหาญ)', 'Shy (ขี้อาย)', 'Evil (ชั่วร้าย)', 'Friendly (เป็นมิตร)', 'Cold (เย็นชา)', 'Funny (ตลก)'];

const CharacterStudio: React.FC<CharacterStudioProps> = ({ characters, onSaveCharacter, onDeleteCharacter, onBack }) => {
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar visibility
  
  const defaultAttributes: CharacterAttributes = {
    gender: 'Male',
    ageGroup: 'Young Adult',
    skinTone: 'Fair',
    faceShape: 'Oval',
    eyeShape: 'Almond',
    eyeColor: 'Brown',
    hairStyle: 'Short / Side Part',
    hairColor: 'Black',
    hairTexture: 'Straight',
    facialFeatures: [],
    bodyType: 'Average',
    clothingStyle: 'Casual',
    clothingColor: 'White',
    clothingDetail: '',
    accessories: [],
    weapons: [],
    personality: 'Brave',
    currentMood: 'Neutral'
  };

  const [form, setForm] = useState<{
    name: string;
    nameEn: string;
    seed: string;
    attr: CharacterAttributes;
    visualDescriptionOverride: string; // New state for override
  }>({
    name: '',
    nameEn: '',
    seed: Math.random().toString(36).substring(7).toUpperCase(),
    attr: { ...defaultAttributes },
    visualDescriptionOverride: '' // Initialize
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
          visualDescriptionOverride: char.visualDescriptionOverride || '' // Load override
        });
      }
    } else {
      // Clear form for new character
      setForm({
        name: '',
        nameEn: '',
        seed: Math.random().toString(36).substring(7).toUpperCase(),
        attr: { ...defaultAttributes },
        visualDescriptionOverride: '' // Clear for new character
      });
    }
  }, [activeCharId, characters]);

  const cleanVal = (val: string) => val.split('(')[0].trim();

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
    
    let desc = `A ${age} ${gender} named ${nameEn}, ${skin} skin, ${eyes}, ${hair} hair, ${attr.bodyType} body.`;
    desc += ` Wearing ${clothes}.`;
    
    if (attr.facialFeatures.length > 0) desc += ` Facial features: ${attr.facialFeatures.map(cleanVal).join(', ')}.`;
    if (attr.accessories.length > 0) desc += ` Accessories: ${attr.accessories.map(cleanVal).join(', ')}.`;
    if (attr.weapons.length > 0) desc += ` Holding: ${attr.weapons.map(cleanVal).join(', ')}.`;
    desc += ` Personality: ${cleanVal(attr.personality)}. Mood: ${cleanVal(attr.currentMood)}.`;

    return desc;
  };

  const handleSave = () => {
    if (!form.name) {
      alert("กรุณาตั้งชื่อตัวละคร");
      return;
    }

    const newChar: Character = {
      id: activeCharId || Date.now().toString(),
      name: form.name,
      nameEn: form.nameEn || form.name,
      description: generateDescription(),
      attributes: form.attr,
      seed: form.seed,
      visualDescriptionOverride: form.visualDescriptionOverride.trim(), // Save override
      createdAt: Date.now()
    };

    onSaveCharacter(newChar);
    if (!activeCharId) { // If it was a new character, clear the form for another new one
        setForm({
            name: '',
            nameEn: '',
            seed: Math.random().toString(36).substring(7).toUpperCase(),
            attr: { ...defaultAttributes },
            visualDescriptionOverride: ''
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
    
    setForm(prev => ({
      ...prev,
      seed: Math.random().toString(36).substring(7).toUpperCase(),
      visualDescriptionOverride: '', // Clear override on randomize
      attr: {
        ...prev.attr,
        gender: randomItem(GENDERS),
        ageGroup: randomItem(AGES),
        skinTone: randomItem(SKINS),
        faceShape: randomItem(FACES),
        eyeColor: randomItem(EYES_COLORS),
        hairStyle: randomItem(HAIR_STYLES),
        hairColor: randomItem(HAIR_COLORS), // Corrected typo
        bodyType: randomItem(BODY_TYPES),
        clothingStyle: randomItem(CLOTHING_STYLES),
        clothingColor: Math.random() > 0.5 ? randomItem(['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White']) : '', // Random color
        clothingDetail: Math.random() > 0.7 ? randomItem(['dragon pattern', 'torn fabric', 'glowing seams']) : '', // Random detail
        personality: randomItem(PERSONALITIES),
        currentMood: randomItem(MOODS),
        accessories: randomItems(ACCESSORIES, 2),
        facialFeatures: randomItems(FACIAL_FEATURES, 1),
        weapons: Math.random() > 0.7 ? [randomItem(WEAPONS)] : []
      }
    }));
  };

  const handleCreateNewCharacter = () => {
    setActiveCharId(null); // This will trigger the useEffect to load a blank form
  };

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
            
            {/* 1. Basics */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                    <User size={18} />
                    <h3 className="font-bold">ข้อมูลพื้นฐาน (Basics)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                        placeholder="ชื่อตัวละคร (ไทย)" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    />
                    <input 
                        value={form.nameEn} onChange={e => setForm(p => ({...p, nameEn: e.target.value}))}
                        placeholder="Character Name (English)" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    />
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.gender} onChange={e => setForm(p => ({...p, attr: {...p.attr, gender: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {GENDERS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.ageGroup} onChange={e => setForm(p => ({...p, attr: {...p.attr, ageGroup: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {AGES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                
                {/* Visual Description Override */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1">
                    <Palette size={12} /> คำบรรยายลักษณะตัวละครโดยละเอียด (Override)
                  </label>
                  <textarea 
                    value={form.visualDescriptionOverride}
                    onChange={e => setForm(p => ({...p, visualDescriptionOverride: e.target.value}))}
                    placeholder="เช่น ผมสีเงินยาวถึงเอว ดวงตาสีม่วง มีรอยสักรูปมังกรที่แขนขวา สวมชุดเกราะหนังสีดำสนิท มีดาบคาตานะห้อยอยู่ข้างเอว บุคลิกเย็นชาแต่ซื่อสัตย์..."
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none resize-y"
                  />
                  <p className="text-[10px] text-slate-600 italic">
                    หากมีข้อมูลในช่องนี้ ระบบจะใช้คำบรรยายนี้เป็นหลักแทนการสร้างจากตัวเลือกด้านล่าง
                  </p>
                </div>
            </div>

            {/* 2. Appearance */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
                    <Smile size={18} />
                    <h3 className="font-bold">ลักษณะใบหน้า (Appearance)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.skinTone} onChange={e => setForm(p => ({...p, attr: {...p.attr, skinTone: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {SKINS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.faceShape} onChange={e => setForm(p => ({...p.attr, attr: {...p.attr, faceShape: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {FACES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.eyeColor} onChange={e => setForm(p => ({...p, attr: {...p.attr, eyeColor: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {EYES_COLORS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                
                {/* Facial Features Tags */}
                <div>
                   <label className="text-xs text-slate-500 block mb-2">จุดเด่นบนใบหน้า (กดเลือกได้หลายอัน)</label>
                   <div className="flex flex-wrap gap-2">
                      {FACIAL_FEATURES.map(feat => (
                        <button
                           key={feat}
                           onClick={() => toggleTag('facialFeatures', feat)}
                           className={`px-3 py-1 text-xs rounded-full border transition-all ${form.attr.facialFeatures.includes(feat) ? 'bg-amber-900/30 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                        >
                           {cleanVal(feat)}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            {/* 3. Hair */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-2">
                    <Scissors size={18} />
                    <h3 className="font-bold">ทรงผม (Hair)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.hairStyle} onChange={e => setForm(p => ({...p, attr: {...p.attr, hairStyle: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {HAIR_STYLES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.hairColor} onChange={e => setForm(p => ({...p, attr: {...p.attr, hairColor: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {HAIR_COLORS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* 4. Clothing & Accessories */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-2">
                    <Shirt size={18} />
                    <h3 className="font-bold">เครื่องแต่งกาย & อุปกรณ์</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.bodyType} onChange={e => setForm(p => ({...p, attr: {...p.attr, bodyType: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {BODY_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.clothingStyle} onChange={e => setForm(p => ({...p, attr: {...p.attr, clothingStyle: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {CLOTHING_STYLES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                     {/* Fix: Correctly update nested `attr` state */}
                     <input 
                        value={form.attr.clothingColor}
                        onChange={e => setForm(p => ({...p, attr: {...p.attr, clothingColor: e.target.value}}))}
                        placeholder="สีชุดหลัก"
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    />
                </div>
                {/* Fix: Correctly update nested `attr` state */}
                <input 
                    value={form.attr.clothingDetail}
                    onChange={e => setForm(p => ({...p, attr: {...p.attr, clothingDetail: e.target.value}}))}
                    placeholder="รายละเอียดชุดเพิ่มเติม (เช่น ลายมังกร, ผ้าคลุมยาว)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />

                {/* Accessories Tags */}
                 <div>
                   <label className="text-xs text-slate-500 block mb-2"><Crown size={12} className="inline mr-1"/>เครื่องประดับ (Accessories)</label>
                   <div className="flex flex-wrap gap-2">
                      {ACCESSORIES.map(item => (
                        <button key={item} onClick={() => toggleTag('accessories', item)} className={`px-3 py-1 text-xs rounded-full border transition-all ${form.attr.accessories.includes(item) ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                           {cleanVal(item)}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Weapons Tags */}
                 <div>
                   <label className="text-xs text-slate-500 block mb-2"><Sword size={12} className="inline mr-1"/>อาวุธ/ของถือ (Weapons)</label>
                   <div className="flex flex-wrap gap-2">
                      {WEAPONS.map(item => (
                        <button key={item} onClick={() => toggleTag('weapons', item)} className={`px-3 py-1 text-xs rounded-full border transition-all ${form.attr.weapons.includes(item) ? 'bg-red-900/30 border-red-500 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                           {cleanVal(item)}
                        </button>
                      ))}
                   </div>
                </div>
            </div>
            
            {/* 5. Personality */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-pink-400 border-b border-slate-800 pb-2">
                    <MessagesSquare size={18} />
                    <h3 className="font-bold">บุคลิกภาพ (Personality)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Fix: Correctly update nested `attr` state */}
                     <select value={form.attr.personality} onChange={e => setForm(p => ({...p, attr: {...p.attr, personality: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {PERSONALITIES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {/* Fix: Correctly update nested `attr` state */}
                    <select value={form.attr.currentMood} onChange={e => setForm(p => ({...p, attr: {...p.attr, currentMood: e.target.value}}))} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
                        {MOODS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

             {/* Seed & Footer */}
             <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500">
                    <Dna size={16} />
                    <h3 className="text-xs font-bold uppercase">Character Seed</h3>
                </div>
                <div className="flex gap-2">
                    <input 
                        value={form.seed}
                        readOnly
                        className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-400 w-full"
                    />
                    <button 
                        onClick={() => setForm(p => ({...p, seed: Math.random().toString(36).substring(7).toUpperCase()}))}
                        className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-slate-400"
                        title="Re-roll Seed"
                    >
                        <RefreshCw size={16}/>
                    </button>
                </div>
             </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
             <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white text-sm">ยกเลิก</button>
             <button 
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
             >
                <Save size={16} /> บันทึกตัวละคร
             </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterStudio;