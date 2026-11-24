#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1b4c87ba635daa87be471a837c04664f54b0cb3101862f742d302471205f3d89/contract';
import startContract from '../../snapshots/1b4c87ba635daa87be471a837c04664f54b0cb3101862f742d302471205f3d89/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e8641bc9a510744f129c2578bf98924685a46f7a68a7172f41305f8b079fcc16/contract';
import endContract from '../../snapshots/e8641bc9a510744f129c2578bf98924685a46f7a68a7172f41305f8b079fcc16/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'InvoiceMetadata',
        constraint: 'InvoiceMetadata_invoice_file_key_key',
      }),
      this.dropColumn({ schema: 'public', table: 'InvoiceMetadata', column: 'contractor_revenue' }),
      this.dropColumn({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'representative_earning',
      }),
      this.dropColumn({ schema: 'public', table: 'InvoiceMetadata', column: 'invoice_file_key' }),
      this.dropIndex({
        schema: 'public',
        table: 'financial_records',
        index: 'financial_records_owner_id_occurred_at_idx_403f39d6',
      }),
      this.dropColumn({ schema: 'public', table: 'financial_records', column: 'occurred_at' }),
      this.addColumn({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: col('extra', 'json', { codecRef: { codecId: 'pg/json@1' } }),
      }),
      this.setNotNull({ schema: 'public', table: 'InvoiceMetadata', column: 'taxes' }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'invoice_external_id',
        type: 'text',
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'iss_amount',
        type: 'numeric(10,2)',
        temporaryDefault: sql`0`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'iss_rate',
        type: 'numeric(5,2)',
        temporaryDefault: sql`0`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'iss_withheld',
        type: 'bool',
        temporaryDefault: sql`false`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'issued_at',
        type: 'timestamptz(3)',
        temporaryDefault: sql`'epoch'`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'occured_at',
        type: 'timestamptz(3)',
        temporaryDefault: sql`'epoch'`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'InvoiceMetadata',
        column: 'source_file_key',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'InvoiceMetadata',
        constraint: 'InvoiceMetadata_invoice_external_id_key',
        columns: ['invoice_external_id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
