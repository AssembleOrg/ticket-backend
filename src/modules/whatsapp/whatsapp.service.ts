import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { join } from 'path';
import pino from 'pino';
import { AllowedPhone } from '../auth/domain/allowed-phone.entity.js';
import { WhatsappFlowService } from './whatsapp-flow.service.js';

const AUTH_DIR = join(process.cwd(), '.wa-auth');
const MAX_RECONNECT_ATTEMPTS = 5;
const SENT_MSG_TTL = 30_000; // 30 seconds

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private socket: WASocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly sentMessages = new Set<string>();

  constructor(
    @InjectRepository(AllowedPhone)
    private readonly allowedPhoneRepo: Repository<AllowedPhone>,
    private readonly flowService: WhatsappFlowService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }

  onModuleDestroy() {
    this.socket?.end(undefined);
  }

  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  private async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    // Silent logger — only fatal errors
    const silentLogger = pino({ level: 'silent' }) as any;

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      browser: ['Pistech Tickets', 'Desktop', '1.0.0'],
      logger: silentLogger,
    });

    this.socket.ev.on('creds.update', () => {
      void saveCreds();
    });

    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.logger.log('Scan QR code to connect WhatsApp:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.log('WhatsApp connected');

        // Mark as unavailable to not interfere with phone notifications
        try {
          await this.socket!.sendPresenceUpdate('unavailable');
        } catch {
          // Non-critical, ignore
        }
      }

      if (connection === 'close') {
        this.isConnected = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          this.logger.warn('WhatsApp logged out. Delete .wa-auth/ and restart.');
          return;
        }

        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          this.logger.error(
            `Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping.`,
          );
          return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), 60_000);
        this.logger.warn(
          `Disconnected (code: ${statusCode}). Retry ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${(delay / 1000).toFixed(0)}s`,
        );
        setTimeout(() => this.connect(), delay);
      }
    });

    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      // Only process new real-time messages
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          await this.processIncomingMessage(msg);
        } catch (err) {
          this.logger.error(`Message processing error: ${(err as Error).message}`);
        }
      }
    });
  }

  private async processIncomingMessage(msg: any) {
    // Skip own messages
    if (msg.key.fromMe) return;
    if (!msg.message) return;

    const messageId = msg.key.id;

    // Prevent processing our own sent messages (loop prevention)
    if (messageId && this.sentMessages.has(messageId)) return;

    const jid = msg.key.remoteJid;
    if (!jid) return;

    // Ignore groups
    if (jid.endsWith('@g.us')) return;

    // Ignore status broadcast
    if (jid === 'status@broadcast') return;

    // Filter protocol messages
    const messageObj = msg.message;
    if (
      'protocolMessage' in messageObj ||
      'senderKeyDistributionMessage' in messageObj
    ) {
      // If it also has conversation text, continue processing
      const hasText =
        ('conversation' in messageObj && messageObj.conversation) ||
        ('extendedTextMessage' in messageObj &&
          messageObj.extendedTextMessage?.text);
      if (!hasText) return;
    }

    // Extract text
    const text =
      messageObj.conversation ||
      messageObj.extendedTextMessage?.text ||
      '';

    const trimmed = text.trim();
    if (!trimmed) return;

    const phone = jid.replace('@s.whatsapp.net', '');
    await this.handleIncomingMessage(phone, trimmed, jid);
  }

  private async handleIncomingMessage(phone: string, text: string, jid: string) {
    const allowed = await this.allowedPhoneRepo.findOne({
      where: { phone, active: true },
    });

    if (!allowed) return; // Silently ignore non-whitelisted

    const reply = await this.flowService.processMessage(phone, text, allowed.clientId);

    if (reply) {
      await this.sendMessage(jid, reply);
    }
  }

  async sendMessage(jid: string, text: string) {
    if (!this.socket || !this.isConnected) {
      this.logger.warn('Cannot send: WhatsApp not connected');
      return;
    }

    const result = await this.socket.sendMessage(jid, { text });
    const messageId = result?.key?.id;

    // Track sent message to prevent loop
    if (messageId) {
      this.sentMessages.add(messageId);
      setTimeout(() => this.sentMessages.delete(messageId), SENT_MSG_TTL);
    }
  }
}
