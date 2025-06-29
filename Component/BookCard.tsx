import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BookType } from "@/utils/types";
import { Link } from 'expo-router';
import { useVideoPlayerStore } from '@/store/playerStore';
import {AntDesign} from '@expo/vector-icons';

export const BookCardImage = React.memo(({ item, shouldPlay = false }: { item: BookType, shouldPlay?: boolean }) => {
    const [aspectRatio, setAspectRatio] = useState<number>(0.65);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

    const {
        currentPlayingId,
        setCurrentPlayingId,
        registerPlayer,
        unregisterPlayer
    } = useVideoPlayerStore();

    const mediaUri = item.image;
    const videoId = `video-${item._id}`;

    // Determine media type based on file extension
    useEffect(() => {
        if (mediaUri.endsWith('.mp4') || mediaUri.endsWith('.mov') || mediaUri.endsWith('.mkv')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }
    }, [mediaUri]);

    // Create video player only for videos
    const player = useVideoPlayer(
        mediaType === 'video' ? mediaUri : '', 
        (player) => {
            if (mediaType === 'video') {
                player.loop = true;
            }
        }
    );

    // Register/unregister video player
    useEffect(() => {
        if (mediaType === 'video' && player) {
            registerPlayer(videoId, player);
            
            return () => {
                try {
                    player.pause();
                } catch (error) {
                    console.warn('Error pausing video on cleanup:', error);
                }
                unregisterPlayer(videoId);
            };
        }
    }, [mediaType, player, videoId, registerPlayer, unregisterPlayer]);

    // Handle video play/pause based on current playing video
    useEffect(() => {
        if (mediaType === 'video' && player) {
            const shouldThisVideoPlay = currentPlayingId === videoId;
            
            try {
                if (shouldThisVideoPlay) {
                    player.play();
                } else {
                    player.pause();
                }
            } catch (error) {
                console.warn('Error controlling video playback:', error);
            }
        }
    }, [currentPlayingId, videoId, mediaType, player]);

    const handleImageLoad = (event: { source: { width: number; height: number } }) => {
        const { width, height } = event.source;
        if (width && height) {
            setAspectRatio(width / height);
        }
    };

    // Handle video tap to play/pause
    const handleVideoPress = () => {
        if (mediaType === 'video') {
            if (currentPlayingId === videoId) {
                // If this video is playing, pause it
                setCurrentPlayingId(null);
            } else {
                // If this video is not playing, play it (this will pause others)
                setCurrentPlayingId(videoId);
            }
        }
    };

    return (
        <View style={{ margin: 4 }}>
            {mediaType === 'video' ? (
                <Pressable onPress={handleVideoPress}>
                    <VideoView
                        player={player}
                        style={{
                            width: '100%',
                            aspectRatio: aspectRatio,
                            borderRadius: 10,
                        }}
                        contentFit="contain"
                        nativeControls={false}
                    />
                    {/* Optional: Add play/pause indicator */}
                    {currentPlayingId !== videoId && (
                        <View style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [{ translateX: -15 }, { translateY: -15 }],
                            borderRadius: 15,
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text>
                                <AntDesign name="playcircleo" size={24} color="white" />
                            </Text>
                        </View>
                    )}
                </Pressable>
            ) : (
                <Link href={{ pathname: '/page/[id]', params: { id: item._id } }}>
                    <View>
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: '100%',
                                aspectRatio: aspectRatio,
                                borderRadius: 10,
                            }}
                            contentFit="contain"
                            onLoad={handleImageLoad}
                        />
                    </View>
                </Link>
            )}
        </View>
    );
});