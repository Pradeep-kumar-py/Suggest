import { View, Text, Pressable, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useCallback, useState } from "react";
import {
    clearSecureStore,
    getAccessToken,
    getRefreshToken,
    getUser,
    isLoggedIn,
    isTokenExpired,
    verifyToken,
} from "@/utils/secureStore";
import { Link, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useAuthStore } from "@/store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { DeepLinkEvent } from "@/utils/types";

const index = () => {
    const router = useRouter();
    const {
        isLoading,
        loginUser,
        user,
        accessToken,
        Name,
        Email,
        Password,
        setUser,
        setAccessToken,
        setRefreshToken,
        refreshToken,
        registerUser,
        setSEmail,
        setSName,
        setSPassword,
    } = useAuthStore();

    // ...existing useEffect code...
    useEffect(() => {
        (async () => {
            try {
                const refreshToken = await getRefreshToken();

                if (refreshToken && isTokenExpired(refreshToken)) {
                    await clearSecureStore();
                    console.log("Cleared expired tokens");
                }

                const isUserLoggedIn = await isLoggedIn();
                console.log("isUserLoggedIn: ", isUserLoggedIn);

                if (isUserLoggedIn) {
                    const user = await getUser();
                    const refreshTokenFresh = (await getRefreshToken()) || "";
                    const accessToken = (await getAccessToken()) || "";
                    setUser(user);
                    setAccessToken(accessToken);
                    setRefreshToken(refreshTokenFresh);
                    router.replace("/(tabs)");
                } else {
                    console.log("User is not logged in - showing welcome screen");
                }
            } catch (error) {
                console.log("Error checking authentication:", error);
                await clearSecureStore();
            }
        })();
    }, []);

    return (
        <>
            <StatusBar backgroundColor="#e3f2fd" style="dark" />
            <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100">
                <ScrollView
                    className="flex-1 px-6"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <View className="items-center pt-8 pb-6">
                        <Image
                            source={require("../assets/photos/bookimg.jpeg")}
                            className="w-44 h-44 rounded-3xl mb-6 border-2 border-blue-300"
                            contentFit="cover"
                        />

                        <Text className="text-gray-800 text-3xl font-bold text-center mb-2">
                            Welcome to <Text className="text-blue-600">Suggest</Text> 📚
                        </Text>

                        <Text className="text-gray-600 text-lg text-center mb-8 px-2 leading-6">
                            Discover amazing books through real video reviews, AI summaries,
                            and community recommendations
                        </Text>
                    </View>

                    {/* Live Features Showcase */}
                    <View className="mb-8">
                        {/* Feature Grid */}
                        <View className="flex-row flex-wrap justify-between">
                            <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                <View className="items-center">
                                    <View className="bg-blue-100 p-3 rounded-full mb-3">
                                        <Ionicons name="videocam" size={24} color="#1976d2" />
                                    </View>
                                    <Text className="font-semibold text-gray-800 text-center">Video Reviews</Text>
                                    <Text className="text-xs text-gray-500 text-center mt-1">
                                        Upload & watch book reviews
                                    </Text>
                                </View>
                            </View>

                            <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                <View className="items-center">
                                    <View className="bg-purple-100 p-3 rounded-full mb-3">
                                        <Ionicons name="sparkles" size={24} color="#7C3AED" />
                                    </View>
                                    <Text className="font-semibold text-gray-800 text-center">AI Summaries</Text>
                                    <Text className="text-xs text-gray-500 text-center mt-1">
                                        Get instant book insights
                                    </Text>
                                </View>
                            </View>

                            <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                <View className="items-center">
                                    <View className="bg-orange-100 p-3 rounded-full mb-3">
                                        <Ionicons name="camera" size={24} color="#EA580C" />
                                    </View>
                                    <Text className="font-semibold text-gray-800 text-center">Photo Upload</Text>
                                    <Text className="text-xs text-gray-500 text-center mt-1">
                                        Share book covers & notes
                                    </Text>
                                </View>
                            </View>

                            <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                <View className="items-center">
                                    <View className="bg-green-100 p-3 rounded-full mb-3">
                                        <Ionicons name="book" size={24} color="#16A34A" />
                                    </View>
                                    <Text className="font-semibold text-gray-800 text-center">Books</Text>
                                    <Text className="text-xs text-gray-500 text-center mt-1">
                                        Explore thousands of titles
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* CTA Buttons */}
                    <View className="flex gap-4 mb-6">
                        <Link href="/(tabs)" asChild>
                            <Pressable className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg flex-row items-center justify-center active:opacity-90 active:scale-98">
                                <Ionicons name="book-outline" size={22} color="#fff" />
                                <Text className="text-white text-lg font-semibold ml-2">
                                    Browse Books Now
                                </Text>
                            </Pressable>
                        </Link>
                        <Link href="/(auth)/signup" asChild>
                            <Pressable className="border-2 border-blue-600 px-8 py-4 rounded-2xl flex-row items-center justify-center active:opacity-70">
                                <Ionicons name="person-add-outline" size={22} color="#1976d2" />
                                <Text className="text-blue-600 text-lg font-semibold ml-2">
                                    Join Community
                                </Text>
                            </Pressable>
                        </Link>

                    </View>

                    {/* Feature Highlights */}
                    <View className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <Text className="text-gray-800 font-semibold text-center mb-4">
                            What Makes Us Different?
                        </Text>

                        <View className="space-y-3">
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                <Text className="text-gray-600 ml-3 flex-1">
                                    No external downloads - everything works in-app
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                <Text className="text-gray-600 ml-3 flex-1">
                                    AI-powered book summaries and recommendations
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                <Text className="text-gray-600 ml-3 flex-1">
                                    Upload photos, videos, and detailed reviews
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                <Text className="text-gray-600 ml-3 flex-1">
                                    Browse as guest or join to contribute
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quote */}
                    <Text className="text-gray-500 text-center italic px-3 pb-8">
                        "Create video reviews, and help others discover
                        amazing books and courses. Your next recommendation could change
                        someone's life!"
                        {"\n"}✨ Rate • Review • Recommend
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default index;