import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { PurchaseOrdersService } from '../purchase-orders.service';

@Processor('purchase-orders')
export class PurchaseOrderProcessor extends WorkerHost {
  constructor(private purchaseOrdersService: PurchaseOrdersService) {
    super();
  }

  async process(job: Job<unknown, unknown, string>) {
    switch (job.name) {
      case 'create-purchase-order': {
        await this.handleCreatePurchaseOrder(
          job.data as Pick<CreatePurchaseOrderDto, 'product_id'>,
        );
        break;
      }
    }
  }

  private async handleCreatePurchaseOrder(
    data: Pick<CreatePurchaseOrderDto, 'product_id'>,
  ) {
    return this.purchaseOrdersService.create(data.product_id);
  }
}
