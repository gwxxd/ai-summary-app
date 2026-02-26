import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/files/list
 * 获取所有文件列表
 */
export async function GET() {
  try {
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // List all files in the bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();

    if (error) {
      console.error('List error:', error);
      return NextResponse.json(
        { error: '获取文件列表失败: ' + error.message },
        { status: 500 }
      );
    }

    // Transform data to include public URLs
    const files = data.map((file) => {
      if (file.id === '') return null; // Skip folders

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name);

      return {
        id: file.name,
        name: file.name.split('-').pop() || file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
        createdAt: file.created_at,
        updatedAt: file.updated_at,
        url: urlData.publicUrl,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      files,
      total: files.length,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files/list
 * 搜索文件
 */
export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();

    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // List all files
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: '搜索失败: ' + error.message },
        { status: 500 }
      );
    }

    // Filter files by search term
    const filteredFiles = data
      .filter((file) => file.id !== '' && file.name.includes(searchTerm))
      .map((file) => {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);

        return {
          id: file.name,
          name: file.name.split('-').pop() || file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'unknown',
          createdAt: file.created_at,
          updatedAt: file.updated_at,
          url: urlData.publicUrl,
        };
      });

    return NextResponse.json({
      success: true,
      files: filteredFiles,
      total: filteredFiles.length,
    });
  } catch (error) {
    console.error('Search files error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
