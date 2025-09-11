import { ActivityIndicator, ViewToken, Alert, Linking, Pressable, Text, View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { BookType } from "@/utils/types";
import { Image } from "expo-image";
import { Image as ReactImage } from 'react-native';
import { getRefreshToken, isTokenExpired } from "@/utils/secureStore";
import { StatusBar } from "expo-status-bar";
import { BookCardImage } from "@/Component/BookCard";
import ShowMoreText from "@/Component/ShowMoreText"
import { FlashList } from "@shopify/flash-list";
import { Picker } from "@react-native-picker/picker";
import { demoBooks } from "@/utils/DemoData";

// import RNPickerSelect from 'react-native-picker-select';




export default function Index() {

  const [Books, setBooks] = useState<BookType[]>([])
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setisLoadingMore] = useState(false)
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedTab, setSelectedTab] = useState<'post' | 'video'>('post');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

const genreOptions = [
  { label: 'All Genres', value: '' },
  { label: 'Fiction', value: 'fiction' },
  { label: 'Non-Fiction', value: 'non-fiction' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Biography', value: 'biography' },
  { label: 'History', value: 'history' },
  { label: 'Self-Help', value: 'self-help' },
  { label: 'Business', value: 'business' },
  { label: 'Programming', value: 'programming' },
  { label: 'Design', value: 'design' },
  { label: 'Cooking', value: 'cooking' },
  { label: 'Travel', value: 'travel' },
  { label: 'Health', value: 'health' },
  { label: 'Philosophy', value: 'philosophy' },
  { label: 'Education', value: 'education' }
];


  // console.log("Books: ", Books)

  const router = useRouter()

  const { fetchAllBooks, isLoading } = useAuthStore()
  const limit = 10 // Number of books to fetch per page

  const categorizeBooks = (books: BookType[]) => {
    return books.map(book => ({
      ...book,
      mediaType: book.image.match(/\.(mp4|mov|mkv)$/i) ? 'video' as const : 'post' as const
    }));
  };



  useEffect(() => {
    (async () => {
      setIsInitialLoading(true)
      setBooks([])
      const result = await fetchAllBooks(1, limit, selectedGenre)
      // console.log("Result: ", result)
      if (result.success) {
        const categorizedBooks = categorizeBooks(result.data.books);
        setBooks(categorizedBooks)
        setHasMore(result.data.totalPages > 1)
        setPageNo(1)
        setIsUsingDemoData(false);
        setIsInitialLoading(false)

      } else {
        console.log("Error fetching books: ", result.message)
        const categorizedDemoBooks = categorizeBooks(demoBooks);
        setBooks(categorizedDemoBooks);
        setHasMore(false); // No more pages for demo
        setIsUsingDemoData(true); // Indicate demo data is in use
        setIsInitialLoading(false)
      }
    })()
  }, [selectedGenre])

  const filteredBooks = useMemo(() => {
    return Books.filter(book => book.mediaType === selectedTab);
  }, [Books, selectedTab]);


  // const handleRefresh = async () => {
  //   setIsRefreshing(true)
  //   try {
  //     setBooks([]) // Clear the current books to fetch fresh data
  //     const result = await fetchAllBooks(1, limit)
  //     console.log("Result from handle refresh: ", result)
  //     if (result.success) {
  //       const categorizedBooks = categorizeBooks(result.data.books);
  //       setBooks(categorizedBooks)
  //       setPageNo(1)
  //       setHasMore(1 < result.data.totalPages)
  //     } else {
  //       console.log("Error fetching books: ", result.message)
  //     }
  //   } catch (error) {
  //     console.log("Error fetching books: ", error)

  //   } finally {
  //     setIsRefreshing(false)
  //   }
  // };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setBooks([]); // Clear the current books to fetch fresh data
      const result = await fetchAllBooks(1, limit, selectedGenre);
      if (result.success) {
        const categorizedBooks = categorizeBooks(result.data.books);
        setBooks(categorizedBooks);
        setPageNo(1);
        setHasMore(1 < result.data.totalPages);
        setIsUsingDemoData(false);
      } else {
        console.log("Error fetching books: ", result.message);
        // Fallback to demo data
        const categorizedDemoBooks = categorizeBooks(demoBooks);
        setBooks(categorizedDemoBooks);
        setHasMore(false);
        setIsUsingDemoData(true);
      }
    } catch (error) {
      console.log("Error fetching books: ", error);
      // Fallback to demo data on exception
      const categorizedDemoBooks = categorizeBooks(demoBooks);
      setBooks(categorizedDemoBooks);
      setHasMore(false);
      setIsUsingDemoData(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreBooks = async () => {
    if (!hasMore || isLoading || isLoadingMore) return // Prevent loading more if there are no more books

    setisLoadingMore(true)
    try {
      const nextPage = pageNo + 1 // Increment the page number

      const result = await fetchAllBooks(nextPage, limit, selectedGenre)
      console.log("Result from load more books: ", result)
      if (result.success) {
        const categorizedBooks = categorizeBooks(result.data.books);
        setBooks(prevBooks => [...prevBooks, ...categorizedBooks]) // Append new books to the existing list
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





  // Update the renderBookCard function to check media type
  const renderBookCard = ({ item }: { item: BookType }) => {
    const isVisible = visibleItems.includes(item._id);

    return (
      <View style={styles.cardBackground} className=" relative flex p-3 rounded-lg shadow-md mb-4 mx-5">
        <View className="flex-row  items-center   " >
          <Image
            source={
              item?.user?.profileImage
                ? { uri: item?.user?.profileImage }
                : require('../../assets/images/user12.jpeg')
            }
            style={{
              width: 35,
              height: 35,
              aspectRatio: 1,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "#6d93b8",
            }}
          />
          <Text className="capitalize font-bold text-textPrimary text-xl ml-3 " >{item.user?.name}</Text>
        </View>
        <BookCardImage item={item} shouldPlay={selectedTab === 'video' && isVisible} />
        <View className='relative flex-row items-center justify-between ' >
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
            <View className="text-placeholderText w-full ">
              <ShowMoreText text={item.caption} noLine={2} />
            </View>
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
        </View>
      </View>
    )
  }


  const LoadingFooter = React.memo(() => (
    <View style={{ paddingVertical: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#1976D2" />
    </View>
  ));

  const EmptyFooter = React.memo(() => <View />);

  const ListEmpty = React.memo(() => (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name="book-outline" size={64} color="#6d93b8" />
      <Text className="text-textPrimary text-2xl font-bold mt-4">No books found</Text>
      <Text className="text-placeholderText text-center mt-2">
        Be the first to recommend a book or pull down to refresh
      </Text>
      <View className="mt-6 border border-cardBackground rounded-lg p-4 bg-cardBackground/10">
        <Text className="text-textDark text-center italic">
          "The more that you read, the more things you will know. The more that you learn, the more places you'll go." - Dr. Seuss
        </Text>
      </View>
    </View>
  ));


  const ListHeader = React.memo(() => (
    <View className="flex items-center justify-center px-5 mb-3">
      <View className="flex items-center">
        <Text className='text-textPrimary text-4xl'>Suggest 📚</Text>
        <Text>Discover great Learning from community 👇</Text>
      </View>
      <View className="flex flex-row justify-center gap-2 w-full mt-4 px-1">
        <Pressable
          onPress={() => setSelectedTab('post')}
          className={`flex-1 bg-white shadow-md rounded-2xl py-4 px-6 flex justify-center items-center border ${selectedTab === 'post'
            ? 'border-blue-300 bg-blue-50'
            : 'border-blue-100'
            } active:bg-blue-50`}
        >
          <View className="flex-row items-center gap-2">
            <View className={`rounded-full p-2 ${selectedTab === 'post' ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
              <Ionicons name="create-outline" size={16} color="white" />
            </View>
            <Text className={`text-lg font-semibold ${selectedTab === 'post' ? 'text-blue-700' : 'text-blue-600'
              }`}>Post</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setSelectedTab('video')}
          className={`flex-1 bg-white shadow-md rounded-2xl py-4 px-6 flex justify-center items-center border ${selectedTab === 'video'
            ? 'border-purple-300 bg-purple-50'
            : 'border-purple-100'
            } active:bg-purple-50`}
        >
          <View className="flex-row items-center gap-2">
            <View className={`rounded-full p-2 ${selectedTab === 'video' ? 'bg-purple-600' : 'bg-purple-500'
              }`}>
              <Ionicons name="videocam-outline" size={16} color="white" />
            </View>
            <Text className={`text-lg font-semibold ${selectedTab === 'video' ? 'text-purple-700' : 'text-purple-600'
              }`}>Video</Text>
          </View>
        </Pressable>
      </View>
      <View className="mt-2 w-full relative">
        {/* Main Picker Button */}
        <Pressable
          onPress={() => setShowGenreDropdown(!showGenreDropdown)}
          className="bg-blue-50 rounded-lg border border-gray-300 mx-1 h-12  px-3 flex-row justify-between items-center"
        >
          <Text className="text-gray-800 text-base">
            {selectedGenre === '' ? 'All Genres' : selectedGenre}
          </Text>
          <Ionicons
            name={showGenreDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#333"
          />
        </Pressable>

        {/* Custom Dropdown - starts exactly at bottom border */}
        {showGenreDropdown && (
          <View className="absolute top-12 left-1 right-1 bg-blue-50 rounded-lg rounded-t-none border border-gray-300 border-t-0 shadow-lg z-50">
            {genreOptions.map((genre, index) => (
              <Pressable
                key={genre.value}
                onPress={() => {
                  setSelectedGenre(genre.label);
                  setShowGenreDropdown(false);
                }}
                className={`p-4 ${index < 4 ? 'border-b border-gray-200' : ''} ${selectedGenre === genre.value ? 'bg-blue-100' : 'bg-transparent'
                  }`}
              >
                <Text className={`text-gray-800 text-base ${selectedGenre === genre.value ? 'font-bold' : 'font-normal'
                  }`}>
                  {genre.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  ));




  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.backGround} className="h-full " >
        <View className="flex-1 mt-6 " >
          {isInitialLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1976D2" />
            </View>
          ) : (
            <FlashList
              data={filteredBooks}
              renderItem={renderBookCard}
              estimatedItemSize={604}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.1}
              onEndReached={loadMoreBooks}
              contentContainerStyle={{ paddingBottom: 16 }}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              removeClippedSubviews={true}
              ListFooterComponent={isLoadingMore ? LoadingFooter : EmptyFooter}
              ListEmptyComponent={ListEmpty}
              ListHeaderComponent={ListHeader}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  backGround: {
    backgroundColor: '#e3f2fd',
  },
  cardBackground: {
    backgroundColor: '#f5f9ff',
  }

})