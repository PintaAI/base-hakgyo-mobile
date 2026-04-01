import { 
  AssessmentAnswer, 
  AssessmentOption, 
  AssessmentQuestion, 
  MateriAssessmentResult,
  Opsi, 
  Soal, 
  TryoutAnswer, 
  TryoutResult 
} from 'hakgyo-expo-sdk';
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

export interface AssessmentResultData {
  result: MateriAssessmentResult;
  answers?: AssessmentAnswer[];
}

interface QuizViewerProps {
  questions: Soal[];
  mode?: 'practice' | 'tryout';
  onSubmit?: (answers: SubmitAnswer[]) => Promise<TryoutResult | null>;
  onComplete?: (score: { correct: number; total: number; percentage: number }) => void;
  passingScore?: number;
  initialResult?: InitialResultData | null;
}

interface AssessmentViewerProps {
  questions: AssessmentQuestion[];
  onSubmit?: (answers: AssessmentAnswer[]) => Promise<MateriAssessmentResult | null>;
  onComplete?: (result: MateriAssessmentResult) => void;
  passingScore?: number;
  initialResult?: AssessmentResultData | null;
  title?: string;
}

type UserAnswers = Record<number, number | null>;

// Unified props that accept both types
export type UnifiedQuizViewerProps = QuizViewerProps | AssessmentViewerProps;

// Helper to check if props are for assessment mode
function isAssessmentProps(props: UnifiedQuizViewerProps): props is AssessmentViewerProps {
  return 'questions' in props && props.questions.length > 0 && 
    'opsi' in props.questions[0] && !('opsis' in props.questions[0]);
}

// Normalize question to common format for rendering
type NormalizedQuestion = {
  id: number;
  pertanyaan: string;
  options: { id: number; opsiText: string; isCorrect?: boolean }[];
  explanation?: string;
};

function normalizeSoal(soal: Soal): NormalizedQuestion {
  return {
    id: soal.id,
    pertanyaan: soal.pertanyaan,
    options: soal.opsis?.map(o => ({ id: o.id, opsiText: o.opsiText, isCorrect: o.isCorrect })) || [],
    explanation: soal.explanation,
  };
}

function normalizeAssessmentQuestion(question: AssessmentQuestion): NormalizedQuestion {
  return {
    id: question.id,
    pertanyaan: question.pertanyaan,
    options: question.opsi?.map(o => ({ id: o.id, opsiText: o.opsiText })) || [],
  };
}

