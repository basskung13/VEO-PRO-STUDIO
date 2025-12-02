
import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    
    export default defineConfig({
      plugins: [react()],
      build: {
        outDir: 'dist', // กำหนดให้ output ไปยังโฟลเดอร์ 'dist'
        // assetsDir: 'assets', // Optional: sub-directory for generated assets
        rollupOptions: {
          // เพื่อให้ Vite จัดการรวม dependencies ทั้งหมดเข้าไว้ใน bundle เดียว
          // โดยไม่ต้องพึ่งพา CDN imports ผ่าน importmap อีกต่อไป
          // หากคุณต้องการให้ React/ReactDOM/GenAI/Lucide โหลดจาก CDN จริงๆ 
          // คุณจะต้องกำหนด external และคง importmap ไว้ ซึ่งทำให้การจัดการซับซ้อนขึ้น
          // วิธีนี้เป็นวิธีมาตรฐานและมีประสิทธิภาพสำหรับแอป React ที่ทันสมัย
        },
      },
      resolve: {
        alias: {
          '@': '/.', // ตั้งค่า alias สำหรับ '@/...' ไปยัง root folder
        },
      },
    });