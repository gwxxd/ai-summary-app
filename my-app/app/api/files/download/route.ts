import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/files/download
 * 获取文件下载URL和元数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: '文件名不能为空' },
        { status: 400 }
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // Get file metadata
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list();

    if (listError) {
      return NextResponse.json(
        { error: '获取文件信息失败: ' + listError.message },
        { status: 500 }
      );
    }

    const fileInfo = fileList?.find((file) => file.name === fileName);

    if (!fileInfo) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Create signed URL for download (valid for 1 hour)
    const { data: signedData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600);

    return NextResponse.json({
      success: true,
      file: {
        id: fileName,
        name: fileName.split('-').pop() || fileName,
        size: fileInfo.metadata?.size || 0,
        type: fileInfo.metadata?.mimetype || 'unknown',
        createdAt: fileInfo.created_at,
        updatedAt: fileInfo.updated_at,
        publicUrl: urlData.publicUrl,
        downloadUrl: signedData?.signedUrl || urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
