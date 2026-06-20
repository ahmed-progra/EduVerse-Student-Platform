import { L, q, ex, LessonDef } from "./types";

export const physics: LessonDef[] = [
  L("Newton's Laws of Motion", ["mechanics", "forces", "motion"], "beginner", 12, {
    intro: `<p>Newton's three laws are the foundation of classical mechanics: (1) an object at rest stays at rest unless acted on by a force — inertia; (2) force equals mass times acceleration (<code>F = ma</code>); (3) every action has an equal and opposite reaction. The second law is the most used: if you know the mass and acceleration, you can compute the force.</p>`,
    concepts: [
      `<strong>First law (Inertia)</strong> — objects resist changes to their motion; no net force means constant velocity`,
      `<strong>Second law</strong> — <code>F = ma</code>: force (N) = mass (kg) × acceleration (m/s²)`,
      `<strong>Third law</strong> — for every action force, there's an equal and opposite reaction force`,
      `<strong>Net force</strong> — the vector sum of all forces acting on an object`,
    ],
    examples: [
      ex("Newton's second law", `mass = 10  # kg\nacceleration = 3.5  # m/s²\nforce = mass * acceleration\nprint(f"Mass: {mass} kg")\nprint(f"Acceleration: {acceleration} m/s²")\nprint(f"Force: {force} N")`, `Mass: 10 kg\nAcceleration: 3.5 m/s²\nForce: 35.0 N`),
      ex("Finding acceleration from force", `mass = 5  # kg\nforce = 20  # N\nacceleration = force / mass\nprint(f"Mass: {mass} kg")\nprint(f"Force: {force} N")\nprint(f"Acceleration: {acceleration} m/s²")`, `Mass: 5 kg\nForce: 20 N\nAcceleration: 4.0 m/s²`),
    ],
    realWorld: `Car safety design uses Newton's laws: seatbelts counteract inertia (first law), crumple zones extend collision time to reduce force (second law), and airbags push back (third law). Rocket propulsion is a perfect example of action-reaction.`,
    practice: `A 1200 kg car accelerates at 5 m/s². What net force does the engine produce? If the same force acts on a 800 kg car, what acceleration results?`,
    mistakes: [
      `Confusing mass and weight: mass is constant (kg), weight = mg (N) depends on gravity`,
      `Forgetting units — force in newtons (N), mass in kg, acceleration in m/s². Mixing units gives wrong answers`,
    ],
    best: [
      `Draw a free-body diagram showing all forces before applying F = ma`,
      `Always check that your units cancel: kg × m/s² = N`,
    ],
    template: `mass_car = 1200  # kg\naccel = 5.0  # m/s²\nforce = mass_car * accel\nprint(f"Force on {mass_car}kg car: {force} N")\nmass_lighter = 800\naccel2 = force / mass_lighter\nprint(f"Same force on {mass_lighter}kg car: {accel2:.1f} m/s²")`,
    quiz: [
      q("What unit is force measured in?", ["kg", "m/s", "Newtons (N)", "Joules"], 2, `The newton (N) = kg·m/s².`),
      q("A 2 kg object accelerates at 3 m/s². What is the force?", ["3 N", "5 N", "6 N", "1.5 N"], 2, `F = 2 × 3 = 6 N.`),
      q("Newton's first law is also known as...", ["Action-reaction", "Inertia", "Acceleration", "Gravity"], 1, `The law of inertia: objects resist changes in motion.`),
    ],
  }),

  L("Velocity and Acceleration", ["mechanics", "motion", "kinematics"], "beginner", 12, {
    intro: `<p>Velocity is speed in a given direction (<code>v = Δd / Δt</code>). Acceleration is the rate of change of velocity (<code>a = Δv / Δt</code>). The equations of motion relate these: <code>v = u + at</code>, <code>v² = u² + 2as</code>, and <code>s = ut + ½at²</code>, where u is initial velocity, v is final velocity, a is acceleration, t is time, and s is displacement.</p>`,
    concepts: [
      `<strong>Velocity</strong> — displacement divided by time: <code>v = Δd / Δt</code> (vector: has direction)`,
      `<strong>Acceleration</strong> — change in velocity over time: <code>a = Δv / Δt</code>`,
      `<strong>First equation</strong> — <code>v = u + at</code>`,
      `<strong>Third equation</strong> — <code>v² = u² + 2as</code> (useful when time isn't known)`,
    ],
    examples: [
      ex("Using v = u + at", `u = 0  # m/s (starting from rest)\na = 9.8  # m/s² (gravity)\nt = 3  # seconds\nv = u + a * t\nprint(f"After {t}s, velocity = {v:.1f} m/s")`, `After 3s, velocity = 29.4 m/s`),
      ex("Using v² = u² + 2as", `u = 15  # m/s\na = -2  # m/s² (braking)\ns = 50  # meters\nv = (u**2 + 2*a*s) ** 0.5\nprint(f"Final velocity: {v:.1f} m/s")\nprint(f"After braking {s}m from {u} m/s")`, `Final velocity: 5.0 m/s\nAfter braking 50m from 15 m/s`),
    ],
    realWorld: `Speed cameras use kinematic equations. Crash reconstruction experts use <code>v² = u² + 2as</code> to estimate speed from skid marks. Roller coaster designers calculate velocity at each point on the track.`,
    practice: `A ball is thrown downward at 5 m/s from a height. After 2 seconds of free fall (gravity = 9.8 m/s²), what's its velocity? Use v = u + at.`,
    mistakes: [
      `Confusing speed and velocity: velocity has direction, speed doesn't. A car going in a circle at constant speed has changing velocity (direction changes)`,
      `Using the wrong kinematic equation — check which variables you know and which you need`,
    ],
    best: [
      `List known and unknown variables (u, v, a, t, s) before picking the right equation`,
      `Watch sign conventions: upward is typically positive, downward negative`,
    ],
    template: `u = 5  # m/s (downward, positive)\na = 9.8  # m/s² (gravity)\nt = 2  # seconds\nv = u + a * t\nprint(f"Initial velocity: {u} m/s")\nprint(f"After {t}s: {v:.1f} m/s")\ns = u * t + 0.5 * a * t**2\nprint(f"Distance fallen: {s:.1f} m")`,
    quiz: [
      q("If a car accelerates from 0 to 20 m/s in 4 seconds, what's its acceleration?", ["4 m/s²", "5 m/s²", "20 m/s²", "0.2 m/s²"], 1, `a = (20 − 0) / 4 = 5 m/s².`),
      q("What does the equation v = u + at tell you?", ["Distance traveled", "Final velocity after time t", "Average speed", "Acceleration"], 1, `It gives final velocity from initial velocity, acceleration, and time.`),
      q("A ball thrown up at 10 m/s with g = −9.8 m/s². When does it stop (v = 0)?", ["About 1 second", "About 2 seconds", "About 0.5 seconds", "About 10 seconds"], 0, `0 = 10 + (−9.8)t → t = 10/9.8 ≈ 1.02 s.`),
    ],
  }),

  L("Projectile Motion", ["mechanics", "motion", "projectiles"], "intermediate", 14, {
    intro: `<p>Projectile motion combines horizontal motion (constant velocity, no force) with vertical motion (constant acceleration from gravity). The path is a parabola. The range (horizontal distance) and maximum height depend on the launch angle, initial speed, and gravity. The optimal angle for maximum range is 45°.</p>`,
    concepts: [
      `<strong>Independence of axes</strong> — horizontal and vertical motion are independent`,
      `<strong>Horizontal</strong> — constant velocity: <code>v_x = v₀·cos(θ)</code>, <code>x = v_x·t</code>`,
      `<strong>Vertical</strong> — constant acceleration: <code>v_y = v₀·sin(θ) − gt</code>, <code>y = v_y·t − ½gt²</code>`,
      `<strong>Range formula</strong> — <code>R = v₀²·sin(2θ) / g</code> (when launch and landing at same height)`,
    ],
    examples: [
      ex("Computing range and max height", `import math\nv0 = 20  # m/s\ntheta = 45  # degrees\ntheta_rad = math.radians(theta)\ng = 9.8\nR = v0**2 * math.sin(2 * theta_rad) / g\nmax_h = (v0 * math.sin(theta_rad))**2 / (2 * g)\nprint(f"Launch: {v0} m/s at {theta}°")\nprint(f"Range: {R:.1f} m")\nprint(f"Max height: {max_h:.1f} m")`, `Launch: 20 m/s at 45°\nRange: 40.8 m\nMax height: 10.2 m`),
      ex("Comparing ranges at different angles", `import math\nv0 = 20\ng = 9.8\nfor angle in [30, 45, 60]:\n    r = v0**2 * math.sin(2 * math.radians(angle)) / g\n    print(f"{angle}°: range = {r:.1f} m")`, `30°: range = 35.3 m\n45°: range = 40.8 m\n60°: range = 35.3 m`),
    ],
    realWorld: `Sports: basketball free throws, golf drives, artillery trajectories, and fireworks all follow projectile motion. Engineers design catapults and water fountains using these equations.`,
    practice: `A soccer ball is kicked at 15 m/s at 40°. Compute its range and maximum height (use g = 9.8). Which angle gives the same range as 40°?`,
    mistakes: [
      `Forgetting that sin(2θ) in the range formula requires θ in radians, not degrees`,
      `Assuming the range formula works — it only applies when launch and landing are at the same height`,
    ],
    best: [
      `Remember that 30° and 60° give the same range (complementary angles)`,
      `Break the problem into horizontal and vertical parts — solve each separately`,
    ],
    template: `import math\nv0 = 15\ntheta = 40\ntheta_r = math.radians(theta)\ng = 9.8\nR = v0**2 * math.sin(2 * theta_r) / g\nH = (v0 * math.sin(theta_r))**2 / (2 * g)\nt_flight = 2 * v0 * math.sin(theta_r) / g\nprint(f"Range: {R:.1f} m")\nprint(f"Max height: {H:.1f} m")\nprint(f"Flight time: {t_flight:.2f} s")`,
    quiz: [
      q("What angle gives the maximum range for projectile motion?", ["30°", "45°", "60°", "90°"], 1, `45° maximizes sin(2θ) = sin(90°) = 1.`),
      q("Horizontal motion of a projectile has...", ["Constant acceleration", "Constant velocity", "Increasing speed", "No motion"], 1, `No horizontal force means constant horizontal velocity.`),
      q("Two projectiles at 30° and 60° with the same speed have...", ["Same height, different range", "Different height, same range", "Same height and range", "Different height and range"], 1, `Complementary angles give the same range but different max heights.`),
    ],
  }),

  L("Work, Energy, and Power", ["mechanics", "energy", "work"], "intermediate", 14, {
    intro: `<p>Work is done when a force moves an object: <code>W = F·d</code> (force × distance). Energy is the ability to do work. Kinetic energy is energy of motion: <code>KE = ½mv²</code>. Potential energy is stored energy: <code>PE = mgh</code> (gravitational). The Law of Conservation of Energy states energy cannot be created or destroyed, only transformed. Power is the rate of doing work: <code>P = W/t</code>.</p>`,
    concepts: [
      `<strong>Work</strong> — <code>W = F·d</code> (joules): force × distance in the direction of force`,
      `<strong>Kinetic energy</strong> — <code>KE = ½mv²</code>: energy of motion`,
      `<strong>Gravitational potential energy</strong> — <code>PE = mgh</code>: energy of height`,
      `<strong>Conservation of energy</strong> — <code>PE₁ + KE₁ = PE₂ + KE₂</code> (no friction)`,
    ],
    examples: [
      ex("Kinetic energy of a moving car", `mass = 1000  # kg\nspeed = 20  # m/s (72 km/h)\nKE = 0.5 * mass * speed**2\nprint(f"Mass: {mass} kg, Speed: {speed} m/s")\nprint(f"Kinetic energy: {KE:,} J")`, `Mass: 1000 kg, Speed: 20 m/s\nKinetic energy: 200,000 J`),
      ex("Conservation of energy (falling object)", `m = 2  # kg\nh = 10  # meters\ng = 9.8\nPE_top = m * g * h\nv_bottom = (2 * g * h) ** 0.5\nKE_bottom = 0.5 * m * v_bottom**2\nprint(f"PE at top: {PE_top:.1f} J")\nprint(f"Speed at bottom: {v_bottom:.1f} m/s")\nprint(f"KE at bottom: {KE_bottom:.1f} J")`, `PE at top: 196.0 J\nSpeed at bottom: 14.0 m/s\nKE at bottom: 196.0 J`),
    ],
    realWorld: `Roller coasters constantly convert PE ↔ KE (highest point = max PE). Hybrid cars use regenerative braking to capture KE and store it. Power plants are rated in megawatts (MW = MJ/s).`,
    practice: `A 60 kg cyclist climbs a 5 m hill. How much work against gravity? If she coasts down, what's her speed at the bottom (ignoring friction)?`,
    mistakes: [
      `Remembering KE = ½mv², not mv² — that missing ½ gives double the correct energy`,
      `Forgetting that work requires motion: holding a heavy box still does zero work (d = 0)`,
    ],
    best: [
      `Use conservation of energy whenever possible — it's often simpler than using kinematic equations`,
      `In real problems, include friction: some energy is always "lost" to heat`,
    ],
    template: `m = 60  # kg\nh = 5  # meters\ng = 9.8\nPE = m * g * h\nv = (2 * g * h) ** 0.5\nprint(f"Work against gravity: {PE:.1f} J")\nprint(f"Speed at bottom: {v:.1f} m/s")`,
    quiz: [
      q("What are the units of work and energy?", ["Watts", "Joules", "Newtons", "Pascals"], 1, `Work and energy are measured in joules (J).`),
      q("A 5 kg object at 10 m height has how much PE? (g = 10)", ["50 J", "500 J", "250 J", "100 J"], 1, `PE = 5 × 10 × 10 = 500 J.`),
      q("Doubling speed multiplies KE by...", ["2", "4", "1.5", "8"], 1, `KE = ½mv², so doubling v quadruples KE.`),
    ],
  }),

  L("Wave Properties", ["waves", "optics", "oscillations"], "beginner", 10, {
    intro: `<p>A wave transfers energy without transferring matter. The key properties: <strong>wavelength</strong> (λ) — distance between consecutive peaks; <strong>frequency</strong> (f) — how many waves pass per second (in Hz); <strong>amplitude</strong> — height from center to peak. They're related by the wave equation: <code>v = f·λ</code>, where v is wave speed.</p>`,
    concepts: [
      `<strong>Wavelength (λ)</strong> — distance between two consecutive crests, in meters`,
      `<strong>Frequency (f)</strong> — number of waves per second, measured in hertz (Hz)`,
      `<strong>Amplitude</strong> — maximum displacement from equilibrium; determines energy`,
      `<strong>Wave equation</strong> — <code>v = f·λ</code>: speed = frequency × wavelength`,
    ],
    examples: [
      ex("Finding wave speed", `f = 440  # Hz (A4 note)\nlam = 0.78  # meters\nv = f * lam\nprint(f"Frequency: {f} Hz")\nprint(f"Wavelength: {lam} m")\nprint(f"Speed: {v:.0f} m/s")`, `Frequency: 440 Hz\nWavelength: 0.78 m\nSpeed: 343 m/s`),
      ex("Finding wavelength from frequency", `v = 343  # m/s (speed of sound)\nf = 256  # Hz\nlam = v / f\nprint(f"Frequency: {f} Hz")\nprint(f"Wavelength: {lam:.2f} m")`, `Frequency: 256 Hz\nWavelength: 1.34 m`),
    ],
    realWorld: `Radio stations broadcast at specific frequencies (e.g., 100.7 MHz). Microwaves use ~2.45 GHz. Seismographs detect earthquake waves. Music: each note corresponds to a specific frequency (A4 = 440 Hz).`,
    practice: `A wave has frequency 60 Hz and wavelength 5 m. What is its speed? If sound travels at 340 m/s, what frequency produces a wavelength of 2 m?`,
    mistakes: [
      `Confusing frequency and speed: frequency depends on the source, speed depends on the medium`,
      `Using Hz as "waves per minute" — Hz is waves per second. Convert minutes to seconds`,
    ],
    best: [
      `Remember: v = f × λ works for all waves — sound, light, water, seismic`,
      `Higher frequency means shorter wavelength (for the same speed)`,
    ],
    template: `f = 60  # Hz\nlam = 5  # meters\nv = f * lam\nprint(f"Wave speed: {v} m/s")\n\nv_sound = 340\nlam2 = 2\nf2 = v_sound / lam2\nprint(f"Frequency for λ=2m: {f2} Hz")`,
    quiz: [
      q("What is the relationship between wave speed, frequency, and wavelength?", ["v = f / λ", "v = f × λ", "v = λ / f", "v = f + λ"], 1, `v = f × λ.`),
      q("If frequency doubles, wavelength... (speed constant)", ["Doubles", "Halves", "Quadruples", "Stays same"], 1, `Since v = f × λ, doubling f halves λ.`),
      q("What unit is frequency measured in?", ["Meters", "Seconds", "Hertz", "Joules"], 2, `Hertz (Hz) = 1/s.`),
    ],
  }),

  L("Sound Waves", ["waves", "sound", "acoustics"], "beginner", 10, {
    intro: `<p>Sound is a longitudinal wave that travels by compressing and rarefying air molecules. The speed of sound in air at 20°C is about 343 m/s. Pitch is determined by frequency (higher frequency = higher pitch). Loudness is determined by amplitude. The Doppler effect causes a change in perceived frequency when the source moves relative to the observer.</p>`,
    concepts: [
      `<strong>Speed of sound</strong> — ~343 m/s in air at 20°C; increases with temperature`,
      `<strong>Pitch and frequency</strong> — high frequency = high pitch (e.g., whistle vs. bass drum)`,
      `<strong>Amplitude and loudness</strong> — measured in decibels (dB)`,
      `<strong>Doppler effect</strong> — <code>f' = f × (v + vₒ) / (v − vₛ)</code> when source approaches`,
    ],
    examples: [
      ex("Speed of sound at different temperatures", `for temp in [0, 20, 30]:\n    v = 331 * (1 + temp / 273) ** 0.5\n    print(f"{temp}°C: {v:.0f} m/s")`, `0°C: 331 m/s\n20°C: 343 m/s\n30°C: 349 m/s`),
      ex("Doppler effect (ambulance approaching)", `v_sound = 343  # m/s\nf_source = 440  # Hz (siren)\nv_source = 30  # m/s (ambulance speed)\nf_heard = f_source * v_sound / (v_sound - v_source)\nprint(f"Source frequency: {f_source} Hz")\nprint(f"Heard frequency (approaching): {f_heard:.0f} Hz")`, `Source frequency: 440 Hz\nHeard frequency (approaching): 483 Hz`),
    ],
    realWorld: `Ultrasound imaging uses high-frequency sound waves. Sonar uses sound to map the ocean floor. Architectural acoustics designs concert halls for optimal sound. Doppler radar measures storm velocity.`,
    practice: `A train horn at 500 Hz approaches you at 40 m/s. What frequency do you hear? (v_sound = 343 m/s)`,
    mistakes: [
      `Thinking sound travels faster in air than in solids — actually fastest in solids (steel: ~5000 m/s)`,
      `Using the wrong sign in the Doppler formula — approaching source→ denominator is (v − vₛ)`,
    ],
    best: [
      `Sound needs a medium — it can't travel through a vacuum (that's why space is silent)`,
      `Each 10 dB increase represents a 10× increase in sound intensity`,
    ],
    template: `v_sound = 343\nf_source = 500\nv_source = 40  # approaching\nf_heard = f_source * v_sound / (v_sound - v_source)\nprint(f"Source: {f_source} Hz")\nprint(f"Heard (approaching): {f_heard:.0f} Hz")\nf_away = f_source * v_sound / (v_sound + v_source)\nprint(f"Heard (receding): {f_away:.0f} Hz")`,
    quiz: [
      q("Sound travels fastest in which medium?", ["Air", "Water", "Steel", "Vacuum"], 2, `Sound moves fastest in solids (steel: ~5000 m/s), slowest in gases.`),
      q("A high-pitched sound has...", ["High frequency", "High amplitude", "Long wavelength", "Low frequency"], 0, `Pitch = frequency. High frequency = high pitch.`),
      q("The Doppler effect explains why an ambulance siren changes pitch because...", ["The air changes temperature", "The source moves relative to you", "Sound speeds up", "The siren changes frequency"], 1, `Motion of source/observer changes the perceived frequency.`),
    ],
  }),

  L("Light and Reflection", ["optics", "light", "reflection"], "intermediate", 12, {
    intro: `<p>Light travels in straight lines at 3 × 10⁸ m/s in a vacuum. Reflection occurs when light bounces off a surface. The law of reflection states: <strong>angle of incidence = angle of reflection</strong>. Plane mirrors produce virtual, upright images at the same distance behind the mirror as the object is in front.</p>`,
    concepts: [
      `<strong>Speed of light</strong> — <code>c = 3.0 × 10⁸ m/s</code> in vacuum, slower in other media`,
      `<strong>Law of reflection</strong> — <code>θᵢ = θᵣ</code>: the angle of incidence equals the angle of reflection`,
      `<strong>Plane mirror</strong> — image is virtual, upright, same size, reversed left-right`,
      `<strong>Curved mirrors</strong> — concave mirrors converge light; convex mirrors diverge it`,
    ],
    examples: [
      ex("Light travel time", `c = 3.0e8  # m/s\n# Sun to Earth: 149.6 million km\ndistance = 149.6e9  # meters\ntime = distance / c\nprint(f"Sun to Earth: {time:.0f} seconds ({time/60:.1f} minutes)")`, `Sun to Earth: 499 seconds (8.3 minutes)`),
      ex("Image distance in a plane mirror", `obj_dist = 1.5  # meters\nimg_dist = obj_dist  # same distance behind mirror\nprint(f"Object is {obj_dist}m in front of mirror")\nprint(f"Image is {img_dist}m behind mirror")\nprint(f"Total distance from object to image: {obj_dist + img_dist}m")`, `Object is 1.5m in front of mirror\nImage is 1.5m behind mirror\nTotal distance from object to image: 3.0m`),
    ],
    realWorld: `Rear-view mirrors (convex), telescopes (concave), periscopes, laser scanning, and fiber optics all rely on reflection. Solar concentrators use concave mirrors to focus sunlight.`,
    practice: `If a light ray hits a mirror at 35° to the normal, what is the angle of reflection? How long does it take for light from the Moon (384,400 km) to reach Earth?`,
    mistakes: [
      `Measuring the angle from the mirror surface instead of the normal (perpendicular line)`,
      `Thinking plane mirrors swap left-right — actually they swap front-back (the z-axis)`,
    ],
    best: [
      `Always measure angles from the normal, not the surface`,
      `The speed of light is the cosmic speed limit — nothing travels faster`,
    ],
    template: `c = 3.0e8  # m/s\nmoon_dist = 384_400_000  # meters (384,400 km)\ntime = moon_dist / c\nprint(f"Light from Moon to Earth: {time:.2f} seconds")\nprint(f"Angle of incidence: 35°")\nprint(f"Angle of reflection: 35° (Law of reflection)")`,
    quiz: [
      q("What is the speed of light in a vacuum?", ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "343 m/s"], 1, `c = 3.0 × 10⁸ m/s ≈ 300,000 km/s.`),
      q("If θᵢ = 40°, what is θᵣ?", ["50°", "40°", "80°", "20°"], 1, `The angle of incidence equals the angle of reflection.`),
      q("The image in a plane mirror is...", ["Real and inverted", "Virtual and upright", "Virtual and inverted", "Real and upright"], 1, `Plane mirrors produce virtual, upright images.`),
    ],
  }),

  L("Refraction and Lenses", ["optics", "refraction", "lenses"], "intermediate", 12, {
    intro: `<p>Refraction is the bending of light when it passes from one medium to another. Snell's law relates the angles: <code>n₁·sin(θ₁) = n₂·sin(θ₂)</code>, where n is the refractive index. Light bends toward the normal when entering a denser medium, and away when entering a less dense medium. Lenses use refraction to focus or spread light.</p>`,
    concepts: [
      `<strong>Refraction</strong> — light changes direction at a boundary between media`,
      `<strong>Snell's law</strong> — <code>n₁·sin(θ₁) = n₂·sin(θ₂)</code>`,
      `<strong>Refractive index</strong> — n = c/v_medium; air ≈ 1.0, water ≈ 1.33, glass ≈ 1.5`,
      `<strong>Lenses</strong> — convex (converging) lenses focus light; concave (diverging) lenses spread it`,
    ],
    examples: [
      ex("Snell's law: air to water", `import math\nn1 = 1.000  # air\nn2 = 1.333  # water\ntheta1 = 30  # degrees\ntheta1_r = math.radians(theta1)\ntheta2_r = math.asin(n1 * math.sin(theta1_r) / n2)\ntheta2 = math.degrees(theta2_r)\nprint(f"Light enters water at {theta1}° to normal")\nprint(f"Bends to {theta2:.1f}° in water")`, `Light enters water at 30° to normal\nBends to 22.1° in water`),
      ex("Critical angle for total internal reflection", `import math\nn_glass = 1.5\nn_air = 1.0\ncrit = math.degrees(math.asin(n_air / n_glass))\nprint(f"Critical angle (glass → air): {crit:.1f}°")`, `Critical angle (glass → air): 41.8°`),
    ],
    realWorld: `Eyeglasses and contact lenses correct vision using refraction. Fiber optics uses total internal reflection to transmit data as light. Rainbows form by refraction in water droplets. Prisms disperse white light into colors.`,
    practice: `Light enters glass (n = 1.5) from air (n = 1.0) at 45°. Use Snell's law to find the angle of refraction.`,
    mistakes: [
      `Confusing the direction: light bends toward the normal when entering a HIGHER index medium`,
      `Using degrees when Python's math functions expect radians — convert with math.radians()`,
    ],
    best: [
      `Remember: light slows down in denser media and bends toward the normal`,
      `Total internal reflection only happens when light travels from higher to lower index`,
    ],
    template: `import math\nn1, n2 = 1.0, 1.5\nt1 = 45\nt1_r = math.radians(t1)\nt2_r = math.asin(n1 * math.sin(t1_r) / n2)\nt2 = math.degrees(t2_r)\nprint(f"Air to glass at {t1}°")\nprint(f"Refracted angle: {t2:.1f}°")`,
    quiz: [
      q("When light enters water from air, it bends...", ["Away from the normal", "Toward the normal", "It doesn't bend", "In a straight line"], 1, `Water has a higher refractive index than air, so light bends toward the normal.`),
      q("Snell's law is: n₁·sin(θ₁) = n₂·sin(θ₂). What does n represent?", ["Angle", "Speed", "Refractive index", "Wavelength"], 2, `n is the refractive index of the medium.`),
      q("A convex lens is also called...", ["Diverging", "Converging", "Reflecting", "Diffracting"], 1, `Convex lenses converge light rays to a focal point.`),
    ],
  }),

  L("Electric Charge and Fields", ["electricity", "fields", "charge"], "intermediate", 14, {
    intro: `<p>Electric charge comes in two types: positive and negative. Like charges repel, opposite charges attract. Coulomb's law gives the force between two charges: <code>F = k·|q₁·q₂| / r²</code>, where k = 8.99 × 10⁹ N·m²/C². The electric field E = F/q describes the force per unit charge at any point in space.</p>`,
    concepts: [
      `<strong>Coulomb's law</strong> — <code>F = k·|q₁·q₂| / r²</code> (force between two charges)`,
      `<strong>Electric field</strong> — <code>E = F/q = k·Q / r²</code> (field from a point charge)`,
      `<strong>Units</strong> — charge in coulombs (C), field in N/C or V/m`,
      `<strong>Conductors vs insulators</strong> — conductors (metals) allow charge to flow; insulators (rubber) do not`,
    ],
    examples: [
      ex("Coulomb's law calculation", `k = 8.99e9\nq1 = 1e-6  # 1 μC\nq2 = 2e-6  # 2 μC\nr = 0.5  # meters\nF = k * q1 * q2 / r**2\nprint(f"Charge 1: {q1*1e6:.0f} μC")\nprint(f"Charge 2: {q2*1e6:.0f} μC")\nprint(f"Distance: {r} m")\nprint(f"Force: {F:.4f} N")`, `Charge 1: 1 μC\nCharge 2: 2 μC\nDistance: 0.5 m\nForce: 0.0719 N`),
      ex("Electric field from a point charge", `k = 8.99e9\nQ = 1e-6  # 1 μC\nr = 1.0  # meter\nE = k * Q / r**2\nprint(f"Charge: {Q*1e6:.0f} μC")\nprint(f"At distance: {r} m")\nprint(f"Electric field: {E:.0f} N/C")`, `Charge: 1 μC\nAt distance: 1 m\nElectric field: 8990 N/C`),
    ],
    realWorld: `Van de Graaff generators, photocopiers, and ink-jet printers use electrostatics. Lightning is a massive electrostatic discharge. Capacitors store charge for electronics.`,
    practice: `Two charges (+3 μC and −6 μC) are 0.3 m apart. Compute the force between them (include the sign — attraction or repulsion?).`,
    mistakes: [
      `Forgetting the square in the denominator: Coulomb's law has r², not r`,
      `Not converting to consistent units — use coulombs (C), not microcoulombs, in calculations`,
    ],
    best: [
      `Like charges repel, opposite attract — the sign of the force tells you which`,
      `k = 8.99 × 10⁹ is a large constant because the coulomb is a very large unit of charge`,
    ],
    template: `k = 8.99e9\nq1 = 3e-6  # 3 μC\nq2 = -6e-6  # -6 μC\nr = 0.3\nF = k * q1 * q2 / r**2\nprint(f"Force: {F:.2f} N")\nif F < 0:\n    print("Attraction (opposite charges)")\nelse:\n    print("Repulsion (like charges)")`,
    quiz: [
      q("If you double the distance between two charges, the force...", ["Doubles", "Halves", "Quarter", "Quadruples"], 2, `Inverse square law: doubling r makes F = 1/4.`),
      q("A neutral object has...", ["Only positive charge", "Only negative charge", "Equal positive and negative", "No charge at all"], 2, `Neutral means equal amounts of positive and negative charge.`),
      q("The unit of electric charge is the...", ["Volt", "Coulomb", "Ampere", "Ohm"], 1, `Charge is measured in coulombs (C).`),
    ],
  }),

  L("Circuits and Resistance (Ohm's Law)", ["electricity", "circuits", "resistance"], "intermediate", 14, {
    intro: `<p>An electric circuit is a closed path through which charge flows. Ohm's law states <code>V = IR</code>: voltage (V) = current (I) × resistance (R). Power dissipated in a resistor is <code>P = IV = I²R = V²/R</code>. Resistors in series add: <code>Rₜ = R₁ + R₂ + ...</code>. Resistors in parallel: <code>1/Rₜ = 1/R₁ + 1/R₂ + ...</code>.</p>`,
    concepts: [
      `<strong>Ohm's law</strong> — <code>V = IR</code>: voltage = current × resistance`,
      `<strong>Power</strong> — <code>P = IV = I²R = V²/R</code> (watts)`,
      `<strong>Series resistors</strong> — <code>Rₜ = R₁ + R₂ + R₃ + ...</code>`,
      `<strong>Parallel resistors</strong> — <code>1/Rₜ = 1/R₁ + 1/R₂ + 1/R₃ + ...</code>`,
    ],
    examples: [
      ex("Ohm's law: finding current", `V = 12  # volts\nR = 8  # ohms\nI = V / R\nprint(f"Voltage: {V} V")\nprint(f"Resistance: {R} Ω")\nprint(f"Current: {I:.2f} A")\nprint(f"Power: {V * I:.1f} W")`, `Voltage: 12 V\nResistance: 8 Ω\nCurrent: 1.50 A\nPower: 18.0 W`),
      ex("Series and parallel resistance", `R1, R2, R3 = 10, 20, 30\nR_series = R1 + R2 + R3\nR_parallel = 1 / (1/R1 + 1/R2 + 1/R3)\nprint(f"Resistors: {R1}Ω, {R2}Ω, {R3}Ω")\nprint(f"Series total: {R_series}Ω")\nprint(f"Parallel total: {R_parallel:.2f}Ω")`, `Resistors: 10Ω, 20Ω, 30Ω\nSeries total: 60Ω\nParallel total: 5.45Ω`),
    ],
    realWorld: `Every electrical device follows Ohm's law. Household wiring is parallel (each outlet gets 120V). Fuses and circuit breakers protect against excess current. LED bulbs use very low power compared to incandescent.`,
    practice: `A 9V battery is connected across a 150Ω resistor. Find the current. How much power is dissipated?`,
    mistakes: [
      `Using parallel formula as Rₜ = R₁ + R₂ when they're in parallel — that's for series!`,
      `Forgetting that current is measured in amperes (A), not milliamperes, when using Ohm's law`,
    ],
    best: [
      `For parallel resistors, the total resistance is always LESS than the smallest individual resistor`,
      `Power = V × I works for any device; use the form that matches what you know`,
    ],
    template: `V = 9  # volts\nR = 150  # ohms\nI = V / R\nP = V * I\nprint(f"Voltage: {V} V")\nprint(f"Resistance: {R} Ω")\nprint(f"Current: {I*1000:.1f} mA")\nprint(f"Power: {P:.2f} W")`,
    quiz: [
      q("If voltage doubles and resistance stays constant, current...", ["Doubles", "Halves", "Quadruples", "Stays same"], 0, `I = V/R: double V doubles I.`),
      q("Two 10Ω resistors in series give...", ["5Ω", "10Ω", "20Ω", "100Ω"], 2, `Series: Rₜ = R₁ + R₂ = 10 + 10 = 20Ω.`),
      q("The unit of resistance is the...", ["Volt", "Ampere", "Ohm", "Watt"], 2, `Resistance is measured in ohms (Ω).`),
    ],
  }),

  L("Magnetic Fields", ["magnetism", "fields", "electromagnetism"], "advanced", 14, {
    intro: `<p>Moving charges create magnetic fields. A current-carrying wire produces a circular magnetic field around it. The force on a wire in a magnetic field is <code>F = BIL·sin(θ)</code>, where B is the magnetic field strength (in teslas), I is current, L is wire length, and θ is the angle between the wire and field.</p>`,
    concepts: [
      `<strong>Magnetic field (B)</strong> — measured in teslas (T); direction from north to south pole`,
      `<strong>Force on a current-carrying wire</strong> — <code>F = BIL·sin(θ)</code>`,
      `<strong>Right-hand rule</strong> — thumb = current direction, fingers curl in B-field direction`,
      `<strong>Earth's magnetic field</strong> — ~50 μT; protects us from solar wind`,
    ],
    examples: [
      ex("Force on a wire in a magnetic field", `B = 0.5  # T\nI = 3  # A\nL = 0.2  # meters\ntheta = 90  # degrees\nimport math\nF = B * I * L * math.sin(math.radians(theta))\nprint(f"Field: {B} T")\nprint(f"Current: {I} A")\nprint(f"Length: {L} m")\nprint(f"Force: {F:.2f} N")`, `Field: 0.5 T\nCurrent: 3 A\nLength: 0.2 m\nForce: 0.30 N`),
      ex("Magnetic field from a long straight wire", `mu0 = 4 * math.pi * 1e-7\nI = 10  # A\nr = 0.05  # 5 cm from wire\nB_wire = mu0 * I / (2 * math.pi * r)\nprint(f"Current: {I} A")\nprint(f"Distance from wire: {r*100:.0f} cm")\nprint(f"Field: {B_wire*1e5:.2f} × 10⁻⁵ T")`, `Current: 10 A\nDistance from wire: 5 cm\nField: 4.00 × 10⁻⁵ T`),
    ],
    realWorld: `Electric motors use magnetic fields to convert electrical energy to motion. MRI scanners use powerful magnets (1.5-3 T) for medical imaging. Maglev trains use magnetic levitation. Hard drives store data magnetically.`,
    practice: `A 0.5 m wire carries 2 A perpendicular to a 0.3 T magnetic field. Calculate the force on the wire.`,
    mistakes: [
      `Forgetting the sin(θ) factor in F = BIL·sin(θ) — maximum force when perpendicular, zero when parallel`,
      `Confusing electric and magnetic fields: E-field exerts force on any charge; B-field only on MOVING charges`,
    ],
    best: [
      `Use the right-hand rule to find the direction of force, not just the magnitude`,
      `Earth's magnetic field is surprisingly weak (~50 μT) compared to even a small bar magnet (~0.01 T)`,
    ],
    template: `import math\nB = 0.3  # T\nI = 2  # A\nL = 0.5  # m\ntheta = 90\nF = B * I * L * math.sin(math.radians(theta))\nprint(f"Field: {B} T")\nprint(f"Current: {I} A")\nprint(f"Length: {L} m")\nprint(f"Force: {F:.2f} N")`,
    quiz: [
      q("What produces a magnetic field?", ["Stationary charges", "Moving charges", "Only magnets", "Only metals"], 1, `Moving charges (electric current) produce magnetic fields.`),
      q("The unit of magnetic field is the...", ["Tesla", "Weber", "Gauss", "Ampere"], 0, `Magnetic field strength is measured in teslas (T).`),
      q("The force on a wire is maximum when the current is...", ["Parallel to B", "Perpendicular to B", "At 45° to B", "Opposite to B"], 1, `sin(90°) = 1 gives maximum force.`),
    ],
  }),

  L("Electromagnetic Induction", ["electromagnetism", "induction", "faraday"], "advanced", 14, {
    intro: `<p>Electromagnetic induction is the process of generating electricity from changing magnetic fields. Faraday's law: the induced voltage (EMF) equals the rate of change of magnetic flux: <code>ε = −N·dΦ/dt</code>. The negative sign (Lenz's law) means the induced current opposes the change that created it. This is how generators and transformers work.</p>`,
    concepts: [
      `<strong>Magnetic flux</strong> — <code>Φ = B·A·cos(θ)</code>: amount of field passing through a loop`,
      `<strong>Faraday's law</strong> — <code>ε = −N·dΦ/dt</code>: changing flux induces voltage`,
      `<strong>Lenz's law</strong> — induced current opposes the change in magnetic flux (the minus sign)`,
      `<strong>Transformers</strong> — <code>V₁/N₁ = V₂/N₂</code>: step up/down voltage using coils`,
    ],
    examples: [
      ex("Flux through a loop", `B = 0.2  # T\nA = 0.05  # m² (area)\ntheta = 0  # degrees (perpendicular)\nimport math\nflux = B * A * math.cos(math.radians(theta))\nprint(f"Field: {B} T, Area: {A} m²")\nprint(f"Angle: {theta}°")\nprint(f"Flux: {flux:.4f} Wb")`, `Field: 0.2 T, Area: 0.05 m²\nAngle: 0°\nFlux: 0.0100 Wb`),
      ex("Transformer voltage", `V1 = 120  # V (primary)\nN1 = 100  # primary turns\nN2 = 500  # secondary turns\nV2 = V1 * N2 / N1\nprint(f"Primary: {V1}V, {N1} turns")\nprint(f"Secondary: {N2} turns")\nprint(f"Output voltage: {V2}V")`, `Primary: 120V, 100 turns\nSecondary: 500 turns\nOutput voltage: 600V`),
    ],
    realWorld: `Power plants use generators (Faraday's law) to produce electricity. Transformers step voltage up for transmission (reducing I²R losses) and down for home use. Induction cooktops heat pans directly. Wireless charging pads use induction.`,
    practice: `A transformer has 200 primary turns and 20 secondary turns. If input is 240 V, what is the output voltage? Is this a step-up or step-down?`,
    mistakes: [
      `Thinking static magnetic fields induce voltage — only CHANGING magnetic fields induce EMF`,
      `Confusing the roles of primary and secondary in a transformer — power is conserved: V₁I₁ = V₂I₂`,
    ],
    best: [
      `Lenz's law is a statement of energy conservation — the induced current fights the change`,
      `More turns on the secondary = step-up (higher voltage); fewer turns = step-down`,
    ],
    template: `V1 = 240\nN1 = 200\nN2 = 20\nV2 = V1 * N2 / N1\nprint(f"Primary: {V1}V, {N1} turns")\nprint(f"Secondary: {N2} turns")\nif V2 < V1:\n    print(f"Step-down: {V2:.0f}V")\nelse:\n    print(f"Step-up: {V2:.0f}V")`,
    quiz: [
      q("What does Faraday's law describe?", ["Force between charges", "How changing magnetic fields create voltage", "Resistance in a wire", "The speed of light"], 1, `Faraday's law: changing magnetic flux induces EMF.`),
      q("A step-up transformer has...", ["More primary than secondary turns", "More secondary than primary turns", "Equal turns", "No core"], 1, `More secondary turns = higher secondary voltage.`),
      q("Lenz's law says the induced current...", ["Reinforces the change", "Opposes the change", "Is constant", "Doesn't exist"], 1, `The negative sign in Faraday's law: induced current opposes the flux change.`),
    ],
  }),

  L("Atomic Structure", ["modern-physics", "atoms", "structure"], "intermediate", 14, {
    intro: `<p>Atoms are the building blocks of matter. Each atom has a dense nucleus (protons + neutrons) surrounded by electrons in orbitals. The number of protons defines the element (e.g., hydrogen = 1, carbon = 6, uranium = 92). Niels Bohr's model placed electrons in discrete energy levels; the modern quantum model describes electron clouds (orbitals) with no exact position.</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Nucleus</strong> — contains protons (positive, ~1.67 × 10⁻²⁷ kg) and neutrons (neutral, same mass)`,
      `<strong>Electrons</strong> — negative charge, ~1/1836 the mass of a proton, in orbitals around the nucleus`,
      `<strong>Atomic number (Z)</strong> — number of protons; defines the element`,
      `<strong>Mass number (A)</strong> — protons + neutrons; isotopes have same Z, different A`,
    ],
    examples: [
      ex("Atomic mass calculation", `protons = 6\nneutrons = 6\nm_p = 1.007276  # amu\nm_n = 1.008665\nmass = protons * m_p + neutrons * m_n\nprint(f"Carbon-12: {protons}p, {neutrons}n")\nprint(f"Estimated mass: {mass:.4f} amu")`, `Carbon-12: 6p, 6n\nEstimated mass: 12.0956 amu`),
      ex("Electron energy levels", `# Energy of electron in hydrogen atom\nn = 1  # ground state\nE = -13.6 / n**2  # eV\nprint(f"n = {n}: E = {E} eV")\nfor n in [2, 3, 4]:\n    E = -13.6 / n**2\n    print(f"n = {n}: E = {E:.2f} eV")`, `n = 1: E = -13.6 eV\nn = 2: E = -3.40 eV\nn = 3: E = -1.51 eV\nn = 4: E = -0.85 eV`),
    ],
    realWorld: `Atomic structure explains everything from chemical bonding to nuclear energy. The Bohr model still helps predict spectral lines. The periodic table arranges elements by atomic number.`,
    practice: `Calculate the estimated mass of oxygen-16 (8 protons, 8 neutrons). How much does the actual mass differ (actual: 15.995 amu)? The difference is nuclear binding energy.`,
    mistakes: [
      `Confusing atomic number (protons) with mass number (protons + neutrons)`,
      `Thinking electrons orbit like planets — quantum mechanics says they exist in probability clouds`,
    ],
    best: [
      `Atomic number defines the element — change the proton count and it's a different element`,
      `Isotopes of the same element have different neutron counts (and thus different masses)`,
    ],
    template: `# Atomic Structure - Key Facts\n# - Atom: nucleus (protons + neutrons) + electron cloud\n# - Proton: +1 charge, ~1 amu\n# - Neutron: 0 charge, ~1 amu\n# - Electron: -1 charge, ~1/1836 amu\n# - Atomic number Z = proton count (defines element)\nprotons = 1\nneutrons = 0\nmass = protons * 1.007 + neutrons * 1.009\nprint(f"Hydrogen-1 ({protons}p, {neutrons}n): ~{mass:.3f} amu")`,
    quiz: [
      q("What defines an element?", ["Number of neutrons", "Number of protons", "Number of electrons", "Total mass"], 1, `Atomic number (protons) defines which element it is.`),
      q("Most of an atom's mass is in the...", ["Electron cloud", "Nucleus", "Orbitals", "Covalent bonds"], 1, `Protons and neutrons (in the nucleus) account for ~99.9% of atomic mass.`),
      q("Carbon-12 has 6 protons and 6 neutrons. Carbon-14 has...", ["6p, 8n", "8p, 6n", "14p, 0n", "6p, 14n"], 0, `14 − 6 = 8 neutrons. Same 6 protons (still carbon), more neutrons.`),
    ],
  }),

  L("Radioactivity", ["modern-physics", "radioactivity", "nuclear"], "intermediate", 12, {
    intro: `<p>Radioactivity is the spontaneous decay of unstable atomic nuclei. Three types: <strong>alpha</strong> (α — helium nucleus, blocked by paper), <strong>beta</strong> (β — electron, blocked by aluminum), <strong>gamma</strong> (γ — high-energy photon, blocked by lead). The half-life is the time for half the atoms to decay: <code>N = N₀ · (½)^(t / t₁/₂)</code>.</p>`,
    concepts: [
      `<strong>Alpha decay</strong> — emits 2p+2n (He nucleus); mass number −4, atomic number −2`,
      `<strong>Beta decay</strong> — neutron → proton + electron; atomic number +1`,
      `<strong>Gamma decay</strong> — emits high-energy photon; no change in mass or atomic number`,
      `<strong>Half-life</strong> — <code>N = N₀ · 0.5^(t / t₁/₂)</code>: exponential decay`,
    ],
    examples: [
      ex("Exponential decay (half-life)", `N0 = 100  # initial atoms\nt_half = 8  # days\nfor t in [0, 8, 16, 24, 32]:\n    N = N0 * 0.5 ** (t / t_half)\n    print(f"Day {t:2d}: {N:.1f} atoms remaining")`, `Day  0: 100.0 atoms remaining\nDay  8: 50.0 atoms remaining\nDay 16: 25.0 atoms remaining\nDay 24: 12.5 atoms remaining\nDay 32: 6.3 atoms remaining`),
      ex("How many half-lives to reach 1%?", `import math\nN_ratio = 0.01\nhalf_lives = math.log(N_ratio) / math.log(0.5)\nprint(f"To reach 1% remaining: {half_lives:.2f} half-lives")`, `To reach 1% remaining: 6.64 half-lives`),
    ],
    realWorld: `Carbon-14 dating (half-life 5730 years) determines the age of archaeological finds. Nuclear medicine uses radioactive tracers for imaging. Uranium-235 (half-life 704 million years) fuels nuclear reactors. Smoke detectors use americium-241 (α source).`,
    practice: `A sample starts with 200 mg of radioactive iodine-131 (half-life = 8 days). How much remains after 24 days? After how many days will 25 mg remain?`,
    mistakes: [
      `Adding half-lives instead of multiplying: after 3 half-lives it's ½ × ½ × ½ = ⅛, not ½ + ½ + ½`,
      `Thinking all radiation is the same — α, β, and γ have very different penetrating power and danger`,
    ],
    best: [
      `After n half-lives, fraction remaining = (½)ⁿ`,
      `Gamma radiation requires the most shielding (lead or thick concrete); alpha barely penetrates skin`,
    ],
    template: `N0 = 200  # mg\nt_half = 8  # days\nt = 24\nN = N0 * 0.5 ** (t / t_half)\nprint(f"After {t} days: {N:.1f} mg remains")\n\n# Days until 25 mg remains\nimport math\ntarget = 25\nn = math.log(target/N0) / math.log(0.5)\ndays = n * t_half\nprint(f"Will reach {target}mg after {days:.0f} days")`,
    quiz: [
      q("After 3 half-lives, what fraction remains?", ["1/3", "1/6", "1/8", "1/9"], 2, `(½)³ = ¹⁄₈.`),
      q("Which radiation is the most penetrating?", ["Alpha", "Beta", "Gamma", "Neutron"], 2, `Gamma rays require thick lead or concrete to stop.`),
      q("Alpha decay reduces the mass number by...", ["1", "2", "4", "0"], 2, `Alpha decay emits 2p+2n → mass number −4.`),
    ],
  }),

  L("Quantum Basics", ["modern-physics", "quantum", "mechanics"], "advanced", 16, {
    intro: `<p>Quantum mechanics governs the very small. Key ideas: energy is quantized (comes in discrete packets called <em>quanta</em>), particles have wave-like properties (de Broglie wavelength), and we can only know probabilities (Heisenberg's uncertainty principle). The Planck-Einstein relation: <code>E = hf</code> (energy = Planck's constant × frequency).</p>`,
    concepts: [
      `<strong>Quantization</strong> — energy, charge, and angular momentum come in discrete values`,
      `<strong>Photon energy</strong> — <code>E = hf = hc/λ</code>, where h = 6.626 × 10⁻³⁴ J·s`,
      `<strong>Wave-particle duality</strong> — light and matter have both wave and particle properties`,
      `<strong>Uncertainty principle</strong> — <code>Δx·Δp ≥ h/(4π)</code>: can't know both position and momentum precisely`,
    ],
    examples: [
      ex("Photon energy", `h = 6.626e-34\nc = 3.0e8\nlam = 500e-9  # 500 nm (green light)\nE = h * c / lam\nprint(f"Wavelength: {lam*1e9:.0f} nm")\nprint(f"Energy: {E:.2e} J")`, `Wavelength: 500 nm\nEnergy: 3.98e-19 J`),
      ex("de Broglie wavelength", `h = 6.626e-34\nm = 9.11e-31  # electron mass\nv = 1e6  # m/s\nlam = h / (m * v)\nprint(f"Electron at {v:.0e} m/s")\nprint(f"de Broglie wavelength: {lam*1e9:.2f} nm")`, `Electron at 1e+06 m/s\nde Broglie wavelength: 0.73 nm`),
    ],
    realWorld: `Lasers use quantum principles (stimulated emission). Transistors, the basis of all modern electronics, rely on quantum mechanics. LEDs emit specific colors based on band gap energy. Quantum computing exploits superposition and entanglement.`,
    practice: `Calculate the energy of a photon with wavelength 400 nm (violet light) and one with 700 nm (red). Which has more energy?`,
    mistakes: [
      `Thinking quantum effects only matter at small scales — they govern all matter, but the effects average out at macroscopic scales`,
      `Misinterpreting the uncertainty principle as a limitation of measurement — it's a fundamental property of nature`,
    ],
    best: [
      `If it emits light, it's quantum: LED, laser, fluorescent bulb, the Sun — all explained by E = hf`,
      `The uncertainty principle isn't about measurement tools — nature fundamentally has no exact values for both position and momentum simultaneously`,
    ],
    template: `h = 6.626e-34\nc = 3.0e8\nfor lam_nm in [400, 500, 600, 700]:\n    lam = lam_nm * 1e-9\n    E = h * c / lam\n    print(f"{lam_nm} nm: E = {E:.3e} J")`,
    quiz: [
      q("What is E = hf used for?", ["Nuclear binding", "Photon energy", "Atomic mass", "Gravity"], 1, `Planck-Einstein: photon energy = Planck's constant × frequency.`),
      q("Which is NOT a quantum phenomenon?", ["Photoelectric effect", "Orbital motion of planets", "Discrete atomic spectra", "Laser operation"], 1, `Planetary motion is classical; the others require quantum mechanics.`),
      q("Wave-particle duality means...", ["Waves are particles", "Everything has both wave and particle properties", "Light is only a wave", "Electrons are only particles"], 1, `Both light and matter exhibit wave and particle behaviors depending on the experiment.`),
    ],
  }),

  L("Relativity Introduction", ["modern-physics", "relativity", "einstein"], "advanced", 14, {
    intro: `<p>Einstein's theory of relativity changed how we understand space, time, and gravity. Special relativity (1905) says the speed of light is constant for all observers, leading to time dilation (<code>t' = t / √(1 − v²/c²)</code>), length contraction, and mass-energy equivalence (<code>E = mc²</code>). General relativity (1915) describes gravity as curvature of spacetime.</p>`,
    concepts: [
      `<strong>Speed of light constant</strong> — c = 3 × 10⁸ m/s for all observers, regardless of relative motion`,
      `<strong>Time dilation</strong> — moving clocks tick slower: <code>t' = t / √(1 − v²/c²)</code>`,
      `<strong>Mass-energy equivalence</strong> — <code>E = mc²</code>: mass can be converted to energy`,
      `<strong>Spacetime</strong> — gravity is the curvature of spacetime by mass and energy`,
    ],
    examples: [
      ex("Time dilation at high speed", `c = 3.0e8\nv = 0.5 * c  # half light speed\nt = 10  # years on Earth\ngamma = 1 / (1 - v**2/c**2)**0.5\nt_travel = t / gamma\nprint(f"Speed: {v/c:.0%} of light")\nprint(f"Earth time: {t} years")\nprint(f"Ship time: {t_travel:.1f} years")`, `Speed: 50% of light\nEarth time: 10 years\nShip time: 8.7 years`),
      ex("E = mc² — energy in matter", `c = 3.0e8\nm = 0.001  # 1 gram\nE = m * c**2\nprint(f"Mass: {m} kg (1 gram)")\nprint(f"Energy: {E:.2e} J")\nprint(f"TNT equivalent: {E / 4.184e9:.0f} tons")`, `Mass: 0.001 kg (1 gram)\nEnergy: 9.00e13 J\nTNT equivalent: 21504 tons`),
    ],
    realWorld: `GPS satellites must account for relativity (time dilation + gravity effects) — without corrections, GPS would drift 10 km per day. Nuclear power converts mass to energy (E = mc²). Particle accelerators routinely confirm relativistic effects.`,
    practice: `If a spaceship travels at 90% of light speed (v = 0.9c), what is the gamma factor? How much does 1 kg of fuel release as energy when converted?`,
    mistakes: [
      `Thinking relativity only applies at extreme speeds — GPS proves it matters at everyday speeds too`,
      `Confusing special relativity (no gravity, constant velocity) with general relativity (includes gravity and acceleration)`,
    ],
    best: [
      `Nothing with mass can reach the speed of light — energy requirements become infinite`,
      `Relativity doesn't mean "everything is relative" — the speed of light is absolute`,
    ],
    template: `c = 3.0e8\nv = 0.9 * c\ngamma = 1 / (1 - v**2/c**2)**0.5\nprint(f"At 90% of light speed:")\nprint(f"Gamma factor: {gamma:.2f}")\nprint(f"Time dilation: for every 1 year on Earth,")\nprint(f"only {1/gamma:.2f} years pass on the ship")\n\nm = 1  # kg\nE = m * c**2\nprint(f"\\nE = mc² for {m}kg: {E:.2e} J")`,
    quiz: [
      q("In special relativity, which is constant for all observers?", ["Time", "Speed of light", "Mass", "Energy"], 1, `The speed of light in a vacuum (c) is the same for all inertial observers.`),
      q("E = mc² shows that...", ["Energy and mass are equivalent", "Energy = mass × speed", "c is variable", "Mass cannot change"], 0, `Mass and energy are interchangeable. Small mass = huge energy.`),
      q("Time dilation means a moving clock...", ["Runs faster", "Runs slower", "Stops", "Runs at same rate"], 1, `Moving clocks tick slower relative to stationary observers.`),
    ],
  }),
];
