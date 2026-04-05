import FontAwesome from '@react-native-vector-icons/fontawesome-free-solid';
import * as React from 'react';
import { Image, Pressable, Text, View, type ImageStyle, type TextStyle } from 'react-native';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
// Types for parsed HTML elements
type HtmlElement = {
  type: 'text' | 'element';
  tagName?: string;
  content?: string;
  attributes?: Record<string, string>;
  children?: HtmlElement[];
};

type HtmlRendererProps = {
  html: string;
  className?: string;
};

/**
 * Parse inline style attribute to extract color
 * Supports: color: rgb(r, g, b), color: #RRGGBB, color: #RGB
 */
function parseStyleColor(style: string): string | undefined {
  const colorMatch = style.match(/color\s*:\s*(rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|#[0-9a-fA-F]{3,6})/);
  if (!colorMatch) return undefined;

  const colorValue = colorMatch[1].trim();

  // Handle rgb(r, g, b) format
  const rgbMatch = colorValue.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Handle hex format
  return colorValue;
}

/**
 * Strip wrapper tags (html, head, body) from HTML string
 */
function stripWrapperTags(html: string): string {
  return html
    .replace(/<html[^>]*>/i, '')
    .replace(/<\/html>/i, '')
    .replace(/<head[^>]*>/i, '')
    .replace(/<\/head>/i, '')
    .replace(/<body[^>]*>/i, '')
    .replace(/<\/body>/i, '');
}

/**
 * Preprocess HTML: replace complex audio embed divs with a simple <audio> tag.
 * Uses a two-pass approach: first find all audio divs, then replace them.
 * The DB stores: <div data-type="audio" data-src="..." ...>...deeply nested divs...</div>
 */
function preprocessAudioEmbeds(html: string): string {
  // Find all audio div opening tags and their positions
  const audioDivs: Array<{ start: number; end: number; src: string; filename: string; duration: string }> = [];
  
  // Regex to find opening audio div tags
  const audioDivRegex = /<div([^>]*?)data-type="audio"([^>]*?)>/gi;
  let match: RegExpExecArray | null;
  
  while ((match = audioDivRegex.exec(html)) !== null) {
    const attrStr = match[1] + match[2];
    
    // Extract data attributes
    const getAttr = (name: string): string => {
      const attrRegex = new RegExp(`${name}="([^"]*)"`, 'i');
      const m = attrStr.match(attrRegex);
      return m ? m[1] : '';
    };
    
    const src = getAttr('data-src');
    if (!src) continue;
    
    const filename = getAttr('data-filename');
    const duration = getAttr('data-duration');
    
    // Find the matching closing </div> by counting depth
    const startIndex = match.index;
    let depth = 1;
    let pos = startIndex + match[0].length;
    
    while (pos < html.length && depth > 0) {
      const nextOpen = html.indexOf('<div', pos);
      const nextClose = html.indexOf('</div>', pos);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          audioDivs.push({
            start: startIndex,
            end: nextClose + 6,
            src,
            filename,
            duration,
          });
          break;
        }
        pos = nextClose + 6;
      }
    }
  }
  
  // Replace from end to start to preserve indices
  let result = html;
  for (let i = audioDivs.length - 1; i >= 0; i--) {
    const { start, end, src, filename, duration } = audioDivs[i];
    const replacement = `<audio src="${src}" data-filename="${filename}" data-duration="${duration}"></audio>`;
    result = result.substring(0, start) + replacement + result.substring(end);
  }
  
  return result;
}

/**
 * AudioPlayer component for rendering HTML audio elements
 * Uses expo-audio for playback
 */
