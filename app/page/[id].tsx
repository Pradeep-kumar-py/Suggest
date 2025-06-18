import { View, Text, StyleSheet, Pressable, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { BookType } from '@/utils/types';
import { BookCardImage } from '@/Component/BookCard';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ShowMoreText from '@/Component/ShowMoreText';
import { SafeAreaView } from 'react-native-safe-area-context';

const ComponentPage = () => {
    const { isLoading, getSingleBook } = useAuthStore()
    const { id } = useLocalSearchParams();
    console.log("ComponentPage id: ", id)

    const [SingleBook, setSingleBook] = useState<BookType | null>(null)
    console.log("SingleBook: ", SingleBook)
    

    
    useEffect(() => {
        (async () => {
            if (id) {
                const result = await getSingleBook(id as string)
                // console.log("SingleBook: ", result)
                if (result.success) {
                    setSingleBook(result.data.book)
                } else {
                    console.log("Error fetching book: ", result.message)
                }
            }
        })()
    }, [])
    
    
    if (isLoading) {
        return <Text>Loading...</Text>
    }
    
    if (!SingleBook) {
        return <Text>No book found</Text>
    }
    
    const item = SingleBook as BookType;
    console.log("item: ", item)


    return (
        <SafeAreaView style={styles.cardBackground} className=" relative flex p-3 rounded-lg shadow-md mb-4 mx-5">
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
            <BookCardImage item={item} />
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
        </SafeAreaView>
    )
}

export default ComponentPage


const styles = StyleSheet.create({
    backGround: {
        backgroundColor: '#e3f2fd',
    },
    cardBackground: {
        backgroundColor: '#f5f9ff',
    }

})