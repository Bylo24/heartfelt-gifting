
import { Video, Image, Star, DollarSign } from "lucide-react";
import { PatternType } from "@/types/gift";

interface PreviewCardProps {
  pageIndex: number;
  themeOption: {
    text: string;
    emoji: string;
    bgColor: string;
    textColors: string[];
    pattern: {
      type: PatternType;
      color: string;
    };
  };
  getPatternStyle: (pattern: { type: PatternType; color: string }) => React.CSSProperties;
}

export const PreviewCard = ({ pageIndex, themeOption, getPatternStyle }: PreviewCardProps) => {
  return (
    <div className={`${themeOption.bgColor} w-full h-full rounded-xl relative overflow-hidden`}>
      <div 
        className="absolute inset-0" 
        style={getPatternStyle(themeOption.pattern)}
      />
      {pageIndex === 0 ? (
        <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-8 p-4">
          <div className="text-center">
            {themeOption.text.split('').map((letter, index) => (
              <span 
                key={index} 
                className={`text-2xl sm:text-3xl md:text-4xl font-serif ${themeOption.textColors[index % themeOption.textColors.length]}`}
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl animate-bounce">
            {themeOption.emoji}
          </div>
        </div>
      ) : pageIndex === 1 ? (
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-4">
            <Video className="h-8 w-8 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
            Video message
          </span>
        </div>
      ) : pageIndex === 2 ? (
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-4">
            <Image className="h-8 w-8 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
            Photo memories
          </span>
          <div className="flex flex-col items-center justify-center mt-4">
            <Star className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Add your first memory</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-4">
            <DollarSign className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-gray-700 mb-2">$50</span>
            <span className="text-sm font-medium text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
              Gift amount
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
