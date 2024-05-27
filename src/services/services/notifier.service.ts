import { Injectable } from "@angular/core";
import { MessageService } from 'primeng/api';
import { NotificationType, enumToString } from "src/assets/enums/notification-type.enum";

@Injectable({
  providedIn: "root",
})

export class NotifierService {

  constructor(private messageService: MessageService) {}

  error(message: string, title: string = 'Error'){
    this.show(NotificationType.error,message,title)
  }

  success(message: string, title: string = 'Success'){
    this.show(NotificationType.success,message,title)
  }

  info(message: string, title: string = 'Info'){
    this.show(NotificationType.info,message,title)
  }

  warning(message: string, title: string = 'Warning'){
    this.show(NotificationType.warning,message,title)
  }

  private show(type: NotificationType, message: string, title?: string,
    life?: number, sticky: boolean = false)
  {
    this.messageService.add({
      severity: enumToString(type),
      summary: title,
      detail: message,
      sticky: sticky,
      life: life
    });
  }
}
