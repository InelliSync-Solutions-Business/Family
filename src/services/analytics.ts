import posthog from 'posthog-js';
import { ContentItem } from '@/types/content';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    persistence: 'localStorage',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: process.env.NODE_ENV === 'development',
  });
}

export type AnalyticsEvent =
  | 'content_view'
  | 'content_upload'
  | 'content_share'
  | 'content_like'
  | 'content_comment'
  | 'content_search'
  | 'content_download'
  | 'ai_chat_start'
  | 'ai_chat_message'
  | 'error_occurred'
  | 'user_settings_update'
  | 'performance_metric'
  | 'api_performance';

interface AnalyticsProperties {
  contentId?: string;
  contentType?: string;
  searchQuery?: string;
  errorMessage?: string;
  duration?: number;
  success?: boolean;
  [key: string]: any;
}

class Analytics {
  private static instance: Analytics;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  public identify(userId: string, traits?: Record<string, any>) {
    if (typeof window === 'undefined') return;
    posthog.identify(userId, traits);
  }

  public track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (typeof window === 'undefined') return;
    posthog.capture(event, properties);
  }

  public trackContentView(content: ContentItem) {
    this.track('content_view', {
      contentId: content.id,
      contentType: content.type,
      title: content.title,
      isPrivate: content.isPrivate,
    });
  }

  public trackContentUpload(content: ContentItem, duration: number) {
    this.track('content_upload', {
      contentId: content.id,
      contentType: content.type,
      size: content.fileUrl ? new Blob([content.fileUrl]).size : undefined,
      duration,
      success: true,
    });
  }

  public trackSearch(
    query: string,
    results: number,
    filters?: Record<string, any>
  ) {
    this.track('content_search', {
      searchQuery: query,
      resultCount: results,
      filters,
    });
  }

  public trackError(error: Error, context?: Record<string, any>) {
    this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  public startPageView() {
    if (typeof window === 'undefined') return;
    posthog.startSessionRecording();
  }

  public stopPageView() {
    if (typeof window === 'undefined') return;
    posthog.stopSessionRecording();
  }

  public reset() {
    if (typeof window === 'undefined') return;
    posthog.reset();
  }
}

export const analytics = Analytics.getInstance();

// Analytics Hook
export function useAnalytics() {
  return analytics;
}

// Performance Monitoring
export class PerformanceMonitoring {
  private static marks: Map<string, number> = new Map();

  static startMark(name: string) {
    this.marks.set(name, performance.now());
  }

  static endMark(name: string) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      analytics.track('performance_metric', {
        name,
        duration,
        timestamp: new Date().toISOString(),
      });
      this.marks.delete(name);
      return duration;
    }
    return null;
  }

  static trackApiCall(endpoint: string, duration: number, success: boolean) {
    analytics.track('api_performance', {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    });
  }
}
