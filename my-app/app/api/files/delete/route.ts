import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE /api/files/delete
 * 删除文件
 */
export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: '文件名不能为空' },
        { status: 400 }
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: '删除失败: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `文件 ${fileName} 已删除`,
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files/delete
 * 批量删除文件
 */
export async function POST(request: NextRequest) {
  try {
    const { fileNames } = await request.json();

    if (!Array.isArray(fileNames) || fileNames.length === 0) {
      return NextResponse.json(
        { error: '文件名列表不能为空' },
        { status: 400 }
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // Batch delete files
    const { error } = await supabase.storage
      .from(bucketName)
      .remove(fileNames);

    if (error) {
      console.error('Batch delete error:', error);
      return NextResponse.json(
        { error: '批量删除失败: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${fileNames.length} 个文件`,
      deletedCount: fileNames.length,
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
