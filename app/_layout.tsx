import { Stack } from "expo-router";
import "./global.css"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";



export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, }} />
        <Stack.Screen name="page/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  )
}
