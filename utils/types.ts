export interface userType {
    id: string,
    name: string,
    email: string,
    createdAt: string,
    profileImage: string,
}

export interface AuthState {
    user: any;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    registerUser: (name: string, email: string, password: string) => Promise<any>;
    loginUser: (email: string, password: string) => Promise<any>;
    logoutUser: () => Promise<void>;
}

export interface UserBookType {
    _id: string,
    title: string,
    caption: string,
    image: string,
    rating: string,
    user:string,
    link: string,
    createdAt: string,
    
}

interface UserType {
    name?: string;
    profileImage?: string;
    // Add other user properties as needed
  }

export interface BookType {
    _id: string,
    title: string,
    caption: string,
    image: string,
    rating: string,
    user?:UserType,
    link: string,
    createdAt: string,
}

export type DeepLinkEvent = {
    url: string;
}

export type otpAndTokenType = {
    otp?: string;
    token?: string;
}