import { View, Text, KeyboardAvoidingView, ScrollView, TextInput, Pressable, Platform, Button } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'
import { useAuthStore } from '@/store/authStore';
import { clearSecureStore } from '@/utils/secureStore';
import { StatusBar } from 'expo-status-bar';
import { MotiPressable } from 'moti/interactions'
import { AnimatedButton } from '@/Component/AnimatedButton';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Picker } from '@react-native-picker/picker';


const Upload = () => {

  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [rating, setRating] = useState(0)
  const [link, setLink] = useState('')
  const [mediaFile, setMediaFile] = useState<any>(null);
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | undefined>(undefined);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [genre, setGenre] = useState('')
  const [availableGenres, setAvailableGenres] = useState<string[]>([])

  const { uploadBook, isLoading } = useAuthStore()

  const genres = [
    'Fiction', 'Non-Fiction', 'Technology', 'Science', 'Biography',
    'History', 'Self-Help', 'Business', 'Programming', 'Design',
    'Cooking', 'Travel', 'Health', 'Philosophy', 'Education'
  ]


  const pickImageAsync = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!image.canceled) {
      console.log(image);

      const asset = image.assets[0];
      setMediaFile({
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        // name: asset.fileName ?? 'photo.jpg',
        name: asset.fileName ?? (asset.mimeType?.startsWith('video') ? 'video.mp4' : 'photo.jpg'),
      })

      setSelectedMediaUri(asset.uri);
      setMediaType(asset.mimeType?.startsWith('video') ? 'video' : 'image');

      // Get image dimensions
      // Use dimensions from asset
      if (asset.width && asset.height) {
        setImageDimensions({ width: asset.width, height: asset.height });
      } else {
        setImageDimensions(null);
      }

    } else {
      alert('You did not select any image.');
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !rating || !genre) {
      alert("Please fill in all fields")
      return
    }

    const formData = new FormData();

    // Append the image file if available
    if (mediaFile) {
      formData.append('image', mediaFile as any);
    }

    // Append other form data
    formData.append('title', title);
    formData.append('caption', caption);
    formData.append('rating', rating.toString());
    formData.append('link', link);
    formData.append('genre', genre); // Add genre to form data

    try {
      const result = await uploadBook(formData);
      console.log("Upload Result: ", result);
      if (result.success) {
        alert("Book uploaded successfully!");
        // Reset form or navigate away
        setTitle('');
        setCaption('');
        setRating(0);
        setLink('');
        setMediaFile(null);
        setGenre('');
        setSelectedMediaUri(undefined);
      } else {
        console.error("Upload failed123: ", result.message);
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      alert("An error occurred while uploading the book");
      console.error(error);
    }

  };

  const videoSource = selectedMediaUri || '';

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true; // Loop the video
    player.play(); // Start playing the video immediately
  })



  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView className="flex-1 "
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80} // adjust if you have headers
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            <View className="border-[1px] flex-1 border-border p-5 mx-5 my-safe-or-7  rounded-lg bg-cardBackground drop-shadow-lg relative " >
              <View className="flex justify-center items-center mb-5" >
                <Text className="font-bold text-textPrimary text-xl " >Add Book || Course Recommendation</Text>
                <Text className='text-textSecondary text-sm' >Share your favourite reads with others</Text>
              </View>
              <View className='flex items-center relative ' >
                <View className="w-full my-4 " >
                  <Text className="text-textPrimary font-semibold mb-1 ">Book or Course Title</Text>
                  <View className="flex-row items-center border-[1px] border-border rounded-lg p-1 pl-2 " >
                    <Ionicons name="book-outline" size={20} color="#1976D2" />
                    <TextInput
                      className="text-textSecondary flex-1 rounded-lg p-2 "
                      placeholder='Enter book title'
                      value={title}
                      onChangeText={setTitle}
                      placeholderTextColor="#767676"
                    />
                  </View>
                </View>
                <View className="w-full mb-4 " >
                  <Text className='text-textPrimary font-semibold mb-1 ' >Your Rating</Text>
                  <View className="flex-row  items-center justify-evenly border-[1px] border-border rounded-lg p-2 " >
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setRating(item)}
                        className="flex-row items-center justify-center"
                      >
                        <Ionicons
                          name={rating >= item ? "star-sharp" : "star-outline"}
                          size={36}
                          color={rating >= item ? "#FFD700" : "#6d93b8"} // yellow or blue
                        />
                      </Pressable >
                    ))}
                  </View>
                </View>
                <View className="w-full mb-4">
                  <Text className='text-textPrimary font-semibold mb-1'>Genre/Category</Text>
                  <View className="border-[1px] border-border rounded-lg ">
                    <Picker
                      selectedValue={genre}
                      onValueChange={setGenre}
                      style={{ color: '#767676' }}
                    >
                      <Picker.Item label="Select a genre..." value="" />
                      {genres.map((g) => (
                        <Picker.Item key={g} label={g} value={g} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View className="w-full mb-4 relative">
                  <Text className="text-textPrimary font-semibold mb-1">Book or Course Image</Text>
                  <Pressable
                    onPress={!selectedMediaUri ? pickImageAsync : undefined}
                    className="flex items-center justify-center border-[1px] border-border rounded-lg p-[2px] "
                  >
                    {selectedMediaUri && imageDimensions && mediaType === 'image' ? (
                      <View className="flex items-center justify-center w-full">
                        <Image
                          source={{ uri: selectedMediaUri }}
                          style={{
                            width: '100%',
                            aspectRatio: imageDimensions.width / imageDimensions.height,
                            borderRadius: 8,
                            alignSelf: 'center',
                          }}
                          contentFit="cover"
                          alt="Selected Image"
                        />
                        <Pressable
                          onPress={pickImageAsync}
                          className="bg-primary px-4 py-2 w-full rounded-lg mt-2 justify-center flex-row items-center"
                        >
                          <Ionicons name="image-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                          <Text className="text-white font-semibold text-base">Select other</Text>
                        </Pressable>
                      </View>
                    ) : selectedMediaUri && imageDimensions && mediaType === 'video' ? (
                      <View className="flex items-center justify-center w-full">
                        <VideoView
                          player={player}
                          style={{
                            width: '100%',
                            aspectRatio: imageDimensions.width / imageDimensions.height,
                            borderRadius: 8,
                            alignSelf: 'center',
                          }}
                        />
                        <Pressable
                          onPress={pickImageAsync}
                          className="bg-primary w-full px-4 py-2 rounded-lg mt-2 self-center flex-row items-center"
                          style={{ minWidth: 140, justifyContent: 'center' }}
                        >
                          <Ionicons name="image-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                          <Text className="text-white font-semibold text-base">Select other</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View className="flex items-center justify-center h-64 w-full">
                        <Ionicons name="image-outline" size={50} color="#1976D2" />
                        <Text className="text-textSecondary text-sm">📷 Photo or 🎥 Video • Under 20MB</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
                <View className="w-full mb-4 relative ">
                  <Text className="text-textPrimary font-semibold mb-1">Book Description</Text>
                  <View className="border-[1px] border-border rounded-lg  ">
                    <TextInput
                      className="text-textSecondary rounded-lg p-2 min-h-36 "
                      placeholder='Write your review or thoughts about the book or course... '
                      value={caption}
                      onChangeText={setCaption}
                      placeholderTextColor="#767676"
                      multiline={true}
                      numberOfLines={8}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
                <View className="w-full mb-4 relative ">
                  <Text className="text-textPrimary font-semibold mb-1">Link</Text>
                  <View className='flex-row items-center border-[1px] border-border rounded-lg p-2 ' >
                    <Ionicons name="link-outline" size={20} color="#1976D2" />
                    <TextInput
                      className="text-textSecondary  flex-1 rounded-lg p-2 "
                      placeholder='Enter book or course link'
                      value={link}
                      onChangeText={setLink}
                      placeholderTextColor="#767676"
                      multiline={true}
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
              {/* <Pressable onPress={handleSubmit} className="bg-primary p-2 rounded-lg mt-5">
                {isLoading ? (
                  <FontAwesome6 name="spinner" size={20} color="white" className="animate-spin ml-3 text-center" />
                ) : (
                  <Text className="text-white text-center">Add book or course</Text>
                )}
              </Pressable> */}
              <AnimatedButton handleSubmit={handleSubmit} isLoading={isLoading} />

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default Upload