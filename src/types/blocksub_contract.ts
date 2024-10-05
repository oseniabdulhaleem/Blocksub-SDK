/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subscription_contract.json`.
 */
export type SubscriptionContract = {
  address:string;
  metadata: {
    name: "subscriptionContract";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "checkSubscriptionStatus";
      discriminator: [6, 68, 105, 12, 88, 172, 114, 43];
      accounts: [
        {
          name: "subscriptionAccount";
          writable: true;
        }
      ];
      args: [];
      returns: "bool";
    },
    {
      name: "subscribe";
      discriminator: [254, 28, 191, 138, 156, 179, 183, 53];
      accounts: [
        {
          name: "subscriptionAccount";
          writable: true;
          signer: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "plan";
          type: "string";
        },
        {
          name: "paymentAmount";
          type: "u64";
        },
        {
          name: "durationInDays";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "subscriptionAccount";
      discriminator: [247, 1, 6, 72, 172, 66, 24, 128];
    }
  ];
  types: [
    {
      name: "subscriptionAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "plan";
            type: "string";
          },
          {
            name: "paymentAmount";
            type: "u64";
          },
          {
            name: "startDate";
            type: "u64";
          },
          {
            name: "expiryDate";
            type: "u64";
          }
        ];
      };
    }
  ];
};
