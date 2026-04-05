import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AssessmentAnswer,
  materiApi,
  MateriAssessmentConfig,
  MateriAssessmentResult,
} from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';

import { AssessmentQuizViewer, AssessmentResultData } from '@/components/quiz-viewer';

export default function MateriAssessmentScreen() {
  const { kelasid, materiid } = useLocalSearchParams<{
    kelasid: string;
    materiid: string;
  }>();
  const router = useRouter();
  const materiId = Number(materiid);

  const [config, setConfig] = useState<MateriAssessmentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (materiId) {
      fetchAssessmentConfig();
    }
  }, [materiId]);

  const fetchAssessmentConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materiApi.getAssessmentConfig(materiId);
      console.log('Assessment Config Response:', JSON.stringify(response, null, 2));
      if (response.data) {
        setConfig(response.data);
      } else {
        setError('Assessment not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
      console.error('Error fetching assessment config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers: AssessmentAnswer[]): Promise<MateriAssessmentResult | null> => {
    setIsSubmitting(true);
    try {
      const response = await materiApi.submitAssessment(materiId, answers);
      console.log('Assessment Result Response:', JSON.stringify(response, null, 2));

      if (response.data) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      Alert.alert(
        'Submission Failed',
        err?.message || 'Failed to submit assessment. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = (assessmentResult: MateriAssessmentResult) => {
    // Show success alert if passed
    if (assessmentResult.isPassed) {
      const xpEarned = assessmentResult.gamification?.assessment?.totalXP || 0;
      const perfectBonus = assessmentResult.gamification?.perfectScore?.totalXP || 0;
      const totalXp = xpEarned + perfectBonus;
      
      if (assessmentResult.nextMateriUnlocked) {
        Alert.alert(
          'Assessment Passed!',
          `You scored ${assessmentResult.score}%!\n\n+${totalXp} XP earned!\n\nNext material has been unlocked.`,
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Assessment Passed!',
          `You scored ${assessmentResult.score}%!\n\n+${totalXp} XP earned!`,
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-3 text-muted-foreground">Loading assessment...</Text>
      </View>
    );
  }

  if (error || !config) {
    return (
      <View className="flex-1 p-6 items-center justify-center">
        <View className="bg-card rounded-2xl border border-border p-6 items-center max-w-xs">
          <View className="w-14 h-14 rounded-full bg-error-muted items-center justify-center">
            <FontAwesome name="exclamation-circle" size={24} color="#ef4444" />
          </View>
          <Text className="mt-4 text-foreground text-lg font-semibold text-center">
            Unable to Load
          </Text>
          <Text className="mt-2 text-muted-foreground text-sm text-center">
            {error || 'Assessment not found'}
          </Text>
          <Pressable
            onPress={fetchAssessmentConfig}
            className="mt-5 bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-primary-foreground font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Prepare initial result data if user has previous assessment
  let initialResultData: AssessmentResultData | null = null;
  if (config.userAssessment) {
    // Convert UserMateriAssessment to MateriAssessmentResult format for display
    // Note: UserMateriAssessment doesn't have all the details, so we create a partial result
    initialResultData = {
      result: {
        score: config.userAssessment.score,
        isPassed: config.userAssessment.isPassed,
        correctAnswers: 0, // Not available in UserMateriAssessment
        totalQuestions: config.questions.length,
        passingScore: config.passingScore,
        nextMateriUnlocked: null,
        assessment: config.userAssessment,
        gamification: undefined,
      },
      answers: [], // Not available in UserMateriAssessment
    };
  }

  return (
    <View className="flex-1">
      {/* Quiz Viewer */}
      <AssessmentQuizViewer
        questions={config.questions}
        passingScore={config.passingScore}
        title={config.title}
        onSubmit={handleSubmit}
        onComplete={handleComplete}
        initialResult={initialResultData}
      />

      {/* Submitting Overlay */}
      {isSubmitting && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center">
          <View className="bg-card p-6 rounded-xl border border-border items-center">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="mt-3 text-foreground font-medium">Submitting...</Text>
          </View>
        </View>
      )}
    </View>
  );
}