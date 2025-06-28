import { ActivityIndicator, ViewToken, Alert, Linking, Pressable, Text, View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { BookType } from "@/utils/types";
import { Image } from "expo-image";
import { Image as ReactImage } from 'react-native';
import { getRefreshToken, isTokenExpired } from "@/utils/secureStore";
import { StatusBar } from "expo-status-bar";
import { BookCardImage } from "@/Component/BookCard";
import ShowMoreText from "@/Component/ShowMoreText"
import { FlashList } from "@shopify/flash-list";
import { useVideoPlayerStore } from "@/store/playerStore";
import BookFilter from '@/Component/BookFilter';

export default function Index() {

  const [Books, setBooks] = useState<BookType[]>([])
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setisLoadingMore] = useState(false)
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('')


  // console.log("Books: ", Books)

  const router = useRouter()

  const { pauseAllVideos } = useVideoPlayerStore();
  const { fetchAllBooks, fetchBooksByGenre, isLoading } = useAuthStore()
  const limit = 5 // Number of books to fetch per page


  useEffect(() => {
    (async () => {
      setIsInitialLoading(true)
      setBooks([])
      const result = await fetchAllBooks(1, limit)
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



  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      setBooks([]) // Clear the current books to fetch fresh data
      const result = await fetchAllBooks(1, limit)
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

      const result = await fetchAllBooks(nextPage, limit)
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

  // Handle viewability changes
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = viewableItems.map(item => item.item._id);
    setVisibleItems(visibleIds);

    // Pause all videos when scrolling fast or when no items are visible
    if (visibleIds.length === 0) {
      pauseAllVideos();
    }
  }, [pauseAllVideos]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Item must be 50% visible
  };



  //   const loadBooks = async (page: number, limit: number, genre: string = '') => {
  //   if (genre) {
  //     return await fetchBooksByGenre(genre, page, limit)
  //   } else {
  //     return await fetchAllBooks(page, limit)
  //   }
  // }

  // const handleFilterChange = async (genre: string) => {
  //   setSelectedGenre(genre)
  //   setIsInitialLoading(true)
  //   setBooks([])

  //   const result = await loadBooks(1, limit, genre)
  //   if (result.success) {
  //     setBooks([...result.data.books])
  //     setHasMore(result.data.totalPages > 1)
  //     setPageNo(1)
  //     setIsInitialLoading(false)
  //   } else {
  //     console.log("Error fetching filtered books: ", result.message)
  //     setIsInitialLoading(false)
  //   }
  // }\

  // const handleFilterChange = async (genre: string) => {
  //   console.log("print hii from filter change")
  // }





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
        {/* <Link href={{
          pathname: "/page/[id]",
          params: { id: item._id, title: item.title }
        }} > */}
        <BookCardImage item={item} shouldPlay={isVisible} />
        {/* </Link> */}
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
              data={Books}
              renderItem={renderBookCard}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.1}
              onEndReached={loadMoreBooks}
              contentContainerStyle={{ paddingBottom: 16 }}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              ListFooterComponent={
                isLoadingMore ? () => (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1976D2" />
                  </View>
                ) : (
                  <View />
                )

              }
              ListEmptyComponent={() => (
                <View className="flex-1 items-center justify-center p-8">
                  <Ionicons name="book-outline" size={64} color="#6d93b8" />
                  <Text className="text-textPrimary text-2xl font-bold mt-4">No books found</Text>
                  <Text className="text-placeholderText text-center mt-2">Be the first to recommend a book or pull down to refresh</Text>
                  <View className="mt-6 border border-cardBackground rounded-lg p-4 bg-cardBackground/10">
                    <Text className="text-textDark text-center italic">"The more that you read, the more things you will know. The more that you learn, the more places you'll go." - Dr. Seuss</Text>
                  </View>
                </View>
              )}
              ListHeaderComponent={() => (
                <View className="flex items-center justify-center px-5 mb-3">
                  <View className="flex items-center " >
                    <Text className='text-textPrimary text-5xl' >Suggest 📚 </Text>
                    <Text>Discover great Learning from community 👇 </Text>
                  </View>
                  {/* <BookFilter
                    onFilterChange={handleFilterChange}
                    selectedGenre={selectedGenre}
                  /> */}
                </View>
              )}
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