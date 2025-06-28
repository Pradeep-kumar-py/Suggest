import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookFilterProps {
  onFilterChange: (genre: string) => void;
  selectedGenre: string;
}

const BookFilter = ({ onFilterChange, selectedGenre }: BookFilterProps) => {
  const genres = [
    'All', 'Fiction', 'Non-Fiction', 'Technology', 'Science', 'Biography', 
    'History', 'Self-Help', 'Business', 'Programming', 'Design'
  ];

  return (
    <View className="mb-4">
      <Text className="text-textDark font-bold text-lg mb-2 px-5">Filter by Genre</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-5"
      >
        {genres.map((genre) => (
          <Pressable
            key={genre}
            onPress={() => onFilterChange(genre === 'All' ? '' : genre)}
            className={`mr-3 px-4 py-2 rounded-full border ${
              selectedGenre === (genre === 'All' ? '' : genre)
                ? 'bg-primary border-primary'
                : 'bg-cardBackground border-border'
            }`}
          >
            <Text
              className={`${
                selectedGenre === (genre === 'All' ? '' : genre)
                  ? 'text-white'
                  : 'text-textDark'
              } font-medium`}
            >
              {genre}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default BookFilter;