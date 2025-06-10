'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import { UserIntent } from '@/lib/ai/types';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: 'private' | 'public';
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Step 1: Refine an VIDA idea',
      label: STAGE1_TEST_PROMPT1.substring(0, 100) + '...',
      action: STAGE1_TEST_PROMPT1,
      initialIntent: UserIntent.RefineIdea
    },
    {
      title: 'Step 2: Generate a Design tech spec',
      label: STAGE2_TEST_PROMPT1.substring(0, 100) + '...',
      action: STAGE2_TEST_PROMPT1,
      initialIntent: UserIntent.GenerateDesign
    },
    {
      title: 'Step 3: Generate task list to build my VIDA design prototype',
      label: STAGE3_TEST_PROMPT1.substring(0, 100) + '...',
      action: STAGE3_TEST_PROMPT1,
      initialIntent: UserIntent.GenerateTaskList
    },

    // {
    //   title: 'Step 4: Generate code for my VIDA based on task list',
    //   label: STAGE3_TEST_PROMPT2.substring(0, 100) + '...',
    //   action: STAGE3_TEST_PROMPT2,
    //   initialIntent: UserIntent.GenerateCode
    // },

  ];

  return (
    <div data-testid="suggested-actions" className="grid sm:grid-cols-1 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append(
                {
                  role: 'user',
                  content: suggestedAction.action,
                },
                {
                  body: {
                    initialIntent: suggestedAction.initialIntent,
                  },
                },
              );
            }}
            className="text-left border rounded-xl px-4 py-2.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);

const STAGE1_TEST_PROMPT1 = `
Give me feedback on my VIDA idea. My idea is to build a decentralized ETH token price oracle VIDA using multiple off-chain price feeds (CoinMarketCap, Coingecko, DEX APIs, etc.) that anchors aggregated price data to the PWR Chain.
`;

const STAGE2_TEST_PROMPT1 = `
Help me generate a technical VIDA design spec for a decentralized ETH token price oracle built on PWR Chain. It should read off-chain prices from multiple sources (CoinMarketCap, Coingecko, DEXs) and aggregate them in a verifiable way, anchoring the results to the PWR ledger.
`;

const STAGE3_TEST_PROMPT1 = `
Help me generate a task list to build a VIDA on PWR Chain. My VIDA will be a decentralized ETH token price oracle that aggregates prices from multiple sources (CoinMarketCap, Coingecko, DEX APIs) and anchors the results immutably to the chain.
`;


const STAGE3_TEST_PROMPT2 = `
Help me generate a task list to build the following VIDA:
- Implement off-chain data fetchers for CoinMarketCap, Coingecko, and DEX APIs inside the VIDA logic.
- Aggregate pricing data from multiple sources and apply a median or weighted-average strategy to reduce outliers.
- Write the aggregated result to PWR Chain via a VIDA data transaction, tagged with a unique VIDA_ID.
- Implement replayability: a CLI script or verifier that reads PWR transaction logs and re-calculates the price for validation.
- Add logs and optional event emissions (e.g., block timestamp, source count, deviation %).
- Document the VIDA logic and its configuration (sources, polling interval, deviation thresholds) in *README.md*.
`;

// Work in progress. Requires further testing. Did not generate JSON as expected.
const STAGE4_TEST_PROMPT = `
Help me generate code based on the following task list for a decentralized ETH Token Price Oracle VIDA on PWR Chain:

* Create a new *vidaProcessor.ts* file that fetches ETH prices from CoinMarketCap, Coingecko, and Uniswap APIs, aggregates them, and posts a VIDA data transaction.
* Add a helper script *sendPriceData.ts* to manually send a test VIDA data transaction to the chain.
* Create a config file *config.ts* for setting the VIDA_ID, RPC endpoint, and source API keys.
* Implement a validator script *replayCheck.ts* that replays VIDA logic by re-fetching on-chain VIDA data and recomputing results for auditability.
* Write *README.md* explaining the project, how to run the VIDA, how to verify the data, and how to customize the price sources.
`;
