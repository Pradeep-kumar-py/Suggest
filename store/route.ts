import { saveAccessToken, saveRefreshToken } from "@/utils/secureStore";
import { useAuthStore } from "./authStore";


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch('https://tipapp.azurewebsites.net/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(data.message);
        }
        console.log("Data11111: ", data)
        // Save the access token and refresh token to secure storage
        await saveAccessToken(data.accessToken);
        await saveRefreshToken(data.refreshToken);

        // Update the store with user data and tokens
        // set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: true });


        return { success: true, message: 'User logged in successfully', data };

    } catch (error) {
        console.error('Error logging in user:', error);
        // set({ isLoading: false });
        return { success: false, message: 'Error logging in user' };
    }
}

export const registerUser = async (name: string, email: string, password: string) => {
    try {
        const response = await fetch('https://tipapp.azurewebsites.net/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();

        console.log("Data: ", data)
        // Check if the response is ok (status code 200-299)
        if(!response.ok) {
            throw new Error(data.message);
        }

        // Save the access token and refresh token to secure storage
        await saveAccessToken(data.accessToken);
        await saveRefreshToken(data.refreshToken);


        
        // Update the store with user data and tokens
        // set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: false });

        
        return {success: true, message: 'User registered successfully', data};

    } catch (error) {
        console.error('Error registering user:', error);
        return {success: false, message: 'Error registering user', };
    }
}

export const logoutUser = async () => {
    // set({ isLoading: false, user: null, accessToken: null, refreshToken: null });
    // Clear the access token and refresh token from secure storage
    await saveAccessToken(null);
    await saveRefreshToken(null);
}