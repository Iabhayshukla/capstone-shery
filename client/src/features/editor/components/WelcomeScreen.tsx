import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';

interface WelcomeScreenProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  'Dark mode dashboard for a crypto exchange',
  'Portfolio for a 3D motion designer',
  'Restaurant booking system with menu',
  'Agency landing page with fluid animations',
  'SaaS product page with pricing cards',
];

const TICKER_ITEMS = [
  'React 18', 'Tailwind CSS', 'GPT-4 Turbo', 'SSE Streaming',
  'TypeScript', 'Framer Motion', 'Radix UI', 'Vercel AI',
  'React 18', 'Tailwind CSS', 'GPT-4 Turbo', 'SSE Streaming',
  'TypeScript', 'Framer Motion', 'Radix UI', 'Vercel AI',
];

export default function WelcomeScreen({ onGenerate, isGenerating }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  
  const targetMouseOffsetX = useRef(0);
  const targetMouseOffsetY = useRef(0);
  const currentMouseOffsetX = useRef(0);
  const currentMouseOffsetY = useRef(0);
  const autoRotateAngleX = useRef(0);
  const autoRotateAngleY = useRef(0);
  const autoRotateSpeedX = 0.0012;
  const autoRotateSpeedY = 0.0025;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
    setCharCount(prompt.length);
  }, [prompt]);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseOffsetY.current = normalizedX * 0.6;
      targetMouseOffsetX.current = normalizedY * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!threeContainerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(2, 3, 4);
    scene.add(mainLight);
    
    const fillLight = new THREE.PointLight(0x4466ff, 0.6);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);
    
    const backLight = new THREE.PointLight(0xff66aa, 0.5);
    backLight.position.set(1, 2, -3);
    scene.add(backLight);
    
    const rimLight = new THREE.PointLight(0xffaa66, 0.55);
    rimLight.position.set(2, 1, -2);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    mainGroupRef.current = group;
    
    const geometry = new THREE.TorusKnotGeometry(1.1, 0.28, 180, 24, 3, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6c63ff,
      emissive: 0x2a1e8c,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.25,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.castShadow = true;
    group.add(torusKnot);
    
    const wireframeGeo = new THREE.TorusKnotGeometry(1.16, 0.3, 150, 20, 3, 4);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x8a7aff,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframeKnot = new THREE.Mesh(wireframeGeo, wireframeMat);
    group.add(wireframeKnot);
    
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.7 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i*3+2] = radius * Math.cos(phi);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6c63ff,
      size: 0.035,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particleSystem);
    
    const ringGeo = new THREE.TorusGeometry(1.45, 0.04, 64, 300);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x7d6eff,
      emissive: 0x3a2c9e,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    
    const ring2Geo = new THREE.TorusGeometry(1.55, 0.025, 64, 300);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xaa99ff,
      emissive: 0x5a4abe,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.z = Math.PI / 3;
    ring2.rotation.x = Math.PI / 2.5;
    group.add(ring2);
    
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 30 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i*3+2] = radius * Math.cos(phi);
      
      const colorType = Math.random();
      if (colorType < 0.7) {
        starColors[i*3] = 0.8 + Math.random() * 0.2;
        starColors[i*3+1] = 0.8 + Math.random() * 0.2;
        starColors[i*3+2] = 1.0;
      } else if (colorType < 0.85) {
        starColors[i*3] = 1.0;
        starColors[i*3+1] = 0.6 + Math.random() * 0.3;
        starColors[i*3+2] = 0.7 + Math.random() * 0.3;
      } else {
        starColors[i*3] = 0.9 + Math.random() * 0.1;
        starColors[i*3+1] = 0.5 + Math.random() * 0.4;
        starColors[i*3+2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterialObj = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeo, starMaterialObj);
    scene.add(stars);
    
    const dustCount = 2500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i*3] = (Math.random() - 0.5) * 180;
      dustPositions[i*3+1] = (Math.random() - 0.5) * 120;
      dustPositions[i*3+2] = (Math.random() - 0.5) * 150 - 50;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.045, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);
    
    let time = 0;
    
    const animate = () => {
      time += 0.012;
      
      const color = new THREE.Color().setHSL(0.65 + Math.sin(time * 0.25) * 0.08, 0.9, 0.55);
      material.color = color;
      const emissiveColor = new THREE.Color().setHSL(0.7 + Math.sin(time * 0.3) * 0.1, 1.0, 0.35);
      material.emissive = emissiveColor;
      material.emissiveIntensity = 0.55 + Math.sin(time * 2.1) * 0.15;
      
      wireframeMat.color = new THREE.Color().setHSL(0.68 + Math.sin(time * 0.4) * 0.05, 0.8, 0.65);
      ringMat.emissiveIntensity = 0.4 + Math.sin(time * 1.8) * 0.15;
      ring2Mat.emissiveIntensity = 0.3 + Math.sin(time * 2.2) * 0.1;
      particleMaterial.color = new THREE.Color().setHSL(0.66 + Math.sin(time * 0.5) * 0.04, 1.0, 0.6);
      
      ring.rotation.z += 0.003;
      ring.rotation.y += 0.002;
      ring2.rotation.x += 0.002;
      ring2.rotation.z += 0.001;
      
      stars.rotation.y += 0.0002;
      stars.rotation.x += 0.0001;
      dustParticles.rotation.y -= 0.00015;
      
      autoRotateAngleX.current += autoRotateSpeedX;
      autoRotateAngleY.current += autoRotateSpeedY;
      
      const lerpSpeed = 0.07;
      currentMouseOffsetX.current += (targetMouseOffsetX.current - currentMouseOffsetX.current) * lerpSpeed;
      currentMouseOffsetY.current += (targetMouseOffsetY.current - currentMouseOffsetY.current) * lerpSpeed;
      
      const finalRotX = autoRotateAngleX.current + currentMouseOffsetX.current;
      const finalRotY = autoRotateAngleY.current + currentMouseOffsetY.current;
      
      if (mainGroupRef.current) {
        mainGroupRef.current.rotation.x = finalRotX;
        mainGroupRef.current.rotation.y = finalRotY;
      }
      
      fillLight.intensity = 0.55 + Math.sin(time * 1.2) * 0.1;
      backLight.intensity = 0.45 + Math.cos(time * 1.5) * 0.12;
      rimLight.intensity = 0.5 + Math.sin(time * 1.9) * 0.1;
      
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    const containerNode = threeContainerRef.current;
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current && containerNode) {
        containerNode.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  const emitParticles = (buttonRect: DOMRect) => {
    const newParticles = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: buttonRect.left + buttonRect.width / 2 + (Math.random() - 0.5) * 50,
      y: buttonRect.top + buttonRect.height / 2,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    const btn = document.querySelector('.generate-btn') as HTMLElement;
    if (btn) emitParticles(btn.getBoundingClientRect());
    onGenerate(prompt.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div
        ref={threeContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: isMobile ? 0.6 : 0.85,
        }}
      />
      
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)`,
        backgroundSize: `${isMobile ? '48px' : '72px'} ${isMobile ? '48px' : '72px'}`,
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', 
          width: isMobile ? 400 : 700, 
          height: isMobile ? 250 : 400,
          background: `linear-gradient(135deg, var(--brand-primary) 0%, transparent 60%)`,
          borderRadius: '50%', 
          filter: 'blur(90px)',
          top: -120, 
          left: -200, 
          opacity: 0.1,
          animation: 'aFloat1 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', 
          width: isMobile ? 300 : 500, 
          height: isMobile ? 300 : 500,
          background: `linear-gradient(225deg, var(--brand-accent) 0%, transparent 60%)`,
          borderRadius: '50%', 
          filter: 'blur(90px)',
          bottom: -50, 
          right: -100, 
          opacity: 0.08,
          animation: 'aFloat2 26s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        position: 'relative', 
        zIndex: 2,
        borderBottom: '1px solid var(--border)',
        padding: `${isMobile ? '6px' : '10px'} 0`, 
        overflow: 'hidden',
        background: 'rgba(var(--brand-primary-rgb, 108, 99, 255), 0.02)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', 
          animation: 'tickScroll 22s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: isMobile ? 6 : 10,
              padding: `0 ${isMobile ? 16 : 28}px`, 
              fontSize: isMobile ? 8 : 10, 
              letterSpacing: isMobile ? 1 : 2,
              textTransform: 'uppercase', 
              color: 'var(--text-muted)',
            }}>
              {item}
              <span style={{ color: 'var(--brand-primary)', opacity: 0.5, fontSize: isMobile ? 10 : 14 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <Link
        to="/dashboard"
        style={{
          position: 'absolute',
          top: isMobile ? 16 : 60,
          left: isMobile ? 12 : 24,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 4 : 8,
          fontSize: isMobile ? 9 : 11,
          fontWeight: 500,
          letterSpacing: isMobile ? 1 : 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: `${isMobile ? '6px' : '8px'} ${isMobile ? '12px' : '16px'}`,
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--brand-primary)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--brand-primary)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(var(--brand-primary-rgb, 108, 99, 255), 0.02)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)';
        }}
      >
        <ArrowLeft size={isMobile ? 10 : 13} />
        <span>{isSmallMobile ? 'Back' : 'Back to Dashboard'}</span>
      </Link>

      <div style={{
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: `${isMobile ? '16px' : '24px'} ${isMobile ? '16px' : '24px'} ${isMobile ? '24px' : '40px'}`,
        position: 'relative', 
        zIndex: 2,
        gap: 0,
        transform: `translateY(${isMobile ? '-4px' : '-12px'})`,
      }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: isMobile ? 4 : 8,
            fontSize: isMobile ? 8 : 11, 
            letterSpacing: isMobile ? 1 : 2, 
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: `${isMobile ? '4px' : '7px'} ${isMobile ? '12px' : '16px'}`, 
            marginBottom: isMobile ? 12 : 20,
          }}
        >
          <span style={{
            width: isMobile ? 4 : 6, 
            height: isMobile ? 4 : 6, 
            borderRadius: '50%',
            background: 'var(--brand-primary)', 
            animation: 'blink 1.4s step-end infinite',
            display: 'inline-block',
          }} />
          <span>{isSmallMobile ? 'Shery AI' : 'Capstone-Shery AI — Next Gen Builder'}</span>
        </motion.div>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 28, lineHeight: 0.92 }}>
          {['Create the', 'Impossible'].map((line, li) => (
            <motion.div
              key={li}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + li * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: 'hidden', 
                display: 'block',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isMobile 
                  ? (li === 1 ? '48px' : '42px')
                  : `clamp(52px, 8vw, ${li === 1 ? '96px' : '84px'})`,
                letterSpacing: isMobile ? 0 : 1,
                color: li === 1 ? 'var(--brand-primary)' : 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {line}
            </motion.div>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: isMobile ? 12 : 16,
              fontSize: isMobile ? 11 : 14, 
              fontWeight: 300, 
              letterSpacing: 0.3,
              color: 'var(--text-muted)', 
              lineHeight: 1.7,
              padding: `0 ${isMobile ? 16 : 0}px`,
            }}
          >
            Describe your dream website and AI will build it instantly.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ 
            width: '100%', 
            maxWidth: isMobile ? '90vw' : 680, 
            marginBottom: isMobile ? 12 : 16 
          }}
        >
          <div style={{
            position: 'relative',
            border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border)'}`,
            background: 'var(--surface)',
            backdropFilter: 'blur(12px)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(var(--brand-primary-rgb, 108, 99, 255), 0.08)' : 'none',
          }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. A modern crypto dashboard with live price charts, wallet connect, and dark theme..."
              rows={3}
              disabled={isGenerating}
              style={{
                width: '100%', 
                background: 'transparent', 
                resize: 'none',
                outline: 'none', 
                border: 'none',
                padding: `${isMobile ? '12px' : '20px'} ${isMobile ? '12px' : '20px'} ${isMobile ? '40px' : '60px'}`,
                fontSize: isMobile ? 12 : 14, 
                lineHeight: 1.7, 
                fontWeight: 300,
                color: 'var(--text-primary)', 
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: 0.2,
              }}
            />

            <div style={{
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0,
              padding: `${isMobile ? '6px' : '10px'} ${isMobile ? '8px' : '14px'}`,
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <span style={{ 
                fontSize: isMobile ? 8 : 10, 
                letterSpacing: isMobile ? 1 : 1.5, 
                textTransform: 'uppercase', 
                color: 'var(--text-muted)',
              }}>
                ⏎ Generate · ⇧+⏎ new line
                {charCount > 0 && ` · ${charCount} chars`}
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="generate-btn"
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: isMobile ? 4 : 8,
                  fontSize: isMobile ? 9 : 11, 
                  fontWeight: 500, 
                  letterSpacing: isMobile ? 1 : 2,
                  textTransform: 'uppercase',
                  color: !prompt.trim() || isGenerating ? 'rgba(255,255,255,0.5)' : '#ffffff',
                  background: !prompt.trim() || isGenerating ? 'rgba(var(--brand-primary-rgb, 108, 99, 255), 0.4)' : 'var(--brand-primary)',
                  border: 'none', 
                  padding: `${isMobile ? '6px' : '9px'} ${isMobile ? '12px' : '20px'}`,
                  cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative', 
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{
                      width: isMobile ? 10 : 12, 
                      height: isMobile ? 10 : 12, 
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTopColor: '#ffffff',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span>{isSmallMobile ? 'Gen...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={isMobile ? 10 : 12} />
                    <span>{isSmallMobile ? 'Gen' : 'Generate'}</span>
                    <ArrowRight size={isMobile ? 10 : 12} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: isMobile ? 6 : 8, 
            justifyContent: 'center', 
            maxWidth: isMobile ? '90vw' : 680,
            padding: `0 ${isMobile ? 8 : 0}px`,
          }}
        >
          {SAMPLE_PROMPTS.map((p, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.06 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPrompt(p)}
              style={{
                fontSize: isMobile ? 9 : 11, 
                fontWeight: 300, 
                letterSpacing: 0.5,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: `${isMobile ? '4px' : '7px'} ${isMobile ? '10px' : '14px'}`, 
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                textAlign: 'center',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {particles.map(p => (
        createPortal(
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 0.5, x: p.x, y: p.y }}
            animate={{ opacity: 0, y: p.y - 100, x: p.x + (Math.random() - 0.5) * 80 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: 5,
              height: 5,
              background: 'var(--brand-primary)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 0 6px var(--brand-primary)',
            }}
          />,
          document.body
        )
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes aFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,40px) scale(1.08)} }
        @keyframes aFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,-60px) scale(1.1)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes tickScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        textarea::placeholder { color: var(--text-muted) !important; opacity: 0.5; }
        textarea:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
}