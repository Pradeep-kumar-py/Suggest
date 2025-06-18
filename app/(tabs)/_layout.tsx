import { Stack, Tabs } from "expo-router";
import { Entypo, FontAwesome6, Ionicons, } from '@expo/vector-icons';


export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#1976D2",
                headerTitleStyle: {
                    color: "#1a4971",
                    fontWeight: "600",
                },
                tabBarStyle: {
                    backgroundColor: "#e3f2fd",
                    borderTopWidth: 1,
                    borderTopColor: "#bbdefb",              
                    elevation: 0,
                    shadowColor: "transparent",
                },

            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="upload"
                options={{
                    title: "Add Book",
                    tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <FontAwesome6 name="user" size={size} color={color} />,
                }} />
        </Tabs>
    );
}