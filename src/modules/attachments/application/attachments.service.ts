import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../../auth/supabase.service.js';
import { AttachmentsRepository } from '../infrastructure/attachments.repository.js';
import { AttachmentType } from '../domain/entities/attachment.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

const BUCKET_NAME = 'ticket-attachments';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/3gpp'];
const AUDIO_MIMES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/opus', 'audio/aac'];

function resolveType(mimeType: string): AttachmentType {
  if (IMAGE_MIMES.includes(mimeType) || mimeType === 'image/webp')
    return AttachmentType.IMAGE;
  if (VIDEO_MIMES.includes(mimeType)) return AttachmentType.VIDEO;
  if (AUDIO_MIMES.includes(mimeType)) return AttachmentType.AUDIO;
  return AttachmentType.DOCUMENT;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async findByTicket(ticketId: string, query: PaginationQueryDto) {
    const result = await this.attachmentsRepository.findByTicketPaginated(ticketId, query);

    const supabase = this.supabaseService.getClient();
    const dataWithUrls = await Promise.all(
      result.data.map(async (attachment) => {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(attachment.storagePath, 3600);
        return { ...attachment, url: data?.signedUrl ?? null };
      }),
    );

    return { ...result, data: dataWithUrls };
  }

  async upload(
    file: Express.Multer.File,
    ticketId: string,
    uploadedBy?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File exceeds 50MB limit');

    let buffer = file.buffer;
    let mimeType = file.mimetype;
    let fileName = file.originalname;

    // Convert images to WebP (except already WebP or GIF animations)
    if (IMAGE_MIMES.includes(mimeType)) {
      buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      mimeType = 'image/webp';
      fileName = fileName.replace(/\.[^.]+$/, '.webp');
    }

    const fileId = uuidv4();
    const storagePath = `${ticketId}/${fileId}-${fileName}`;

    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Upload failed: ${error.message}`);

    return this.attachmentsRepository.create({
      ticketId,
      originalName: file.originalname,
      storagePath,
      mimeType,
      size: buffer.length,
      type: resolveType(mimeType),
      uploadedBy,
    });
  }

  async getSignedUrl(id: string) {
    const attachment = await this.attachmentsRepository.findById(id);
    if (!attachment) throw new NotFoundException('Attachment not found');

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(attachment.storagePath, 3600); // 1 hour

    if (error)
      throw new BadRequestException(`Could not generate URL: ${error.message}`);

    return { url: data.signedUrl, attachment };
  }

  async remove(id: string) {
    const attachment = await this.attachmentsRepository.findById(id);
    if (!attachment) throw new NotFoundException('Attachment not found');

    const supabase = this.supabaseService.getClient();
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([attachment.storagePath]);

    await this.attachmentsRepository.delete(id);
  }
}
