import { MenuHeader } from '@/components/menu-header';
import { QuizViewer, SubmitAnswer, InitialResultData } from '@/components/quiz-viewer';
import { useLocalSearchParams } from 'expo-router';
import { Soal, Tryout, tryoutApi, TryoutResult, TryoutParticipant,} from 'hakgyo-expo-sdk';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
export default function TryoutDetailScreen() {
  const { tryoutId } = useLocalSearchParams<{ tryoutId: string }>();
  const id = Number(tryoutId);
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingResult, setExistingResult] = useState<InitialResultData | null>(null);
  const [checkingResult, setCheckingResult] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTryout();
    }
  }, [id]);

  const fetchTryout = async () => {
    try {
      setLoading(true);
      setError(null);
      setCheckingResult(true);

      // Fetch the tryout details
      const response = await tryoutApi.get(id);
      setTryout(response.data || null);

      // Extract questions from the tryout's koleksiSoal
      const soals = response.data?.koleksiSoal?.soals || [];
      setQuestions(soals);

      // Check for existing result
      try {
        const resultResponse = await tryoutApi.getResults(id);
        console.log('getResults response:', resultResponse);
        
        // Handle different response types
        if (resultResponse.data) {
          if (!Array.isArray(resultResponse.data)) {
            // Single TryoutResult (student view)
            console.log('User already has a result for this tryout:', resultResponse.data);
            setExistingResult({ result: resultResponse.data });
          } else if (Array.isArray(resultResponse.data) && resultResponse.data.length > 0) {
            // Array of TryoutParticipant - get the latest one for the current user
            const participant = resultResponse.data[0] as TryoutParticipant;
            
            if (participant && participant.status === 'SUBMITTED') {
              setExistingResult({
                result: {
                  id: participant.id,
                  score: participant.score,
                  correctCount: Math.round((participant.score / 100) * soals.length),
                  totalCount: soals.length,
                  timeTakenSeconds: participant.timeTakenSeconds,
                  passed: tryout?.passingScore ? participant.score >= tryout.passingScore : undefined,
                },
                answers: participant.answers,
              });
            } else {
              console.log('User has no result for this tryout - participant not submitted');
            }
          } else {
            console.log('User has no result for this tryout - empty array');
          }
        } else {
          console.log('User has no result for this tryout - no data');
        }
      } catch (resultErr) {
        console.log('User has no result for this tryout - error:', resultErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tryout');
    } finally {
      setLoading(false);
      setCheckingResult(false);
    }
  };

  const handleSubmit = async (answers: SubmitAnswer[]): Promise<TryoutResult | null> => {
    try {
      const result = await tryoutApi.submit(id, answers);
      
      // Update existing result after successful submission
      if (result.data) {
        setExistingResult({ result: result.data });
      }
      
      return result.data || null;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-card items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-2 text-muted-foreground">Loading tryout...</Text>
      </View>
    );
  }

  if (error || !tryout) {
    return (
      <View className="flex-1 p-6">
        <Text className="text-destructive">{error || 'Tryout not found'}</Text>
        <Pressable
          className="mt-4 p-3 bg-primary rounded-lg"
          onPress={fetchTryout}
        >
          <Text className="text-primary-foreground text-center">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Truncate description to single line
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Build subtitle with duration and question count
  const getSubtitle = () => {
    const parts = [];
    if (tryout.duration) {
      parts.push(`${tryout.duration} mins`);
    }
    parts.push(`${questions.length} questions`);
    return parts.join(' | ');
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <MenuHeader
        title={tryout.nama}
        subtitle={tryout.description ? truncateText(tryout.description) : getSubtitle()}
        insetEnabled={false}
        centerAlign={true}
      />

      {/* Quiz Viewer */}
      <View className="flex-1 bg-card/10 p-0 border-border overflow-visible">
        {checkingResult ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="mt-2 text-muted-foreground">Checking for existing result...</Text>
          </View>
        ) : (
          <QuizViewer
            questions={questions}
            mode="tryout"
            onSubmit={handleSubmit}
            passingScore={tryout.passingScore}
            initialResult={existingResult}
          />
        )}
      </View>
    </View>
  );
}