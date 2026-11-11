#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1b4c87ba635daa87be471a837c04664f54b0cb3101862f742d302471205f3d89/contract';
import endContract from '../../snapshots/1b4c87ba635daa87be471a837c04664f54b0cb3101862f742d302471205f3d89/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/62cdd690b8fd67e80300b70454d260e990d92347ca1309593f222e4a58e66092/contract';
import startContract from '../../snapshots/62cdd690b8fd67e80300b70454d260e990d92347ca1309593f222e4a58e66092/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'InvoiceMetadata',
        columns: [
          col('contractor_revenue', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('invoice_file_key', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('record_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('representative_earning', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('taxes', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('uploaded_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['record_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'financial_records',
        columns: [
          col('amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('contractor_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('direction', 'text', {
            notNull: true,
            default: lit('GAIN'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('occurred_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('owner_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('source', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('MANUAL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'financial_records_direction_check_350a9126',
            sql`"direction" IN ('GAIN', 'LOSS')`,
          ),
          checkExpression(
            'financial_records_type_check_79cca8bb',
            sql`"type" IN ('MANUAL', 'INVOICE')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'InvoiceMetadata',
        constraint: 'InvoiceMetadata_invoice_file_key_key',
        columns: ['invoice_file_key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'app_users',
        constraint: 'app_users_profile_image_key_key',
        columns: ['profile_image_key'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'financial_records',
        index: 'financial_records_contractor_id_idx_3efce6ab',
        columns: ['contractor_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'financial_records',
        index: 'financial_records_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'financial_records',
        index: 'financial_records_owner_id_occurred_at_idx_403f39d6',
        columns: ['owner_id', 'occurred_at'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'InvoiceMetadata',
        foreignKey: {
          name: 'InvoiceMetadata_record_id_fkey',
          columns: ['record_id'],
          references: { schema: 'public', table: 'financial_records', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'financial_records',
        foreignKey: {
          name: 'financial_records_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'app_users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'financial_records',
        foreignKey: {
          name: 'financial_records_contractor_id_fkey',
          columns: ['contractor_id'],
          references: { schema: 'public', table: 'contractors', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
