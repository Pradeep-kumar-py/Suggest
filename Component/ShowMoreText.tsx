// filepath: Component/ShowMoreText.tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ShowMoreTextProps {
  text: string;
  noLine?: number;
}

const renderFormattedText = (text: string) => {
  if (!text) return null;

  const blocks = text.split('\n');
  
  return blocks.map((block, index) => {
    let isHeading = false;
    let headingLevel = 0;
    let content = block;

    const headingMatch = block.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      isHeading = true;
      headingLevel = headingMatch[1].length;
      content = headingMatch[2];
    }

    // Parse inline elements: **bold** and *italic*
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    const inlineRender = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <Text key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
      } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <Text key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });

    const getFontSize = () => {
        if (!isHeading) return 15;
        if (headingLevel === 1) return 20;
        if (headingLevel === 2) return 18;
        if (headingLevel === 3) return 16;
        return 15;
    }

    return (
      <Text 
        key={index} 
        style={{ 
            fontWeight: isHeading ? 'bold' : 'normal',
            fontSize: getFontSize(),
            color: isHeading ? '#1e3a8a' : '#334155'
        }}
      >
        {inlineRender}
        {index < blocks.length - 1 ? '\n' : ''}
      </Text>
    );
  });
};

const ShowMoreText = ({ text='', noLine = 2 }: ShowMoreTextProps) => {
  const [expanded, setExpanded] = useState(false);

  // Simple check for more than `noLine` lines or long text
  const shouldShowMore = text.split('\n').length > noLine || text.length > 100;

  return (
    <View>
      <Text numberOfLines={expanded ? undefined : noLine} style={{ lineHeight: 22 }}>
        {renderFormattedText(text)}
      </Text>
      {shouldShowMore && (
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text style={{ color: '#1976D2', marginTop: 4, fontWeight: '500' }}>
            {expanded ? 'Show less' : 'Read more...'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ShowMoreText;


