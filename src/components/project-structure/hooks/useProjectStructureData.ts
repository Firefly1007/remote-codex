import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import type { Project } from '../../../types/app';
import type { FileTreeNode } from '../types';

type UseProjectStructureDataResult = {
  files: FileTreeNode[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useProjectStructureData(selectedProject: Project | null): UseProjectStructureDataResult {
  const [files, setFiles] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const projectName = selectedProject?.name;

    if (!projectName) {
      setFiles([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getFiles(projectName);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Structure fetch failed:', response.status, errorText);
          if (!cancelled) {
            setFiles([]);
            setError(`HTTP ${response.status}: ${errorText || 'Failed to load'}`);
          }
          return;
        }

        const data = (await response.json()) as FileTreeNode[];
        if (!cancelled) {
          setFiles(data);
        }
      } catch (err) {
        console.error('Error fetching project structure:', err);
        if (!cancelled) {
          setFiles([]);
          setError(String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchFiles();

    return () => {
      cancelled = true;
    };
  }, [selectedProject?.name, refreshKey]);

  return { files, loading, error, refresh };
}
