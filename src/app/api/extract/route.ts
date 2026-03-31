import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedTexts: { filename: string; content: string }[] = [];

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.zip')) {
      const zip = await JSZip.loadAsync(buffer);
      const entries = Object.entries(zip.files).filter(
        ([name, entry]) => !entry.dir && !name.startsWith('__MACOSX') && !name.startsWith('.')
      );

      for (const [name, entry] of entries) {
        const lower = name.toLowerCase();
        try {
          const entryBuffer = await entry.async('nodebuffer');

          if (lower.endsWith('.pdf')) {
            const text = await extractPdfText(entryBuffer);
            if (text.trim()) extractedTexts.push({ filename: name, content: text });
          } else if (lower.endsWith('.pptx')) {
            const text = await extractPptxText(entryBuffer);
            if (text.trim()) extractedTexts.push({ filename: name, content: text });
          } else if (lower.endsWith('.docx')) {
            const text = await extractDocxText(entryBuffer);
            if (text.trim()) extractedTexts.push({ filename: name, content: text });
          } else if (lower.endsWith('.txt') || lower.endsWith('.md')) {
            const text = entryBuffer.toString('utf-8');
            if (text.trim()) extractedTexts.push({ filename: name, content: text });
          }
        } catch (e) {
          console.error(`Error extracting ${name}:`, e);
        }
      }
    } else {
      const text = await extractSingleFile(buffer, fileName);
      if (text && text.trim()) {
        extractedTexts.push({ filename: file.name, content: text });
      }
    }

    if (extractedTexts.length === 0) {
      return NextResponse.json(
        { error: 'No readable content found. Supported: PDF, PPTX, DOCX, TXT, MD (or a ZIP containing them).' },
        { status: 400 }
      );
    }

    const combined = extractedTexts
      .map((t) => `=== ${t.filename} ===\n${t.content}`)
      .join('\n\n');

    const truncated = combined.slice(0, 30000);

    return NextResponse.json({
      success: true,
      fileCount: extractedTexts.length,
      files: extractedTexts.map((t) => t.filename),
      contentLength: truncated.length,
      content: truncated,
    });
  } catch (error: any) {
    console.error('Extract error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please check the format and try again.' },
      { status: 500 }
    );
  }
}

async function extractSingleFile(buffer: Buffer, lowerName: string): Promise<string> {
  if (lowerName.endsWith('.pdf')) return extractPdfText(buffer);
  if (lowerName.endsWith('.pptx')) return extractPptxText(buffer);
  if (lowerName.endsWith('.docx')) return extractDocxText(buffer);
  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) return buffer.toString('utf-8');
  return '';
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer, { max: 100 });
    return sanitizeText(data.text || '');
  } catch (e: any) {
    console.error('PDF parse error:', e?.message || e);
    return '';
  }
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  try {
    const officeparser = await import('officeparser');
    const text = await officeparser.parseOfficeAsync(buffer);
    return sanitizeText(typeof text === 'string' ? text : String(text || ''));
  } catch (e: any) {
    console.error('PPTX parse error:', e?.message || e);
    return '';
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return sanitizeText(result.value || '');
  } catch (e: any) {
    console.error('DOCX parse error:', e?.message || e);
    return '';
  }
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}
