import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

/**
 * Full list of available network ids
 * https://beta.docs.sqd.dev/en/data/networks
 */
export const networks = ['ethereum-mainnet', 'moonbeam'] as const;

export const transactionStatuses = ['pending', 'completed', 'stale'] as const;

export const networkEnum = pgEnum('network', networks);

export const transactionStatusEnum = pgEnum(
  'transactionStatus',
  transactionStatuses,
);

export const transferTable = pgTable(
  'transfer',
  {
    sequence: varchar().notNull(),
    from: varchar().notNull(),
    to: varchar().notNull(),
    status: varchar().notNull(),
    originTxHash: varchar(),
    destinationTxHash: varchar(),
    originChain: varchar(),
    destinationChain: varchar(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  (table) => [
    primaryKey({
      columns: [table.sequence, table.from, table.to],
    }),
  ],
);

export const processingStatusesTable = pgTable(
  'processing_status',
  {
    network: networkEnum().notNull(),
    latest_processed_block: integer().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.network],
    }),
  ],
);

export type Transfer = typeof transferTable.$inferInsert;
export type ProcessingStatus = typeof processingStatusesTable.$inferInsert;

export type Network = (typeof networks)[number];
export type TransactionStatus = (typeof transactionStatuses)[number];

export default {
  transferTable,
  processingStatusesTable,
};
