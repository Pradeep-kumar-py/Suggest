import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BookType } from "@/utils/types";
import { Link } from 'expo-router';
import { useVideoPlayerStore } from '@/store/playerStore';
const screenWidth = Dimensions.get('window').width;


export const BookCardImage = ({ item, shouldPlay = false }: { item: BookType, shouldPlay?: boolean, muted?: boolean }) => {


    const [AspectRatio, setAspectRatio] = useState<number>(.65); // Default aspect ratio, can be adjusted based on your needs
    const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState(false);

    const {
        currentPlayingId,
        setCurrentPlayingId,
        registerPlayer,
        unregisterPlayer
    } = useVideoPlayerStore();

    const mediaUri = item.image;
    const videoId = `video-${item._id}`;

    const handleImageLoad = (event: { source: { width: number; height: number } }) => {
        const { width, height } = event.source;
        if (width && height) {
            setAspectRatio(width / height); // or height / width if you prefer
        }
    };




    const player = useVideoPlayer(mediaUri, (player) => {
        player.loop = true;

    });

    // FIX: Use useEffect to set mediaType
    useEffect(() => {
        if (mediaUri.endsWith('.mp4') || mediaUri.endsWith('.mov') || mediaUri.endsWith('.mkv')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }
    }, [mediaUri]);


    useEffect(() => {
        if (mediaType === 'video' && player) {
            registerPlayer(videoId, player);

            return () => {
                unregisterPlayer(videoId);
            };
        }
    }, [mediaType, player, videoId]);


    // Handle play/pause based on current playing video
    useEffect(() => {
        if (mediaType === 'video') {
            const shouldThisVideoPlay = currentPlayingId === videoId;

            if (shouldThisVideoPlay && !isPlaying) {
                player.play();
                setIsPlaying(true);
            } else if (!shouldThisVideoPlay && isPlaying) {
                player.pause();
                setIsPlaying(false);
            }
        }
    }, [currentPlayingId, videoId, mediaType, isPlaying]);


    // useEffect(() => {
    //     if (mediaType === 'video' && player?.videoTrack) {
    //         // console.log("Player status: ", player.stopObserving);
    //         // console.log("Player video track size ", player.subtitleTrack );


    //         const { height, width } = player.videoTrack.size as any; 
    //         // console.log("Video Width: ", width, " Video Height: ", height);
    //         if (width > 0 && height > 0) {
    //             setAspectRatio(width / height);
    //             // console.log("Aspect Ratio from video : ", AspectRatio);/
    //         }
    //     }
    // }, [mediaType, player?.videoTrack]); 



    return (

        <View style={{ margin: 4 }}>
            {mediaType === 'video' ? (
                    <VideoView
                        player={player}
                        style={{
                            width: '100%',
                            aspectRatio: AspectRatio,
                            borderRadius: 10,
                        }}
                        contentFit="contain"
                    />
            ) : (
                <Link
                    href={{
                        pathname: '/page/[id]',
                        params: { id: item._id },
                    }}
                >
                    <View>
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: '100%',
                                // height: imageHeight,
                                aspectRatio: AspectRatio,
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
};
