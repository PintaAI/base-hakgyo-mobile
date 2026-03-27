import { Opsi, Soal, TryoutAnswer, TryoutResult } from 'hakgyo-expo-sdk';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { HtmlRenderer } from './html-renderer';

export interface SubmitAnswer {
  soalId: number;
  opsiId: number;
}

export interface InitialResultData {
  result: TryoutResult;
  answers?: TryoutAnswer[];
}

interface QuizViewerProps {
  questions: Soal[];
  mode?: 'practice' | 'tryout';
  onSubmit?: (answers: SubmitAnswer[]) => Promise<TryoutResult | null>;
  onComplete?: (score: { correct: number; total: number; percentage: number }) => void;
  passingScore?: number;
  initialResult?: InitialResultData | null;
}

type UserAnswers = Record<number, number | null>;

export function QuizViewer({ questions, mode = 'practice', onSubmit, onComplete, passingScore, initialResult }: QuizViewerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [listWidth, setListWidth] = useState(windowWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>(() => {
    // Initialize userAnswers from initialResult if available
    if (initialResult?.answers) {
      const answers: UserAnswers = {};
      initialResult.answers.forEach((answer) => {
        if (answer.opsiId) {
          answers[answer.soalId] = answer.opsiId;
        }
      });
      return answers;
    }
    return {};
  });
  const [showResults, setShowResults] = useState(!!initialResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tryoutResult, setTryoutResult] = useState<TryoutResult | null>(initialResult?.result || null);
  const [showReview, setShowReview] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSelectAnswer = (opsiId: number, questionId: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: opsiId,
    }));
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (mode === 'tryout' && onSubmit) {
      // In tryout mode, submit answers to API
      setIsSubmitting(true);
      try {
        const answers: SubmitAnswer[] = questions
          .filter((q) => userAnswers[q.id] !== null && userAnswers[q.id] !== undefined)
          .map((q) => ({
            soalId: q.id,
            opsiId: userAnswers[q.id] as number,
          }));
        
        const result = await onSubmit(answers);
        if (result) {
          setTryoutResult(result);
        }
        setShowResults(true);
        
        // Call onComplete callback if provided
        if (onComplete && result) {
          onComplete({
            correct: result.correctCount,
            total: questions.length,
            percentage: result.score,
          });
        }
      } catch (error: any) {
        Alert.alert(
          'Submission Failed',
          error?.message || 'Failed to submit tryout. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // In practice mode, show results directly
      setShowResults(true);
      
      // Call onComplete callback if provided
      if (onComplete) {
        const correct = calculateScore();
        const percentage = Math.round((correct / questions.length) * 100);
        onComplete({
          correct,
          total: questions.length,
          percentage,
        });
      }
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setShowResults(false);
    setTryoutResult(null);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  };

  // Calculate score (for practice mode or fallback)
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selectedOpsiId = userAnswers[q.id];
      const correctOpsi = q.opsis?.find((o) => o.isCorrect);
      if (selectedOpsiId && correctOpsi && selectedOpsiId === correctOpsi.id) {
        correct++;
      }
    });
    return correct;
  };

  // Get score from tryout result or calculate locally
  const getScore = () => {
    if (mode === 'tryout' && tryoutResult) {
      return tryoutResult.correctCount;
    }
    return calculateScore();
  };

  const getPercentage = () => {
    if (mode === 'tryout' && tryoutResult) {
      return tryoutResult.score;
    }
    return Math.round((getScore() / questions.length) * 100);
  };

  if (questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-muted-foreground">No questions available</Text>
      </View>
    );
  }

  // Results screen
  if (showResults) {
    const score = getScore();
    const percentage = getPercentage();
    const passed = mode === 'tryout' && tryoutResult?.passed !== undefined
      ? tryoutResult.passed
      : (passingScore !== undefined ? percentage >= passingScore : undefined);

    return (
      <ScrollView className="flex-1 pt-3 p-2" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Score Summary */}
        <View className="bg-card p-6 rounded-lg border border-border items-center">
          <Text className="text-5xl font-bold text-primary mb-1">{percentage}%</Text>
          <Text className="text-base text-muted-foreground">
            {score} of {questions.length} correct
          </Text>
          {mode === 'tryout' && tryoutResult?.timeTakenSeconds !== undefined && (
            <Text className="text-sm text-muted-foreground mt-1">
              {Math.floor(tryoutResult.timeTakenSeconds / 60)}m {tryoutResult.timeTakenSeconds % 60}s
            </Text>
          )}
          {passed !== undefined && (
            <View
              className={`mt-4 px-5 py-2 rounded-full ${
                passed ? 'bg-success-muted' : 'bg-error-muted'
              }`}
            >
              <Text className={`text-sm font-semibold ${passed ? 'text-success-foreground' : 'text-error-foreground'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-4 gap-3">
          <Pressable
            className="p-4 bg-card rounded-lg border border-border items-center flex-row justify-center gap-2"
            onPress={() => setShowReview(!showReview)}
          >
            <Text className="text-primary font-medium">
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Text>
          </Pressable>

          {mode === 'practice' && (
            <Pressable
              className="p-4 bg-primary rounded-lg items-center"
              onPress={handleRestart}
            >
              <Text className="text-primary-foreground font-semibold">Try Again</Text>
            </Pressable>
          )}
        </View>

        {/* Question Review - only shown when showReview is true */}
        {showReview && questions.map((question, qIndex) => {
          const selectedOpsiId = userAnswers[question.id];
          const correctOpsi = question.opsis?.find((o) => o.isCorrect);
          const isCorrect = selectedOpsiId === correctOpsi?.id;

          return (
            <View key={question.id} className="bg-card p-4 rounded-lg border border-border mt-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-semibold text-muted-foreground">
                  Question {qIndex + 1}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded ${
                    isCorrect ? 'bg-success-muted' : 'bg-error-muted'
                  }`}
                >
                  <Text className={`text-xs ${isCorrect ? 'text-success-foreground' : 'text-error-foreground'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Text>
                </View>
              </View>

              <HtmlRenderer html={question.pertanyaan || ''} className="mb-3" />

              {question.opsis?.map((opsi) => {
                const isSelected = selectedOpsiId === opsi.id;
                const isCorrectOpsi = opsi.isCorrect;

                return (
                  <View
                    key={opsi.id}
                    className={`p-3 rounded-lg mb-2 border ${
                      isCorrectOpsi
                        ? 'bg-success-muted border-success'
                        : isSelected
                        ? 'bg-error-muted border-error'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <View
                      className={
                        isCorrectOpsi
                          ? 'text-success-foreground'
                          : isSelected
                          ? 'text-error-foreground'
                          : 'text-foreground'
                      }
                    >
                      <HtmlRenderer html={opsi.opsiText || ''} />
                    </View>
                  </View>
                );
              })}

              {question.explanation && (
                <View className="mt-3 p-3 bg-info-muted rounded-lg">
                  <Text className="text-sm font-semibold text-info-foreground mb-1">
                    Explanation:
                  </Text>
                  <Text className="text-sm text-info-foreground">{question.explanation}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // Quiz screen
  return (
    <View className="flex-1">
      {/* Progress bar — fixed outside FlatList */}
      <View className="h-2 bg-muted rounded-full overflow-hidden mx-4 mt-2">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </View>

      {/* Question counter */}
      <Text className="text-sm text-muted-foreground mt-2 mb-2 mx-4">
        Question {currentIndex + 1} of {questions.length}
      </Text>

      {/* Horizontally paging FlatList — handles swipe gestures natively */}
      <FlatList
        ref={flatListRef}
        data={questions}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        bounces={false}
        onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / listWidth);
          setCurrentIndex(newIndex);
        }}
        getItemLayout={(_, index) => ({
          length: listWidth,
          offset: listWidth * index,
          index,
        })}
        renderItem={({ item: question }) => {
          const isSelected = (opsiId: number) => userAnswers[question.id] === opsiId;

          return (
            <ScrollView
              style={{ width: listWidth }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Question */}
              <View className="bg-card p-4 rounded-lg border border-border">
                <HtmlRenderer html={question.pertanyaan || ''} />
              </View>

              {/* Options */}
              <View className="mt-4">
                {question.opsis?.map((opsi: Opsi) => (
                  <Pressable
                    key={opsi.id}
                    className={`p-4 rounded-lg mb-3 border ${
                      isSelected(opsi.id)
                        ? 'bg-primary/20 border-primary'
                        : 'bg-card border-border'
                    }`}
                    onPress={() => handleSelectAnswer(opsi.id, question.id)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                          isSelected(opsi.id) ? 'border-primary bg-primary' : 'border-border'
                        }`}
                      >
                        {isSelected(opsi.id) && (
                          <Text className="text-primary-foreground text-sm">✓</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <HtmlRenderer html={opsi.opsiText || ''} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Navigation */}
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  className={`flex-1 p-4 rounded-lg border border-border ${
                    currentIndex === 0 ? 'opacity-50' : ''
                  }`}
                  onPress={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <Text className="text-center text-foreground">Previous</Text>
                </Pressable>

                {currentIndex === questions.length - 1 ? (
                  <Pressable
                    className={`flex-1 p-4 bg-primary rounded-lg flex-row items-center justify-center ${
                      isSubmitting ? 'opacity-70' : ''
                    }`}
                    onPress={handleFinish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" className="text-primary-foreground" />
                    ) : (
                      <Text className="text-center text-primary-foreground font-semibold">
                        {mode === 'tryout' ? 'Submit' : 'Finish'}
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <Pressable
                    className="flex-1 p-4 bg-primary rounded-lg"
                    onPress={handleNext}
                  >
                    <Text className="text-center text-primary-foreground font-semibold">
                      Next
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          );
        }}
      />
    </View>
  );
}
