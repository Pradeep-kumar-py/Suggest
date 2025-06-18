import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'expo-router'
import { optVerify, sendVerificationEmail } from '@/utils/secureStore'

const OtpVerification = () => {
    const [otp, setOtp] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)

    const { Name, Email, Password, registerUser, setSEmail, setSName, setSPassword } = useAuthStore()
    const name = Name, email = Email, password = Password;
    console.log("Name: ", name)


    const router = useRouter()

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
            setOtp('') // Clear OTP input after successful registration
            setIsVerifying(false) // Reset verifying state
            setSEmail('')
            setSName('')
            setSPassword('')
            // Navigate to the main app screen after successful registration
            router.replace('/(tabs)')
        }
        else {
            {
                alert('User registration failed')
                setOtp('') // Clear OTP input if registration fails
                setIsVerifying(false) // Reset verifying state
                setSEmail('')
                setSName('')
                setSPassword('')
                // Optionally, you can navigate back to the signup screen or show an error message
                router.push('/(auth)/signup')
            }

        }
    }


    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Please enter your OTP')
            return
        }
        setIsVerifying(true)
        try {
            const res = await optVerify(otp)
            if (res?.success) {
                Alert.alert('OTP Verified', 'Your OTP has been successfully verified.')
                // Proceed with the next steps, e.g., navigate to the main app screen
                handleSignup()
                setIsVerifying(false) // Reset verifying state
            } else {
                Alert.alert('Invalid OTP', 'The OTP you entered is invalid or expired. Please try again.')
                setOtp('') // Clear OTP input on failure
                setIsVerifying(false) // Reset verifying state
            }
        } catch (error) {
            console.error('Error verifying OTP:', error)
            Alert.alert('Error', 'An error occurred while verifying the OTP. Please try again later.')
            setOtp('') // Clear OTP input on error
            setIsVerifying(false) // Reset verifying state
        }

    }

    const handleResend = async () => {
        try {
            setIsResending(true)
            if (!email) return
            const to = email
            const title = name + ' - Account Verification'
            const content = `Please verify your account by clicking on the link below or entering the OTP sent to your email.`
            const response = await sendVerificationEmail(to, title, content)
            if (response?.success) {
                Alert.alert('Verification Email Sent', 'A new verification email has been sent to your email address.')
                setIsResending(false) // Reset resending state
            } else {
                Alert.alert('Failed to Resend Verification Email', 'Please try again later.')
                setIsResending(false) // Reset resending state
            }

        } catch (error) {
            console.error("Error sending verification email: ", error);
            Alert.alert('Failed to resend verification email', 'Please try again later.')
            setIsResending(false) // Reset resending state
        }
    }

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
            <StatusBar style="auto" />
            <SafeAreaView className="flex-1 justify-center px-5">
                <View className="bg-cardBackground p-5 rounded-2xl shadow-lg">
                    {/* Title */}
                    <Text className="text-textDark font-bold text-xl mb-3">
                        OTP Verification
                    </Text>

                    {/* Instruction */}
                    <Text className="text-[#767676] mb-4">
                        We have sent a 6-digits code to your email@example.com.
                        Please enter it below or check your email for a verification link.
                    </Text>

                    {/* OTP Input */}
                    <View className="flex-row items-center border border-border bg-[#f0f8ff] p-2 rounded-lg mb-3">
                        <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#1a4971" />
                        <TextInput
                            className="flex-1 ml-2 text-[#767676]"
                            placeholder="Enter OTP"
                            placeholderTextColor="#767676"
                            keyboardType="number-pad"
                            onChangeText={setOtp}
                            value={otp}
                        />
                    </View>

                    {/* Validate button */}

                    <Pressable onPress={handleVerifyOtp} className="mt-5 bg-textSecondary p-3 rounded-lg">
                        {isVerifying ? (
                            <FontAwesome6 name="spinner" size={20} color="white" className="animate-spin text-center" />
                        ) : (
                            <Text className="text-white font-bold text-center">
                                Verify OTP
                            </Text>
                        )}
                    </Pressable>

                    {/* Resend Section */}
                    <View className="flex-row justify-center mt-4">
                        <Text className="text-[#767676] mr-1">
                            Didn’t get the code?
                        </Text>
                        <Pressable onPress={handleResend}>
                            {isResending ? (
                                <ActivityIndicator size="small" color="#1a4971" />
                            ) : (
                                <Text className="text-textSecondary font-semibold">
                                    Resend OTP
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Loading Indicator (optional) */}
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>

    )
}

export default OtpVerification