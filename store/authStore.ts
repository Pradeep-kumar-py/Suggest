import { userType } from '@/utils/types';
import { clearSecureStore, saveAccessToken, saveRefreshToken, saveUser } from '../utils/secureStore';
import { create } from 'zustand';
import { API_BASE_URLS } from '@/utils/constant';
import jwtDecode from 'jwt-decode';
import { fetchWithAuth } from '@/utils/refreshAccessToken';
const API_BASE_URL = API_BASE_URLS


interface AuthState {
    Name: string | null;
    Email: string | null;
    Password: string | null;
    setSName: (name: string) => void;
    setSEmail: (email: string) => void;
    setSPassword: (password: string) => void;
    user: userType | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    isLoading: boolean;
    setisLoading: (isLoading: boolean) => void;
    setUser: (user: any) => void;
    setAccessToken: (accessToken: string) => void;
    setRefreshToken: (refreshToken: string) => void;
    clearTokens: () => void;
    checkmethod: () => void;
    loginUser: (email: string, password: string) => Promise<{ success: boolean; message: string; data?: any }>;
    registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string; data?: any }>;
    logoutUser: () => Promise<void>;
    uploadBook: (formData: FormData) => Promise<{ success: boolean; message: string; data?: any }>;
    // refreshTokens: () => Promise<boolean>;
    fetchUserBooks: (pageNo: number, limit: number) => Promise<{ success: boolean; message: string; data?: any }>;
    fetchAllBooks: (pageNo: number, limit: number) => Promise<{ success: boolean; message: string; data?: any }>;
    uploadProfileImage: (formData: FormData) => Promise<{ success: boolean; message: string; data?: any }>;
    deleteBook: (bookId: string) => Promise<{ success: boolean; message: string; data?: any }>;
    getSingleBook: (bookId: string) => Promise<{ success: boolean; message: string; data?: any }>;

}


export const useAuthStore = create<AuthState>((set, get) => ({
    Name: null,
    Email: null,
    Password: null,
    setSName: (name: string) => set({ Name: name }),
    setSEmail: (email: string) => set({ Email: email }),
    setSPassword: (password: string) => set({ Password: password }),
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    setisLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    setRefreshToken: (refreshToken: string) => set({ refreshToken }),
    clearTokens: () => set({ accessToken: null, refreshToken: null }),

    checkmethod: () => {
        set({ isLoading: true });
        setTimeout(() => {
            // clearTokens();
        }, 4000);
        console.log("Check method called")
    },

    loginUser: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
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
            await saveUser(data.user);

            // Update the store with user data and tokens
            set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: false });


            return { success: true, message: 'User logged in successfully', data };

        } catch (error) {
            console.error('Error logging in user:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error logging in user' };
        }
    },


    registerUser: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email: email.toLowerCase(), password }),
            });
            const data = await response.json();

            console.log("Data: ", data)
            // Check if the response is ok (status code 200-299)
            if (!response.ok) {
                throw new Error(data.message);
            }

            // Save the access token and refresh token to secure storage
            await saveAccessToken(data.accessToken);
            await saveRefreshToken(data.refreshToken);
            await saveUser(data.user);



            // Update the store with user data and tokens
            set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: false });


            return { success: true, message: 'User registered successfully', data };

        } catch (error) {
            set({ isLoading: false });
            console.error('Error registering user:', error);
            return { success: false, message: 'Error registering user', };
        }
    },

    logoutUser: async () => {
        set({ isLoading: false, user: null, accessToken: null, refreshToken: null });
        // Clear the access token and refresh token from secure storage
        await clearSecureStore();
        console.log("User logged out successfully")
    },

    uploadBook: async (formData: FormData): Promise<{ success: boolean; message: string; data?: any }> => {
        set({ isLoading: true });
        let retries = 3;

        while (retries > 0) {
            try {
                // Get the current state to access the accessToken
                const { accessToken } = get();
                if (!accessToken) {
                    set({ isLoading: false });
                    return { success: false, message: 'No access token found' };
                }

                const response = await fetchWithAuth(`${API_BASE_URL}/api/upload/book`, {
                    method: 'POST',
                    body: formData,
                });

                const text = await response.text();

                // try parse JSON, else fall back to text
                let data: any;
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }
                // const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to upload book');
                }

                set({ isLoading: false });
                return { success: true, message: 'Book uploaded successfully', data };

            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        message: error.message || 'Failed to upload book'
                    };
                }
                // Wait before retrying (you can implement exponential backoff here)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // This should never be reached because of the returns inside the loop,
        // but TypeScript needs it for type safety
        set({ isLoading: false });
        return { success: false, message: 'Maximum retries exceeded' };
    },

    fetchUserBooks: async (pageNo: number, limit: number): Promise<{ success: boolean; message: string; data?: any }> => {
        set({ isLoading: true });
        try {

            const response = await fetchWithAuth(`${API_BASE_URL}/api/book/getuserbooks?page=${pageNo}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            set({ isLoading: false });
            return { success: true, message: 'Books fetched successfully', data };

        } catch (error) {
            console.error('Error fetching user books:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error fetching user books' };
        }
    },

    fetchAllBooks: async (pageNo: number, limit: number): Promise<{ success: boolean; message: string; data?: any }> => {
        set({ isLoading: true });
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/book/getallbooks?page=${pageNo}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            set({ isLoading: false });
            return { success: true, message: 'Books fetched successfully', data };

        } catch (error) {
            console.error('Error fetching all books:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error fetching all books' };
        }
    },

    uploadProfileImage: async (formData: FormData): Promise<{ success: boolean; message: string; data?: any }> => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/upload/profileImage`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }
            return { success: true, message: 'Profile image uploaded successfully', data };

        } catch (error) {
            console.error('Error uploading profile image:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error uploading profile image' };
        }

    },
    deleteBook: async (bookId: string): Promise<{ success: boolean; message: string; data?: any }> => {
        set({ isLoading: true });
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/book/deletebook/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            set({ isLoading: false });
            return { success: true, message: 'Book deleted successfully', data };

        } catch (error) {
            console.error('Error deleting book:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error deleting book' };
        }
    },

    getSingleBook: async (bookId: string): Promise<{ success: boolean; message: string; data?: any }> => {
        set({ isLoading: true });
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/book/getbook/${bookId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            set({ isLoading: false });
            return { success: true, message: 'Book fetched successfully', data };

        } catch (error) {
            console.error('Error fetching book:', error);
            set({ isLoading: false });
            return { success: false, message: 'Error fetching book' };
        }
    }


}));


// Todo to implement the auth store
// what state do we need to store ?
// 1. accessToken: string | null;
// 2. refreshToken: string | null;