function AudioPlayer({ src, filename, duration }: { src: string; filename?: string; duration?: string }) {
  const player = useAudioPlayer(src);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parsedDuration = duration ? parseFloat(duration) : 0;

  const [currentTime, setCurrentTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isEnded, setIsEnded] = React.useState(false);
  const [isSeeking, setIsSeeking] = React.useState(false);
  const [seekProgress, setSeekProgress] = React.useState(0);
  const progressBarWidth = React.useRef(0);

  const status = useEvent(player, 'playbackStatusUpdate');

  React.useEffect(() => {
    if (status) {
      setCurrentTime(status.currentTime);
      setTotalDuration(status.duration);
      setIsPlaying(status.playing);
      // Detect end: playing stopped and near the end of duration
      if (!status.playing && status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        setIsEnded(true);
      } else if (status.playing) {
        setIsEnded(false);
      }
    }
  }, [status]);

  React.useEffect(() => {
    return () => {
      try { player.pause(); } catch (_) {}
    };
  }, [player]);

  const displayDuration = totalDuration > 0 ? totalDuration : parsedDuration;
  const liveProgress = displayDuration > 0 ? Math.min(currentTime / displayDuration, 1) : 0;
  const progress = isSeeking ? seekProgress : liveProgress;

  const handleSeek = (pageX: number, containerX: number) => {
    const barWidth = progressBarWidth.current;
    if (barWidth <= 0 || displayDuration <= 0) return;
    const ratio = Math.min(Math.max((pageX - containerX) / barWidth, 0), 1);
    const seekTo = ratio * displayDuration;
    setSeekProgress(ratio);
    setCurrentTime(seekTo);
    player.seekTo(seekTo);
  };

  const togglePlay = () => {
    if (isPlaying) player.pause();
    else player.play();
  };

  const replay = () => {
    player.seekTo(0);
    player.play();
    setCurrentTime(0);
    setIsEnded(false);
  };

  const displayName = filename
    ? filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    : 'Audio';

  return (
    <View className="my-3 rounded-xl border border-border bg-card flex-row items-center px-3 py-3 gap-3">
      {/* Left: single action button */}
      <Pressable
        onPress={isEnded ? replay : togglePlay}
        className="w-10 h-10 rounded-full items-center justify-center bg-primary shrink-0 active:opacity-75"
      >
        {isEnded ? (
          <FontAwesome name="rotate-left" size={15} color="#fff" />
        ) : isPlaying ? (
          <FontAwesome name="pause" size={15} color="#fff" />
        ) : (
          <FontAwesome name="play" size={15} color="#fff" style={{ marginLeft: 2 }} />
        )}
      </Pressable>

      {/* Right: filename + progress + time */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm">🎵</Text>
          <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <View
          className="h-4 justify-center"
          onLayout={(e) => { progressBarWidth.current = e.nativeEvent.layout.width; }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            setIsSeeking(true);
            handleSeek(e.nativeEvent.pageX, e.nativeEvent.locationX < 0 ? e.nativeEvent.pageX : e.nativeEvent.pageX - e.nativeEvent.locationX);
          }}
          onResponderMove={(e) => {
            const containerX = e.nativeEvent.pageX - e.nativeEvent.locationX;
            handleSeek(e.nativeEvent.pageX, containerX);
          }}
          onResponderRelease={() => { setIsSeeking(false); }}
        >
          <View className="h-1.5 rounded-full bg-muted overflow-hidden">
            <View className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
          </View>
          {/* Thumb indicator */}
          <View
            className="absolute w-3 h-3 rounded-full bg-primary border-2 border-background"
            style={{ left: `${progress * 100}%`, top: 2, marginLeft: -6 }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted-foreground">{formatTime(currentTime)}</Text>
          <Text className="text-xs text-muted-foreground">
            {displayDuration > 0 ? formatTime(displayDuration) : '--:--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Parse HTML string into a tree of HtmlElement nodes
 * Uses regex-based parsing for simplicity
 */
function parseHtml(html: string): HtmlElement[] {
  const preprocessed = preprocessAudioEmbeds(html);
  const stripped = stripWrapperTags(preprocessed);
  const elements: HtmlElement[] = [];

  // Check if it's plain text (no HTML tags)
  if (!stripped.includes('<')) {
    return [{ type: 'text', content: stripped }];
  }

  let remaining = stripped;

  while (remaining.length > 0) {
    // Find the next opening tag
    const openTagMatch = remaining.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/);
    
    if (!openTagMatch) {
      // No more tags, add remaining as text
      if (remaining.trim()) {
        elements.push({ type: 'text', content: remaining });
      }
      break;
    }

    const [fullTag, tagName, attributesStr] = openTagMatch;
    const tagStartIndex = remaining.indexOf(fullTag);

    // Add text before the tag
    if (tagStartIndex > 0) {
      const textContent = remaining.substring(0, tagStartIndex);
      if (textContent.trim()) {
        elements.push({ type: 'text', content: textContent });
      }
    }

    // Parse attributes
    const attributes: Record<string, string> = {};
    if (attributesStr) {
      const attrRegex = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
      }
    }

    // Find the closing tag
    const closingTag = `</${tagName}>`;
    const closingTagIndex = remaining.indexOf(closingTag, tagStartIndex + fullTag.length);

    if (closingTagIndex === -1) {
      // Self-closing tag (like <img />)
      if (fullTag.endsWith('/>')) {
        elements.push({
          type: 'element',
          tagName,
          attributes,
          children: [],
        });
        // Advance past the self-closing tag and continue parsing
        remaining = remaining.substring(tagStartIndex + fullTag.length);
        continue;
      } else {
        // Malformed HTML, treat as text and stop
        elements.push({ type: 'text', content: remaining });
        break;
      }
    }

    // Extract content between tags
    const content = remaining.substring(tagStartIndex + fullTag.length, closingTagIndex);

    // Recursively parse children
    const children = parseHtml(content);

    elements.push({
      type: 'element',
      tagName,
      attributes,
      children,
    });

    // Move past the closing tag
    remaining = remaining.substring(closingTagIndex + closingTag.length);
  }

  return elements;
}

/**
 * Render a single HTML element as React Native components
 */
function renderElement(element: HtmlElement, key: string): React.ReactNode {
  if (element.type === 'text') {
    return (
      <Text key={key} className="text-foreground">
        {element.content}
      </Text>
    );
  }

  const { tagName, attributes, children } = element;

  switch (tagName?.toLowerCase()) {
    case 'p': {
      return (
        <View key={key} style={{ marginBottom: 8 }}>
          {children?.map((child, i) => renderElement(child, `${key}-p-${i}`))}
        </View>
      );
    }

    case 'img': {
      const src = attributes?.src;
      const className = attributes?.class || '';
      
      if (!src) return null;

      // Parse classes for styling
      const hasRounded = className.includes('rounded-lg');
      const hasBorder = className.includes('border');
      const hasMutedBorder = className.includes('border-muted');

      const imageStyle: ImageStyle = {
        borderRadius: hasRounded ? 8 : 0,
        borderWidth: hasBorder ? 1 : 0,
        borderColor: hasMutedBorder ? '#e5e7eb' : undefined,
        resizeMode: 'contain',
        maxWidth: '100%',
        height: 200,
      };

      return (
        <Image
          key={key}
          source={{ uri: src }}
          style={imageStyle}
        />
      );
    }

    case 'audio': {
      const src = attributes?.src;
      const filename = attributes?.['data-filename'];
      const duration = attributes?.['data-duration'];
      
      if (!src) return null;

      return <AudioPlayer key={key} src={src} filename={filename} duration={duration} />;
    }

    case 'span': {
      const style = attributes?.style || '';
      const color = parseStyleColor(style);

      const textStyle: TextStyle = {};
      if (color) {
        textStyle.color = color;
      }

      return (
        <Text key={key} style={textStyle} className="text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-span-${i}`))}
        </Text>
      );
    }

    case 'strong':
    case 'b': {
      return (
        <Text key={key} className="font-bold text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-strong-${i}`))}
        </Text>
      );
    }

    case 'em':
    case 'i': {
      return (
        <Text key={key} className="italic text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-em-${i}`))}
        </Text>
      );
    }

    case 'u': {
      return (
        <Text key={key} className="underline text-foreground">
          {children?.map((child, i) => renderElement(child, `${key}-u-${i}`))}
        </Text>
      );
    }

    case 'h1': {
      return (
        <Text key={key} className="text-2xl font-bold text-foreground mt-2 mb-1">
          {children?.map((child, i) => renderElement(child, `${key}-h1-${i}`))}
        </Text>
      );
    }

    case 'h2': {
      return (
        <Text key={key} className="text-xl font-bold text-foreground mt-2 mb-1">
          {children?.map((child, i) => renderElement(child, `${key}-h2-${i}`))}
        </Text>
      );
    }

    case 'h3': {
      return (
        <Text key={key} className="text-lg font-semibold text-foreground mt-2 mb-1">
          {children?.map((child, i) => renderElement(child, `${key}-h3-${i}`))}
        </Text>
      );
    }

    case 'h4': {
      return (
        <Text key={key} className="text-base font-semibold text-foreground mt-1 mb-0">
          {children?.map((child, i) => renderElement(child, `${key}-h4-${i}`))}
        </Text>
      );
    }

    case 'h5': {
      return (
        <Text key={key} className="text-sm font-semibold text-foreground mt-1 mb-0">
          {children?.map((child, i) => renderElement(child, `${key}-h5-${i}`))}
        </Text>
      );
    }

    case 'h6': {
      return (
        <Text key={key} className="text-xs font-semibold text-foreground mt-1 mb-0">
          {children?.map((child, i) => renderElement(child, `${key}-h6-${i}`))}
        </Text>
      );
    }

    default: {
      // Unknown tag, render children
      return (
        <React.Fragment key={key}>
          {children?.map((child, i) => renderElement(child, `${key}-unknown-${i}`))}
        </React.Fragment>
      );
    }
  }
}

/**
 * HtmlRenderer - A simple HTML renderer for React Native
 *
 * Parses HTML content and renders it using React Native components.
 * Supports: p, img, audio, span, strong, b, em, i, u
 * Handles inline styles for color
 * Strips wrapper tags (html, head, body)
 *
 * @example
 * <HtmlRenderer html="<p>Hello <strong>world</strong></p>" />
 */
export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  const elements = parseHtml(html);

  return (
    <View className={className}>
      {elements.map((element, index) => renderElement(element, `html-${index}`))}
    </View>
  );
}
