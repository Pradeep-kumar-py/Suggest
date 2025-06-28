import { View, Text, Pressable, EmitterSubscription } from 'react-native'
import React, { useEffect, useCallback, useState } from 'react'
import { clearSecureStore, getAccessToken, getRefreshToken, getUser, isLoggedIn, isTokenExpired, verifyToken } from '@/utils/secureStore'
import { Link, useRouter } from 'expo-router'
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/store/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { MotiView, MotiText } from 'moti';
import { DeepLinkEvent } from '@/utils/types';

const index = () => {
    const router = useRouter()
    const { isLoading, loginUser, user, accessToken, Name, Email, Password, setUser, setAccessToken, setRefreshToken, refreshToken, registerUser, setSEmail, setSName, setSPassword } = useAuthStore()
    const name = Name, email = Email, password = Password;
    console.log("Name: ", name)

    const handleSignup = async () => {
        console.log(name, email, password)
        // Add null checks before calling registerUser
        if (!name || !email || !password) {
            alert('Please fill all the fields')
            return
        }
        const response = await registerUser(name, email, password)
        console.log("Response: ", response)
        if (response.success) {
            alert('User registered successfully')
            setSEmail('')
            setSName('')
            setSPassword('')
            // Navigate to the main app screen after successful registration
            router.replace('/(tabs)')
        }
        else {
            {
                alert('User registration failed')
                setSEmail('')
                setSName('')
                setSPassword('')
                // Optionally, you can navigate back to the signup screen or show an error message
                router.push('/(auth)/signup')
            }

        }
    }


    useEffect(() => {
        (async () => {
            try {
                const refreshToken = await getRefreshToken()

                if (refreshToken && isTokenExpired(refreshToken)) {
                    // Clear expired tokens
                    await clearSecureStore()
                    console.log("Cleared expired tokens")
                }

                const isUserLoggedIn = await isLoggedIn()
                console.log("isUserLoggedIn: ", isUserLoggedIn)

                if (isUserLoggedIn) {
                    const user = await getUser()
                    const refreshTokenFresh = await getRefreshToken() || ""
                    const accessToken = await getAccessToken() || ""
                    setUser(user)
                    setAccessToken(accessToken)
                    setRefreshToken(refreshTokenFresh)
                    router.replace("/(tabs)")
                } else {
                    console.log("User is not logged in - showing welcome screen")
                }
            } catch (error) {
                console.log("Error checking authentication:", error)
                await clearSecureStore() // Clear any corrupted data
            }
        })()
    }, [])


    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const refreshToken = await getRefreshToken() || ""
    //             const isTokenValid = !isTokenExpired(refreshToken)
    //             console.log("isTokenValid: ", isTokenValid)

    //             if (!isTokenValid) {
    //                 console.log("Refresh token is expired")
    //                 router.replace("/")
    //                 // replace push with replace to avoid going back to this page
    //             }
    //         } catch (error) {
    //             console.log("Error checking token: ", error)
    //             router.replace("/")
    //         }
    //     })()
    // }, [])

    // useEffect(() => {
    //     (async () => {
    //         const isUserLoggedIn = await isLoggedIn()
    //         console.log("isUserLoggedIn: ", isUserLoggedIn)

    //         if (isUserLoggedIn) {
    //             const user = await getUser()
    //             const refreshToken = await getRefreshToken() || ""
    //             const accessToken = await getAccessToken() || ""
    //             setUser(user)
    //             setAccessToken(accessToken)
    //             setRefreshToken(refreshToken)
    //             router.replace("/(tabs)")
    //         } else {
    //             console.log("User is not logged in")
    //         }
    //     })()
    // }, [])


    // const handleDeepLink = useCallback(async (event: DeepLinkEvent) => {
    //     console.log('🔗 Deep link received:', event.url);

    //     try {
    //         const { path, queryParams } = Linking.parse(event.url);
    //         console.log('Path from deep link >>>', path);
    //         console.log('Query from deep link >>>', queryParams);

    //         if (path === 'verify-otp' && queryParams?.token) {
    //             const res = await verifyToken(queryParams?.token);
    //             if (res?.success) {
    //                 // Check if we have the required registration data
    //                 if (name && email && password) {
    //                     const registrationResult: any = await handleSignup();
    //                     if (registrationResult) {
    //                         alert('Your account has been registered and verified successfully!');
    //                         router.replace('/(tabs)');
    //                     }
    //                 } else {
    //                     alert('Registration data not found. Please try signing up again.');
    //                     router.push('/(auth)/signup');
    //                 }
    //             } else {
    //                 alert('Invalid or expired verification link');
    //                 router.push('/(auth)/signup');
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error processing deep link:', error);
    //         alert('An error occurred during verification');
    //     }
    // }, [name, email, password, handleSignup]);

    // Handle deep linking for account verification

    // useEffect(() => {
    //     (async () => {
    //         const initialURL = await Linking.getInitialURL();
    //         if (initialURL) handleDeepLink({ url: initialURL });
    //     })();

    //     const subscription = Linking.addEventListener('url', handleDeepLink);
    //     return () => {
    //         // Correct:
    //         subscription.remove();
    //     };
    // }, [handleDeepLink]);




    return (
        <>
            {/* <StatusBar backgroundColor="#e3f2fd" style="dark" /> */}
            <SafeAreaView className="flex-1 bg-[#e3f2fd] px-6 justify-center items-center">
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 700 }}
                    className="w-full items-center"
                >
                    <Image
                        source={require('../assets/photos/bookimg.jpeg')}
                        style={{
                            width: 180,
                            height: 180,
                            borderRadius: 30,
                            marginBottom: 24,
                            borderWidth: 2,
                            borderColor: '#90caf9',
                        }}
                        contentFit="cover"
                    />

                    <Text className="text-textPrimary text-3xl font-bold text-center mb-2">
                        Welcome to <Text className="text-[#1976d2]">Suggest</Text> 📚
                    </Text>

                    <Text className="text-placeholderText text-lg text-center mb-6">
                        Share book & course recommendations with photos and videos. Build your learning community and discover your next great read! 🎥📖
                    </Text>

                    <Link href="/(auth)" asChild>
                        <Pressable className="bg-[#1976d2] px-8 py-3 rounded-xl shadow-lg flex-row items-center active:opacity-90">
                            <Ionicons name="log-in-outline" size={22} color="#fff" />
                            <Text className="text-white text-lg font-semibold ml-2">Start Recommending</Text>
                        </Pressable>
                    </Link>

                    <MotiText
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 500, duration: 800 }}
                        className="text-placeholderText text-center mt-8 italic px-3"
                    >
                        "Create video reviews, rate your favorites, and help others discover amazing books and courses. Your next recommendation could change someone's life!"
                        {"\n"}✨ Rate • Review • Recommend
                    </MotiText>
                </MotiView>
            </SafeAreaView>
        </>
    )
}

export default index