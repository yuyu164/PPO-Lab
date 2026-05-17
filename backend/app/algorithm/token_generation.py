import numpy as np
from app.utils.numeric import round4

VOCAB = ["I", "am", "an", "AI", "model", "assistant", "the", "hello", "world", "deep", "learning", "language"]


def generate_token_log_probs(
    context_tokens: list[str],
    actor_params: dict,
    vocab: list[str] | None = None,
) -> tuple[str, float]:
    # 来源：算法A1
    if vocab is None:
        vocab = VOCAB

    seed = abs(hash(tuple(context_tokens))) % (2 ** 31) if context_tokens else 42
    rng = np.random.default_rng(seed)
    logits = rng.normal(actor_params["mean"], actor_params["std"], size=len(vocab))
    probs = np.exp(logits - np.max(logits))
    probs = probs / probs.sum()

    token_idx = int(rng.choice(len(vocab), p=probs))
    token = vocab[token_idx]
    log_prob = round4(float(np.log(probs[token_idx])))

    return token, log_prob


def generate_ref_log_prob(
    token: str,
    ref_params: dict,
    vocab: list[str] | None = None,
) -> float:
    # 来源：算法A1
    if vocab is None:
        vocab = VOCAB

    seed = abs(hash(token)) % (2 ** 31)
    rng = np.random.default_rng(seed)
    logits = rng.normal(ref_params["mean"], ref_params["std"], size=len(vocab))
    probs = np.exp(logits - np.max(logits))
    probs = probs / probs.sum()

    token_idx = vocab.index(token) if token in vocab else 0
    return round4(float(np.log(probs[token_idx])))
