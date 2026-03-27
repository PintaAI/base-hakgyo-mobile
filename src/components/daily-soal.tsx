import { Colors } from '@/constants/theme';
import { gamificationApi, Soal, soalApi, useAuth } from 'hakgyo-expo-sdk';
import { AlertCircle, BookOpen, CheckCircle, ChevronRight, X, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from 'react-native';
import { QuizViewer } from './quiz-viewer';

export function DailySoal() {
  const { user, refreshSession } = useAuth();
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const fetchDailySoal = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await soalApi.getDaily(user.id, 5);
      
      if (response.data) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch daily soal:', err);
      setError('Gagal memuat soal harian');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDailySoal();
  }, [fetchDailySoal]);

  const handleOpenQuiz = () => {
    setIsExpanded(true);
  };

  const handleCloseQuiz = () => {
    setIsExpanded(false);
  };

  const handleFinish = async (correct: number, total: number) => {
    setScore({ correct, total });
    setHasCompleted(true);
    
    // Award XP for completing the quiz
    if (user?.id) {
      try {
        setIsSubmitting(true);
        const result = await gamificationApi.processEvent({
          event: 'COMPLETE_SOAL',
          metadata: {
            totalQuestions: total,
            correctAnswers: correct,
            score: Math.round((correct / total) * 100),
          },
          userTimeZone: 'Asia/Seoul', // User's timezone for streak calculation
        });
        
        if (result.success && result.data) {
          setXpEarned(result.data.totalXP);
          // Refresh user session to get updated XP and level
          refreshSession();
        }
      } catch (err) {
        console.error('Failed to process gamification event:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRestart = () => {
    setHasCompleted(false);
    setScore(null);
    setXpEarned(null);
    setIsExpanded(false);
  };

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.mutedForeground, fontSize: 14 }}>
          Memuat soal harian...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={20} color={theme.destructive} />
          <Text style={{ color: theme.destructive, fontSize: 14 }}>{error}</Text>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  // Expanded quiz view
  if (isExpanded) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
          flex: 1,
          minHeight: 400,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color={theme.primary} />
            <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
              Soal Harian
            </Text>
          </View>
          <Pressable
            onPress={handleCloseQuiz}
            style={{
              padding: 4,
              borderRadius: 999,
              backgroundColor: theme.muted,
            }}
          >
            <X size={16} color={theme.mutedForeground} />
          </Pressable>
        </View>

        {/* Quiz Content */}
        <View style={{ flex: 1 }}>
          <QuizViewer
            questions={questions}
            mode="practice"
            passingScore={60}
            onComplete={(result) => handleFinish(result.correct, result.total)}
          />
        </View>
      </View>
    );
  }

  // Completed state - show score summary
  if (hasCompleted && score) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const passed = percentage >= 60;

    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color={theme.primary} />
            <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
              Soal Harian
            </Text>
          </View>
          {passed ? (
            <CheckCircle size={20} color={theme.success} />
          ) : (
            <XCircle size={20} color={theme.destructive} />
          )}
        </View>

        {/* Score Summary */}
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: theme.primary }}>
            {percentage}%
          </Text>
          <Text style={{ color: theme.mutedForeground, fontSize: 14, marginTop: 4 }}>
            {score.correct} dari {score.total} soal benar
          </Text>
          
          {/* XP Earned */}
          {xpEarned !== null && (
            <View
              style={{
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: theme.primary + '1A',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primary }}>
                +{xpEarned} XP
              </Text>
            </View>
          )}
          
          <View
            style={{
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: passed ? theme.success + '1A' : theme.destructive + '1A',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: passed ? theme.success : theme.destructive,
              }}
            >
              {passed ? 'LULUS' : 'BELUM LULUS'}
            </Text>
          </View>

          <Pressable
            onPress={handleRestart}
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: theme.primary,
            }}
          >
            <Text style={{ color: theme.background, fontWeight: '600', fontSize: 14 }}>
              Coba Lagi
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Collapsed preview view
  return (
    <Pressable
      onPress={handleOpenQuiz}
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} color={theme.primary} />
          <Text style={{ fontWeight: '600', fontSize: 16, color: theme.foreground }}>
            Soal Harian
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.primary + '1A',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>
            {questions.length} soal
          </Text>
        </View>
      </View>

      {/* Preview Content */}
      <View style={{ padding: 16 }}>

        
        {/* Question Preview */}
        <View
          style={{
            backgroundColor: theme.muted,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: theme.mutedForeground, fontSize: 12, marginBottom: 4 }}>
            Preview:
          </Text>
          <Text style={{ color: theme.foreground, fontSize: 14 }} numberOfLines={2}>
            {questions[0]?.pertanyaan?.replace(/<[^>]*>/g, '') || 'Soal tersedia'}
          </Text>
        </View>

        {/* Start Button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.primary,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: theme.background, fontWeight: '600', fontSize: 14 }}>
            Mulai Latihan
          </Text>
          <ChevronRight size={16} color={theme.background} />
        </View>
      </View>
    </Pressable>
  );
}