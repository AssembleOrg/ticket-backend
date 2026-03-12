import { Injectable, Logger } from '@nestjs/common';
import { TicketsService } from '../tickets/application/tickets.service.js';
import { ProjectsService } from '../projects/application/projects.service.js';
import { ClientsService } from '../clients/application/clients.service.js';

/**
 * FSM States for the conversational flow:
 * - IDLE: waiting for /soporte command
 * - SELECT_PROJECT: user must pick a project
 * - ENTER_TITLE: user must enter ticket title
 * - ENTER_DESCRIPTION: user must enter ticket description
 * - CONFIRM: user confirms or cancels
 */
enum FlowState {
  IDLE = 'IDLE',
  SELECT_PROJECT = 'SELECT_PROJECT',
  ENTER_TITLE = 'ENTER_TITLE',
  ENTER_DESCRIPTION = 'ENTER_DESCRIPTION',
  CONFIRM = 'CONFIRM',
}

interface UserSession {
  state: FlowState;
  clientId: string | null;
  projectId: string | null;
  projectName: string | null;
  title: string | null;
  description: string | null;
  projects: Array<{ id: string; name: string }>;
}

@Injectable()
export class WhatsappFlowService {
  private readonly logger = new Logger(WhatsappFlowService.name);
  private sessions = new Map<string, UserSession>();

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly projectsService: ProjectsService,
    private readonly clientsService: ClientsService,
  ) {}

  private getSession(phone: string): UserSession {
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, {
        state: FlowState.IDLE,
        clientId: null,
        projectId: null,
        projectName: null,
        title: null,
        description: null,
        projects: [],
      });
    }
    return this.sessions.get(phone)!;
  }

  private resetSession(phone: string) {
    this.sessions.delete(phone);
  }

  async processMessage(phone: string, text: string, clientId: string | null): Promise<string | null> {
    const session = this.getSession(phone);

    // Allow cancellation at any point during the flow
    if (session.state !== FlowState.IDLE && text.toLowerCase() === '/cancelar') {
      this.resetSession(phone);
      return 'Operacion cancelada. Envia /soporte para crear un nuevo ticket.';
    }

    switch (session.state) {
      case FlowState.IDLE:
        return this.handleIdle(phone, text, clientId, session);

      case FlowState.SELECT_PROJECT:
        return this.handleSelectProject(phone, text, session);

      case FlowState.ENTER_TITLE:
        return this.handleEnterTitle(phone, text, session);

      case FlowState.ENTER_DESCRIPTION:
        return this.handleEnterDescription(phone, text, session);

      case FlowState.CONFIRM:
        return this.handleConfirm(phone, text, session);

      default:
        this.resetSession(phone);
        return null;
    }
  }

  private async handleIdle(
    phone: string,
    text: string,
    clientId: string | null,
    session: UserSession,
  ): Promise<string | null> {
    // STRICT match: only exact "/soporte" activates the bot
    if (text !== '/soporte') {
      return null; // Silently ignore everything else
    }

    if (!clientId) {
      return 'Tu numero esta registrado pero no esta vinculado a un cliente. Contacta al administrador.';
    }

    session.clientId = clientId;

    // Fetch projects for this client
    const projects = await this.projectsService.findByClientId(clientId);

    if (!projects || projects.length === 0) {
      this.resetSession(phone);
      return 'No hay proyectos registrados para tu cuenta. Contacta al administrador.';
    }

    session.projects = projects.map((p: any) => ({
      id: p.id,
      name: p.name,
    }));

    if (projects.length === 1) {
      // Auto-select the only project
      session.projectId = session.projects[0].id;
      session.projectName = session.projects[0].name;
      session.state = FlowState.ENTER_TITLE;

      return (
        `Hola! Vamos a crear un ticket de soporte para *${session.projects[0].name}*.\n\n` +
        `Escribe el *titulo* del problema:\n\n` +
        `_(Envia /cancelar para cancelar)_`
      );
    }

    // Multiple projects: let user pick
    session.state = FlowState.SELECT_PROJECT;

    let msg = 'Hola! Selecciona el proyecto para tu ticket:\n\n';
    session.projects.forEach((p, i) => {
      msg += `*${i + 1}.* ${p.name}\n`;
    });
    msg += '\nResponde con el *numero* del proyecto.\n\n_(Envia /cancelar para cancelar)_';

    return msg;
  }

  private async handleSelectProject(
    phone: string,
    text: string,
    session: UserSession,
  ): Promise<string> {
    const idx = parseInt(text, 10);

    if (isNaN(idx) || idx < 1 || idx > session.projects.length) {
      return `Responde con un numero del 1 al ${session.projects.length}.`;
    }

    const selected = session.projects[idx - 1];
    session.projectId = selected.id;
    session.projectName = selected.name;
    session.state = FlowState.ENTER_TITLE;

    return (
      `Proyecto: *${selected.name}*\n\n` +
      `Escribe el *titulo* del problema:`
    );
  }

  private async handleEnterTitle(
    phone: string,
    text: string,
    session: UserSession,
  ): Promise<string> {
    if (text.length < 3) {
      return 'El titulo debe tener al menos 3 caracteres. Intenta de nuevo:';
    }

    if (text.length > 200) {
      return 'El titulo es muy largo (max 200 caracteres). Intenta de nuevo:';
    }

    session.title = text;
    session.state = FlowState.ENTER_DESCRIPTION;

    return 'Ahora escribe una *descripcion* detallada del problema:';
  }

  private async handleEnterDescription(
    phone: string,
    text: string,
    session: UserSession,
  ): Promise<string> {
    if (text.length < 10) {
      return 'La descripcion debe tener al menos 10 caracteres. Se mas detallado:';
    }

    session.description = text;
    session.state = FlowState.CONFIRM;

    return (
      `Resumen del ticket:\n\n` +
      `*Proyecto:* ${session.projectName}\n` +
      `*Titulo:* ${session.title}\n` +
      `*Descripcion:* ${session.description}\n\n` +
      `Responde *si* para confirmar o *no* para cancelar.`
    );
  }

  private async handleConfirm(
    phone: string,
    text: string,
    session: UserSession,
  ): Promise<string> {
    const answer = text.toLowerCase();

    if (answer === 'si' || answer === 'sí') {
      try {
        const ticket = await this.ticketsService.create({
          title: session.title!,
          description: session.description!,
          clientId: session.clientId!,
          projectId: session.projectId!,
        });

        this.resetSession(phone);

        return (
          `Ticket creado exitosamente!\n\n` +
          `*Codigo:* ${ticket.code}\n` +
          `*Estado:* Abierto\n\n` +
          `Puedes hacer seguimiento con tu equipo de soporte usando el codigo *${ticket.code}*.`
        );
      } catch (err) {
        this.logger.error(`Error creating ticket from WhatsApp: ${(err as Error).message}`);
        this.resetSession(phone);
        return 'Ocurrio un error al crear el ticket. Intenta de nuevo con /soporte.';
      }
    }

    if (answer === 'no') {
      this.resetSession(phone);
      return 'Ticket cancelado. Envia /soporte para crear uno nuevo.';
    }

    return 'Responde *si* o *no*.';
  }
}
