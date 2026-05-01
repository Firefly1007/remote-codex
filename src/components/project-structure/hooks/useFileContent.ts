import { useEffect, useRef, useState } from 'react';
import { api, authenticatedFetch } from '../../../utils/api';
import { isBinaryFile, isImageFile } from '../../code-editor/utils/binaryFile';

const MAX_PREVIEW_SIZE = 500 * 1024; // 500KB
const MAX_PREVIEW_LINES = 10000;

type UseFileContentResult = {
  content: string | null;
  loading: boolean;
  error: string | null;
  isBinary: boolean;
  isTruncated: boolean;
  isImage: boolean;
  imageUrl: string | null;
};

export function useFileContent(projectName: string | null, filePath: string | null): UseFileContentResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBinary, setIsBinary] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!projectName || !filePath) {
      setContent(null);
      setLoading(false);
      setError(null);
      setIsBinary(false);
      setIsTruncated(false);
      setIsImage(false);
      setImageUrl(null);
      return;
    }

    const fileName = filePath.split(/[/\\]/).pop() ?? filePath;

    if (isImageFile(fileName)) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      let isActive = true;
      let objectUrl: string | null = null;

      const fetchImage = async () => {
        if (isActive) {
          setLoading(true);
          setError(null);
          setIsImage(true);
          setContent(null);
          setIsBinary(false);
          setIsTruncated(false);
          setImageUrl(null);
        }
        try {
          const imagePath = `/api/projects/${projectName}/files/content?path=${encodeURIComponent(filePath)}`;
          const response = await authenticatedFetch(imagePath, {
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to load image: ${response.status}`);
          }

          const blob = await response.blob();
          if (!isActive) return;
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        } catch (err) {
          if ((err as { name?: string }).name === 'AbortError') {
            return;
          }
          console.error('Error loading image:', err);
          if (isActive) {
            setError(String(err));
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      void fetchImage();

      return () => {
        isActive = false;
        abortControllerRef.current?.abort();
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }

    if (isBinaryFile(fileName)) {
      setContent(null);
      setLoading(false);
      setError(null);
      setIsBinary(true);
      setIsTruncated(false);
      setIsImage(false);
      setImageUrl(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let isActive = true;

    const fetchContent = async () => {
      if (isActive) {
        setLoading(true);
        setError(null);
        setIsBinary(false);
        setIsTruncated(false);
        setIsImage(false);
        setImageUrl(null);
      }
      try {
        const response = await api.readFile(projectName, filePath);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('File read failed:', response.status, errorText);
          if (isActive) {
            setContent(null);
            setError(errorText || 'Failed to load file');
          }
          return;
        }

        const data = await response.json() as { content?: string };
        const text = data.content ?? '';
        if (!isActive) return;

        if (text.length > MAX_PREVIEW_SIZE) {
          const truncated = text.slice(0, MAX_PREVIEW_SIZE);
          setContent(truncated);
          setIsTruncated(true);
        } else {
          const lines = text.split('\n');
          if (lines.length > MAX_PREVIEW_LINES) {
            setContent(lines.slice(0, MAX_PREVIEW_LINES).join('\n'));
            setIsTruncated(true);
          } else {
            setContent(text);
            setIsTruncated(false);
          }
        }
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          return;
        }
        console.error('Error reading file:', err);
        if (isActive) {
          setContent(null);
          setError(String(err));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void fetchContent();

    return () => {
      isActive = false;
      abortControllerRef.current?.abort();
    };
  }, [projectName, filePath]);

  return { content, loading, error, isBinary, isTruncated, isImage, imageUrl };
}
