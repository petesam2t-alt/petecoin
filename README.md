# 🐾 PeteCoin (PETE)

A community-driven fungible token for pet lovers, built on the Stacks blockchain using Clarity smart contracts.

## 🎯 Overview

PeteCoin is a SIP-010 compliant fungible token designed to bring together pet enthusiasts and support pet-related initiatives. Whether you're a dog lover, cat enthusiast, or supporter of any furry (or not-so-furry) friends, PeteCoin provides a way to participate in a community-driven ecosystem.

## 🚀 Features

- **SIP-010 Compliant**: Fully compatible with the Stacks fungible token standard
- **Community Focused**: Designed for pet lovers and animal welfare initiatives
- **Secure**: Built with Clarity smart contracts for maximum security and transparency
- **Utility Functions**: Includes batch transfers for airdrops and memo transfers for enhanced functionality

## 📊 Token Details

- **Name**: PeteCoin
- **Symbol**: PETE
- **Decimals**: 6
- **Total Supply**: 1,000,000,000 PETE (1 billion tokens)
- **Blockchain**: Stacks

## 🛠️ Development Setup

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Stacks development environment
- Node.js (v16 or higher)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/petecoin.git
cd petecoin

# Install dependencies
npm install
```

### Testing

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/petecoin_test.ts

# Check contract syntax
clarinet check
```

### Local Development

```bash
# Start local development environment
clarinet integrate

# Deploy to local testnet
clarinet deploy --testnet
```

## 🔧 Smart Contract Functions

### SIP-010 Standard Functions

- `transfer(amount, from, to, memo)` - Transfer tokens between addresses
- `get-name()` - Returns token name
- `get-symbol()` - Returns token symbol
- `get-decimals()` - Returns decimal places
- `get-balance(who)` - Returns balance for an address
- `get-total-supply()` - Returns total token supply
- `get-token-uri()` - Returns token metadata URI

### Administrative Functions

- `mint(amount, to)` - Mint new tokens (owner only)
- `burn(amount, from)` - Burn tokens
- `set-token-uri(value)` - Update token metadata URI (owner only)
- `batch-transfer(recipients)` - Transfer to multiple recipients (owner only)

### Utility Functions

- `transfer-memo(amount, to, memo)` - Transfer with memo message

## 🔐 Security Features

- **Owner-only minting**: Only the contract owner can mint new tokens
- **Burn protection**: Users can only burn their own tokens
- **Transfer validation**: Ensures only token owners can initiate transfers
- **Input validation**: All functions validate input parameters

## 📝 Usage Examples

### Basic Transfer

```clarity
;; Transfer 1000 PETE tokens
(contract-call? .petecoin transfer u1000000 tx-sender 'SP1234567890ABCDEF recipient-address none)
```

### Transfer with Memo

```clarity
;; Transfer with a message
(contract-call? .petecoin transfer-memo u500000 'SP1234567890ABCDEF "For pet food!")
```

### Check Balance

```clarity
;; Get balance for an address
(contract-call? .petecoin get-balance 'SP1234567890ABCDEF)
```

## 🧪 Testing

The project includes comprehensive tests covering:

- Token initialization and metadata
- Transfer functionality
- Minting and burning
- Administrative functions
- Error handling
- Edge cases

Run tests with:
```bash
clarinet test
```

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to Stacks testnet
clarinet deploy --testnet
```

### Mainnet Deployment

```bash
# Deploy to Stacks mainnet (use with caution)
clarinet deploy --mainnet
```

## 🤝 Contributing

We welcome contributions from the pet-loving community! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 🐕 Community

Join our community of pet lovers:

- **Discord**: [Join our server](#)
- **Twitter**: [@PeteCoinSTX](#)
- **Website**: [petecoin.io](#)

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the Stacks community for the amazing blockchain infrastructure
- Inspired by pet lovers everywhere
- Built with ❤️ for our furry friends

---

**Disclaimer**: This is a community token project. Please do your own research and understand the risks before participating in any cryptocurrency activities.
