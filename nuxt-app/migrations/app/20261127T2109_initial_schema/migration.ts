#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/11dc1d04c4e8e9533ceef16172fa263b6a04c93314b7a31ae933b3901a5c25cb/contract';
import endContract from '../../snapshots/11dc1d04c4e8e9533ceef16172fa263b6a04c93314b7a31ae933b3901a5c25cb/contract.json' with { type: 'json' };
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

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'app_users',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('profile_image_key', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('REPRESENTATIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
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
            'app_users_role_check_f76bcac1',
            sql`"role" IN ('ADMIN', 'REPRESENTATIVE')`,
          ),
          checkExpression(
            'app_users_status_check_1527ac15',
            sql`"status" IN ('ACTIVE', 'SUSPENDED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'contractors',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('document', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('legal_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
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
          col('owner_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('source', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
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
      this.createTable({
        schema: 'public',
        table: 'invoice_metadata',
        columns: [
          col('extra', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('invoice_external_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('iss_amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('iss_rate', 'numeric(5,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 5, scale: 2 } },
          }),
          col('iss_withheld', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('issued_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('occured_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('record_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('source_file_key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('taxes', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
          col('uploaded_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['record_id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'app_users',
        constraint: 'app_users_profile_image_key_key',
        columns: ['profile_image_key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'contractors',
        constraint: 'contractors_document_key',
        columns: ['document'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'invoice_metadata',
        constraint: 'invoice_metadata_invoice_external_id_key',
        columns: ['invoice_external_id'],
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
      this.addForeignKey({
        schema: 'public',
        table: 'invoice_metadata',
        foreignKey: {
          name: 'invoice_metadata_record_id_fkey',
          columns: ['record_id'],
          references: { schema: 'public', table: 'financial_records', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
