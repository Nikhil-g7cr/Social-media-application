import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AppConfig } from '../../config/AppConfig';
import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver } from '@azure/service-bus';
import { EventEmitter2 } from '@nestjs/event-emitter';
import AppLogger from '../../core/logger/app-logger';

@Injectable()
export class ServiceBusService implements OnModuleInit, OnModuleDestroy {
  private sbClient: ServiceBusClient | null = null;
  private senders: Map<string, ServiceBusSender> = new Map();
  private receivers: Map<string, ServiceBusReceiver> = new Map();

  constructor(
    private readonly appConfig: AppConfig,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    if (connectionString) {
      try {
        this.sbClient = new ServiceBusClient(connectionString);
        this.logger.log('[ServiceBusService] Azure Service Bus initialized.', 200);
        
        // Start bridging subscriptions to internal events
        this.startConsuming('ContentEvents', 'MonolithSubscription');
        this.startConsuming('SocialEvents', 'MonolithSubscription');
      } catch (error) {
        this.logger.error(`[ServiceBusService] Failed to initialize Azure Service Bus: ${error}`, 500);
      }
    } else {
      this.logger.warn('[ServiceBusService] AZURE_SERVICE_BUS_CONNECTION_STRING is missing. Falling back to internal EventEmitter.');
    }
  }

  async onModuleDestroy() {
    if (this.sbClient) {
      for (const sender of this.senders.values()) {
        await sender.close();
      }
      for (const receiver of this.receivers.values()) {
        await receiver.close();
      }
      await this.sbClient.close();
    }
  }

  /**
   * Publishes an event. If Azure Service Bus is enabled, it sends it to the topic/queue.
   * Otherwise, it uses the internal EventEmitter.
   */
  async publishEvent(topicName: string, eventName: string, payload: any): Promise<void> {
    if (this.sbClient) {
      try {
        let sender = this.senders.get(topicName);
        if (!sender) {
          sender = this.sbClient.createSender(topicName);
          this.senders.set(topicName, sender);
        }

        await sender.sendMessages({
          body: payload,
          applicationProperties: { eventType: eventName },
          messageId: `${eventName}-${Date.now()}` // Basic idempotency
        });

        this.logger.log(`[ServiceBusService] Published event ${eventName} to topic ${topicName}`, 200);
      } catch (error) {
        this.logger.error(`[ServiceBusService] Error publishing ${eventName} to Service Bus: ${error}`, 500);
        // Fallback internally on failure
        this.eventEmitter.emit(eventName, payload);
      }
    } else {
      // Fallback to internal event emitter
      this.eventEmitter.emit(eventName, payload);
    }
  }

  /**
   * Subscribes to an Azure Service Bus topic and routes messages to the internal EventEmitter.
   */
  private startConsuming(topicName: string, subscriptionName: string) {
    if (!this.sbClient) return;

    try {
      const receiver = this.sbClient.createReceiver(topicName, subscriptionName);
      this.receivers.set(`${topicName}-${subscriptionName}`, receiver);

      receiver.subscribe({
        processMessage: async (message) => {
          const eventType = message.applicationProperties?.eventType as string;
          if (eventType) {
            this.logger.log(`[ServiceBusService] Received event ${eventType} from ${topicName}`, 200);
            // Bridge the ASB message to the internal NestJS event emitter
            this.eventEmitter.emit(eventType, message.body);
          }
        },
        processError: async (args) => {
          this.logger.error(`[ServiceBusService] Error processing message from ${args.entityPath}: ${args.error}`, 500);
        }
      });
      
      this.logger.log(`[ServiceBusService] Subscribed to topic ${topicName} via ${subscriptionName}`, 200);
    } catch (error) {
      this.logger.error(`[ServiceBusService] Failed to subscribe to ${topicName}: ${error}`, 500);
    }
  }
}
