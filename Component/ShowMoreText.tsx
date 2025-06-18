// filepath: Component/ShowMoreText.tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ShowMoreTextProps {
  text: string;
  noLine?: number;
}

const ShowMoreText = ({ text='', noLine = 2 }: ShowMoreTextProps) => {
  const [expanded, setExpanded] = useState(false);

  // Simple check for more than 2 lines or long text
  const shouldShowMore = text.split('\n').length > noLine || text.length > 100;

  return (
    <View>
      <Text numberOfLines={expanded ? undefined : noLine}>
        {text}
      </Text>
      {shouldShowMore && (
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text style={{ color: '#1976D2', marginTop: 2 }}>
            {expanded ? 'Show less' : 'Read more...'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ShowMoreText;


