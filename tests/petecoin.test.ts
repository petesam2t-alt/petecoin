import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "petecoin";
const TOKEN_NAME = "PeteCoin";
const TOKEN_SYMBOL = "PETE";
const TOKEN_DECIMALS = 6;
const TOTAL_SUPPLY = 1000000000000000; // 1 billion tokens with 6 decimals

describe("PeteCoin Token Tests", () => {
  
  describe("Token Metadata", () => {
    it("returns correct token name", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-name", [], deployer);
      expect(result).toBeOk(TOKEN_NAME);
    });

    it("returns correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-symbol", [], deployer);
      expect(result).toBeOk(TOKEN_SYMBOL);
    });

    it("returns correct decimals", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-decimals", [], deployer);
      expect(result).toBeOk(TOKEN_DECIMALS);
    });

    it("returns correct total supply", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(result).toBeOk(TOTAL_SUPPLY);
    });

    it("returns token URI", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-uri", [], deployer);
      expect(result).toBeOk("https://petecoin.io/token-metadata.json");
    });
  });

  describe("Initial State", () => {
    it("deployer has the total supply", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [deployer], deployer);
      expect(result).toBeOk(TOTAL_SUPPLY);
    });

    it("other wallets have zero balance", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      expect(result).toBeOk(0);
    });
  });

  describe("Transfers", () => {
    it("allows deployer to transfer tokens", () => {
      const transferAmount = 1000000; // 1 PETE
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [transferAmount, deployer, wallet1, "none"],
        deployer
      );
      expect(result).toBeOk(true);

      // Check balances after transfer
      const deployerBalance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [deployer], deployer);
      const wallet1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      
      expect(deployerBalance.result).toBeOk(TOTAL_SUPPLY - transferAmount);
      expect(wallet1Balance.result).toBeOk(transferAmount);
    });

    it("prevents unauthorized transfers", () => {
      const transferAmount = 1000000;
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [transferAmount, deployer, wallet2, "none"],
        wallet1 // wallet1 trying to transfer from deployer's account
      );
      expect(result).toBeErr(101); // ERR-NOT-TOKEN-OWNER
    });

    it("allows wallet to transfer their own tokens", () => {
      // First, give wallet1 some tokens
      const initialAmount = 2000000; // 2 PETE
      simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [initialAmount, deployer, wallet1, "none"],
        deployer
      );

      // Now wallet1 transfers to wallet2
      const transferAmount = 500000; // 0.5 PETE
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [transferAmount, wallet1, wallet2, "none"],
        wallet1
      );
      expect(result).toBeOk(true);

      // Check final balances
      const wallet1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      const wallet2Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet2], deployer);
      
      expect(wallet1Balance.result).toBeOk(initialAmount - transferAmount);
      expect(wallet2Balance.result).toBeOk(transferAmount);
    });
  });

  describe("Transfer with Memo", () => {
    it("allows transfer with memo", () => {
      const transferAmount = 1000000;
      const memo = "0x466f7220706574206665656421"; // "For pet feed!" in hex
      
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer-memo",
        [transferAmount, wallet3, memo],
        deployer
      );
      expect(result).toBeOk(true);

      // Check balance
      const wallet3Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet3], deployer);
      expect(wallet3Balance.result).toBeOk(transferAmount);
    });
  });

  describe("Minting", () => {
    it("allows contract owner to mint tokens", () => {
      const mintAmount = 5000000; // 5 PETE
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [mintAmount, wallet1],
        deployer
      );
      expect(result).toBeOk(true);

      // Check that total supply increased
      const totalSupply = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(TOTAL_SUPPLY + mintAmount);

      // Check recipient balance
      const wallet1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      expect(wallet1Balance.result).toBeOk(mintAmount);
    });

    it("prevents non-owner from minting tokens", () => {
      const mintAmount = 1000000;
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [mintAmount, wallet1],
        wallet1 // non-owner trying to mint
      );
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });

    it("prevents minting zero tokens", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "mint",
        [0, wallet1],
        deployer
      );
      expect(result).toBeErr(103); // ERR-INVALID-AMOUNT
    });
  });

  describe("Burning", () => {
    it("allows token holder to burn their tokens", () => {
      // First give wallet1 some tokens
      const mintAmount = 3000000; // 3 PETE
      simnet.callPublicFn(CONTRACT_NAME, "mint", [mintAmount, wallet1], deployer);

      const burnAmount = 1000000; // 1 PETE
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [burnAmount, wallet1],
        wallet1
      );
      expect(result).toBeOk(true);

      // Check balance after burn
      const wallet1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      expect(wallet1Balance.result).toBeOk(mintAmount - burnAmount);
    });

    it("prevents burning zero tokens", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [0, wallet1],
        wallet1
      );
      expect(result).toBeErr(103); // ERR-INVALID-AMOUNT
    });

    it("prevents unauthorized burning", () => {
      const burnAmount = 1000000;
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "burn",
        [burnAmount, deployer],
        wallet1 // wallet1 trying to burn deployer's tokens
      );
      expect(result).toBeErr(101); // ERR-NOT-TOKEN-OWNER
    });
  });

  describe("Administrative Functions", () => {
    it("allows owner to update token URI", () => {
      const newUri = "https://new-petecoin.io/metadata.json";
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-token-uri",
        [newUri],
        deployer
      );
      expect(result).toBeOk(true);

      // Verify URI was updated
      const { result: uriResult } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-token-uri", [], deployer);
      expect(uriResult).toBeOk(newUri);
    });

    it("prevents non-owner from updating token URI", () => {
      const newUri = "https://fake.com/metadata.json";
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-token-uri",
        [newUri],
        wallet1
      );
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });
  });

  describe("Batch Transfers", () => {
    it("allows owner to perform batch transfers", () => {
      const recipients = [
        { to: wallet1, amount: 1000000 },
        { to: wallet2, amount: 2000000 },
        { to: wallet3, amount: 3000000 }
      ];

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "batch-transfer",
        [recipients],
        deployer
      );
      expect(result).toBeOk(true);

      // Check all recipient balances
      const wallet1Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet1], deployer);
      const wallet2Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet2], deployer);
      const wallet3Balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [wallet3], deployer);

      expect(wallet1Balance.result).toBeOk(1000000);
      expect(wallet2Balance.result).toBeOk(2000000);
      expect(wallet3Balance.result).toBeOk(3000000);
    });

    it("prevents non-owner from performing batch transfers", () => {
      const recipients = [
        { to: wallet2, amount: 1000000 }
      ];

      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "batch-transfer",
        [recipients],
        wallet1
      );
      expect(result).toBeErr(100); // ERR-OWNER-ONLY
    });
  });

  describe("Edge Cases", () => {
    it("handles maximum transfer amounts", () => {
      // Try to transfer more than balance
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [TOTAL_SUPPLY + 1, deployer, wallet1, "none"],
        deployer
      );
      // This should fail due to insufficient balance
      expect(result).toBeErr(); // The specific error depends on the ft-transfer? implementation
    });

    it("handles self-transfers", () => {
      const transferAmount = 1000000;
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "transfer",
        [transferAmount, deployer, deployer, "none"],
        deployer
      );
      expect(result).toBeOk(true);

      // Balance should remain the same
      const balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-balance", [deployer], deployer);
      expect(balance.result).toBeOk(TOTAL_SUPPLY);
    });
  });
});