export function QuizViewer(props: UnifiedQuizViewerProps) {
  const isAssessment = isAssessmentProps(props);
  
  // Normalize questions
  const normalizedQuestions: NormalizedQuestion[] = isAssessment
    ? (props as AssessmentViewerProps).questions.map(normalizeAssessmentQuestion)
    : (props as QuizViewerProps).questions.map(normalizeSoal);
  
  const mode = isAssessment ? 'assessment' : (props as QuizViewerProps).mode || 'practice';
  const passingScore = props.passingScore;
  const title = isAssessment ? (props as AssessmentViewerProps).title : undefined;
  
  const { width: windowWidth } = useWindowDimensions();
  const [listWidth, setListWidth] = useState(windowWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>(() => {
    // Initialize from initialResult
    if (props.initialResult?.answers) {
      const answers: UserAnswers = {};
      props.initialResult.answers.forEach((answer) => {
        // Handle both TryoutAnswer (opsiId) and AssessmentAnswer (selectedOptionId)
        const opsiId = 'opsiId' in answer ? answer.opsiId : ('selectedOptionId' in answer ? answer.selectedOptionId : null);
        if (opsiId) {
          answers[answer.soalId] = opsiId;
        }
      });
      return answers;
    }
    return {};
  });
  const [showResults, setShowResults] = useState(!!props.initialResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Result state - different types for different modes
  const [tryoutResult, setTryoutResult] = useState<TryoutResult | null>(
    !isAssessment && (props as QuizViewerProps).initialResult?.result 
      ? (props as QuizViewerProps).initialResult!.result 
      : null
  );
  const [assessmentResult, setAssessmentResult] = useState<MateriAssessmentResult | null>(
    isAssessment && (props as AssessmentViewerProps).initialResult?.result 
      ? (props as AssessmentViewerProps).initialResult!.result 
      : null
  );
  
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
    if (currentIndex < normalizedQuestions.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    const answers = normalizedQuestions
      .filter((q) => userAnswers[q.id] !== null && userAnswers[q.id] !== undefined)
      .map((q) => ({
        soalId: q.id,
        opsiId: userAnswers[q.id] as number,
      }));

    if (mode === 'assessment' && isAssessment) {
      // Assessment mode - submit to materiApi
      const onSubmit = (props as AssessmentViewerProps).onSubmit;
      if (!onSubmit) {
        setShowResults(true);
        return;
      }
      
      setIsSubmitting(true);
      try {
        const assessmentAnswers: AssessmentAnswer[] = answers.map(a => ({
          soalId: a.soalId,
          selectedOptionId: a.opsiId,
        }));
        
        const result = await onSubmit(assessmentAnswers);
        if (result) {
          setAssessmentResult(result);
          setShowResults(true);
          
          // Call onComplete callback
          const onComplete = (props as AssessmentViewerProps).onComplete;
          if (onComplete) {
            onComplete(result);
          }
        }
      } catch (error: any) {
        Alert.alert(
          'Submission Failed',
          error?.message || 'Failed to submit assessment. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'tryout' && !isAssessment) {
      // Tryout mode - submit to tryoutApi
      const onSubmit = (props as QuizViewerProps).onSubmit;
      if (!onSubmit) {
        setShowResults(true);
        return;
      }
      
      setIsSubmitting(true);
      try {
        const result = await onSubmit(answers);
        if (result) {
          setTryoutResult(result);
        }
        setShowResults(true);
        
        // Call onComplete callback
        const onComplete = (props as QuizViewerProps).onComplete;
        if (onComplete && result) {
          onComplete({
            correct: result.correctCount,
            total: normalizedQuestions.length,
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
      // Practice mode - show results directly
      setShowResults(true);
      
      const onComplete = (props as QuizViewerProps).onComplete;
      if (onComplete) {
        const correct = calculateScoreForPractice();
        const percentage = Math.round((correct / normalizedQuestions.length) * 100);
        onComplete({
          correct,
          total: normalizedQuestions.length,
          percentage,
        });
      }
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setShowResults(false);
    setTryoutResult(null);
    setAssessmentResult(null);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  };

  // Calculate score for practice mode (where we know correct answers)
  const calculateScoreForPractice = () => {
    let correct = 0;
    normalizedQuestions.forEach((q) => {
      const selectedOpsiId = userAnswers[q.id];
      const correctOpsi = q.options.find((o) => o.isCorrect);
      if (selectedOpsiId && correctOpsi && selectedOpsiId === correctOpsi.id) {
        correct++;
      }
    });
    return correct;
  };

  // Get score from result or calculate locally
  const getScore = () => {
    if (mode === 'assessment' && assessmentResult) {
      return assessmentResult.correctAnswers;
    }
    if (mode === 'tryout' && tryoutResult) {
      return tryoutResult.correctCount;
    }
    return calculateScoreForPractice();
  };

  const getPercentage = () => {
    if (mode === 'assessment' && assessmentResult) {
      return assessmentResult.score;
    }
    if (mode === 'tryout' && tryoutResult) {
      return tryoutResult.score;
    }
    return Math.round((getScore() / normalizedQuestions.length) * 100);
  };

  const getPassedStatus = () => {
    if (mode === 'assessment' && assessmentResult) {
      return assessmentResult.isPassed;
    }
    if (mode === 'tryout' && tryoutResult?.passed !== undefined) {
      return tryoutResult.passed;
    }
    if (passingScore !== undefined) {
      return getPercentage() >= passingScore;
    }
    return undefined;
  };

  if (normalizedQuestions.length === 0) {
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
    const passed = getPassedStatus();

    return (
      <ScrollView className="flex-1 pt-3 p-2" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Title for assessment */}
        {title && (
          <Text className="text-lg font-semibold text-foreground mb-2 text-center">
            {title}
          </Text>
        )}
        
        {/* Score Summary */}
        <View className="bg-card p-6 rounded-lg border border-border items-center">
          <Text className="text-5xl font-bold text-primary mb-1">{percentage}%</Text>
          <Text className="text-base text-muted-foreground">
            {score} of {normalizedQuestions.length} correct
          </Text>
          
          {/* Time taken for tryout */}
          {mode === 'tryout' && tryoutResult?.timeTakenSeconds !== undefined && (
            <Text className="text-sm text-muted-foreground mt-1">
              {Math.floor(tryoutResult.timeTakenSeconds / 60)}m {tryoutResult.timeTakenSeconds % 60}s
            </Text>
          )}
          
          {/* Passing score info for assessment */}
          {mode === 'assessment' && assessmentResult && (
            <Text className="text-sm text-muted-foreground mt-1">
              Passing score: {assessmentResult.passingScore}%
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
          
          {/* Gamification info for assessment */}
          {mode === 'assessment' && assessmentResult?.gamification && (
            <View className="mt-4 p-3 bg-primary/10 rounded-lg">
              <Text className="text-sm font-semibold text-primary">
                +{assessmentResult.gamification.assessment?.totalXP || 0} XP earned!
              </Text>
              {assessmentResult.gamification.perfectScore && percentage === 100 && (
                <Text className="text-sm text-primary mt-1">
                  🎉 Perfect Score Bonus: +{assessmentResult.gamification.perfectScore.totalXP} XP
                </Text>
              )}
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

          {/* Retry options */}
          {mode === 'practice' && (
            <Pressable
              className="p-4 bg-primary rounded-lg items-center"
              onPress={handleRestart}
            >
              <Text className="text-primary-foreground font-semibold">Try Again</Text>
            </Pressable>
          )}
          
          {mode === 'assessment' && (props as AssessmentViewerProps).onSubmit && (
            <Pressable
              className="p-4 bg-primary rounded-lg items-center"
              onPress={handleRestart}
            >
              <Text className="text-primary-foreground font-semibold">Retake Assessment</Text>
            </Pressable>
          )}
        </View>

        {/* Question Review */}
        {showReview && normalizedQuestions.map((question, qIndex) => {
          const selectedOpsiId = userAnswers[question.id];
          
          // For practice/tryout mode, we know correct answers
          const correctOpsi = question.options.find((o) => o.isCorrect);
          const isCorrect = selectedOpsiId === correctOpsi?.id;

          return (
            <View key={question.id} className="bg-card p-4 rounded-lg border border-border mt-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-semibold text-muted-foreground">
                  Question {qIndex + 1}
                </Text>
                
                {/* Show correct/incorrect badge only in practice/tryout mode where we know correct answers */}
                {mode !== 'assessment' && (
                  <View
                    className={`px-2 py-0.5 rounded ${
                      isCorrect
                        ? 'bg-success-muted'
                        : 'bg-error-muted'
                    }`}
                  >
                    <Text className={`text-xs ${
                      isCorrect
                        ? 'text-success-foreground'
                        : 'text-error-foreground'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                  </View>
                )}
                
                {/* In assessment mode, show if answered */}
                {mode === 'assessment' && selectedOpsiId && (
                  <View className="px-2 py-0.5 rounded bg-primary/20">
                    <Text className="text-xs text-primary">Answered</Text>
                  </View>
                )}
              </View>

              <HtmlRenderer html={question.pertanyaan || ''} className="mb-3" />

              {question.options.map((opsi: { id: number; opsiText: string; isCorrect?: boolean }) => {
                const isSelected = selectedOpsiId === opsi.id;
                const isCorrectOpsi = opsi.isCorrect;

                // Determine styling based on mode
                let optionStyle = 'bg-muted border-border';
                let textStyle = 'text-foreground';
                
                if (mode !== 'assessment') {
                  // Practice/tryout mode - show correct answers
                  if (isCorrectOpsi) {
                    optionStyle = 'bg-success-muted border-success';
                    textStyle = 'text-success-foreground';
                  } else if (isSelected) {
                    optionStyle = 'bg-error-muted border-error';
                    textStyle = 'text-error-foreground';
                  }
                } else {
                  // Assessment mode - only show selected
                  if (isSelected) {
                    optionStyle = 'bg-primary/20 border-primary';
                    textStyle = 'text-primary';
                  }
                }

                return (
                  <View
                    key={opsi.id}
                    className={`p-3 rounded-lg mb-2 border ${optionStyle}`}
                  >
                    <View className={textStyle}>
                      <HtmlRenderer html={opsi.opsiText || ''} />
                    </View>
                  </View>
                );
              })}

              {/* Explanation - only available in Soal (practice/tryout) */}
              {question.explanation && mode !== 'assessment' && (
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
      {/* Title for assessment */}
      {title && (
        <Text className="text-lg font-semibold text-foreground mb-2 mx-4 text-center">
          {title}
        </Text>
      )}
      
      {/* Progress bar */}
      <View className="h-2 bg-muted rounded-full overflow-hidden mx-4 mt-2">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${((currentIndex + 1) / normalizedQuestions.length) * 100}%` }}
        />
      </View>

      {/* Question counter */}
      <Text className="text-sm text-muted-foreground mt-2 mb-2 mx-4">
        Question {currentIndex + 1} of {normalizedQuestions.length}
      </Text>

      {/* Horizontally paging FlatList */}
      <FlatList
        ref={flatListRef}
        data={normalizedQuestions}
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
                {question.options.map((opsi: { id: number; opsiText: string; isCorrect?: boolean }) => (
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

                {currentIndex === normalizedQuestions.length - 1 ? (
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
                        {mode === 'assessment' || mode === 'tryout' ? 'Submit' : 'Finish'}
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

// Export type-specific wrapper components for better type inference
export function SoalQuizViewer(props: QuizViewerProps) {
  return <QuizViewer {...props} />;
}

export function AssessmentQuizViewer(props: AssessmentViewerProps) {
  return <QuizViewer {...props} />;
}
