import { View, Text, Pressable, ScrollView, FlatList, Alert, ActivityIndicator, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useAuthStore } from '@/store/authStore'
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { clearSecureStore } from '@/utils/secureStore'
import { useRouter } from 'expo-router'
import { fetchWithAuth } from '@/utils/refreshAccessToken'
import { UserBookType } from '@/utils/types'
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar'

const Profile = () => {

  const { user, fetchUserBooks, isLoading, uploadProfileImage, deleteBook } = useAuthStore()
  const router = useRouter()
  // console.log(user)

  const [Books, setBooks] = useState<UserBookType[]>([])
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setisLoadingMore] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);



  const limit = 5 // Number of books to fetch per page

  useEffect(() => {
    (async () => {
      setIsInitialLoading(true)
      setBooks([])
      const result = await fetchUserBooks(1, limit)
      // console.log("Result: ", result)
      if (result.success) {
        setBooks([...result.data.books])
        setHasMore(result.data.totalPages > 1)
        setPageNo(1)
        setIsInitialLoading(false)
      } else {
        console.log("Error fetching books: ", result.message)
        setIsInitialLoading(false)
      }
    })()
  }, [])
  // console.log("Books: ", Books)
  // console.log("hasmore", hasMore)
  // console.log("pageNo: ", pageNo) // Check if there are more books to load


  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      setBooks([]) // Clear the current books to fetch fresh data
      const result = await fetchUserBooks(1, limit)
      console.log("Result from handle refresh: ", result)
      if (result.success) {
        setBooks([...result.data.books])
        setPageNo(1)
        setHasMore(1 < result.data.totalPages)
      } else {
        console.log("Error fetching books: ", result.message)
      }
    } catch (error) {
      console.log("Error fetching books: ", error)
    } finally {
      setIsRefreshing(false)
    }
  };

  const loadMoreBooks = async () => {
    if (!hasMore || isLoading || isLoadingMore) return // Prevent loading more if there are no more books

    setisLoadingMore(true)
    try {
      const nextPage = pageNo + 1 // Increment the page number

      const result = await fetchUserBooks(nextPage, limit)
      console.log("Result from load more books: ", result)
      if (result.success) {
        setBooks(prevBooks => [...prevBooks, ...result.data.books]) // Append new books to the existing list
        setPageNo(nextPage) // Update the page number
        setHasMore(nextPage < result.data.totalPages) // Check if there are more pages
      } else {
        console.log("Error fetching books: ", result.message)
        // Alert.alert("Error", "Failed to load more books")
      }

      console.log("pageNo inside the try block cheaking if it has increased or not: ", pageNo) // Check if there are more books to load

    } catch (error) {
      console.log("Error fetching books: ", error)
      Alert.alert("Error", "Failed to load more books")
    } finally {
      setisLoadingMore(false)
    }
  }


  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        // 1) Build the image file object
        const imageData = {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? 'photo.jpg',
        };
        // 2) Store in state
        setImageFile(imageData);
        setSelectedImage(asset.uri);
        // 3) Return it
        return imageData;
      }
      return null;
    } catch (err) {
      console.error("Error picking image:", err);
      return null;
    }
  };


  const UploadImage = async () => {
    setUploadingImage(true);
    try {
      const selectedImageData = await selectImage();
      if (!selectedImageData) {
        setUploadingImage(false);
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', selectedImageData as any); // <-- this is the proper file object
      // <-- now this is the proper file object

      const result = await uploadProfileImage(formData);
      console.log("Upload Result:", result);
      Alert.alert(result.success ? "Uploaded!" : "Upload failed", result.message);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setImageFile(null);
      setUploadingImage(false);
    }
  };



  const handleProfileImage = () => {
    Alert.alert('Upload', 'Want to upload Profile image ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Upload',
        onPress: () => {
          UploadImage()
          console.log('Image Uploaded')
        },
        style: 'destructive',
      },
    ])
    console.log('Upload image pressed')
  }

  const deleteOneBook = async (bookId: string) => {
    try {
      const result = await deleteBook(bookId)
      console.log("Delete Result:", result);

      if (result.success) {
        // Update local state to remove the deleted book
        setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
        Alert.alert("Success", "Book deleted successfully");
      } else {
        Alert.alert("Error", result.message || "Failed to delete book");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete book");
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this book?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          deleteOneBook(bookId)
          console.log('Book deleted')
        },
        style: 'destructive',
      },
    ])

  }








  const UserBox = () => {
    return (
      <View className="flex justify-between bg-cardBackground p-4 rounded-lg shadow-md mx-5 my-4">
        <View className="flex-row gap-4 items-center">
          <Pressable onPress={handleProfileImage}>
            {uploadingImage ? (
              <FontAwesome6 name="spinner" size={20} color="blue" className="animate-spin ml-3 text-center" />
            ) : (
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : user?.profileImage
                      ? { uri: user.profileImage }
                      : require('../../assets/images/user12.jpeg')
                }
                style={{
                  width: '25%',
                  height: 80,
                  aspectRatio: 1,
                  borderRadius: 50,
                }}
                className="w-12 h-12 rounded-full mr-4"
              />
            )}
          </Pressable>
          <View className=' flex-1 ' >
            <Text className="text-3xl text-textDark font-bold capitalize ">{user?.name}</Text>
            <Text className="text-placeholderText">{user?.email}</Text>
            <Text className="text-placeholderText">
              Member since{'  '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
            </Text>
          </View>
        </View>
      </View>
    )
  }


  const renderBookCard = ({ item }: { item: UserBookType }) => {
    return (
      <View className=" relative flex-row bg-cardBackground p-3 rounded-lg shadow-md mb-4 mx-5">
        <View className='flex items-center justify-center' >
          <Image
            source={
              item?.image
                ? { uri: item.image }
                : require('../../assets/photos/bookimg.jpeg')
            }
            style={{
              width: '100%',
              height: 130,
              aspectRatio: 1,
              borderRadius: 10,
            }}
          />
        </View>
        <View className=' flex-1 relative flex-row items-center justify-between ' >
          <View className=' flex-1 gap-1 ml-4 ' >
            <Text className="text-textDark font-bold text-2xl capitalize">{item.title}</Text>
            <View className="flex-row  items-center rounded-lg " >
              {[1, 2, 3, 4, 5].map((items) => (
                <Ionicons
                  key={items}
                  size={15}
                  name={Number(item.rating) >= items ? "star-sharp" : "star-outline"}
                  color={Number(item.rating) >= items ? "#FFD700" : "#6d93b8"} // yellow or blue
                />
              ))}
            </View>
            <Text className="text-placeholderText">{item.caption}</Text>
            {item.link !== '' && (
              <Pressable
                onPress={() => Linking.openURL(item.link)}
                className="mt-1"
              >
                <Text
                  className="text-blue-600 underline"
                  numberOfLines={1}
                >
                  {item.link}
                </Text>
              </Pressable>
            )}
            <Text className="text-placeholderText">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
          </View>
          <Pressable onPress={() => handleDeleteBook(item._id)} className='w-8' >
            <MaterialIcons name="delete" size={30} color="#1976D2" />
          </Pressable>
        </View>
      </View>

    )
  }

  const logoutUser = async () => {
    await clearSecureStore();
    // Clear user data from the store
    Alert.alert("User logged out successfully")
    router.replace('/(auth)')
  }

  const handleLogout = () => {
    // Add your logout logic here
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => {
          logoutUser()
          console.log('User logged out')
        },
        style: 'destructive',
      },
    ])
    console.log('Logout pressed')
  }



  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-background">
        <View className='flex-1' >
          <UserBox />
          <Pressable onPress={handleLogout} className="flex-row items-center justify-center bg-primary p-2 rounded-lg mx-5 ">
            <Text className="text-white font-semibold text-lg">Logout</Text>
          </Pressable>
          <View className='px-8 mt-8  ' >
            <View className="flex-row justify-between items-center text-textDark mb-4 ">
              <Text className='text-2xl font-bold' >Your Recomendation</Text>
              <Text>Total Books{" "}{Books.length}</Text>
            </View>
          </View>
          {
            Books.length === 0 && !isInitialLoading && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-placeholderText">No books found</Text>
              </View>
            )
          }
          {isInitialLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1976D2" />
            </View>
          ) : (
            <FlatList
              data={Books}
              renderItem={renderBookCard}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.1}
              onEndReached={loadMoreBooks}
              contentContainerStyle={{ paddingBottom: 16 }}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              ListFooterComponent={
                isLoadingMore ? () => (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1976D2" />
                  </View>
                )
                  : null
              }
            />
          )}
        </View>
      </SafeAreaView>
    </>
  )
}

export default Profile
