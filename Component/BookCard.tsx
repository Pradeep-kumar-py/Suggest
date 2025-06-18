import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const screenWidth = Dimensions.get('window').width;

type BookType = {
    image: string;
};

export const BookCardImage = ({ item, shouldPlay = false, muted = true }: { item: BookType, shouldPlay?: boolean, muted?: boolean }) => {
    const [AspectRatio, setAspectRatio] = useState<number>(.5); // Default aspect ratio, can be adjusted based on your needs
    const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);

    const handleImageLoad = (event: { source: { width: number; height: number } }) => {
        const { width, height } = event.source;
        if (width && height) {
            setAspectRatio(width / height); // or height / width if you prefer
        }
    };

    const mediaUri = item.image;


    const player = useVideoPlayer(mediaUri, (player) => {
        player.loop = true;
        if (shouldPlay) {
            player.play();
        } else {
            player.pause();
        }
        player.muted = muted;

        
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
        if (mediaType === 'video') {
            if (shouldPlay) {
                player.play();
            } else {
                player.pause();
            }
            player.muted = muted;
        }
    }, [shouldPlay, muted, mediaType]);

    useEffect(() => {
        if (mediaType === 'video' && player?.videoTrack) {
            // console.log("Player status: ", player.stopObserving);
            // console.log("Player video track size ", player.subtitleTrack );
            
            
            const { height, width } = player.videoTrack.size as any; 
            // console.log("Video Width: ", width, " Video Height: ", height);
            if (width > 0 && height > 0) {
                setAspectRatio(width / height);
                // console.log("Aspect Ratio from video : ", AspectRatio);/
            }
        }
    }, [mediaType, player?.videoTrack]); 



    return (
        <View style={{ margin: 4 }}>
            {mediaType === 'video' ? (
                <VideoView
                    player={player}
                    style={{
                        width: '100%',
                        aspectRatio: AspectRatio,
                        borderRadius: 10,
                        // alignSelf: 'center',
                    }}
                    contentFit="contain"

                />
            ) : (
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
            )}
        </View>
    );
};
