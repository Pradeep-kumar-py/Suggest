import { MotiPressable } from 'moti/interactions';
import { Text } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export function AnimatedButton({ handleSubmit, isLoading }: { handleSubmit: () => void; isLoading: boolean }) {
    return (
        <MotiPressable
            onPress={handleSubmit}
            // Add the worklet directive to the animate function
            animate={({ pressed }) => {
                'worklet';
                return {
                    scale: pressed ? 0.9 : 1
                };
            }}     
            style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
                marginBottom: 2,
                
            }}
        >
            {isLoading ? (
                <FontAwesome6 name="spinner" size={20} color="white" />
            ) : (
                <Text style={{ color: 'white', textAlign: 'center' }}>Add book or course</Text>
            )}
        </MotiPressable>
    );
}