import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, RefreshCw, Sparkles, Image as ImageIcon, AlertCircle, Video, CheckCircle, Sliders, Sun, Moon } from 'lucide-react';
import { detectSnake } from '../services/api';
import { prepareImage } from '../utils/prepareImage';

// Demo snake images for 1-click test, bundled in public/samples (no external hosts, CORS or rate limits)
const SAMPLE_SNAKES = [
  { name: 'King Cobra (Deadly)', url: '/samples/king-cobra.jpg', type: 'Venomous' },
  { name: 'Corn Snake (Harmless)', url: '/samples/corn-snake.jpg', type: 'Non-Venomous' },
  { name: 'Green Tree Python', url: '/samples/green-tree-python.jpg', type: 'Harmless' }
];

export default function UploadZone({ onDetectionComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Photo Enhancer state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [nightBoost, setNightBoost] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Start Live Camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setError('Unable to access camera. Please check camera permissions.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      handleFile(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Select Sample Image
  const selectSampleImage = async (sample) => {
    try {
      setLoading(true);
      setError(null);
      setImagePreview(sample.url);

      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], 'sample-snake.jpg', { type: blob.type || 'image/jpeg' });
      setSelectedFile(file);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sample image. Please try uploading a file.');
      setLoading(false);
    }
  };

  // Toggle Night Boost
  const handleNightBoost = () => {
    if (!nightBoost) {
      setBrightness(145);
      setContrast(130);
      setNightBoost(true);
    } else {
      setBrightness(100);
      setContrast(100);
      setNightBoost(false);
    }
  };

  // Trigger Detection
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append('image', await prepareImage(selectedFile, { brightness, contrast }));

      const response = await detectSnake(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 70) / progressEvent.total);
        setUploadProgress(percent);
      });

      setUploadProgress(100);
      setTimeout(() => {
        setLoading(false);
        if (response.success && response.data) {
          onDetectionComplete(response.data);
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'AI Identification failed. Please try again.';
      setError(msg);
    }
  };

  const clearSelection = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setError(null);
    setBrightness(100);
    setContrast(100);
    setNightBoost(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Upload Panel */}
      <div className="glass-panel hud-corners" style={{
        padding: '2rem',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Camera View */}
        {cameraActive ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: '#000',
            borderRadius: '16px'
          }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
              />
              <div className="scanner-overlay">
                <div className="scan-beam"></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={capturePhoto} className="btn btn-primary">
                <Camera size={18} /> Snap Photo & Analyze
              </button>
              <button onClick={stopCamera} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : !imagePreview ? (
          /* Drag & Drop Area */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: dragActive ? '2px dashed #10b981' : '2px dashed rgba(255, 255, 255, 0.15)',
              background: dragActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              borderRadius: '18px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#34d399'
            }}>
              <UploadCloud size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>
              Drag & Drop Snake Image Here
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Supports High-Res JPG, PNG, WebP up to 10MB
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="btn btn-primary"
              >
                <ImageIcon size={18} /> Browse Photos
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                className="btn btn-secondary"
              >
                <Camera size={18} /> Open Camera
              </button>
            </div>
          </div>
        ) : (
          /* Preview + Enhancer + Analysis Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              height: '340px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <img
                src={imagePreview}
                alt="Selected snake preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`
                }}
              />
              {loading && (
                <div className="scanner-overlay">
                  <div className="scan-beam"></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '999px',
                    color: '#34d399',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    <RefreshCw className="animate-spin" size={16} /> Scanning with Gemini Vision...
                  </div>
                </div>
              )}
            </div>

            {/* Photo Enhancer Controls */}
            <div style={{
              width: '100%',
              maxWidth: '520px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '0.85rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                <Sliders size={16} color="#34d399" /> Low-Light Enhancer
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleNightBoost}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    background: nightBoost ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: nightBoost ? '#f59e0b' : '#94a3b8',
                    border: nightBoost ? '1px solid #f59e0b' : '1px solid var(--border-glass)'
                  }}
                >
                  <Moon size={13} /> {nightBoost ? 'Night-Boost ON' : 'Night-Vision Boost'}
                </button>

                {(brightness !== 100 || contrast !== 100) && (
                  <button
                    type="button"
                    onClick={() => { setBrightness(100); setContrast(100); setNightBoost(false); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '520px' }}>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.9rem', fontSize: '1.05rem' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" /> Analyzing Species...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Run AI Species Detection
                  </>
                )}
              </button>

              <button
                onClick={clearSelection}
                disabled={loading}
                className="btn btn-secondary"
              >
                Change Image
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Demo Samples */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Quick Test with Sample Snakes:
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {SAMPLE_SNAKES.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => selectSampleImage(sample)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                className="glass-card"
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.4rem' }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sample.name.split(' (')[0]}
                </div>
                <div style={{ fontSize: '0.65rem', color: sample.type === 'Venomous' || sample.type === 'Dangerous' ? '#f87171' : '#34d399' }}>
                  {sample.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
