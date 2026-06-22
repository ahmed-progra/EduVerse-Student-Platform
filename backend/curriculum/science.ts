import { L, q, ex, LessonDef } from "./types";

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
      ex(
        "Comparing cell types",
        `print("Feature          | Prokaryotic    | Eukaryotic")\nprint("-" * 50)\nprint("Nucleus          | No             | Yes")\nprint("Organelles       | Few, no membrane| Many, membrane-bound")\nprint("Size             | 0.1-5 μm       | 10-100 μm")\nprint("Examples         | Bacteria       | Plants, animals, fungi")`,
        `Feature          | Prokaryotic    | Eukaryotic\n--------------------------------------------------\nNucleus          | No             | Yes\nOrganelles       | Few, no membrane| Many, membrane-bound\nSize             | 0.1-5 μm       | 10-100 μm\nExamples         | Bacteria       | Plants, animals, fungi`,
      ),
      ex(
        "Organelle functions",
        `organelles = {\n    "Nucleus": "Stores DNA, controls cell",\n    "Mitochondria": "Produces ATP (energy)",\n    "Ribosomes": "Protein synthesis",\n    "ER": "Protein and lipid processing",\n    "Golgi": "Packages and ships proteins",\n    "Lysosomes": "Digests waste",\n}\nfor name, func in organelles.items():\n    print(f"{name:15s} → {func}")`,
        `Nucleus         → Stores DNA, controls cell\nMitochondria    → Produces ATP (energy)\nRibosomes       → Protein synthesis\nER              → Protein and lipid processing\nGolgi           → Packages and ships proteins\nLysosomes       → Digests waste`,
      ),
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
      q(
        "Which organelle produces energy (ATP)?",
        ["Nucleus", "Mitochondria", "Ribosome", "Golgi"],
        1,
        `Mitochondria are the powerhouse of the cell.`,
      ),
      q(
        "Prokaryotic cells differ from eukaryotic cells by lacking...",
        ["DNA", "A cell membrane", "A nucleus", "Ribosomes"],
        2,
        `Prokaryotes have no membrane-bound nucleus; their DNA floats freely.`,
      ),
      q(
        "The cell membrane's main function is to...",
        ["Produce energy", "Store DNA", "Control what enters/exits", "Synthesize proteins"],
        2,
        `The cell membrane is a selective barrier around the cell.`,
      ),
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
      ex(
        "DNA base pairing",
        `# DNA sequence and its complement\nsequence = "ATCGGCTA"\ncomplement = ""\npairs = {"A": "T", "T": "A", "C": "G", "G": "C"}\nfor base in sequence:\n    complement += pairs[base]\nprint(f"Original:    {sequence}")\nprint(f"Complement:  {complement}")`,
        `Original:    ATCGGCTA\nComplement:  TAGCCGAT`,
      ),
      ex(
        "Counting bases",
        `dna = "AGCTAGCTAA"\na = dna.count("A")\nt = dna.count("T")\nc = dna.count("C")\ng = dna.count("G")\nprint(f"DNA: {dna}")\nprint(f"A={a}, T={t}, C={c}, G={g}")\nprint(f"A/T ratio: {a/t:.1f} (should be ~1.0 for double-stranded DNA)")`,
        `DNA: AGCTAGCTAA\nA=4, T=4, C=2, G=2\nA/T ratio: 1.0 (should be ~1.0 for double-stranded DNA)`,
      ),
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
      q(
        "Which base pairs with Guanine (G) in DNA?",
        ["Adenine", "Thymine", "Cytosine", "Uracil"],
        2,
        `G pairs with C (3 hydrogen bonds).`,
      ),
      q(
        "The shape of DNA is a...",
        ["Single strand", "Double helix", "Triple helix", "Circle"],
        1,
        `DNA has a double helix structure — like a twisted ladder.`,
      ),
      q(
        "A gene is...",
        [
          "The entire DNA molecule",
          "A segment of DNA coding for a protein",
          "A chromosome",
          "A type of protein",
        ],
        1,
        `Genes are specific DNA segments that code for functional products.`,
      ),
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
      ex(
        "Heart rate and cardiac output",
        `heart_rate = 72  # bpm\nstroke_volume = 70  # mL per beat\ncardiac_output = heart_rate * stroke_volume / 1000  # L/min\nprint(f"Heart rate: {heart_rate} bpm")\nprint(f"Stroke volume: {stroke_volume} mL")\nprint(f"Cardiac output: {cardiac_output:.1f} L/min")`,
        `Heart rate: 72 bpm\nStroke volume: 70 mL\nCardiac output: 5.0 L/min`,
      ),
      ex(
        "Comparing system functions",
        `systems = {\n    "Circulatory": "Transport O2, nutrients, waste",\n    "Respiratory": "Gas exchange (O2 in, CO2 out)",\n    "Nervous": "Control and coordination (electrical)",\n    "Digestive": "Break down food, absorb nutrients",\n    "Muscular": "Movement and posture",\n    "Skeletal": "Support, protection, blood cell production",\n}\nfor sys, func in systems.items():\n    print(f"{sys:12s} → {func}")`,
        `Circulatory   → Transport O2, nutrients, waste\nRespiratory   → Gas exchange (O2 in, CO2 out)\nNervous       → Control and coordination (electrical)\nDigestive     → Break down food, absorb nutrients\nMuscular      → Movement and posture\nSkeletal      → Support, protection, blood cell production`,
      ),
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
      q(
        "Which system transports oxygen throughout the body?",
        ["Respiratory", "Circulatory", "Nervous", "Digestive"],
        1,
        `The circulatory system (heart + blood vessels) transports O<sub>2</sub>.`,
      ),
      q(
        "Homeostasis means...",
        ["The body is cold", "Stable internal conditions", "High blood pressure", "Running fast"],
        1,
        `Homeostasis is maintaining a stable internal environment.`,
      ),
      q(
        "Gas exchange in the lungs happens in the...",
        ["Bronchi", "Trachea", "Alveoli", "Diaphragm"],
        2,
        `Alveoli are tiny air sacs where gas exchange occurs.`,
      ),
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
      ex(
        "Energy transfer through trophic levels",
        `energy_sun = 100000  # J (solar energy)\nproducers = energy_sun * 0.01  # 1% captured by photosynthesis\nprimary = producers * 0.1\nsecondary = primary * 0.1\ntertiary = secondary * 0.1\nprint(f"Sunlight: {energy_sun:,} J")\nprint(f"Producers (plants):  {producers:.0f} J")\nprint(f"Primary consumers:   {primary:.0f} J")\nprint(f"Secondary consumers: {secondary:.1f} J")\nprint(f"Tertiary consumers:  {tertiary:.2f} J")`,
        `Sunlight: 100,000 J\nProducers (plants):  1,000 J\nPrimary consumers:   100 J\nSecondary consumers: 10.0 J\nTertiary consumers:  1.00 J`,
      ),
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
      q(
        "In a food chain, which trophic level has the most energy?",
        ["Primary consumers", "Secondary consumers", "Producers", "Tertiary consumers"],
        2,
        `Producers (plants) capture energy directly from the sun.`,
      ),
      q(
        "What percentage of energy typically transfers between trophic levels?",
        ["50%", "25%", "10%", "90%"],
        2,
        `~10% transfers; the rest is used for metabolism or lost as heat.`,
      ),
      q(
        "Decomposers are important because they...",
        [
          "Eat live prey",
          "Recycle nutrients back into the soil",
          "Produce energy from sunlight",
          "Create food chains",
        ],
        1,
        `Decomposers break down dead matter and return nutrients.`,
      ),
    ],
  }),

  L(
    "Atoms, Elements, and the Periodic Table",
    ["chemistry", "atoms", "elements", "periodic-table"],
    "beginner",
    12,
    {
      intro: `<p>Everything is made of atoms. An <strong>element</strong> is a pure substance made of only one type of atom. The <strong>periodic table</strong> organizes all 118 known elements by atomic number. Elements in the same column (group) have similar chemical properties. Rows are called <strong>periods</strong>. Key groups: alkali metals (Group 1), noble gases (Group 18), and halogens (Group 17).</p>
<!-- 3D MODEL PLACEHOLDER -->`,
      concepts: [
        `<strong>Atom</strong> — smallest unit of an element; has protons, neutrons, and electrons`,
        `<strong>Atomic number (Z)</strong> — number of protons; uniquely identifies each element`,
        `<strong>Group (column)</strong> — elements with similar properties (same number of valence electrons)`,
        `<strong>Period (row)</strong> — elements with the same number of electron shells`,
      ],
      examples: [
        ex(
          "Element information from atomic number",
          `elements = {\n    1: {"name": "Hydrogen", "symbol": "H", "mass": 1.008},\n    2: {"name": "Helium", "symbol": "He", "mass": 4.003},\n    6: {"name": "Carbon", "symbol": "C", "mass": 12.011},\n    8: {"name": "Oxygen", "symbol": "O", "mass": 15.999},\n    26: {"name": "Iron", "symbol": "Fe", "mass": 55.845},\n}\nfor z, info in elements.items():\n    print(f"Z={z:3d}  {info['symbol']:3s}  {info['name']:10s}  Mass: {info['mass']:.3f}")`,
          `Z=  1  H    Hydrogen     Mass: 1.008\nZ=  2  He   Helium       Mass: 4.003\nZ=  6  C    Carbon       Mass: 12.011\nZ=  8  O    Oxygen       Mass: 15.999\nZ= 26  Fe   Iron         Mass: 55.845`,
        ),
        ex(
          "Electron shells (Bohr model)",
          `for z in range(1, 11):\n    if z <= 2:\n        config = str(z)\n    elif z <= 10:\n        config = f"2, {z-2}"\n    else:\n        config = ""\n    print(f"Z={z:2d}: {config} electrons per shell")`,
          `Z= 1: 1 electrons per shell\nZ= 2: 2 electrons per shell\nZ= 3: 2, 1 electrons per shell\nZ= 4: 2, 2 electrons per shell\nZ= 5: 2, 3 electrons per shell\nZ= 6: 2, 4 electrons per shell\nZ= 7: 2, 5 electrons per shell\nZ= 8: 2, 6 electrons per shell\nZ= 9: 2, 7 electrons per shell\nZ=10: 2, 8 electrons per shell`,
        ),
      ],
      realWorld: `Materials science designs new materials by combining elements. The periodic table predicts how elements react: sodium (Group 1) reacts explosively with water; chlorine (Group 17) is a toxic gas — together they form table salt (NaCl).`,
      practice: `Look up the atomic numbers of nitrogen (N), silicon (Si), and gold (Au). Which group and period is each in?`,
      mistakes: [
        `Confusing atomic number (protons) with atomic mass (protons + neutrons)`,
        `Thinking elements in the same period are similar — they're not; elements in the same GROUP share properties`,
      ],
      best: [
        `The periodic table is a map: position tells you everything about an element's behavior`,
        `Group 18 (noble gases) are unreactive because their outer shell is full — the "happy" elements`,
      ],
      template: `"""
# Atoms, Elements, and the Periodic Table - Key Facts
- Atom: smallest unit of matter; proton, neutron, electron
- Element: one type of atom; 118 known elements
- Atomic number (Z) = number of protons (defines the element)
- Groups (columns): elements with similar properties
- Periods (rows): same number of electron shells
- Metals on left, non-metals on right, metalloids in between
- Key groups: Alkali metals (1), Halogens (17), Noble gases (18)
"""
print("The periodic table organizes 118 elements by atomic number.")
print("Elements in the same group have similar chemical properties.")`,
      quiz: [
        q(
          "The atomic number represents...",
          [
            "Number of neutrons",
            "Number of protons",
            "Atomic mass",
            "Number of electrons in outer shell",
          ],
          1,
          `Atomic number Z = number of protons.`,
        ),
        q(
          "Elements in the same group (column) have...",
          [
            "Same atomic mass",
            "Similar chemical properties",
            "Same number of neutrons",
            "Same number of electron shells",
          ],
          1,
          `Same number of valence electrons → similar chemical behavior.`,
        ),
        q(
          "Noble gases are very unreactive because...",
          [
            "They are rare",
            "Their outer electron shell is full",
            "They have no electrons",
            "They are heavy",
          ],
          1,
          `A full outer shell means no tendency to gain/lose electrons → inert.`,
        ),
      ],
    },
  ),

  L("Chemical Bonds", ["chemistry", "bonding", "molecules"], "beginner", 10, {
    intro: `<p>Chemical bonds hold atoms together to form molecules. <strong>Ionic bonds</strong> form when electrons transfer (one atom gives, another takes) — like NaCl. <strong>Covalent bonds</strong> form when atoms share electrons — like H<sub>2</sub>O. <strong>Metallic bonds</strong> share electrons in a "sea" — like iron. The type of bond determines the substance's properties.</p>`,
    concepts: [
      `<strong>Ionic bond</strong> — electron transfer; metal + non-metal; forms crystal lattice (e.g., NaCl)`,
      `<strong>Covalent bond</strong> — electron sharing; non-metal + non-metal; forms discrete molecules (e.g., H<sub>2</sub>O)`,
      `<strong>Electronegativity</strong> — how strongly an atom pulls electrons; determines bond type`,
      `<strong>Polarity</strong> — unequal electron sharing creates polar molecules (like water)`,
    ],
    examples: [
      ex(
        "Ionic vs covalent properties",
        `print("Property        | Ionic (NaCl)    | Covalent (H2O)")\nprint("-" * 50)\nprint("State (room T)  | Solid crystal   | Gas/liquid")\nprint("Melting point   | High (801 C)    | Low (0 C)")\nprint("Conductivity    | When molten     | Poor")\nprint("Bond type       | Electron transfer| Electron sharing")`,
      ),
      ex(
        "Water molecule (polar covalent)",
        `print("Water molecule (H2O):")\nprint("  H -- O -- H (104.5 degree angle)")\nprint("  Oxygen pulls electrons, polar")\nprint("  Polarity gives water its special properties")`,
      ),
    ],
    realWorld: `The properties of water (polar covalent) make it essential for life. Batteries use ionic compounds as electrolytes. The strength of metallic bonds determines metal properties.`,
    practice: `Classify these compounds as ionic or covalent: CO<sub>2</sub>, MgO, CH<sub>4</sub>, KBr, NH<sub>3</sub>.`,
    mistakes: [
      `Thinking all bonds are either purely ionic or purely covalent — many bonds are in between (polar covalent)`,
      `Assuming metals only form ionic bonds — they form metallic bonds with each other`,
    ],
    best: [
      `Electronegativity difference > 1.7 → ionic; < 0.4 → nonpolar covalent; between → polar covalent`,
      `Water's polarity is why it's called the "universal solvent"`,
    ],
    template: `"""
# Chemical Bonds - Key Facts
1. Ionic bond: Electron transfer (metal + non-metal), high melting point
2. Covalent bond: Electron sharing (non-metal + non-metal), low melting point
3. Metallic bond: Sea of electrons (metal atoms), malleable, conductive

Bond type determines the substance's properties.
"""
print("Chemical bonds hold atoms together to form molecules.")`,
    quiz: [
      q(
        "An ionic bond forms when...",
        [
          "Atoms share electrons",
          "Electrons transfer from one atom to another",
          "Atoms share protons",
          "Electrons are destroyed",
        ],
        1,
        `Ionic bonds involve electron transfer.`,
      ),
      q(
        "Water (H2O) has what type of bonding?",
        ["Ionic", "Nonpolar covalent", "Polar covalent", "Metallic"],
        2,
        `Water has polar covalent bonds.`,
      ),
      q(
        "Which property is typical of ionic compounds?",
        [
          "Low melting point",
          "Poor conductor when dissolved",
          "High melting point",
          "Flexible solid",
        ],
        2,
        `Ionic compounds have high melting points.`,
      ),
    ],
  }),

  L(
    "Chemical Reactions and Equations",
    ["chemistry", "reactions", "equations"],
    "intermediate",
    14,
    {
      intro: `<p>A chemical reaction rearranges atoms to form new substances. Reactants (left side) → Products (right side). Chemical equations must be <strong>balanced</strong> — the same number of each atom on both sides. The Law of Conservation of Mass says matter is neither created nor destroyed.</p>`,
      concepts: [
        `<strong>Reactants → Products</strong> — substances that change produce new substances`,
        `<strong>Conservation of mass</strong> — total mass before = total mass after`,
        `<strong>Balancing equations</strong> — adjust coefficients (not subscripts!) to equalize atom counts`,
        `<strong>Types of reactions</strong> — synthesis (A+B→AB), decomposition (AB→A+B), combustion`,
      ],
      examples: [
        ex(
          "Balancing a combustion reaction",
          `# CH4 + O2 → CO2 + H2O\nreactants = {"C": 1, "H": 4, "O": 4}\nproducts = {"C": 1, "H": 4, "O": 4}\nprint(f"Reactants:  {reactants}")\nprint(f"Products:   {products}")\nif reactants == products:\n    print("✓ Balanced: CH4 + 2O2 → CO2 + 2H2O")`,
          `Reactants:  {'C': 1, 'H': 4, 'O': 4}\nProducts:   {'C': 1, 'H': 4, 'O': 4}\n✓ Balanced`,
        ),
        ex(
          "Checking conservation of mass",
          `mass_reactants = 16 + 64  # g\nmass_products = 44 + 36   # g\nprint(f"Reactants: {mass_reactants}g")\nprint(f"Products:  {mass_products}g")\nif mass_reactants == mass_products:\n    print("✓ Mass conserved!")`,
          `Reactants: 80g\nProducts:  80g\n✓ Mass conserved!`,
        ),
      ],
      realWorld: `Photosynthesis (6CO2 + 6H2O → C6H12O6 + 6O2) powers life on Earth. Combustion powers cars. Digestion is a series of chemical reactions.`,
      practice: `Balance: Fe + O2 → Fe2O3 (rust formation). Find the right coefficients.`,
      mistakes: [
        `Changing subscripts instead of coefficients: H2O → H2O2 is a different molecule`,
        `Forgetting diatomic elements: H2, O2, N2, F2, Cl2, Br2, I2`,
      ],
      best: [
        `Start balancing with the element appearing in only one reactant and one product`,
        `Leave oxygen and hydrogen for last — they appear in multiple compounds`,
      ],
      template: `# Balancing: Fe + O2 → Fe2O3\nprint("4Fe + 3O2 → 2Fe2O3")\nbalanced = {"Fe": (4, 4), "O": (6, 6)}\nfor elem, (r, p) in balanced.items():\n    status = "✓" if r == p else "✗"\n    print(f"{status} {elem}: {r} → {p}")`,
      quiz: [
        q(
          "A balanced chemical equation has...",
          [
            "Same number of molecules on each side",
            "Same number of each atom on each side",
            "Same total volume",
            "No change in state",
          ],
          1,
          `Balancing means equal atom counts.`,
        ),
        q(
          "What does the Law of Conservation of Mass state?",
          [
            "Mass can be created",
            "Mass is neither created nor destroyed",
            "Mass always increases",
            "Mass always decreases",
          ],
          1,
          `Total mass is conserved in chemical reactions.`,
        ),
        q(
          "In 2H2 + O2 → 2H2O, how many hydrogen atoms on each side?",
          ["2", "4", "6", "1"],
          1,
          `2H2 = 4 H atoms on left; 2H2O = 4 H atoms on right.`,
        ),
      ],
    },
  ),

  L("Acids, Bases, and pH", ["chemistry", "acids-bases", "ph"], "intermediate", 12, {
    intro: `<p>Acids release H<sup>+</sup> ions in water; bases release OH<sup>−</sup> ions. The pH scale (0-14) measures acidity: pH < 7 is acidic, pH > 7 is basic, pH = 7 is neutral. <code>pH = −log<sub>10</sub>[H<sup>+</sup>]</code>. Each unit represents a 10× change in H<sup>+</sup> concentration.</p>`,
    concepts: [
      `<strong>Acid</strong> — donates H<sup>+</sup> ions (protons) in solution; tastes sour`,
      `<strong>Base</strong> — accepts H<sup>+</sup> or donates OH<sup>−</sup>; tastes bitter; slippery`,
      `<strong>pH scale</strong> — <code>pH = −log<sub>10</sub>[H<sup>+</sup>]</code>; logarithmic`,
      `<strong>Neutralization</strong> — acid + base → salt + water: HCl + NaOH → NaCl + H<sub>2</sub>O`,
    ],
    examples: [
      ex(
        "Computing pH from H+ concentration",
        `import math\nh_conc = 1e-3\npH = -math.log10(h_conc)\nprint(f"[H+] = {h_conc} M")\nprint(f"pH = {pH:.1f} (acidic)")`,
        `[H+] = 0.001 M\npH = 3.0 (acidic)`,
      ),
      ex(
        "Comparing acidity",
        `import math\nfor h in [1e-1, 1e-3, 1e-5, 1e-7, 1e-9, 1e-11, 1e-13]:\n    ph = -math.log10(h)\n    typ = "Acidic" if ph < 7 else "Neutral" if ph == 7 else "Basic"\n    print(f"{h:.0e}      {ph:.1f}     {typ}")`,
      ),
    ],
    realWorld: `Antacids neutralize stomach acid. Soil pH affects plant growth. Swimming pools maintain pH 7.2-7.8. Blood pH must stay ~7.35-7.45.`,
    practice: `Compute the pH of a solution with [H+] = 2.5 × 10^−4 M. Is it acidic or basic?`,
    mistakes: [
      `Thinking pH 6 is twice as acidic as pH 3 — each unit is a 10× factor`,
      `Forgetting water auto-ionizes: pure water has [H+] = 10^−7 M, hence pH 7`,
    ],
    best: [
      `pH = -log[H+] is logarithmic — small pH changes represent large concentration changes`,
      `Universal indicator changes color across the pH range`,
    ],
    template: `import math\nh_conc = 2.5e-4\npH = -math.log10(h_conc)\nprint(f"[H+] = {h_conc:.1e} M")\nprint(f"pH = {pH:.2f}")\nif pH < 7:\n    print("Acidic solution")\nelif pH > 7:\n    print("Basic solution")\nelse:\n    print("Neutral solution")`,
    quiz: [
      q(
        "A solution with pH = 3 has [H+] compared to pH = 5?",
        ["10× more", "100× more", "100× less", "Same"],
        1,
        `pH 3 is 100× more acidic than pH 5.`,
      ),
      q(
        "What happens in neutralization?",
        [
          "Two acids mix",
          "An acid and base form salt and water",
          "A base decomposes",
          "Water evaporates",
        ],
        1,
        `Neutralization: acid + base → salt + water.`,
      ),
      q(
        "Pure water has what pH?",
        ["0", "7", "14", "3"],
        1,
        `Pure water at 25°C has pH 7 (neutral).`,
      ),
    ],
  }),

  L("Layers of the Earth", ["earth-science", "geology", "earth-structure"], "beginner", 10, {
    intro: `<p>The Earth has four main layers. The <strong>crust</strong> is the thin outer shell (5-70 km thick). The <strong>mantle</strong> extends to ~2900 km — mostly solid but flows very slowly. The <strong>outer core</strong> is liquid iron and nickel (~2200 km thick) and generates Earth's magnetic field. The <strong>inner core</strong> is solid iron/nickel at ~5500°C.</p>`,
    concepts: [
      `<strong>Crust</strong> — 5-70 km thick; continental (granite, ~35 km) and oceanic (basalt, ~7 km)`,
      `<strong>Mantle</strong> — ~2900 km thick; semi-solid rock that flows by convection; drives plate tectonics`,
      `<strong>Outer core</strong> — liquid iron and nickel; convection creates Earth's magnetic field`,
      `<strong>Inner core</strong> — solid iron and nickel; ~5500°C; incredibly dense`,
    ],
    examples: [
      ex(
        "Earth's layer thickness",
        `layers = {\n    "Crust": 35, "Mantle": 2900,\n    "Outer Core": 2200, "Inner Core": 1300,\n}\nfor layer, thick in layers.items():\n    bar = "#" * (thick // 50)\n    print(f"{layer:12s} | {thick:5d} km {bar}")`,
      ),
      ex(
        "Temperature gradient",
        `for depth, temp in [(0, 20), (100, 1000), (1000, 3000), (2900, 3700), (5100, 5500)]:\n    print(f"{depth:6d} km  {temp:5d}°C")`,
      ),
    ],
    realWorld: `Geothermal energy taps heat from the interior. Understanding Earth's layers helps predict eruptions and earthquakes. The magnetic field protects us from solar radiation.`,
    practice: `The Earth's radius is ~6371 km. What percentage of the radius does each layer represent?`,
    mistakes: [
      `Thinking the mantle is liquid — it's mostly solid but flows slowly over geological timescales`,
      `Confusing the outer core (liquid, generates magnetic field) with inner core (solid)`,
    ],
    best: [
      `The deeper you go, the hotter and denser it gets. Temperature gradient: ~25°C per km in the crust`,
      `Without the outer core's magnetic field, the solar wind would strip away our atmosphere`,
    ],
    template: `"""
# Layers of the Earth - Key Facts
1. Crust: 5-70 km thick; thin outer shell
2. Mantle: ~2900 km thick; mostly solid, flows by convection
3. Outer Core: ~2200 km thick; liquid Fe + Ni; generates magnetic field
4. Inner Core: ~1300 km radius; solid Fe + Ni; ~5500°C
Total Earth radius: ~6371 km
"""
print("Earth has 4 layers: crust, mantle, outer core, inner core.")`,
    quiz: [
      q(
        "Which layer of Earth is liquid and generates the magnetic field?",
        ["Crust", "Mantle", "Outer core", "Inner core"],
        2,
        `The liquid outer core convects, generating the geodynamo.`,
      ),
      q(
        "The Earth's crust is thickest under...",
        ["Oceans", "Continents", "Polar ice caps", "Deserts"],
        1,
        `Continental crust is ~35 km; oceanic crust is ~7 km.`,
      ),
      q(
        "What is the temperature of the inner core?",
        ["1000°C", "3000°C", "5500°C", "100°C"],
        2,
        `The inner core reaches ~5500°C.`,
      ),
    ],
  }),

  L("Plate Tectonics", ["earth-science", "geology", "tectonics"], "beginner", 10, {
    intro: `<p>Earth's lithosphere (crust + upper mantle) is broken into ~15 major <strong>tectonic plates</strong> that move a few centimeters per year. Convection currents in the mantle drive plate motion. At boundaries: <strong>divergent</strong> (move apart → mid-ocean ridges), <strong>convergent</strong> (collide → mountains/subduction), or <strong>transform</strong> (slide → earthquakes).</p>`,
    concepts: [
      `<strong>Divergent boundaries</strong> — plates move apart; magma rises creating new crust`,
      `<strong>Convergent boundaries</strong> — plates collide; subduction forms mountains, volcanoes, trenches`,
      `<strong>Transform boundaries</strong> — plates slide past; causes earthquakes (San Andreas Fault)`,
      `<strong>Continental drift</strong> — proposed by Wegener (1912); evidence: matching fossils and rock types`,
    ],
    examples: [
      ex(
        "Plate movement over time",
        `rate = 2  # cm/year\ndistance = rate * 100_000_000\nprint(f"Plate movement: {rate} cm/year")\nprint(f"In 100 million years: {distance/100_000:.0f} km")`,
        `Plate movement: 2 cm/year\nIn 100 million years: 2000 km`,
      ),
      ex(
        "Plate boundary types",
        `boundaries = {\n    "Divergent": "Plates move apart, new crust formed",\n    "Convergent": "Plates collide, mountains/volcanoes",\n    "Transform":  "Plates slide past, earthquakes",\n}\nfor btype, desc in boundaries.items():\n    print(f"{btype:10s} → {desc}")`,
      ),
    ],
    realWorld: `The Himalayas still rise as India collides with Eurasia. The "Ring of Fire" is a ring of convergent boundaries causing earthquakes and volcanoes.`,
    practice: `Identify the plate boundary type for: (a) Mariana Trench, (b) Mid-Atlantic Ridge, (c) San Andreas Fault.`,
    mistakes: [
      `Thinking continents "drift" on their own — they're carried by tectonic plates`,
      `Believing Wegener had a mechanism — mantle convection was discovered decades later`,
    ],
    best: [
      `Pangaea existed ~300 million years ago; it broke into today's continents`,
      `Earthquake and volcano locations map almost perfectly onto plate boundaries`,
    ],
    template: `"""
# Plate Tectonics - Key Facts
- Lithosphere = crust + upper mantle, broken into ~15 plates
- Plates move ~2-15 cm/year (fingernail growth speed)
- Driver: Convection currents in the mantle

Three boundary types:
1. Divergent: Plates separate, new crust formed (Mid-Atlantic Ridge)
2. Convergent: Plates collide, mountains or subduction (Himalayas)
3. Transform: Plates slide past, earthquakes (San Andreas Fault)
"""
print("Tectonic plates move ~2-15 cm/year, driven by mantle convection.")`,
    quiz: [
      q(
        "What drives plate tectonics?",
        ["Earth's rotation", "Mantle convection", "Gravity from the Moon", "Ocean currents"],
        1,
        `Convection currents in the mantle move the plates.`,
      ),
      q(
        "The Himalayas formed at what type of boundary?",
        ["Divergent", "Convergent", "Transform", "Subduction"],
        1,
        `India collided with Eurasia → convergent boundary.`,
      ),
      q(
        "Where do most earthquakes occur?",
        [
          "In the middle of plates",
          "Along plate boundaries",
          "Only at transform boundaries",
          "Randomly",
        ],
        1,
        `Most earthquakes occur at plate boundaries.`,
      ),
    ],
  }),

  L("The Water Cycle", ["earth-science", "water", "hydrology"], "beginner", 10, {
    intro: `<p>The water cycle continuously moves water between Earth's surface and atmosphere. Main processes: <strong>evaporation</strong> (liquid → vapor), <strong>condensation</strong> (vapor → clouds), <strong>precipitation</strong> (rain, snow), <strong>collection</strong> (water returns to oceans). <strong>Transpiration</strong> releases water vapor from plants. 97% of Earth's water is in oceans; only 3% is freshwater.</p>`,
    concepts: [
      `<strong>Evaporation</strong> — sun heats water, turning it into water vapor (~90% from oceans)`,
      `<strong>Condensation</strong> — water vapor cools, forming clouds`,
      `<strong>Precipitation</strong> — when droplets are too heavy, they fall as rain/snow`,
      `<strong>Collection</strong> — water returns to oceans; some infiltrates into groundwater`,
    ],
    examples: [
      ex(
        "Water distribution on Earth",
        `water = {\n    "Oceans": 96.5, "Groundwater": 1.7,\n    "Ice caps": 1.7, "Lakes/rivers": 0.013,\n    "Atmosphere": 0.001,\n}\nfor source, pct in water.items():\n    bar = "#" * int(pct * 2)\n    print(f"{source:20s} | {pct:5.1f}% {bar}")`,
      ),
      ex(
        "Water cycle steps",
        `steps = [\n    "1. Sun heats oceans → evaporation",\n    "2. Vapor rises, cools → condensation (clouds)",\n    "3. Clouds release → precipitation",\n    "4. Water collects in rivers, lakes, oceans",\n    "5. Plants release water → transpiration",\n    "6. Repeat!",\n]\nfor step in steps:\n    print(step)`,
      ),
    ],
    realWorld: `Understanding the water cycle is critical for agriculture, flood prediction, and water resource management.`,
    practice: `Explain what happens to a puddle after a rainstorm on a sunny day. Which parts of the water cycle are involved?`,
    mistakes: [
      `Thinking evaporation only happens from oceans — soil and plants also contribute`,
      `Forgetting groundwater supplies drinking water for ~2 billion people`,
    ],
    best: [
      `The same water molecules have been cycling for billions of years`,
      `The water cycle is a closed system: water changes form and location but total amount is constant`,
    ],
    template: `"""
# The Water Cycle - Key Facts
Steps:
1. Evaporation: Liquid → vapor (sun heats oceans, lakes)
2. Transpiration: Plants release water vapor
3. Condensation: Vapor → liquid (forms clouds)
4. Precipitation: Rain, snow, sleet, hail
5. Collection: Water returns to oceans, lakes, rivers
6. Infiltration: Water seeps into groundwater (aquifers)

Earth's water: 97% saltwater, 3% freshwater
"""
print("Water continuously cycles through evaporation, condensation, and precipitation.")`,
    quiz: [
      q(
        "What process turns liquid water into water vapor?",
        ["Condensation", "Evaporation", "Precipitation", "Transpiration"],
        1,
        `Evaporation: liquid → vapor.`,
      ),
      q(
        "What percentage of Earth's water is in the oceans?",
        ["50%", "75%", "96.5%", "99%"],
        2,
        `~96.5% of Earth's water is in oceans.`,
      ),
      q(
        "The process by which plants release water vapor is called...",
        ["Evaporation", "Condensation", "Transpiration", "Precipitation"],
        2,
        `Transpiration is water vapor from plant leaves.`,
      ),
    ],
  }),

  L("Climate and Atmosphere", ["earth-science", "climate", "atmosphere"], "intermediate", 12, {
    intro: `<p>Earth's atmosphere: 78% N<sub>2</sub>, 21% O<sub>2</sub>, 1% Ar + CO<sub>2</sub> (~420 ppm). The <strong>greenhouse effect</strong> is natural — CO<sub>2</sub>, H<sub>2</sub>O, and methane trap heat, keeping Earth ~33°C warmer. Human activity increases CO<sub>2</sub>, enhancing the greenhouse effect and causing global warming.</p>`,
    concepts: [
      `<strong>Atmosphere composition</strong> — N<sub>2</sub> (78%), O<sub>2</sub> (21%), Ar (0.9%), CO<sub>2</sub> (~420 ppm)`,
      `<strong>Greenhouse effect</strong> — greenhouse gases trap infrared radiation, warming the planet`,
      `<strong>Global warming</strong> — CO<sub>2</sub> increased from ~280 ppm (pre-industrial) to ~420 ppm`,
      `<strong>Climate vs weather</strong> — weather is short-term; climate is long-term averages`,
    ],
    examples: [
      ex(
        "CO2 concentration increase",
        `years = list(range(1880, 2030, 20))\nco2 = [280, 300, 310, 320, 340, 370, 390, 410, 420]\nfor y, c in zip(years, co2):\n    bar = "#" * ((c - 270) // 5)\n    print(f"{y}   {c} {bar}")`,
      ),
      ex(
        "Greenhouse effect",
        `print(f"Natural greenhouse effect: +33°C")\nprint(f"Without it, Earth avg temp: -18°C")\nprint(f"With natural greenhouse:   15°C")`,
      ),
    ],
    realWorld: `The Paris Agreement aims to limit warming to 1.5°C. Renewable energy reduces CO<sub>2</sub> emissions.`,
    practice: `If pre-industrial CO<sub>2</sub> was 280 ppm and current is 420 ppm, what is the percentage increase?`,
    mistakes: [
      `Confusing weather and climate: "it snowed" is weather; "temperatures are rising" is climate`,
      `Thinking the greenhouse effect is bad — without it, Earth would be frozen. The problem is the enhanced effect`,
    ],
    best: [
      `CO<sub>2</sub> levels are higher than any point in the last 3 million years`,
      `The last decade (2014-2024) was the warmest on record`,
    ],
    template: `pre_industrial = 280\ncurrent = 420\nincrease_pct = (current - pre_industrial) / pre_industrial * 100\nprint(f"Pre-industrial CO2: {pre_industrial} ppm")\nprint(f"Current CO2: {current} ppm")\nprint(f"Increase: {increase_pct:.1f}%")`,
    quiz: [
      q(
        "What is the most abundant gas in Earth's atmosphere?",
        ["Oxygen (O2)", "Nitrogen (N2)", "Carbon dioxide (CO2)", "Argon (Ar)"],
        1,
        `Nitrogen makes up ~78% of the atmosphere.`,
      ),
      q(
        "The natural greenhouse effect keeps Earth...",
        [
          "The same temperature",
          "About 33°C warmer than without it",
          "Cooler",
          "Reverses night and day",
        ],
        1,
        `Without the greenhouse effect, Earth would be -18°C.`,
      ),
      q(
        "Climate vs weather: which is long-term?",
        ["Weather", "Climate", "Both", "Neither"],
        1,
        `Climate = decades+; Weather = days.`,
      ),
    ],
  }),

  L("The Solar System", ["astronomy", "solar-system"], "beginner", 12, {
    intro: `<p>Our Solar System formed ~4.6 billion years ago. The Sun contains 99.86% of all mass. Eight planets: four <strong>terrestrial</strong> (Mercury, Venus, Earth, Mars) and four <strong>gas/ice giants</strong> (Jupiter, Saturn, Uranus, Neptune). Beyond Neptune lies the Kuiper Belt.</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Terrestrial planets</strong> — rocky, close to the Sun, smaller, few or no moons`,
      `<strong>Gas giants</strong> — Jupiter, Saturn: hydrogen and helium, massive, rings, many moons`,
      `<strong>Ice giants</strong> — Uranus, Neptune: methane/ammonia/water ices`,
      `<strong>Asteroid Belt</strong> — between Mars and Jupiter; millions of rocky objects`,
    ],
    examples: [
      ex(
        "Planet distances from the Sun (AU)",
        `planets = {\n    "Mercury": 0.39, "Venus": 0.72,\n    "Earth": 1.0, "Mars": 1.52,\n    "Jupiter": 5.2, "Saturn": 9.54,\n    "Uranus": 19.2, "Neptune": 30.1,\n}\nfor planet, au in planets.items():\n    bar = "=" * int(au * 3)\n    print(f"{planet:10s}  {au:5.2f}   |{bar}")`,
      ),
      ex(
        "Orbital periods",
        `planets = {\n    "Mercury": 88, "Venus": 225, "Earth": 365,\n    "Mars": 687, "Jupiter": 4333, "Saturn": 10759,\n    "Uranus": 30687, "Neptune": 60190,\n}\nfor planet, days in planets.items():\n    print(f"{planet:10s} {days:6d} days = {days/365.25:.2f} Earth years")`,
      ),
    ],
    realWorld: `Space probes explore the Solar System. Satellites provide GPS, communication, and weather monitoring.`,
    practice: `List the planets in order from the Sun. Which has the shortest orbital period?`,
    mistakes: [
      `Pluto was reclassified as a dwarf planet in 2006 — 8 major planets`,
      `Thinking the Asteroid Belt is dense — it's mostly empty space`,
    ],
    best: [
      `My Very Educated Mother Just Served Us Noodles (planet order mnemonic)`,
      `1 AU = ~150 million km (Earth-Sun distance)`,
    ],
    template: `"""
# The Solar System - Key Facts
- Formed ~4.6 billion years ago from a gas/dust cloud
- Sun: 99.86% of all mass

Planets (from Sun outward):
1. Mercury  - Smallest, closest, cratered
2. Venus    - Hottest (CO2 atmosphere)
3. Earth    - Liquid water, life
4. Mars     - Red, largest volcano (Olympus Mons)
5. Jupiter  - Largest, Great Red Spot
6. Saturn   - Rings, least dense (would float in water)
7. Uranus   - Rotates on its side
8. Neptune  - Fastest winds (-225°C)

Also: Asteroid Belt (Mars-Jupiter), Kuiper Belt (dwarf planets)
"""
print("The Solar System has 8 planets orbiting the Sun.")`,
    quiz: [
      q(
        "Which planet is closest to the Sun?",
        ["Venus", "Mercury", "Mars", "Earth"],
        1,
        `Mercury at 0.39 AU.`,
      ),
      q(
        "The largest planet in the Solar System is...",
        ["Saturn", "Neptune", "Jupiter", "Uranus"],
        2,
        `Jupiter is the largest at over 300× Earth's mass.`,
      ),
      q(
        "Why is Pluto not considered a major planet?",
        ["Too small", "Hasn't cleared its orbital neighborhood", "Has a moon", "Too far"],
        1,
        `Pluto hasn't cleared its orbit of debris.`,
      ),
    ],
  }),

  L("Stars and Life Cycles", ["astronomy", "stars", "stellar-evolution"], "intermediate", 14, {
    intro: `<p>Stars are balls of plasma powered by nuclear fusion (H → He). A star's life depends on its mass. <strong>Low-mass stars</strong> (like the Sun) → red giant → planetary nebula → white dwarf. <strong>High-mass stars</strong> (8×+ Sun) → red supergiant → supernova → neutron star or black hole.</p>`,
    concepts: [
      `<strong>Nuclear fusion</strong> — hydrogen fuses into helium, releasing energy (E = mc<sup>2</sup>)`,
      `<strong>Main sequence</strong> — longest stage; stable fusion (Sun is here now)`,
      `<strong>Low-mass death</strong> — red giant → planetary nebula → white dwarf`,
      `<strong>High-mass death</strong> — red supergiant → supernova → neutron star or black hole`,
    ],
    examples: [
      ex(
        "Sun's energy output",
        `power_sun = 3.828e26  # W\npower_per_m2 = power_sun / (4 * 3.14159 * (1.496e11)**2)\nprint(f"Sun's power: {power_sun:.2e} W")\nprint(f"Solar constant: {power_per_m2:.0f} W/m2")`,
        `Sun's power: 3.83e+26 W\nSolar constant: 1361 W/m2`,
      ),
      ex(
        "Star types",
        `stars = {\n    "Sun (G2V)": (5778, 1),\n    "Sirius A": (9940, 25.4),\n    "Betelgeuse": (3500, 126000),\n    "Proxima Centauri": (3042, 0.0017),\n}\nfor name, (temp, lum) in stars.items():\n    print(f"{name:18s} {temp:5d}K  Luminosity: {lum:>10.2f}")`,
      ),
    ],
    realWorld: `The Sun will become a red giant in ~5 billion years. Nuclear fusion research aims to replicate stellar energy on Earth.`,
    practice: `The Sun is ~5778 K (yellow). Betelgeuse is ~3500 K (red). Sirius is ~9940 K (blue-white). What does color tell you about temperature?`,
    mistakes: [
      `Thinking all stars die as supernovae — only stars >8× Sun mass go supernova`,
      `Confusing white dwarfs with neutron stars`,
    ],
    best: [
      `Blue stars are hotter than red stars`,
      `Heavier stars burn brighter and die younger (millions of years vs billions)`,
    ],
    template: `"""
# Stars and Life Cycles - Key Facts
Stars powered by nuclear fusion (H → He).

Low-mass (< 8× Sun): Nebula → Main Sequence → Red Giant → White Dwarf
High-mass (> 8× Sun): Nebula → Main Sequence → Supergiant → Supernova → Neutron Star / Black Hole

- H-R Diagram: temperature vs luminosity
- Main sequence: ~90% of stars
- The Sun: G2V type, 5778 K, ~10 billion year lifespan
"""
print("The Sun is a main-sequence star converting hydrogen to helium.")`,
    quiz: [
      q(
        "What powers the Sun?",
        [
          "Chemical burning",
          "Nuclear fission",
          "Nuclear fusion (H → He)",
          "Gravitational contraction",
        ],
        2,
        `The Sun fuses hydrogen into helium.`,
      ),
      q(
        "What remains after a low-mass star dies?",
        ["Black hole", "Neutron star", "White dwarf", "Nebula"],
        2,
        `Low-mass stars become white dwarfs.`,
      ),
      q(
        "On the H-R diagram, most stars are on the...",
        ["Red giant branch", "Main sequence", "White dwarf region", "Supergiant branch"],
        1,
        `~90% of stars are on the main sequence.`,
      ),
    ],
  }),

  L("Galaxies and the Universe", ["astronomy", "galaxies", "universe"], "intermediate", 14, {
    intro: `<p>A galaxy is a massive collection of stars, gas, dust, and dark matter held by gravity. Three main types: <strong>spiral</strong> (Milky Way), <strong>elliptical</strong> (oval, old stars), <strong>irregular</strong> (no defined shape). The Milky Way has 100-400 billion stars and is ~100,000 light-years across. The observable universe contains ~2 trillion galaxies. The universe began with the Big Bang ~13.8 billion years ago.</p>`,
    concepts: [
      `<strong>Spiral galaxies</strong> — disk with arms; lots of gas/dust → new star formation`,
      `<strong>Elliptical galaxies</strong> — oval, little gas; mostly old stars; common in clusters`,
      `<strong>Irregular galaxies</strong> — no defined shape; often from gravitational interactions`,
      `<strong>Expanding universe</strong> — Hubble's law: galaxies recede faster the farther they are`,
    ],
    examples: [
      ex(
        "Light-year distances",
        `ly = 9.45e15  # meters\nprint(f"1 light-year = {ly:.2e} m")\nprint(f"Andromeda Galaxy: 2.5 million light-years away")`,
        `1 light-year = 9.45e+15 m\nAndromeda Galaxy: 2.5 million light-years away`,
      ),
      ex(
        "Hubble's law",
        `H0 = 70\nprint("Hubble: v = H0 * d")\nfor d in [1, 10, 100, 1000]:\n    print(f"{d:4d} Mpc → v = {H0*d:5d} km/s")`,
      ),
    ],
    realWorld: `James Webb Space Telescope observes the earliest galaxies. Dark matter (~27%) and dark energy (~68%) are mysterious components of the universe.`,
    practice: `If a galaxy is 200 Mpc away, how fast is it receding? (H0 = 70 km/s/Mpc)`,
    mistakes: [
      `Thinking galaxies are evenly distributed — they form clusters and superclusters`,
      `Confusing the Big Bang with an explosion — space itself expanded everywhere`,
    ],
    best: [
      `A light-year is a distance (~9.5 trillion km), not a time`,
      `Looking farther = looking further back in time`,
    ],
    template: `H0 = 70  # km/s per Mpc\nd = 200  # Mpc\nv = H0 * d\nprint(f"Hubble constant: {H0} km/s/Mpc")\nprint(f"Distance: {d} Mpc")\nprint(f"Recession velocity: {v} km/s")`,
    quiz: [
      q(
        "What type of galaxy is the Milky Way?",
        ["Elliptical", "Spiral", "Irregular", "Lenticular"],
        1,
        `The Milky Way is a barred spiral galaxy.`,
      ),
      q(
        "About how old is the universe?",
        ["4.6 billion years", "13.8 billion years", "100 million years", "1 trillion years"],
        1,
        `The Big Bang occurred ~13.8 billion years ago.`,
      ),
      q(
        "Most of the universe is made of...",
        ["Stars and planets", "Dark energy and dark matter", "Hydrogen gas", "Black holes"],
        1,
        `~95% of the universe is dark matter (~27%) and dark energy (~68%).`,
      ),
    ],
  }),

  L("Space Exploration", ["astronomy", "exploration", "space"], "intermediate", 12, {
    intro: `<p>Space exploration began in 1957 with Sputnik. Key milestones: Yuri Gagarin (first human in space, 1961), Apollo 11 Moon landing (1969), the International Space Station, and the James Webb Space Telescope. The ISS orbits at ~400 km altitude. Current goals: returning to the Moon (Artemis), Mars exploration, and the JWST observing the early universe.</p>`,
    concepts: [
      `<strong>Escape velocity</strong> — ~11.2 km/s needed to leave Earth's gravity`,
      `<strong>Rocket equation</strong> — Δv = v<sub>e</sub>·ln(m<sub>0</sub>/m<sub>f</sub>)`,
      `<strong>Microgravity</strong> — astronauts experience freefall; crucial for experiments`,
      `<strong>Key challenges</strong> — radiation, life support, cost, distance`,
    ],
    examples: [
      ex(
        "Rocket equation (Tsiolkovsky)",
        `import math\nve, m0, mf = 4.5, 500, 100\ndv = ve * math.log(m0 / mf)\nprint(f"Exhaust vel: {ve} km/s")\nprint(f"Mass ratio: {m0/mf:.1f}")\nprint(f"Delta-v: {dv:.2f} km/s")`,
        `Exhaust vel: 4.5 km/s\nMass ratio: 5.0\nDelta-v: 7.24 km/s`,
      ),
      ex(
        "Travel time to Mars",
        `distance_km = 140e6\nspeed_kms = 20\ntime_days = distance_km / speed_kms / 3600 / 24\nprint(f"Distance to Mars: {distance_km:.1e} km")\nprint(f"Speed: {speed_kms} km/s")\nprint(f"Travel time: {time_days:.0f} days")`,
        `Distance to Mars: 1.4e+8 km\nSpeed: 20 km/s\nTravel time: 81 days`,
      ),
    ],
    realWorld: `Satellites provide GPS, communications, Earth observation. The ISS hosts microgravity research. Space mining and tourism are emerging.`,
    practice: `A rocket has exhaust velocity 3.5 km/s, initial mass 200 tons, payload 30 tons. Calculate delta-v.`,
    mistakes: [
      `Thinking astronauts are in "zero gravity" — they're in freefall; gravity at ISS is ~90% of Earth's`,
      `Believing space travel is like movies — it takes months to reach Mars, communication has delays`,
    ],
    best: [
      `Propellant is the heaviest part of any rocket — most mass is fuel`,
      `Apollo landed 12 humans on the Moon (1969-1972); no human has been beyond low Earth orbit since`,
    ],
    template: `import math\nve, m0, mf = 3.5, 200, 30\ndv = ve * math.log(m0 / mf)\nprint(f"Rocket delta-v: {dv:.2f} km/s")\nprint(f"(Need ~9.4 km/s to reach orbit)")`,
    quiz: [
      q(
        "In what year did humans first land on the Moon?",
        ["1961", "1969", "1972", "1957"],
        1,
        `Apollo 11 landed July 20, 1969.`,
      ),
      q(
        "Why do astronauts appear weightless on the ISS?",
        ["No gravity", "Freefall (microgravity)", "Magnetic boots", "Anti-gravity"],
        1,
        `The ISS is in continuous freefall.`,
      ),
      q(
        "What is the approximate escape velocity from Earth?",
        ["5 km/s", "7 km/s", "11.2 km/s", "20 km/s"],
        2,
        `~11.2 km/s to escape Earth's gravity.`,
      ),
    ],
  }),
];
