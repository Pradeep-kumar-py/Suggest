import { View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { BookType } from '@/utils/types';
import { BookCardImage } from '@/Component/BookCard';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ShowMoreText from '@/Component/ShowMoreText';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FASTAPI_URI } from '@/utils/constant';

const ComponentPage = () => {
    const { isLoading, getSingleBook } = useAuthStore()
    const { id } = useLocalSearchParams();
    const [summary, setSummary] = useState<string | null>(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState<string | null>(null)

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

    const generateSummary = async () => {
        console.log("generate summary is pressed")
        setSummaryLoading(true)
        setSummaryError(null)
        try {
            const response = await fetch(`${FASTAPI_URI}/process-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: SingleBook?.title, image_url: SingleBook?.image }),
            })

            const data = await response.json()
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message);
            }
            setSummaryLoading(false)
            if (data.summary) {
                setSummary(data.summary)
            }
        } catch (error) {
            console.log("error while fetching data from fastapi");
            setSummaryLoading(false)
            if (error instanceof Error) {
                setSummaryError(error.message);
            }
        }
    }

    if (isLoading) {
        return <Text>Loading...</Text>
    }

    if (!SingleBook) {
        return <Text>No book found</Text>
    }

    const item = SingleBook as BookType;
    console.log("item: ", item)

    return (
        <>
            <StatusBar style="auto" />
            <SafeAreaView style={styles.backGround} className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.cardBackground} className="relative flex p-3 rounded-lg shadow-md mb-4 mx-5 mt-4">
                        {/* Profile section - matching your card layout */}
                        <View className="flex-row items-center mb-3">
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
                            <Text className="capitalize font-bold text-textPrimary text-xl ml-3">{item.user?.name}</Text>
                        </View>

                        {/* Book image */}
                        <BookCardImage item={item} />

                        {/* Book details section */}
                        <View className='relative flex-row items-center justify-between'>
                            <View className='flex-1 gap-1 ml-4'>
                                <Text className="text-textDark font-bold text-2xl capitalize">{item.title}</Text>
                                <View className="flex-row items-center rounded-lg">
                                    {[1, 2, 3, 4, 5].map((items) => (
                                        <Ionicons
                                            key={items}
                                            size={15}
                                            name={Number(item.rating) >= items ? "star-sharp" : "star-outline"}
                                            color={Number(item.rating) >= items ? "#FFD700" : "#6d93b8"} // yellow or blue
                                        />
                                    ))}
                                </View>
                                <View className="text-placeholderText w-full">
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
                        <View>
                            <Pressable onPress={generateSummary} >
                                <Text className="border-2 rounded-md border-blue-400 text-center p-2 bg-blue-300 my-2 " >Generate summary</Text>
                            </Pressable>
                            {summaryLoading && <Text className='my-3' >Loading summary...</Text>}
                            {summaryError && <Text style={{ color: 'red' }}>{summaryError}</Text>}
                            {summary && (
                                <View style={{ marginTop: 10, backgroundColor: '#e0e7ff', padding: 10, borderRadius: 8 }}>
                                    <Text>{summary}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
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