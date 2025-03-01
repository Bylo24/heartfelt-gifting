
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Layout, Sticker } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeType } from "@/utils/giftThemes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchTemplatesByTheme, GiftCardTemplate } from "@/utils/giftCardTemplates";
import { toast } from "sonner";

interface GiftCardProps {
  theme: ThemeType;
  messageVideo: File | null;
  memories: Array<{
    id: string;
    imageUrl?: string;
    caption: string;
    date: Date;
  }>;
  amount: string;
}

export const GiftCard = ({ theme, messageVideo, memories, amount }: GiftCardProps) => {
  const [currentPage, setCurrentPage] = useState<'front' | 'left' | 'right' | 'back'>('front');
  const [isRevealed, setIsRevealed] = useState(false);
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GiftCardTemplate | null>(null);
  const [placedStickers, setPlacedStickers] = useState<Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const themeTemplates = await fetchTemplatesByTheme(theme);
        setTemplates(themeTemplates);
        if (themeTemplates.length > 0) {
          setSelectedTemplate(themeTemplates[0]);
        }
      } catch (error) {
        toast.error("Failed to load templates");
        console.error(error);
      }
    };

    loadTemplates();
  }, [theme]);

  const handleDragEnd = (info: any, sticker: { id: string; emoji: string }) => {
    const position = {
      id: `${sticker.id}-${Date.now()}`,
      emoji: sticker.emoji,
      x: info.point.x,
      y: info.point.y,
      rotation: Math.random() * 30 - 15
    };
    setPlacedStickers([...placedStickers, position]);
  };

  const getPageIndex = (page: 'front' | 'left' | 'right' | 'back') => {
    const pages = ['front', 'left', 'right', 'back'];
    return pages.indexOf(page);
  };

  const handleNextPage = () => {
    const pages = ['front', 'left', 'right', 'back'];
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1] as 'front' | 'left' | 'right' | 'back');
    }
  };

  const handlePreviousPage = () => {
    const pages = ['front', 'left', 'right', 'back'];
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1] as 'front' | 'left' | 'right' | 'back');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'front':
        return (
          <div 
            className="w-full h-full flex flex-col items-center justify-between p-6 bg-white rounded-lg relative overflow-hidden"
            style={{
              backgroundImage: selectedTemplate ? `url(${selectedTemplate.image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            
            {placedStickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                className="absolute text-4xl"
                style={{
                  x: sticker.x,
                  y: sticker.y,
                  rotate: sticker.rotation,
                  cursor: 'move'
                }}
              >
                {sticker.emoji}
              </motion.div>
            ))}

            <div className="relative flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl">🎁</div>
              <h2 className="text-2xl font-bold text-center text-white">
                You've received a gift!
              </h2>
              <p className="text-white/90 text-center">Swipe or tap to open</p>
            </div>

            <div className="relative flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                    <Layout className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <img
                            src={template.image_url}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm text-white">{template.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                    <Sticker className="h-4 w-4 mr-2" />
                    Stickers
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Stickers</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="grid grid-cols-4 gap-4">
                      {['🎈', '🎁', '🎊', '🎉', '💝', '💖', '✨', '⭐'].map((emoji, index) => (
                        <motion.div
                          key={index}
                          className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-3xl cursor-move"
                          drag
                          dragSnapToOrigin
                          onDragEnd={(_, info) => handleDragEnd(info, { id: String(index), emoji })}
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );

      case 'left':
        return (
          <div className="w-full h-full bg-white rounded-lg p-4">
            <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
              {messageVideo ? (
                <video
                  className="w-full h-full object-cover rounded-lg"
                  src={URL.createObjectURL(messageVideo)}
                  controls
                  playsInline
                />
              ) : (
                <p className="text-gray-500">Video message will appear here</p>
              )}
            </div>
          </div>
        );

      case 'right':
        return (
          <div className="w-full h-full bg-white rounded-lg p-4 space-y-4">
            <div className="space-y-4">
              {memories.map((memory) => (
                <div key={memory.id} className="space-y-2">
                  {memory.imageUrl && (
                    <img
                      src={memory.imageUrl}
                      alt={memory.caption}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <p className="text-sm text-gray-600">{memory.caption}</p>
                </div>
              ))}
              {memories.length === 0 && (
                <p className="text-center text-gray-500">Memories will appear here</p>
              )}
            </div>
          </div>
        );

      case 'back':
        return (
          <div className="w-full h-full bg-white rounded-lg p-4">
            <div 
              className="w-full h-full flex flex-col items-center justify-center space-y-6 cursor-pointer"
              onClick={() => setIsRevealed(true)}
            >
              {isRevealed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-white">${amount}</span>
                </motion.div>
              ) : (
                <p className="text-gray-500">Tap to reveal amount</p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] relative">
      <motion.div
        className="w-full h-full"
        animate={{ 
          rotateY: getPageIndex(currentPage) * 90,
          transition: { duration: 0.5 }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {renderPage()}
      </motion.div>
      
      <div className="absolute top-1/2 left-4 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage === 'front'}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === 'back'}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
