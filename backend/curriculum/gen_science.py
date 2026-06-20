import json

# This script writes the science.ts file to avoid PowerShell escaping issues
content = r'''import { L, q, ex, LessonDef } from "./types";

export const science: LessonDef[] = [
  L("The Cell: Structure and Function", ["biology", "cells"], "beginner", 10, {
    intro: `<p>The cell is the basic unit of life. All living things are made up of cells. The two main types are <strong>prokaryotic</strong> (no nucleus, like bacteria) and <strong>eukaryotic</strong> (have a nucleus, like plant and animal cells). Key organelles include the nucleus (contains DNA), mitochondria (powerhouse), ribosomes (protein factories), and the cell membrane (gatekeeper).</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Cell theory</strong> — all living things are made of cells, cells are the basic unit of life, all cells come from existing cells`,
      `<strong>Nucleus</strong> — contains DNA, controls cell activities ("brain of the cell")`,
      `<strong>Mitochondria</strong> — produces ATP (energy) through cellular respiration`,
      `<strong>Cell membrane</strong> — phospholipid bilayer that controls what enters and exits the cell`,
    ],
    examples: [
      ex("Comparing cell types", `print("Feature          | Prokaryotic    | Eukaryotic")\nprint("-" * 50)\nprint("Nucleus          | No             | Yes")\nprint("Organelles       | Few, no membrane| Many, membrane-bound")\nprint("Size             | 0.1-5 μm       | 10-100 μm")\nprint("Examples         | Bacteria       | Plants, animals, fungi")`, `Feature          | Prokaryotic    | Eukaryotic\n--------------------------------------------------\nNucleus          | No             | Yes\nOrganelles       | Few, no membrane| Many, membrane-bound\nSize             | 0.1-5 μm       | 10-100 μm\nExamples         | Bacteria       | Plants, animals, fungi`),
      ex("Organelle functions", `organelles = {\n    "Nucleus": "Stores DNA, controls cell",\n    "Mitochondria": "Produces ATP (energy)",\n    "Ribosomes": "Protein synthesis",\n    "ER": "Protein and lipid processing",\n    "Golgi": "Packages and ships proteins",\n    "Lysosomes": "Digests waste",\n}\nfor name, func in organelles.items():\n    print(f"{name:15s} → {func}")`, `Nucleus         → Stores DNA, controls cell\nMitochondria    → Produces ATP (energy)\nRibosomes       → Protein synthesis\nER              → Protein and lipid processing\nGolgi           → Packages and ships proteins\nLysosomes       → Digests waste`),
    ],
    realWorld: `Stem cell research, cancer treatment (targeting rapidly dividing cells), antibiotics (targeting bacterial cell walls), and cloning all depend on understanding cell structure.`,
    practice: `Create a table comparing plant and animal cells. List at least three differences (e.g., cell wall, chloroplasts, shape).`,
    mistakes: [
      `Thinking all cells are the same size — nerve cells can be over 1 meter long; red blood cells are ~8 μm`,
      `Confusing prokaryotes (no nucleus, bacteria) with eukaryotes (have nucleus, everything else)`,
    ],
    best: [
      `Remember: "Mighty Mitochondria" — they're the powerhouse, producing most of the cell's ATP`,
      `The cell membrane is selectively permeable — think of it as a bouncer at a club, not a wall`,
    ],
    template: `"""
# The Cell - Key Organelles
- Nucleus: Contains DNA, controls cell activities
- Mitochondria: Powerhouse, produces ATP
- Ribosomes: Protein synthesis
- Endoplasmic Reticulum (ER): Protein and lipid processing
- Golgi Apparatus: Packages and ships proteins
- Cell membrane: Selective barrier - controls what enters/exits
- Lysosomes: Digests cellular waste

Plant cells only:
- Cell wall: Provides rigid structure
- Chloroplasts: Photosynthesis
- Large central vacuole: Stores water
"""
print("The cell is the basic unit of life.")
print("All organisms are made of cells.")`,
    quiz: [
      q("Which organelle produces energy (ATP)?", ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], 1, `Mitochondria are the powerhouse of the cell.`),
      q("Prokaryotic cells differ from eukaryotic cells by lacking...", ["DNA", "A cell membrane", "A nucleus", "Ribosomes"], 2, `Prokaryotes have no membrane-bound nucleus; their DNA floats freely.`),
      q("The cell membrane's main function is to...", ["Produce energy", "Store DNA", "Control what enters/exits", "Synthesize proteins"], 2, `The cell membrane is a selective barrier around the cell.`),
    ],
  }),

  L("DNA and Genetics", ["biology", "genetics", "dna"], "beginner", 12, {
    intro: `<p>DNA (Deoxyribonucleic Acid) is the molecule that stores genetic instructions. It has a <strong>double helix</strong> structure — two strands twisted together, held by complementary base pairs: Adenine (A) pairs with Thymine (T), and Cytosine (C) pairs with Guanine (G). A gene is a segment of DNA that codes for a specific protein. Humans have about 20,000-25,000 genes.</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Double helix</strong> — two DNA strands twisted together, discovered by Watson and Crick (1953)`,
      `<strong>Base pairing</strong> — A pairs with T, C pairs with G (the "genetic alphabet")`,
      `<strong>Gene</strong> — a segment of DNA that codes for a protein or functional RNA`,
      `<strong>Chromosome</strong> — a long DNA molecule containing many genes; humans have 23 pairs`,
    ],
    examples: [
      ex("DNA base pairing", `# DNA sequence and its complement\nsequence = "ATCGGCTA"\ncomplement = ""\npairs = {"A": "T", "T": "A", "C": "G", "G": "C"}\nfor base in sequence:\n    complement += pairs[base]\nprint(f"Original:    {sequence}")\nprint(f"Complement:  {complement}")`, `Original:    ATCGGCTA\nComplement:  TAGCCGAT`),
      ex("Counting bases", `dna = "AGCTAGCTAA"\na = dna.count("A")\nt = dna.count("T")\nc = dna.count("C")\ng = dna.count("G")\nprint(f"DNA: {dna}")\nprint(f"A={a}, T={t}, C={c}, G={g}")\nprint(f"A/T ratio: {a/t:.1f} (should be ~1.0 for double-stranded DNA)")`, `DNA: AGCTAGCTAA\nA=4, T=4, C=2, G=2\nA/T ratio: 1.0 (should be ~1.0 for double-stranded DNA)`),
    ],
    realWorld: `DNA profiling (forensics), genetic testing for disease risk, CRISPR gene editing, genetically modified organisms (GMOs), and tracing ancestry all rely on understanding DNA and genetics.`,
    practice: `Given the DNA sequence "TACGGTTA", determine the complementary strand. Then count how many G-C base pairs and A-T base pairs it forms.`,
    mistakes: [
      `Confusing DNA bases with RNA: DNA has T (thymine); RNA has U (uracil) instead`,
      `Thinking a gene and a chromosome are the same — a chromosome contains thousands of genes`,
    ],
    best: [
      `Chargaff's rule: in double-stranded DNA, A = T and C = G (always check your pairing)`,
      `Mutations are changes in DNA sequence — some are harmful, some neutral, some beneficial (driving evolution)`,
    ],
    template: `"""
# DNA Structure - Key Facts
- DNA = Deoxyribonucleic Acid
- Shape: Double helix
- Discovered by Watson and Crick (1953)
- Components: Nucleotides (sugar + phosphate + base)
- Bases: A (Adenine), T (Thymine), C (Cytosine), G (Guanine)
- Base pairing: A-T, C-G (Chargaff's rule)
- Function: Stores and transmits genetic information
- Humans: ~3 billion base pairs, ~20,000 genes
"""
print("DNA is a double helix molecule that stores genetic instructions.")
print("Base pairing: A with T, C with G.")`,
    quiz: [
      q("Which base pairs with Guanine (G) in DNA?", ["Adenine", "Thymine", "Cytosine", "Uracil"], 2, `G pairs with C (3 hydrogen bonds).`),
      q("The shape of DNA is a...", ["Single strand", "Double helix", "Triple helix", "Circle"], 1, `DNA has a double helix structure — like a twisted ladder.`),
      q("A gene is...", ["The entire DNA molecule", "A segment of DNA coding for a protein", "A chromosome", "A type of protein"], 1, `Genes are specific DNA segments that code for functional products.`),
    ],
  }),

  L("Human Body Systems", ["biology", "body-systems", "anatomy"], "intermediate", 14, {
    intro: `<p>The human body has 11 major organ systems, each with a specific function. The <strong>circulatory system</strong> (heart, blood vessels) transports oxygen and nutrients. The <strong>respiratory system</strong> (lungs) exchanges O<sub>2</sub> and CO<sub>2</sub>. The <strong>nervous system</strong> (brain, nerves) controls responses. The <strong>digestive system</strong> breaks down food. All systems work together to maintain <strong>homeostasis</strong> — a stable internal environment.</p>`,
    concepts: [
      `<strong>Circulatory system</strong> — heart pumps blood through arteries, veins, and capillaries; delivers O<sub>2</sub> and removes CO<sub>2</sub>`,
      `<strong>Respiratory system</strong> — lungs take in O<sub>2</sub>, release CO<sub>2</sub>; alveoli are the gas exchange surfaces`,
      `<strong>Nervous system</strong> — brain, spinal cord, and nerves; sends electrical signals called nerve impulses`,
      `<strong>Homeostasis</strong> — the body's ability to maintain stable internal conditions (temperature, pH, blood sugar)`,
    ],
    examples: [
      ex("Heart rate and cardiac output", `heart_rate = 72  # bpm\nstroke_volume = 70  # mL per beat\ncardiac_output = heart_rate * stroke_volume / 1000  # L/min\nprint(f"Heart rate: {heart_rate} bpm")\nprint(f"Stroke volume: {stroke_volume} mL")\nprint(f"Cardiac output: {cardiac_output:.1f} L/min")`, `Heart rate: 72 bpm\nStroke volume: 70 mL\nCardiac output: 5.0 L/min`),
      ex("Comparing system functions", `systems = {\n    "Circulatory": "Transport O2, nutrients, waste",\n    "Respiratory": "Gas exchange (O2 in, CO2 out)",\n    "Nervous": "Control and coordination (electrical)",\n    "Digestive": "Break down food, absorb nutrients",\n    "Muscular": "Movement and posture",\n    "Skeletal": "Support, protection, blood cell production",\n}\nfor sys, func in systems.items():\n    print(f"{sys:12s} → {func}")`, `Circulatory   → Transport O2, nutrients, waste\nRespiratory   → Gas exchange (O2 in, CO2 out)\nNervous       → Control and coordination (electrical)\nDigestive     → Break down food, absorb nutrients\nMuscular      → Movement and posture\nSkeletal      → Support, protection, blood cell production`),
    ],
    realWorld: `Understanding body systems is essential for medicine (diagnosing diseases, surgery), fitness training (how muscles adapt), and drug development (how a drug affects each system).`,
    practice: `List three body systems that are activated when you run. Describe the role of each.`,
    mistakes: [
      `Thinking organs work in isolation — every organ depends on others; the heart needs O<sub>2</sub> from lungs, lungs need circulation, etc.`,
      `Confusing arteries (carry blood away from heart) with veins (carry blood toward heart)`,
    ],
    best: [
      `Remember the hierarchy: cells → tissues → organs → organ systems → organism`,
      `Homeostasis is the body's balancing act — like a thermostat, it constantly adjusts to stay in the optimal range`,
    ],
    template: `"""
# Human Body Systems - Key Facts
## 11 Major Systems
1. Circulatory - Heart, blood vessels; transports O2 and nutrients
2. Respiratory - Lungs; gas exchange (O2 in, CO2 out)
3. Nervous - Brain, spinal cord, nerves; electrical signaling
4. Digestive - Mouth to intestines; breaks down food
5. Muscular - Muscles; movement, posture, heat generation
6. Skeletal - Bones; support, protection, calcium storage
7. Immune - White blood cells, lymph; fights pathogens
8. Endocrine - Glands; chemical signaling (hormones)
9. Excretory - Kidneys, bladder; removes waste, balances water
10. Integumentary - Skin; protection, temperature regulation
11. Reproductive - Produces gametes; ensures species survival

All systems work together to maintain HOMEOSTASIS.
"""
print("The human body has 11 organ systems working together.")`,
    quiz: [
      q("Which system transports oxygen throughout the body?", ["Respiratory", "Circulatory", "Nervous", "Digestive"], 1, `The circulatory system (heart + blood vessels) transports O<sub>2</sub>.`),
      q("Homeostasis means...", ["The body is cold", "Stable internal conditions", "High blood pressure", "Running fast"], 1, `Homeostasis is maintaining a stable internal environment.`),
      q("Gas exchange in the lungs happens in the...", ["Bronchi", "Trachea", "Alveoli", "Diaphragm"], 2, `Alveoli are tiny air sacs where gas exchange occurs.`),
    ],
  }),

  L("Ecosystems and Food Chains", ["biology", "ecology", "ecosystems"], "intermediate", 12, {
    intro: `<p>An ecosystem includes all living things (biotic factors) and their physical environment (abiotic factors) in an area. A <strong>food chain</strong> shows the flow of energy: producers (plants) → primary consumers (herbivores) → secondary consumers (carnivores) → decomposers. Each level, or <strong>trophic level</strong>, transfers about 10% of energy to the next — the rest is lost as heat.</p>`,
    concepts: [
      `<strong>Producers</strong> — plants and algae that make their own food via photosynthesis (using sunlight)`,
      `<strong>Consumers</strong> — herbivores (eat plants), carnivores (eat animals), omnivores (eat both)`,
      `<strong>Decomposers</strong> — bacteria and fungi that break down dead matter, returning nutrients to the soil`,
      `<strong>10% rule</strong> — only ~10% of energy transfers from one trophic level to the next`,
    ],
    examples: [
      ex("Energy transfer through trophic levels", `energy_sun = 100000  # J (solar energy)\nproducers = energy_sun * 0.01  # 1% captured by photosynthesis\nprimary = producers * 0.1\nsecondary = primary * 0.1\ntertiary = secondary * 0.1\nprint(f"Sunlight: {energy_sun:,} J")\nprint(f"Producers (plants):  {producers:.0f} J")\nprint(f"Primary consumers:   {primary:.0f} J")\nprint(f"Secondary consumers: {secondary:.1f} J")\nprint(f"Tertiary consumers:  {tertiary:.2f} J")`, `Sunlight: 100,000 J\nProducers (plants):  1,000 J\nPrimary consumers:   100 J\nSecondary consumers: 10.0 J\nTertiary consumers:  1.00 J`),
      ex("Food web example", `print("Grass ----> Grasshopper ----> Frog ----> Snake ----> Hawk")`),
    ],
    realWorld: `Conservation efforts protect keystone species whose presence is critical to an ecosystem. Invasive species disrupt food chains. Understanding energy flow guides sustainable agriculture and fisheries management.`,
    practice: `Draw a food chain with 5 levels (producer → 4 consumers). If the producer has 10,000 J of energy, how much is available at each level?`,
    mistakes: [
      `Thinking decomposers are "just at the end" — they operate at every level, breaking down waste and dead matter`,
      `Confusing a food chain (one linear path) with a food web (all interconnected chains in an ecosystem)`,
    ],
    best: [
      `Energy flows one way through an ecosystem. Nutrients cycle (carbon, nitrogen, water cycles)`,
      `There are rarely more than 4-5 trophic levels because too much energy is lost at each step`,
    ],
    template: `"""
# Ecosystems - Key Facts
- Ecosystem = all living things + their physical environment
- Food chain: Sun → Producer → Primary → Secondary → Tertiary
- 10% rule: only 10% of energy transfers between levels
- Trophic levels: position in the food chain
- Decomposers (bacteria/fungi) recycle nutrients
- Keystone species: have outsized impact on ecosystem
"""
print("Energy flows through ecosystems in one direction.")
print("Only ~10% of energy transfers between trophic levels.")`,
    quiz: [
      q("In a food chain, which trophic level has the most energy?", ["Primary consumers", "Secondary consumers", "Producers", "Tertiary consumers"], 2, `Producers (plants) capture energy directly from the sun.`),
      q("What percentage of energy typically transfers between trophic levels?", ["50%", "25%", "10%", "90%"], 2, `~10% transfers; the rest is used for metabolism or lost as heat.`),
      q("Decomposers are important because they...", ["Eat live prey", "Recycle nutrients back into the soil", "Produce energy from sunlight", "Create food chains"], 1, `Decomposers break down dead matter and return nutrients.`),
    ],
  }),
'''

with open(r'C:\Users\zconsumers\Desktop\EduVerse Final\backend\curriculum\science.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("written part 1")
