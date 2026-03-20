import { Opsi, Soal } from 'hakgyo-expo-sdk';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { HtmlRenderer } from './html-renderer';

interface QuizViewerProps {
  questions: Soal[];
}

type UserAnswers = Record<number, number | null>;

export function QuizViewer({ questions }: QuizViewerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [listWidth, setListWidth] = useState(windowWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState(false);
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

  const handleFinish = () => {
    setShowResults(true);
  };

  const handleRestart = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  };

  // Calculate score
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

  if (questions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-muted-foreground">No questions available</Text>
      </View>
    );
  }

  // Results screen
  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <ScrollView className="flex-1 pt-3" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Score Summary */}
        <View className="bg-card p-6 rounded-lg border border-border items-center">
          <Text className="text-4xl font-bold text-primary mb-2">{percentage}%</Text>
          <Text className="text-lg text-foreground">
            {score} out of {questions.length} correct
          </Text>
        </View>

        {/* Question Review */}
        {questions.map((question, qIndex) => {
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
                    isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  <Text className={`text-xs ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
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
                        ? 'bg-green-500/20 border-green-500'
                        : isSelected
                        ? 'bg-red-500/20 border-red-500'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <View
                      className={
                        isCorrectOpsi
                          ? 'text-green-700'
                          : isSelected
                          ? 'text-red-700'
                          : 'text-foreground'
                      }
                    >
                      <HtmlRenderer html={opsi.opsiText || ''} />
                    </View>
                  </View>
                );
              })}

              {question.explanation && (
                <View className="mt-3 p-3 bg-blue-500/10 rounded-lg">
                  <Text className="text-sm font-semibold text-blue-700 mb-1">
                    Explanation:
                  </Text>
                  <Text className="text-sm text-blue-800">{question.explanation}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Restart Button */}
        <Pressable
          className="mt-6 p-4 bg-primary rounded-lg items-center"
          onPress={handleRestart}
        >
          <Text className="text-primary-foreground font-semibold">Try Again</Text>
        </Pressable>
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
                    className="flex-1 p-4 bg-primary rounded-lg"
                    onPress={handleFinish}
                  >
                    <Text className="text-center text-primary-foreground font-semibold">
                      Finish
                    </Text>
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
