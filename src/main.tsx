import React, { StrictMode, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Đăng ký toàn bộ React Hooks lên window để mọi component đều tự động nhận diện
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).useState = useState;
  (window as any).useEffect = useEffect;
  (window as any).useMemo = useMemo;
  (window as any).useRef = useRef;
  (window as any).useCallback = useCallback;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
