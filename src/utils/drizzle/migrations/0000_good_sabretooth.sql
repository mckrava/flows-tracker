CREATE TYPE "public"."network" AS ENUM('ethereum-mainnet', 'base-mainent', 'binance-mainnet');--> statement-breakpoint
CREATE TYPE "public"."transactionStatus" AS ENUM('pending', 'completed', 'stale');--> statement-breakpoint
CREATE TABLE "transfer" (
	"sequence" varchar NOT NULL,
	"from" varchar NOT NULL,
	"to" varchar NOT NULL,
	"status" "transactionStatus" NOT NULL,
	"originTxHash" varchar,
	"destinationTxHash" varchar,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	CONSTRAINT "transfer_sequence_from_to_pk" PRIMARY KEY("sequence","from","to")
);
