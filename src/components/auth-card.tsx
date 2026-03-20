import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import FontAwesomeBrands from '@react-native-vector-icons/fontawesome-free-brands';
import { useAuth } from 'hakgyo-expo-sdk';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Input } from './input';

interface AuthCardProps {
  title?: string;
  subtitle?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
}

export function AuthCard({
  title = 'Welcome',
  subtitle = 'Sign in to continue',
  onSuccess,
  onError,
}: AuthCardProps) {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showEmailForm, setShowEmailForm] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data) {
        throw new Error('Failed to get user data from Google Sign-In');
      }

      // Sign in with hakgyo SDK
      const result = await signInWithGoogle(userInfo.data as any);

      if (result.success) {
        onSuccess?.(result.session);
      } else {
        onError?.(new Error(result.error || 'Google sign-in failed'));
      }
    } catch (error: any) {
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in - no error needed
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation is already in progress - no error needed
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError?.(new Error('Google Play Services not available. Please install Google Play Services to continue.'));
      } else {
        // Catch all other errors
        const errorMessage = error?.message || 'An unexpected error occurred during sign-in. Please try again.';
        onError?.(new Error(errorMessage));
      }
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  const handleCredentialSignIn = async () => {
    try {
      setIsLoading(true);

      if (!email || !password) {
        onError?.(new Error('Please enter both email and password'));
        return;
      }

      // Sign in with hakgyo SDK using email and password
      const result = await signInWithEmail(email, password);

      if (result.success) {
        onSuccess?.(result.session);
      } else {
        onError?.(new Error(result.error || 'Invalid email or password. Please try again.'));
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid email or password. Please try again.';
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-8 rounded-2xl gap-2">
      <Text className="text-4xl font-bold text-center text-foreground">
        {title}
      </Text>
      <Text className="text-base text-center opacity-70 text-foreground">
        {subtitle}
      </Text>

      <View className="gap-3 mt-2">
        {!showEmailForm ? (
          <>
            <Text className="text-center text-sm text-muted-foreground mb-2">
              Continue with
            </Text>
            <Pressable
              className="rounded-lg p-3 border flex-row items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: theme.background, borderColor: theme.backgroundSelected, opacity: isLoading ? 0.6 : 1 }}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FontAwesomeBrands name="google" size={20} color={theme.text} />
              <Text className="text-base font-semibold text-foreground">
                {isLoading ? 'Signing in...' : 'Google'}
              </Text>
            </Pressable>
            <Pressable
              className="rounded-lg p-3 flex-row items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: theme.text, opacity: isLoading ? 0.6 : 1 }}
              onPress={() => setShowEmailForm(true)}
              disabled={isLoading}
            >
              <FontAwesome name="envelope" size={20} color={theme.background} />
              <Text className="text-base font-semibold text-background">
                Email
              </Text>
            </Pressable>
          </>
        ) : (
          <View className="gap-3">
            <Input
              variant="default"
              size="md"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
            <Input
              variant="default"
              size="md"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 rounded-lg p-3 border items-center justify-center"
                style={{ borderColor: theme.backgroundSelected }}
                onPress={() => setShowEmailForm(false)}
                disabled={isLoading}
              >
                <Text className="text-base font-medium text-muted-foreground">
                  Back
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-lg p-3 items-center justify-center shadow-md"
                style={{ backgroundColor: theme.text, opacity: isLoading ? 0.6 : 1 }}
                onPress={handleCredentialSignIn}
                disabled={isLoading}
              >
                <Text className="text-base font-semibold text-background">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

