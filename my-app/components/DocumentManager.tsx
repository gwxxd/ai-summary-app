'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export default function DocumentManager() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = '/api/files/list';
      if (searchTerm) {
        const response = await fetch('/api/files/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm }),
        });

        if (!response.ok) {
          throw new Error('获取文件列表失败');
        }

        const data = await response.json();
        setFiles(data.files || []);
      } else {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('获取文件列表失败');
        }

        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [searchTerm]);

  const handleUploadSuccess = (file: File) => {
    setFiles((prev) => [file, ...prev]);
    setSuccessMessage(`文件 ${file.name} 上传成功`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileName));
      setSuccessMessage('文件已删除');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDownload = (file: File) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileClick = (file: File) => {
    setPreviewFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 文档管理系统
          </h1>
          <p className="text-gray-600">
            由 Supabase 驱动的安全文件存储和管理
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                上传文件
              </h2>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
              <div className="mt-6 text-xs text-gray-500 space-y-2">
                <p>
                  <strong>支持格式：</strong> PDF, DOC, DOCX, TXT, XLSX, 图片
                </p>
                <p>
                  <strong>最大文件：</strong> 100MB
                </p>
                <p>
                  <strong>存储：</strong> Supabase Storage
                </p>
              </div>
            </div>

            {/* Files List Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  我的文件 ({files.length})
                </h2>
                <button
                  onClick={fetchFiles}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isLoading ? '刷新中...' : '刷新'}
                </button>
              </div>

              {/* Search Box */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="搜索文件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">加载中...</p>
                </div>
              ) : (
                <FileList
                  files={files}
                  isLoading={isLoading}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onRefresh={fetchFiles}
                  onFileClick={handleFileClick} // Pass the handler to FileList
                />
              )}
            </div>
          </div>

          {/* File Preview Section */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div className="bg-white rounded-lg shadow-md p-6 flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                文件预览
              </h2>
              {previewFile ? (
                <div className="text-gray-600 text-sm">
                  <iframe
                    src={previewFile.url}
                    title="文件预览"
                    className="w-full h-[calc(100vh-100px)] border border-gray-300 rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <p className="text-gray-500">选择一个文件以预览其内容。</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{files.length}</p>
            <p className="text-gray-600 text-sm mt-2">文件总数</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {(
                files.reduce((sum, f) => sum + f.size, 0) /
                1024 /
                1024
              ).toFixed(2)}
              MB
            </p>
            <p className="text-gray-600 text-sm mt-2">已用空间</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">100MB</p>
            <p className="text-gray-600 text-sm mt-2">上传限制</p>
          </div>
        </div>
      </div>
    </div>
  );
}
