export const IDL = {
  "address": "5j1xSY5sZMgDS4feyzvaHzgr9JHHMERf5FWdp8CiorFy",
  "metadata": {
    "name": "subscription_contract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "check_subscription_status",
      "discriminator": [
        6,
        68,
        105,
        12,
        88,
        172,
        114,
        43
      ],
      "accounts": [
        {
          "name": "subscription_account",
          "writable": true
        }
      ],
      "args": [],
      "returns": "bool"
    },
    {
      "name": "subscribe",
      "discriminator": [
        254,
        28,
        191,
        138,
        156,
        179,
        183,
        53
      ],
      "accounts": [
        {
          "name": "subscription_account",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "plan",
          "type": "string"
        },
        {
          "name": "payment_amount",
          "type": "u64"
        },
        {
          "name": "duration_in_days",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SubscriptionAccount",
      "discriminator": [
        247,
        1,
        6,
        72,
        172,
        66,
        24,
        128
      ]
    }
  ],
  "types": [
    {
      "name": "SubscriptionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "plan",
            "type": "string"
          },
          {
            "name": "payment_amount",
            "type": "u64"
          },
          {
            "name": "start_date",
            "type": "u64"
          },
          {
            "name": "expiry_date",
            "type": "u64"
          }
        ]
      }
    }
  ]
}