import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from 'hakgyo-expo-sdk';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';
import { View as ThemedView } from './view';

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
  const [signInMethod, setSignInMethod] = React.useState<'google' | 'credentials'>('google');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

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
        console.log('Google Sign-In cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation is already in progress - no error needed
        console.log('Google Sign-In already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError?.(new Error('Google Play Services not available. Please install Google Play Services to continue.'));
      } else {
        // Catch all other errors
        const errorMessage = error?.message || 'An unexpected error occurred during sign-in. Please try again.';
        onError?.(new Error(errorMessage));
        console.error('Google Sign-In error:', error);
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
      console.error('Credential sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text type="title" style={styles.title}>
        {title}
      </Text>
      <Text type="default" style={styles.subtitle}>
        {subtitle}
      </Text>

      <View style={[styles.signInMethodToggle, { backgroundColor: theme.backgroundElement }]}>
        <Pressable
          style={[
            styles.toggleButton,
            signInMethod === 'google' && [
              styles.toggleButtonActive,
              { backgroundColor: theme.backgroundSelected },
            ],
          ]}
          onPress={() => setSignInMethod('google')}
        >
          <Text
            themeColor={signInMethod === 'google' ? 'text' : 'textSecondary'}
            style={styles.toggleButtonText}
          >
            Google
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            signInMethod === 'credentials' && [
              styles.toggleButtonActive,
              { backgroundColor: theme.backgroundSelected },
            ],
          ]}
          onPress={() => setSignInMethod('credentials')}
        >
          <Text
            themeColor={signInMethod === 'credentials' ? 'text' : 'textSecondary'}
            style={styles.toggleButtonText}
          >
            Email
          </Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        {signInMethod === 'google' ? (
          <Pressable
            style={[
              styles.googleButton,
              { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.googleIcon}>
                <GoogleGIcon />
              </View>
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.credentialsContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.backgroundSelected,
                  color: theme.text,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.backgroundSelected,
                  color: theme.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Pressable
              style={[
                styles.signInButton,
                { backgroundColor: theme.text },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleCredentialSignIn}
              disabled={isLoading}
            >
              <Text themeColor="background" style={styles.signInButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

function GoogleGIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  signInMethodToggle: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
    marginBottom: Spacing.two,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  toggleButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  googleButton: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  credentialsContainer: {
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    fontSize: 16,
  },
  signInButton: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
