import { Pressable, Text } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';

export function AnimatedButton({ handleSubmit, isLoading }: { handleSubmit: () => void; isLoading: boolean }) {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            onPress={handleSubmit}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
                marginBottom: 2,
                opacity: pressed ? 0.85 : 1,
            }}
        >
            {isLoading ? (
                <FontAwesome6 name="spinner" size={20} color="white" />
            ) : (
                <Text style={{ color: 'white', textAlign: 'center' }}>Add book or course</Text>
            )}
        </Pressable>
    );
}