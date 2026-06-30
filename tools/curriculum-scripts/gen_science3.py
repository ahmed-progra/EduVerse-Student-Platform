content = r'''
  L("Layers of the Earth", ["earth-science", "geology", "earth-structure"], "beginner", 10, {
    intro: `<p>The Earth has four main layers. The <strong>crust</strong> is the thin outer shell (5-70 km thick). The <strong>mantle</strong> extends to ~2900 km — mostly solid but flows very slowly. The <strong>outer core</strong> is liquid iron and nickel (~2200 km thick) and generates Earth's magnetic field. The <strong>inner core</strong> is solid iron/nickel at ~5500°C.</p>`,
    concepts: [
      `<strong>Crust</strong> — 5-70 km thick; continental (granite, ~35 km) and oceanic (basalt, ~7 km)`,
      `<strong>Mantle</strong> — ~2900 km thick; semi-solid rock that flows by convection; drives plate tectonics`,
      `<strong>Outer core</strong> — liquid iron and nickel; convection creates Earth's magnetic field`,
      `<strong>Inner core</strong> — solid iron and nickel; ~5500°C; incredibly dense`,
    ],
    examples: [
      ex("Earth's layer thickness", `layers = {\n    "Crust": 35, "Mantle": 2900,\n    "Outer Core": 2200, "Inner Core": 1300,\n}\nfor layer, thick in layers.items():\n    bar = "#" * (thick // 50)\n    print(f"{layer:12s} | {thick:5d} km {bar}")`),
      ex("Temperature gradient", `for depth, temp in [(0, 20), (100, 1000), (1000, 3000), (2900, 3700), (5100, 5500)]:\n    print(f"{depth:6d} km  {temp:5d}°C")`),
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
      q("Which layer of Earth is liquid and generates the magnetic field?", ["Crust", "Mantle", "Outer core", "Inner core"], 2, `The liquid outer core convects, generating the geodynamo.`),
      q("The Earth's crust is thickest under...", ["Oceans", "Continents", "Polar ice caps", "Deserts"], 1, `Continental crust is ~35 km; oceanic crust is ~7 km.`),
      q("What is the temperature of the inner core?", ["1000°C", "3000°C", "5500°C", "100°C"], 2, `The inner core reaches ~5500°C.`),
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
      ex("Plate movement over time", `rate = 2  # cm/year\ndistance = rate * 100_000_000\nprint(f"Plate movement: {rate} cm/year")\nprint(f"In 100 million years: {distance/100_000:.0f} km")`, `Plate movement: 2 cm/year\nIn 100 million years: 2000 km`),
      ex("Plate boundary types", `boundaries = {\n    "Divergent": "Plates move apart, new crust formed",\n    "Convergent": "Plates collide, mountains/volcanoes",\n    "Transform":  "Plates slide past, earthquakes",\n}\nfor btype, desc in boundaries.items():\n    print(f"{btype:10s} → {desc}")`),
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
      q("What drives plate tectonics?", ["Earth's rotation", "Mantle convection", "Gravity from the Moon", "Ocean currents"], 1, `Convection currents in the mantle move the plates.`),
      q("The Himalayas formed at what type of boundary?", ["Divergent", "Convergent", "Transform", "Subduction"], 1, `India collided with Eurasia → convergent boundary.`),
      q("Where do most earthquakes occur?", ["In the middle of plates", "Along plate boundaries", "Only at transform boundaries", "Randomly"], 1, `Most earthquakes occur at plate boundaries.`),
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
      ex("Water distribution on Earth", `water = {\n    "Oceans": 96.5, "Groundwater": 1.7,\n    "Ice caps": 1.7, "Lakes/rivers": 0.013,\n    "Atmosphere": 0.001,\n}\nfor source, pct in water.items():\n    bar = "#" * int(pct * 2)\n    print(f"{source:20s} | {pct:5.1f}% {bar}")`),
      ex("Water cycle steps", `steps = [\n    "1. Sun heats oceans → evaporation",\n    "2. Vapor rises, cools → condensation (clouds)",\n    "3. Clouds release → precipitation",\n    "4. Water collects in rivers, lakes, oceans",\n    "5. Plants release water → transpiration",\n    "6. Repeat!",\n]\nfor step in steps:\n    print(step)`),
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
      q("What process turns liquid water into water vapor?", ["Condensation", "Evaporation", "Precipitation", "Transpiration"], 1, `Evaporation: liquid → vapor.`),
      q("What percentage of Earth's water is in the oceans?", ["50%", "75%", "96.5%", "99%"], 2, `~96.5% of Earth's water is in oceans.`),
      q("The process by which plants release water vapor is called...", ["Evaporation", "Condensation", "Transpiration", "Precipitation"], 2, `Transpiration is water vapor from plant leaves.`),
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
      ex("CO2 concentration increase", `years = list(range(1880, 2030, 20))\nco2 = [280, 300, 310, 320, 340, 370, 390, 410, 420]\nfor y, c in zip(years, co2):\n    bar = "#" * ((c - 270) // 5)\n    print(f"{y}   {c} {bar}")`),
      ex("Greenhouse effect", `print(f"Natural greenhouse effect: +33°C")\nprint(f"Without it, Earth avg temp: -18°C")\nprint(f"With natural greenhouse:   15°C")`),
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
      q("What is the most abundant gas in Earth's atmosphere?", ["Oxygen (O2)", "Nitrogen (N2)", "Carbon dioxide (CO2)", "Argon (Ar)"], 1, `Nitrogen makes up ~78% of the atmosphere.`),
      q("The natural greenhouse effect keeps Earth...", ["The same temperature", "About 33°C warmer than without it", "Cooler", "Reverses night and day"], 1, `Without the greenhouse effect, Earth would be -18°C.`),
      q("Climate vs weather: which is long-term?", ["Weather", "Climate", "Both", "Neither"], 1, `Climate = decades+; Weather = days.`),
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
      ex("Planet distances from the Sun (AU)", `planets = {\n    "Mercury": 0.39, "Venus": 0.72,\n    "Earth": 1.0, "Mars": 1.52,\n    "Jupiter": 5.2, "Saturn": 9.54,\n    "Uranus": 19.2, "Neptune": 30.1,\n}\nfor planet, au in planets.items():\n    bar = "=" * int(au * 3)\n    print(f"{planet:10s}  {au:5.2f}   |{bar}")`),
      ex("Orbital periods", `planets = {\n    "Mercury": 88, "Venus": 225, "Earth": 365,\n    "Mars": 687, "Jupiter": 4333, "Saturn": 10759,\n    "Uranus": 30687, "Neptune": 60190,\n}\nfor planet, days in planets.items():\n    print(f"{planet:10s} {days:6d} days = {days/365.25:.2f} Earth years")`),
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
      q("Which planet is closest to the Sun?", ["Venus", "Mercury", "Mars", "Earth"], 1, `Mercury at 0.39 AU.`),
      q("The largest planet in the Solar System is...", ["Saturn", "Neptune", "Jupiter", "Uranus"], 2, `Jupiter is the largest at over 300× Earth's mass.`),
      q("Why is Pluto not considered a major planet?", ["Too small", "Hasn't cleared its orbital neighborhood", "Has a moon", "Too far"], 1, `Pluto hasn't cleared its orbit of debris.`),
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
      ex("Sun's energy output", `power_sun = 3.828e26  # W\npower_per_m2 = power_sun / (4 * 3.14159 * (1.496e11)**2)\nprint(f"Sun's power: {power_sun:.2e} W")\nprint(f"Solar constant: {power_per_m2:.0f} W/m2")`, `Sun's power: 3.83e+26 W\nSolar constant: 1361 W/m2`),
      ex("Star types", `stars = {\n    "Sun (G2V)": (5778, 1),\n    "Sirius A": (9940, 25.4),\n    "Betelgeuse": (3500, 126000),\n    "Proxima Centauri": (3042, 0.0017),\n}\nfor name, (temp, lum) in stars.items():\n    print(f"{name:18s} {temp:5d}K  Luminosity: {lum:>10.2f}")`),
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
      q("What powers the Sun?", ["Chemical burning", "Nuclear fission", "Nuclear fusion (H → He)", "Gravitational contraction"], 2, `The Sun fuses hydrogen into helium.`),
      q("What remains after a low-mass star dies?", ["Black hole", "Neutron star", "White dwarf", "Nebula"], 2, `Low-mass stars become white dwarfs.`),
      q("On the H-R diagram, most stars are on the...", ["Red giant branch", "Main sequence", "White dwarf region", "Supergiant branch"], 1, `~90% of stars are on the main sequence.`),
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
      ex("Light-year distances", `ly = 9.45e15  # meters\nprint(f"1 light-year = {ly:.2e} m")\nprint(f"Andromeda Galaxy: 2.5 million light-years away")`, `1 light-year = 9.45e+15 m\nAndromeda Galaxy: 2.5 million light-years away`),
      ex("Hubble's law", `H0 = 70\nprint("Hubble: v = H0 * d")\nfor d in [1, 10, 100, 1000]:\n    print(f"{d:4d} Mpc → v = {H0*d:5d} km/s")`),
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
      q("What type of galaxy is the Milky Way?", ["Elliptical", "Spiral", "Irregular", "Lenticular"], 1, `The Milky Way is a barred spiral galaxy.`),
      q("About how old is the universe?", ["4.6 billion years", "13.8 billion years", "100 million years", "1 trillion years"], 1, `The Big Bang occurred ~13.8 billion years ago.`),
      q("Most of the universe is made of...", ["Stars and planets", "Dark energy and dark matter", "Hydrogen gas", "Black holes"], 1, `~95% of the universe is dark matter (~27%) and dark energy (~68%).`),
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
      ex("Rocket equation (Tsiolkovsky)", `import math\nve, m0, mf = 4.5, 500, 100\ndv = ve * math.log(m0 / mf)\nprint(f"Exhaust vel: {ve} km/s")\nprint(f"Mass ratio: {m0/mf:.1f}")\nprint(f"Delta-v: {dv:.2f} km/s")`, `Exhaust vel: 4.5 km/s\nMass ratio: 5.0\nDelta-v: 7.24 km/s`),
      ex("Travel time to Mars", `distance_km = 140e6\nspeed_kms = 20\ntime_days = distance_km / speed_kms / 3600 / 24\nprint(f"Distance to Mars: {distance_km:.1e} km")\nprint(f"Speed: {speed_kms} km/s")\nprint(f"Travel time: {time_days:.0f} days")`, `Distance to Mars: 1.4e+8 km\nSpeed: 20 km/s\nTravel time: 81 days`),
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
      q("In what year did humans first land on the Moon?", ["1961", "1969", "1972", "1957"], 1, `Apollo 11 landed July 20, 1969.`),
      q("Why do astronauts appear weightless on the ISS?", ["No gravity", "Freefall (microgravity)", "Magnetic boots", "Anti-gravity"], 1, `The ISS is in continuous freefall.`),
      q("What is the approximate escape velocity from Earth?", ["5 km/s", "7 km/s", "11.2 km/s", "20 km/s"], 2, `~11.2 km/s to escape Earth's gravity.`),
    ],
  }),
];
'''

with open(r'C:\Users\zconsumers\Desktop\EduVerse Final\backend\curriculum\science.ts', 'a', encoding='utf-8') as f:
    f.write(content)

print("written part 3 — science.ts complete")
