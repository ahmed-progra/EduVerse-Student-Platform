content = r'''
  L("Atoms, Elements, and the Periodic Table", ["chemistry", "atoms", "elements", "periodic-table"], "beginner", 12, {
    intro: `<p>Everything is made of atoms. An <strong>element</strong> is a pure substance made of only one type of atom. The <strong>periodic table</strong> organizes all 118 known elements by atomic number. Elements in the same column (group) have similar chemical properties. Rows are called <strong>periods</strong>. Key groups: alkali metals (Group 1), noble gases (Group 18), and halogens (Group 17).</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Atom</strong> — smallest unit of an element; has protons, neutrons, and electrons`,
      `<strong>Atomic number (Z)</strong> — number of protons; uniquely identifies each element`,
      `<strong>Group (column)</strong> — elements with similar properties (same number of valence electrons)`,
      `<strong>Period (row)</strong> — elements with the same number of electron shells`,
    ],
    examples: [
      ex("Element information from atomic number", `elements = {\n    1: {"name": "Hydrogen", "symbol": "H", "mass": 1.008},\n    2: {"name": "Helium", "symbol": "He", "mass": 4.003},\n    6: {"name": "Carbon", "symbol": "C", "mass": 12.011},\n    8: {"name": "Oxygen", "symbol": "O", "mass": 15.999},\n    26: {"name": "Iron", "symbol": "Fe", "mass": 55.845},\n}\nfor z, info in elements.items():\n    print(f"Z={z:3d}  {info['symbol']:3s}  {info['name']:10s}  Mass: {info['mass']:.3f}")`, `Z=  1  H    Hydrogen     Mass: 1.008\nZ=  2  He   Helium       Mass: 4.003\nZ=  6  C    Carbon       Mass: 12.011\nZ=  8  O    Oxygen       Mass: 15.999\nZ= 26  Fe   Iron         Mass: 55.845`),
      ex("Electron shells (Bohr model)", `for z in range(1, 11):\n    if z <= 2:\n        config = str(z)\n    elif z <= 10:\n        config = f"2, {z-2}"\n    else:\n        config = ""\n    print(f"Z={z:2d}: {config} electrons per shell")`, `Z= 1: 1 electrons per shell\nZ= 2: 2 electrons per shell\nZ= 3: 2, 1 electrons per shell\nZ= 4: 2, 2 electrons per shell\nZ= 5: 2, 3 electrons per shell\nZ= 6: 2, 4 electrons per shell\nZ= 7: 2, 5 electrons per shell\nZ= 8: 2, 6 electrons per shell\nZ= 9: 2, 7 electrons per shell\nZ=10: 2, 8 electrons per shell`),
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
      q("The atomic number represents...", ["Number of neutrons", "Number of protons", "Atomic mass", "Number of electrons in outer shell"], 1, `Atomic number Z = number of protons.`),
      q("Elements in the same group (column) have...", ["Same atomic mass", "Similar chemical properties", "Same number of neutrons", "Same number of electron shells"], 1, `Same number of valence electrons → similar chemical behavior.`),
      q("Noble gases are very unreactive because...", ["They are rare", "Their outer electron shell is full", "They have no electrons", "They are heavy"], 1, `A full outer shell means no tendency to gain/lose electrons → inert.`),
    ],
  }),

  L("Chemical Bonds", ["chemistry", "bonding", "molecules"], "beginner", 10, {
    intro: `<p>Chemical bonds hold atoms together to form molecules. <strong>Ionic bonds</strong> form when electrons transfer (one atom gives, another takes) — like NaCl. <strong>Covalent bonds</strong> form when atoms share electrons — like H<sub>2</sub>O. <strong>Metallic bonds</strong> share electrons in a "sea" — like iron. The type of bond determines the substance's properties.</p>`,
    concepts: [
      `<strong>Ionic bond</strong> — electron transfer; metal + non-metal; forms crystal lattice (e.g., NaCl)`,
      `<strong>Covalent bond</strong> — electron sharing; non-metal + non-metal; forms discrete molecules (e.g., H<sub>2</sub>O)`,
      `<strong>Electronegativity</strong> — how strongly an atom pulls electrons; determines bond type`,
      `<strong>Polarity</strong> — unequal electron sharing creates polar molecules (like water)`,
    ],
    examples: [
      ex("Ionic vs covalent properties", `print("Property        | Ionic (NaCl)    | Covalent (H2O)")\nprint("-" * 50)\nprint("State (room T)  | Solid crystal   | Gas/liquid")\nprint("Melting point   | High (801 C)    | Low (0 C)")\nprint("Conductivity    | When molten     | Poor")\nprint("Bond type       | Electron transfer| Electron sharing")`),
      ex("Water molecule (polar covalent)", `print("Water molecule (H2O):")\nprint("  H -- O -- H (104.5 degree angle)")\nprint("  Oxygen pulls electrons, polar")\nprint("  Polarity gives water its special properties")`),
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
      q("An ionic bond forms when...", ["Atoms share electrons", "Electrons transfer from one atom to another", "Atoms share protons", "Electrons are destroyed"], 1, `Ionic bonds involve electron transfer.`),
      q("Water (H2O) has what type of bonding?", ["Ionic", "Nonpolar covalent", "Polar covalent", "Metallic"], 2, `Water has polar covalent bonds.`),
      q("Which property is typical of ionic compounds?", ["Low melting point", "Poor conductor when dissolved", "High melting point", "Flexible solid"], 2, `Ionic compounds have high melting points.`),
    ],
  }),

  L("Chemical Reactions and Equations", ["chemistry", "reactions", "equations"], "intermediate", 14, {
    intro: `<p>A chemical reaction rearranges atoms to form new substances. Reactants (left side) → Products (right side). Chemical equations must be <strong>balanced</strong> — the same number of each atom on both sides. The Law of Conservation of Mass says matter is neither created nor destroyed.</p>`,
    concepts: [
      `<strong>Reactants → Products</strong> — substances that change produce new substances`,
      `<strong>Conservation of mass</strong> — total mass before = total mass after`,
      `<strong>Balancing equations</strong> — adjust coefficients (not subscripts!) to equalize atom counts`,
      `<strong>Types of reactions</strong> — synthesis (A+B→AB), decomposition (AB→A+B), combustion`,
    ],
    examples: [
      ex("Balancing a combustion reaction", `# CH4 + O2 → CO2 + H2O\nreactants = {"C": 1, "H": 4, "O": 4}\nproducts = {"C": 1, "H": 4, "O": 4}\nprint(f"Reactants:  {reactants}")\nprint(f"Products:   {products}")\nif reactants == products:\n    print("✓ Balanced: CH4 + 2O2 → CO2 + 2H2O")`, `Reactants:  {'C': 1, 'H': 4, 'O': 4}\nProducts:   {'C': 1, 'H': 4, 'O': 4}\n✓ Balanced`),
      ex("Checking conservation of mass", `mass_reactants = 16 + 64  # g\nmass_products = 44 + 36   # g\nprint(f"Reactants: {mass_reactants}g")\nprint(f"Products:  {mass_products}g")\nif mass_reactants == mass_products:\n    print("✓ Mass conserved!")`, `Reactants: 80g\nProducts:  80g\n✓ Mass conserved!`),
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
      q("A balanced chemical equation has...", ["Same number of molecules on each side", "Same number of each atom on each side", "Same total volume", "No change in state"], 1, `Balancing means equal atom counts.`),
      q("What does the Law of Conservation of Mass state?", ["Mass can be created", "Mass is neither created nor destroyed", "Mass always increases", "Mass always decreases"], 1, `Total mass is conserved in chemical reactions.`),
      q("In 2H2 + O2 → 2H2O, how many hydrogen atoms on each side?", ["2", "4", "6", "1"], 1, `2H2 = 4 H atoms on left; 2H2O = 4 H atoms on right.`),
    ],
  }),

  L("Acids, Bases, and pH", ["chemistry", "acids-bases", "ph"], "intermediate", 12, {
    intro: `<p>Acids release H<sup>+</sup> ions in water; bases release OH<sup>−</sup> ions. The pH scale (0-14) measures acidity: pH < 7 is acidic, pH > 7 is basic, pH = 7 is neutral. <code>pH = −log<sub>10</sub>[H<sup>+</sup>]</code>. Each unit represents a 10× change in H<sup>+</sup> concentration.</p>`,
    concepts: [
      `<strong>Acid</strong> — donates H<sup>+</sup> ions (protons) in solution; tastes sour`,
      `<strong>Base</strong> — accepts H<sup>+</sup> or donates OH<sup>−</sup>; tastes bitter; slippery`,
      `<strong>pH scale</strong> — <code>pH = −log<sub>10</sub>[H<sup>+</sup>]</code>; logarithmic`,
      `<strong>Neutralization</strong> — acid + base → salt + water: HCl + NaOH → NaCl + H<sub>2</sub>O`,
    ],
    examples: [
      ex("Computing pH from H+ concentration", `import math\nh_conc = 1e-3\npH = -math.log10(h_conc)\nprint(f"[H+] = {h_conc} M")\nprint(f"pH = {pH:.1f} (acidic)")`, `[H+] = 0.001 M\npH = 3.0 (acidic)`),
      ex("Comparing acidity", `import math\nfor h in [1e-1, 1e-3, 1e-5, 1e-7, 1e-9, 1e-11, 1e-13]:\n    ph = -math.log10(h)\n    typ = "Acidic" if ph < 7 else "Neutral" if ph == 7 else "Basic"\n    print(f"{h:.0e}      {ph:.1f}     {typ}")`),
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
      q("A solution with pH = 3 has [H+] compared to pH = 5?", ["10× more", "100× more", "100× less", "Same"], 1, `pH 3 is 100× more acidic than pH 5.`),
      q("What happens in neutralization?", ["Two acids mix", "An acid and base form salt and water", "A base decomposes", "Water evaporates"], 1, `Neutralization: acid + base → salt + water.`),
      q("Pure water has what pH?", ["0", "7", "14", "3"], 1, `Pure water at 25°C has pH 7 (neutral).`),
    ],
  }),
'''

with open(r'C:\Users\zconsumers\Desktop\EduVerse Final\backend\curriculum\science.ts', 'a', encoding='utf-8') as f:
    f.write(content)

print("written part 2")
