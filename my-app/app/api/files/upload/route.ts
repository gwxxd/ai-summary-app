import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateFile, generateFileName } from '@/lib/fileValidation';

/**
 * POST /api/files/upload
 * 上传文件到Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileName = generateFileName(file);
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents';

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: '上传失败: ' + error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      file: {
        id: data.path,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/files/upload
 * 获取上传权限信息
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: process.env.MAX_FILE_SIZE || 104857600,
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,xlsx,png,jpg').split(','),
  });
}
