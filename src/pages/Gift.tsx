
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ThemeType } from "@/utils/giftThemes";
import InsideLeftCard from "@/components/gift/InsideLeftCard";
import { AmountStep } from "@/components/gift/AmountStep";
import { FrontCard } from "@/components/gift/cards/FrontCard";
import { BlankCard } from "@/components/gift/cards/BlankCard";
import { useStickerManager } from "@/hooks/useStickerManager";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { stickerOptions } from "@/constants/giftOptions";
import { GiftRevealAnimation } from "@/components/gift/GiftRevealAnimation";
import { MemoryReplayScreen } from "@/components/gift/MemoryReplayScreen";
import { PageContainer } from "@/components/layout/PageContainer";
import { useGiftNavigation } from "@/components/gift/stages/GiftNavigationManager";
import { RecipientStage } from "@/components/gift/stages/RecipientStage";

const GiftContent = () => {
  const [selectedTheme] = useState<ThemeType>('holiday');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageVideo, setMessageVideo] = useState<File | null>(null);
  const [messageVideoUrl, setMessageVideoUrl] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [memories, setMemories] = useState<Array<{ id: string; imageUrl?: string; caption: string; date: Date }>>([]);

  const { selectedThemeOption, handlePatternChange, setSelectedThemeOption } = useTheme();
  const {
    placedStickers,
    selectedSticker,
    showStickers,
    setShowStickers,
    handleStickerClick,
    handleStickerDragEnd,
    handleStickerTap,
    handleStickerRemove,
    handleStickerRotate
  } = useStickerManager();

  const {
    currentPage,
    currentStep,
    goToPreviousStep,
    goToNextStep
  } = useGiftNavigation();

  const handleAddMemory = (memory: Omit<{ id: string; imageUrl?: string; caption: string; date: Date }, "id">) => {
    const newMemory = {
      ...memory,
      id: crypto.randomUUID()
    };
    setMemories(prev => [...prev, newMemory]);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    setMessageVideo(file);
    const videoUrl = URL.createObjectURL(file);
    setMessageVideoUrl(videoUrl);
  };

  useEffect(() => {
    return () => {
      if (messageVideoUrl) {
        URL.revokeObjectURL(messageVideoUrl);
      }
    };
  }, [messageVideoUrl]);

  if (currentStep === 'reveal') {
    return (
      <PageContainer>
        <GiftRevealAnimation
          messageVideo={messageVideoUrl}
          amount={amount}
          memories={memories}
          memory={null}
          onComplete={goToNextStep}
        />
      </PageContainer>
    );
  }

  if (currentStep === 'memory') {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MemoryReplayScreen
              memories={memories}
              onAddMemory={handleAddMemory}
              onNext={goToNextStep}
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (currentStep === 'amount') {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AmountStep
              amount={amount}
              setAmount={setAmount}
              onNext={goToNextStep}
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (currentPage === 'front') {
    return (
      <PageContainer>
        <FrontCard
          selectedThemeOption={selectedThemeOption}
          placedStickers={placedStickers}
          selectedSticker={selectedSticker}
          showStickers={showStickers}
          stickerOptions={stickerOptions}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          onPatternChange={handlePatternChange}
          onThemeChange={setSelectedThemeOption}
          onShowStickers={setShowStickers}
          onStickerClick={handleStickerClick}
          onStickerTap={handleStickerTap}
          onStickerDragEnd={handleStickerDragEnd}
          onStickerRemove={handleStickerRemove}
          onStickerRotate={handleStickerRotate}
        />
      </PageContainer>
    );
  }

  if (currentPage === 'blank') {
    return (
      <PageContainer>
        <BlankCard
          selectedThemeOption={selectedThemeOption}
          messageVideo={messageVideo}
          placedStickers={placedStickers}
          selectedSticker={selectedSticker}
          showStickers={showStickers}
          stickerOptions={stickerOptions}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          onPatternChange={handlePatternChange}
          onShowStickers={setShowStickers}
          onStickerClick={handleStickerClick}
          onStickerTap={handleStickerTap}
          onStickerDragEnd={handleStickerDragEnd}
          onStickerRemove={handleStickerRemove}
          onStickerRotate={handleStickerRotate}
          onFileChange={handleFileChange}
          setMessageVideo={setMessageVideo}
        />
      </PageContainer>
    );
  }

  if (currentPage === 'inside-left') {
    return (
      <PageContainer>
        <InsideLeftCard
          selectedThemeOption={selectedThemeOption}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
        />
      </PageContainer>
    );
  }

  return (
    <RecipientStage
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      onNext={goToNextStep}
      onBack={goToPreviousStep}
    />
  );
};

const Gift = () => {
  return (
    <ThemeProvider>
      <GiftContent />
    </ThemeProvider>
  );
};

export default Gift;
