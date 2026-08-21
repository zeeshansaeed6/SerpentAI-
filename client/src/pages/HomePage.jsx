import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import UploadZone from '../components/UploadZone';
import ResultCard from '../components/ResultCard';

export default function HomePage({ onExploreGuide }) {
  const [detectionResult, setDetectionResult] = useState(null);

  const handleDetectionComplete = (data) => {
    setDetectionResult(data);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleScanAgain = () => {
    setDetectionResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!detectionResult && (
        <HeroSection onExploreGuide={onExploreGuide} />
      )}

      {detectionResult ? (
        <ResultCard
          result={detectionResult}
          onScanAgain={handleScanAgain}
        />
      ) : (
        <UploadZone
          onDetectionComplete={handleDetectionComplete}
        />
      )}
    </div>
  );
}
