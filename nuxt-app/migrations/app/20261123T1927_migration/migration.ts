#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/96df1ac95c26b96fce468d12b7279ad88b1abc74c69b1be56b3deae9fad31413/contract';
import endContract from '../../snapshots/96df1ac95c26b96fce468d12b7279ad88b1abc74c69b1be56b3deae9fad31413/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e8641bc9a510744f129c2578bf98924685a46f7a68a7172f41305f8b079fcc16/contract';
import startContract from '../../snapshots/e8641bc9a510744f129c2578bf98924685a46f7a68a7172f41305f8b079fcc16/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.setNotNull({ schema: 'public', table: 'financial_records', column: 'source' })];
  }
}

MigrationCLI.run(import.meta.url, M);
