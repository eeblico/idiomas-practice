#!/usr/bin/env python3
"""
Extract island sentences from https://practice.hyperlingua.app/ (no login required)
and save them to an Excel workbook.
"""

import re
from pathlib import Path

import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# -------------------------------------------------
# Configuration (adjust if site structure changes)
BASE_URL = "https://practice.hyperlingua.app/"
# CSS selector that wraps each "island" block – inspect the page to find the correct selector.
# The selector below is a best‑guess based on typical React class naming; you may need to update it.
ISLAND_BLOCK_SELECTOR = "[data-testid='island-card']"  # <-- adjust if needed
# Inside each block, sentences are usually in <p> elements.
SENTENCE_SELECTOR = "p"

# -------------------------------------------------
def clean_text(text: str) -> str:
    """Collapse whitespace and strip edges."""
    return re.sub(r"\s+", " ", text).strip()

def split_into_sentences(text: str):
    """Simple sentence splitter using punctuation marks."""
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s]

def main():
    # Selenium setup – headless Chrome/Edge
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=chrome_options)

    try:
        driver.get(BASE_URL)
        # Wait for island elements to appear (adjust timeout if needed)
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, ISLAND_BLOCK_SELECTOR))
        )

        island_elements = driver.find_elements(By.CSS_SELECTOR, ISLAND_BLOCK_SELECTOR)
        print(f"Found {len(island_elements)} island blocks.")

        all_data = []
        for idx, island_el in enumerate(island_elements, start=1):
            raw_text = " ".join(
                p.text for p in island_el.find_elements(By.CSS_SELECTOR, SENTENCE_SELECTOR)
            )
            cleaned = clean_text(raw_text)
            sentences = split_into_sentences(cleaned)
            for s_idx, sentence in enumerate(sentences, start=1):
                all_data.append({
                    "Island": f"Ilha {idx}",
                    "Sentence #": s_idx,
                    "Sentence": sentence,
                })

        # Export to Excel
        df = pd.DataFrame(all_data)
        out_path = Path.cwd() / "ilhas_sentences.xlsx"
        df.to_excel(out_path, index=False, sheet_name="Ilhas")
        print(f"✅ Extraction complete → {out_path}")

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
