import { View, Text, StyleSheet, Pressable, Linking, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { BookType } from '@/utils/types';
import { BookCardImage } from '@/Component/BookCard';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ShowMoreText from '@/Component/ShowMoreText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FASTAPI_URI } from '@/utils/constant';
import * as Speech from 'expo-speech';


const ComponentPage = () => {
    const { getSingleBook } = useAuthStore()
    const { id } = useLocalSearchParams();
    const bookId = Array.isArray(id) ? id[0] : id;   // always a plain string
    const [summary, setSummary] = useState<string | null>(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState<string | null>(null)
    const [play, setPlay] = useState(false)
    const [SingleBook, setSingleBook] = useState<BookType | null>(null)
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        (async () => {
            if (bookId) {
                const result = await getSingleBook(bookId)
                if (result.success) {
                    setSingleBook(result.data.book)
                } else {
                    console.log("Error fetching book: ", result.message)
                }
            }
            setPageLoading(false)
        })()
    }, [])

    const generateSummary = async () => {
        setSummaryLoading(true)
        setSummaryError(null)
        try {
            const response = await fetch(`${FASTAPI_URI}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: SingleBook?.title, description: SingleBook?.caption }),
            })

            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                throw new Error(textData || "An unknown error occurred");
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || "An unknown error occurred");
            }
            setSummaryLoading(false)
            if (data.summary) {
                setSummary(data.summary)
            }
        } catch (error) {
            setSummaryLoading(false)
            if (error instanceof Error) {
                setSummaryError(error.message);
            }
        }
    }

    const speakSummary = () => {
        if (summary) {
            setPlay(true);
            const textToSpeak = summary.replace(/[*#_]/g, '').trim();
            Speech.speak(textToSpeak, {
                language: 'en',
                pitch: .9,
                rate: .9,
                voice: 'en-US-language',
            });
        }
    };

    const pauseSummary = () => {
        setPlay(false);
        Speech.stop();
    };

    if (pageLoading) {
        return (
            <SafeAreaView style={styles.backGround} className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10, color: '#4a6fa5' }}>Loading book...</Text>
            </SafeAreaView>
        )
    }

    if (!SingleBook) {
        return (
            <SafeAreaView style={styles.backGround} className="flex-1 items-center justify-center">
                <Text style={{ color: '#4a6fa5', fontSize: 16 }}>No book found</Text>
            </SafeAreaView>
        )
    }

    const item = SingleBook;

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

                        {/* Profile section */}
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

                        {/* Book details */}
                        <View className='relative flex-row items-center justify-between'>
                            <View className='flex-1 gap-1 ml-4'>
                                <Text className="text-textDark font-bold text-2xl capitalize">{item.title}</Text>

                                {/* Aggregate star display */}
                                <View className="flex-row items-center rounded-lg">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Ionicons
                                            key={s}
                                            size={15}
                                            name={Number(item.rating) >= s ? "star-sharp" : "star-outline"}
                                            color={Number(item.rating) >= s ? "#FFD700" : "#6d93b8"}
                                        />
                                    ))}
                                    {(item.ratingCount ?? 0) > 0 && (
                                        <Text style={{ marginLeft: 4, fontSize: 12, color: '#6d93b8' }}>
                                            ({item.ratingCount})
                                        </Text>
                                    )}
                                </View>

                                <View className="text-placeholderText w-full">
                                    <ShowMoreText text={item.caption} noLine={2} />
                                </View>

                                {item.link !== '' && (
                                    <Pressable onPress={() => Linking.openURL(item.link)} className="mt-1">
                                        <Text className="text-blue-600 underline" numberOfLines={1}>
                                            {item.link}
                                        </Text>
                                    </Pressable>
                                )}

                                <Text className="text-placeholderText">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                </Text>
                            </View>
                        </View>

                        {/* ── Interactive Rating Widget ── */}
                        <RatingWidget
                            bookId={bookId}
                            onRated={(updatedBook) => setSingleBook(updatedBook)}
                        />

                        {/* Generate Summary */}
                        <View>
                            <Pressable
                                onPress={generateSummary}
                                className="mt-2 bg-blue-500 rounded-lg shadow-lg flex-row items-center justify-center"
                            >
                                <Ionicons name="document-text-outline" size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-center py-2 text-lg">Generate Summary</Text>
                            </Pressable>

                            {summaryLoading && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                                    <ActivityIndicator size="small" color="#2563eb" />
                                    <Text style={{ marginLeft: 10 }}>Generating summary...</Text>
                                </View>
                            )}

                            {summaryError && <Text style={{ color: 'red' }}>{summaryError}</Text>}

                            {summary && (
                                <View style={{ marginTop: 10, backgroundColor: '#e0e7ff', padding: 10, borderRadius: 8 }}>
                                    <ShowMoreText text={summary} noLine={6} />
                                    {play ? (
                                        <Pressable
                                            onPress={pauseSummary}
                                            className="mt-2 bg-green-500 rounded-lg shadow-lg flex-row items-center justify-center"
                                        >
                                            <Ionicons name="pause-circle" size={20} color="white" className="mr-2" />
                                            <Text className="text-white font-bold text-center py-2 text-lg">Pause Summary</Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            onPress={speakSummary}
                                            className="mt-2 bg-green-500 rounded-lg shadow-lg flex-row items-center justify-center"
                                        >
                                            <Ionicons name="play-circle" size={20} color="white" className="mr-2" />
                                            <Text className="text-white font-bold text-center py-2 text-lg">Speak Summary</Text>
                                        </Pressable>
                                    )}
                                </View>
                            )}
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

// ──────────────────────────────────────────────
// Interactive Rating Widget
// ──────────────────────────────────────────────
interface RatingWidgetProps {
    bookId: string;
    onRated: (updatedBook: BookType) => void;
}

const RatingWidget = ({ bookId, onRated }: RatingWidgetProps) => {
    const { rateBook, getUserRating, user } = useAuthStore();
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    // Load user's existing rating
    useEffect(() => {
        (async () => {
            const result = await getUserRating(bookId);
            if (result.success && result.data?.rating !== null && result.data?.rating !== undefined) {
                setUserRating(result.data.rating);
            }
        })();
    }, [bookId]);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 2500);
    };

    const handleRate = async (star: number) => {
        if (!user) {
            Alert.alert(
                'Not Logged In',
                'You need to log in to rate this book.',
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }
        if (submitting) return;
        const prev = userRating;
        setHovered(null);
        setUserRating(star);   // optimistic update
        setSubmitting(true);

        const result = await rateBook(bookId, star);
        setSubmitting(false);

        if (result.success) {
            showToast('Thanks for rating! ⭐', true);
            if (result.data?.book) {
                onRated(result.data.book);
            }
        } else {
            showToast('Could not save rating. Try again.', false);
            setUserRating(prev); // rollback
        }
    };

    const displayRating = hovered ?? userRating ?? 0;

    return (
        <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rate this book</Text>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                        key={star}
                        onPressIn={() => setHovered(star)}
                        onPressOut={() => setHovered(null)}
                        onPress={() => handleRate(star)}
                        hitSlop={8}
                        disabled={submitting}
                    >
                        <Ionicons
                            name={displayRating >= star ? 'star-sharp' : 'star-outline'}
                            size={32}
                            color={displayRating >= star ? '#FFD700' : '#b0c4d8'}
                            style={{ marginHorizontal: 4 }}
                        />
                    </Pressable>
                ))}
                {submitting && (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginLeft: 10 }} />
                )}
            </View>

            {userRating !== null && !submitting && (
                <Text style={styles.yourRatingText}>Your rating: {userRating} / 5</Text>
            )}

            {toast && (
                <View style={[styles.toast, { backgroundColor: toast.ok ? '#22c55e' : '#ef4444' }]}>
                    <Text style={styles.toastText}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
};

export default ComponentPage

const styles = StyleSheet.create({
    backGround: {
        backgroundColor: '#e3f2fd',
    },
    cardBackground: {
        backgroundColor: '#f5f9ff',
    },
    // Rating widget
    ratingContainer: {
        marginTop: 14,
        marginBottom: 4,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#eaf3ff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c8ddf5',
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a6fa5',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    yourRatingText: {
        marginTop: 6,
        fontSize: 12,
        color: '#6d93b8',
    },
    toast: {
        marginTop: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    toastText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
})