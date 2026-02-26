'use client';

import { useState } from 'react';
import { formatFileSize } from '@/lib/fileValidation';

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface FileListProps {
  files: File[];
  isLoading?: boolean;
  onDelete?: (fileName: string) => void;
  onDownload?: (file: File) => void;
  onRefresh?: () => void;
  onFileClick?: (file: File) => void;
}

export default function FileList({
  files,
  isLoading = false,
  onDelete,
  onDownload,
  onRefresh,
  onFileClick,
}: FileListProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [deletingFiles, setDeletingFiles] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(files.map((f) => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDelete = async (fileId: string) => {
    if (!onDelete) return;

    setDeletingFiles((prev) => [...prev, fileId]);
    try {
      await onDelete(fileId);
    } finally {
      setDeletingFiles((prev) => prev.filter((id) => id !== fileId));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (!confirm(`确定要删除 ${selectedFiles.length} 个文件吗？`)) {
      return;
    }

    setDeletingFiles(selectedFiles);
    try {
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNames: selectedFiles }),
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      setSelectedFiles([]);
      onRefresh?.();
    } finally {
      setDeletingFiles([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无文件</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm text-blue-700">
            已选择 {selectedFiles.length} 个文件
          </span>
          <button
            onClick={handleBatchDelete}
            disabled={deletingFiles.length > 0}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            批量删除
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left">文件名</th>
              <th className="px-4 py-3 text-left">大小</th>
              <th className="px-4 py-3 text-left">创建时间</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                    className="rounded"
                  />
                </td>
                <td
                  className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:underline"
                  onClick={() => onFileClick?.(file)}
                >
                  {file.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFiles.includes(file.id)}
                    className="text-red-500 hover:text-red-700 text-xs disabled:text-gray-400"
                  >
                    {deletingFiles.includes(file.id) ? '删除中...' : '删除'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
