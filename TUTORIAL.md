# From Zero to GenLayer: Build an AI Content Detector dApp

In this tutorial, you will build a full-stack dApp on **GenLayer** from scratch. By the end, you will have a working app that detects whether any text is AI-generated or Human-written — with the result verified on-chain by multiple AI validators.

## 🎯 What You Will Learn

- What GenLayer is and how it differs from traditional blockchains
- How **Optimistic Democracy Consensus** works
- How the **Equivalence Principle** ensures validators agree
- How to write an **Intelligent Contract** in Python
- How to deploy using **GenLayer Studio**
- How to connect a frontend using **genlayer-js**

---

## 🧠 What is GenLayer?

GenLayer is a blockchain that lets you write smart contracts in **Python** with two superpowers:

| Feature | Traditional Blockchain | GenLayer |
|---|---|---|
| Language | Solidity | **Python** |
| Internet Access | ❌ | ✅ |
| AI Decision Making | ❌ | ✅ |
| Multi-AI Consensus | ❌ | ✅ |

These contracts are called **Intelligent Contracts**.

---

## 🗳️ Optimistic Democracy Consensus

When you call a contract function, **5 validators** independently run the same code using different AI models (GPT, Claude, Gemini, DeepSeek, etc.) and vote on the result:
```
PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED
```

If the majority agree → result is finalized on-chain.
If they disagree → a new round starts with different validators.

---

## ⚖️ Equivalence Principle

Instead of comparing exact outputs, GenLayer compares the **meaning**:
```python
gl.eq_principle.prompt_comparative(
    get_result,
    "content_type must be the same"
)
```

This tells GenLayer: as long as the key value matches, the outputs are equivalent.

---

## 🛠️ Part 1: Setup

1. Open [studio.genlayer.com](https://studio.genlayer.com) in your browser — no installation needed
2. You will see the code editor, file list, and logs panel
3. Click on `wizard_of_coin.py` to explore a basic example contract

---

## 📄 Part 2: Write the Intelligent Contract

### Step 1 — Create a new contract

Click the **New Contract** icon at the top of the left panel and name it:
`ai_content_detector.py`

### Step 2 — Paste this code
```python
# v0.1.0
# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json

class AIContentDetector(gl.Contract):
    last_result: str

    def __init__(self):
        self.last_result = ""

    @gl.public.write
    def analyze_content(self, text: str) -> None:
        prompt = f"""
Analyze the following text and determine:
1. Is it AI-generated or Human-written?
2. Quality score from 1 to 10
3. Brief reason for your decision (one sentence)

Respond using ONLY the following format:
{{"content_type": "AI or Human", "score": 5, "reason": "your reason here"}}
It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parseable by a JSON parser without errors.

Text to analyze:
{text}
"""

        def get_result():
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            return result

        raw = gl.eq_principle.prompt_comparative(
            get_result, "content_type must be the same"
        )
        self.last_result = raw

    @gl.public.view
    def get_last_result(self) -> str:
        return self.last_result
```

### Step 3 — Key concepts

| Concept | What it does |
|---|---|
| `gl.Contract` | Base class for all contracts |
| `last_result: str` | Variable stored permanently on-chain |
| `@gl.public.write` | Function that modifies state |
| `@gl.public.view` | Read-only function |
| `gl.nondet.exec_prompt` | Calls an AI model with a prompt |
| `gl.eq_principle.prompt_comparative` | Ensures validators agree |

---

## 🚀 Part 3: Deploy the Contract

1. Click **Run and Debug** in the left sidebar
2. Click **Deploy new instance**
3. Watch the consensus happen: `PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED`
4. Notice the **Validator Set** — 5 different AI models all vote ✅
5. Copy the contract address: `Deployed at 0x...`

> ⚠️ You may see `ERROR` in the Result field after deployment — this is normal. It just means the `__init__` function returned no value. If the Consensus History shows **ACCEPTED** and all validators show **Agree**, your contract deployed successfully.

---

## 🎨 Part 4: Build the Frontend

### Step 1 — Clone and setup
```bash
git clone https://github.com/NoMad-bnb/genlayer-project-boilerplate.git
cd genlayer-project-boilerplate/frontend
```

Copy the `.env` file:
```bash
# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
```

### Step 2 — Install and run
```bash
npm install
npm install genlayer-js
npm run dev
```

### Step 3 — How the frontend connects to the contract
```tsx
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const client = createClient({ chain: studionet, account: createAccount() });

// Write to contract
const txHash = await client.writeContract({
  address: CONTRACT_ADDRESS,
  functionName: "analyze_content",
  args: [text],
  value: 0n,
});

// Wait for finalization
await client.waitForTransactionReceipt({
  hash: txHash,
  status: TransactionStatus.FINALIZED,
});

// Read from contract
const data = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: "get_last_result",
  args: [],
});
```

Open [http://localhost:3000](http://localhost:3000), paste any text, and click **Analyze Text**!

---

## ✅ What You Learned

- What GenLayer is and how it differs from traditional blockchains
- How **Optimistic Democracy Consensus** works
- How the **Equivalence Principle** ensures validators agree
- How to write an **Intelligent Contract** in Python
- How to deploy using **GenLayer Studio**
- How to connect a frontend using **genlayer-js**

---

## 🔗 Resources

- [GenLayer Docs](https://docs.genlayer.com/)
- [GenLayer Studio](https://studio.genlayer.com)
- [genlayer-js SDK](https://github.com/yeagerai/genlayer-js)
- [Discord Community](https://discord.gg/8Jm4v89VAu)