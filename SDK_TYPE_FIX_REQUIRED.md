# SDK Type Fix Required: Vocabulary API Response Types

## Issue Summary

The TypeScript type definitions for `vocabularyApi.listSets()` do not match the actual API response structure, causing type errors when consuming the API.

## Current SDK Type Definition

```typescript
// From node_modules/hakgyo-expo-sdk/dist/index.d.ts
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    streakInfo?: StreakInfo;
}

// vocabularyApi.listSets type
declare const vocabularyApi: {
    listSets: (params?: QueryParams) => Promise<ApiResponse<PaginatedResponse<VocabularySet>>>;
    // ...
};
```

## Expected Access Pattern (Based on Types)

According to the type definitions, accessing the vocabulary sets should require:

```typescript
const response = await vocabularyApi.listSets({ limit: 50 });
const vocabSets = response.data.data; // VocabularySet[]
```

This is because:
- `response` is `ApiResponse<PaginatedResponse<VocabularySet>>`
- `response.data` is `PaginatedResponse<VocabularySet>` (which extends `ApiResponse<VocabularySet[]>`)
- `response.data.data` is `VocabularySet[]`

## Actual API Response Structure

At runtime, the actual response structure is:

```typescript
const response = await vocabularyApi.listSets({ limit: 50 });
const vocabSets = response.data; // VocabularySet[] - works at runtime!
```

This indicates the actual API returns `ApiResponse<VocabularySet[]>` directly, NOT `ApiResponse<PaginatedResponse<VocabularySet>>`.

## Type Error

When using the correct runtime access pattern:

```typescript
setVocabSets(response?.data ?? []);
// TypeScript Error: Argument of type 'never[] | PaginatedResponse<VocabularySet>' is not assignable to 
// parameter of type 'SetStateAction<VocabularySet[]>'.
```

## Proposed Fix

**Option 1:** If pagination is not returned by the API, update the type to:

```typescript
listSets: (params?: QueryParams) => Promise<ApiResponse<VocabularySet[]>>;
```

**Option 2:** If pagination IS returned by the API, ensure the API response wraps the data correctly:

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

## Affected Methods

Based on the SDK types, this issue likely affects multiple API methods:

- `vocabularyApi.listSets()`
- `vocabularyApi.listItems()`
- `kelasApi.list()`
- `soalApi.listCollections()`
- `soalApi.listQuestions()`
- `postsApi.list()`
- `gamificationApi.getActivityHistory()`

## Recommendation

1. Verify the actual API response structure from the backend
2. Update SDK type definitions to match the actual response
3. Ensure documentation reflects the correct response structure

## Files to Update

- `packages/hakgyo-expo-sdk/src/types/api.ts` - Update `PaginatedResponse` or method return types
- `packages/hakgyo-expo-sdk/src/api/vocabulary.ts` - Update method return types if needed
- `hakgyo-expo-sdk-docs/api-vocabulary.md` - Update documentation to match actual response

---

**Created:** 2026-03-14
**SDK Version:** 1.0.34
**Reporter:** Mobile App Team