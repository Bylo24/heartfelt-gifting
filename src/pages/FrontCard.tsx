import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeOption, Sticker, PatternType } from "@/types/gift";
import { StickerLayer } from "@/components/gift/StickerLayer";
import { PatternSelector } from "@/components/gift/PatternSelector";
import { ThemeSelector } from "@/components/gift/ThemeSelector";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useStickerManager } from "@/hooks/useStickerManager";
import { stickerOptions, themeOptions } from "@/constants/giftOptions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const colorOptions = [
  { name: 'Soft Peach', value: '#FDE1D3' },
  { name: 'Soft Orange', value: '#FEC6A1' },
  { name: 'Soft Pink', value: '#FFDEE2' },
  { name: 'Soft Purple', value: '#E5DEFF' },
  { name: 'Soft Blue', value: '#D3E4FD' },
  { name: 'Soft Green', value: '#F2FCE2' },
  { name: 'Soft Yellow', value: '#FEF7CD' },
  { name: 'Soft Gray', value: '#F1F0FB' },
];

interface GiftDesign {
  theme: string | null;
  front_card_pattern: PatternType | null;
  front_card_stickers: Json | null;
  id: string;
  created_at: string;
  editing_session_id: string | null;
  editing_user_id: string | null;
  last_edited_at: string | null;
  memories: any | null;
  message_video_url: string | null;
  selected_amount: number | null;
  status: string | null;
  token: string | null;
  user_id: string | null;
}

const isValidStickerObject = (value: any): value is { 
  id: string; 
  emoji: string; 
  x: number; 
  y: number; 
  rotation: number; 
} => {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.emoji === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.rotation === 'number'
  );
};

const FrontCardContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
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
    handleStickerRotate,
    setPlacedStickers
  } = useStickerManager();

  const token = localStorage.getItem('gift_draft_token');

  const handleColorChange = (color: string) => {
    const updatedTheme: ThemeOption = {
      ...selectedThemeOption,
      screenBgColor: color
    };
    setSelectedThemeOption(updatedTheme);
  };

  const { data: giftDesign, isError } = useQuery({
    queryKey: ['gift-design', token],
    queryFn: async () => {
      if (!token) throw new Error('No gift token found');
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('gift_designs')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: newGiftDesign, error: createError } = await supabase
          .from('gift_designs')
          .insert([
            { 
              token,
              status: 'draft',
              user_id: user.id
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        return newGiftDesign;
      }

      const processedData: GiftDesign = {
        ...data,
        front_card_pattern: isValidPatternType(data.front_card_pattern) ? data.front_card_pattern : null,
        front_card_stickers: Array.isArray(data.front_card_stickers) 
          ? data.front_card_stickers.filter(isValidSticker)
          : null
      };

      return processedData;
    },
    enabled: !!token && !!user,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false
  });

  useEffect(() => {
    if (isError) {
      toast.error('Error loading gift design');
      navigate('/home');
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (giftDesign) {
      if (giftDesign.theme) {
        const savedTheme = themeOptions.find(t => t.text === giftDesign.theme);
        if (savedTheme) {
          const patternType = giftDesign.front_card_pattern || savedTheme.pattern.type;
          if (isValidPatternType(patternType)) {
            const themeWithPattern = {
              ...savedTheme,
              pattern: {
                ...savedTheme.pattern,
                type: patternType
              }
            };
            setSelectedThemeOption(themeWithPattern);
          }
        }
      }

      if (giftDesign.front_card_stickers && Array.isArray(giftDesign.front_card_stickers)) {
        const validStickers = giftDesign.front_card_stickers
          .filter(isValidStickerObject)
          .map(sticker => ({
            id: sticker.id,
            emoji: sticker.emoji,
            x: sticker.x,
            y: sticker.y,
            rotation: sticker.rotation
          }));
        setPlacedStickers(validStickers);
      }
    }
  }, [giftDesign, setSelectedThemeOption, setPlacedStickers]);

  const isValidPatternType = (type: any): type is PatternType => {
    return ['dots', 'grid', 'waves', 'none'].includes(type);
  };

  const isValidSticker = (sticker: any): sticker is Sticker => {
    return (
      sticker &&
      typeof sticker.id === 'string' &&
      typeof sticker.emoji === 'string' &&
      typeof sticker.x === 'number' &&
      typeof sticker.y === 'number' &&
      typeof sticker.rotation === 'number'
    );
  };

  useEffect(() => {
    const saveChanges = async () => {
      if (!token || !giftDesign || !user) {
        console.error('Missing required data for saving changes');
        return;
      }

      try {
        const stickersForDb = placedStickers.map(sticker => ({
          id: sticker.id,
          emoji: sticker.emoji,
          x: sticker.x,
          y: sticker.y,
          rotation: sticker.rotation
        }));

        const { error } = await supabase
          .from('gift_designs')
          .update({
            front_card_pattern: selectedThemeOption.pattern.type,
            front_card_stickers: stickersForDb,
            theme: selectedThemeOption.text,
            last_edited_at: new Date().toISOString()
          })
          .eq('token', token)
          .eq('user_id', user.id);

        if (error) throw error;

        queryClient.setQueryData(['gift-design', token], (oldData: any) => ({
          ...oldData,
          front_card_pattern: selectedThemeOption.pattern.type,
          front_card_stickers: stickersForDb,
          theme: selectedThemeOption.text,
          last_edited_at: new Date().toISOString()
        }));

        console.log('Card changes saved successfully');
      } catch (err) {
        console.error('Error saving card changes:', err);
        toast.error('Failed to save changes');
      }
    };

    const timeoutId = setTimeout(saveChanges, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedThemeOption, placedStickers, token, queryClient, giftDesign, user]);

  const handleBackClick = () => {
    navigate('/home');
  };

  const getPatternStyle = (pattern: ThemeOption['pattern']) => {
    switch (pattern.type) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${pattern.color} 10%, transparent 11%)`,
          backgroundSize: '20px 20px'
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(to right, ${pattern.color} 1px, transparent 1px),
                           linear-gradient(to bottom, ${pattern.color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      case 'waves':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, ${pattern.color} 0px, ${pattern.color} 2px,
                           transparent 2px, transparent 8px)`,
          backgroundSize: '20px 20px'
        };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <div 
      className="min-h-screen relative transition-colors duration-300"
      style={{ backgroundColor: selectedThemeOption.screenBgColor }}
    >
      <div className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 10%, transparent 11%)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 sm:p-4 gap-2">
          <button 
            onClick={() => navigate('/home')}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-full flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 sm:h-10 px-2 sm:px-4 rounded-full text-sm sm:text-base">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1 sm:mr-2"
                    style={{ backgroundColor: selectedThemeOption.screenBgColor }}
                  />
                  <span className="hidden xs:inline">Background</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className="w-12 h-12 rounded-lg border-2 transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: selectedThemeOption.screenBgColor === color.value ? '#000' : 'transparent'
                      }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <ThemeSelector
              themes={[selectedThemeOption]}
              selectedTheme={selectedThemeOption}
              onThemeChange={setSelectedThemeOption}
            />
          </div>
          
          <Button 
            onClick={() => navigate('/insideleftscreen')}
            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 font-medium shadow-lg hover:bg-white/95 transition-colors text-sm sm:text-base flex-shrink-0"
          >
            Next
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div 
            ref={cardRef}
            className={`${selectedThemeOption.bgColor} rounded-lg aspect-[3/4] w-full max-w-md shadow-lg p-8 transition-colors duration-300 relative card-container overflow-hidden`}
          >
            <div 
              className="absolute inset-0 z-0" 
              style={getPatternStyle(selectedThemeOption.pattern)}
            />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-8 pointer-events-none">
              <div className="text-center">
                {selectedThemeOption.text.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={`text-3xl sm:text-5xl md:text-8xl font-serif ${selectedThemeOption.textColors[index % selectedThemeOption.textColors.length]}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              
              <div className="text-4xl sm:text-5xl md:text-6xl animate-bounce">
                {selectedThemeOption.emoji}
              </div>
            </div>

            <StickerLayer
              stickers={placedStickers}
              selectedSticker={selectedSticker}
              cardRef={cardRef}
              onStickerTap={handleStickerTap}
              onStickerDragEnd={handleStickerDragEnd}
              onStickerRemove={handleStickerRemove}
              onStickerRotate={handleStickerRotate}
            />
          </div>
        </div>

        <PatternSelector
          currentPattern={selectedThemeOption.pattern.type}
          onPatternChange={handlePatternChange}
        />

        <div className="flex justify-center pb-8 relative">
          <div className="relative">
            <button 
              onClick={() => setShowStickers(!showStickers)}
              className="w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/95 transition-colors"
            >
              <span className="text-2xl">⭐</span>
            </button>
            
            {showStickers && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-2 min-w-[200px]">
                {stickerOptions.map((sticker, index) => (
                  <button 
                    key={index}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-full transition-colors"
                    onClick={() => handleStickerClick(sticker.emoji)}
                  >
                    <span className="text-2xl">{sticker.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FrontCard = () => {
  return (
    <ThemeProvider>
      <FrontCardContent />
    </ThemeProvider>
  );
};

export default FrontCard;
