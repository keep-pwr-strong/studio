export const pwrBasicsDoc = `

The following is a basic overview of the PWR Chain.

# What is PWR Chain?

PWR Chain is a groundbreaking blockchain infrastructure designed to make blockchain technology accessible and beneficial for everyone, regardless of their technical expertise. This infrastructure goes beyond traditional blockchain models by offering a platform that simplifies the development and usage of decentralized applications (DApps).

PWR Chain is designed to address key challenges such as scalability, interoperability, and developer accessibility that have historically constrained blockchain development. It moves away from the one virtual machine architecture prevalent in most blockchain networks such as Ethereum, Solana, and others, and it enables an infinite number of virtual machines and software applications to exist on top of it. 

PWR Chain's approach distinctly separates the roles of validation and processing resulting in a more efficient and scalable system and ensuring that the applications built on top of PWR Chain will never affect its performance or affect each other's performance.

The core of PWR Chain is its base layer, operated by validator nodes, which is solely responsible for managing consensus, handling transactions, organizing blocks, and ensuring network security, without being burdened by the processing of smart contracts or other applications. On top of this base layer, an infinite number of virtual machines and applications can be built and operate independently. This design supports a high transaction throughput (over 300,000 transactions per second) and instant finality, which eliminates delays in confirming transactions.

PWR Chain supports an inclusive development environment where developers can utilize familiar programming languages and tools without needing to adapt to new blockchain-specific languages or environments.

This flexibility extends to the deployment of virtual machines and software applications that can interact seamlessly on the chain, further supported by the network's robust security measures and efficient transaction processing.

Moreover, PWR Chain employs a fixed fee model for transactions, which are charged based on the amount of data processed, rather than using a gas system, making costs predictable and tied directly to resource usage. This model, combined with the blockchain's high scalability and developer-friendly approach, positions PWR Chain as a powerful infrastructure for the next generation of decentralized applications.

## Abstract

Traditional blockchain systems face a fundamental trade-off: decentralization and security often come at the cost of scalability, flexibility, and accessibility for mainstream developers. **PWR Chain** redefines this paradigm by decoupling consensus from execution, creating a modular architecture where decentralized applications inherit blockchain’s trust without its constraints.

At its core, PWR Chain operates as a **decentralized data layer**, securing transactions with NIST-standardized post-quantum cryptography while enabling **Verifiable Immutable Data Applications (VIDAs)**—self-contained programs that process data off-chain using familiar Web2 tools (Python, Java, SQL). Unlike smart contracts or L1/L2 chains, VIDAs are not bound by blockchain gas fees, proprietary languages, or monolithic execution. Instead, they leverage PWR Chain’s immutable ledger as a universal source of truth, updating their states independently while remaining verifiable by anyone.

**Key innovations include:**

- **Horizontal Scalability**: Add unlimited VIDAs without congesting the blockchain.
- **Conduit Nodes**: Trustless relays for cross-VIDA communication, governed by app-specific rules.
- **Enterprise-Ready Design**: Integrate legacy systems (ERP, CRM) via APIs while anchoring critical actions to blockchain.
- **Quantum Resistance**: Post-quantum future-proof validator consensus.

For developers, PWR Chain eliminates the complexity of blockchain-native programming. For enterprises, it delivers auditability and cost efficiency without infrastructure overhauls. For users, it ensures transparency—every action is recorded on-chain, and every result can be independently verified.

By bridging Web2 agility with Web3 trust, PWR Chain empowers a new era of decentralized and immutable applications: scalable enough for global enterprises, flexible enough for indie developers, and secure enough for mission-critical use cases. This is not just a blockchain—it's a foundation for the next evolution of decentralized software.
`;