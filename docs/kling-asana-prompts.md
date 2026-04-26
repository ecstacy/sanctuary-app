# Asana Animation Prompts — Entry → Hold → Exit loops

Short looping reference animations for each asana in The Sanctuary. Users with a visual-learning preference watch these in-app to **learn how to enter the pose** and **practice alongside**.

## What we're generating

One clip per pose, **5 seconds total**, structured as:

- **0 – 2s:** entry — from Tadasana (frame 1) into the pose
- **2 – 3s:** peak hold (~1 breath)
- **3 – 5s:** exit — back to Tadasana (final frame)

Because frame 1 and the final frame are both Tadasana, the clip loops seamlessly. Every repeat, the user sees the entry again — so a visual learner practicing alongside gets a fresh demonstration of the mechanics each loop. If they want to study the peak, they pause or re-watch.

Two exceptions:

- **Tadasana itself** — no entry needed. It's a 5s still hold of Mountain Pose with breath.
- **Surya Namaskar (Sun Salutation)** — already a flowing sequence, start=end=Tadasana by nature. 10s, full flow.

---

## Why the two-stage workflow

Pure text-to-video lets Kling drift — especially at the peak pose (seated twists, pigeon, supine twists). The peak is the one moment that *must* be correct, since it's the moment the user is trying to learn.

Fix: **anchor the peak with an image.** Kling's advanced modes accept keyframes — start, end, and optionally a mid-point reference. We give it a correct Tadasana as start and end, and a correct peak-pose image as the mid-reference. Kling then animates plausible transitions between the three fixed points.

If Kling's keyframe features aren't available in your tier, fall back to **Image-to-Video mode with Tadasana as the start frame** plus a detailed motion prompt. The peak pose image still earns its keep — you compare the generated peak against it and regenerate if it's wrong.

### Why a text-to-image tool alone won't work for 17 images

Every new prompt re-rolls the subject and setting from scratch, so across 17 generations the outfit shade shifts, the face changes, the studio rearranges. The prompt can't carry memory between generations.

**Solution: generate Tadasana once, then use Google's Nano Banana (Gemini 2.5 Flash Image) to *edit* that Tadasana into each of the other 16 peak poses.** Nano Banana is built for "same subject, same scene, change X" edits. The reference image carries the person, clothing, studio, lighting and framing forward automatically — you only have to describe the new pose mechanics.

### Workflow

1. **Stage 1a — Generate canonical Tadasana once** in Stitch (or Imagen / Flux / Midjourney — whichever gives you the best-looking single image). This is the one shot where you design the woman, wardrobe, studio and camera from scratch. Save it.
2. **Stage 1b — Edit that Tadasana into 16 peak poses in Nano Banana.** Upload the Tadasana, paste the preserve block below + the per-asana pose-mechanics prompt. Nano Banana returns the same woman in the same room in the new pose. Save each output as `{poseKey}-peak.jpg`.
3. **Stage 2 — Kling:**
   - Upload Tadasana as the start frame.
   - If Kling offers an end-frame field: upload Tadasana again there (ensures loop-close).
   - If Kling offers a mid-reference or keyframe field: upload the peak-pose image there.
   - Paste the motion prompt for that asana.
   - Render. Compare the peak moment against the peak image. Regenerate if it's wrong.

---

## Technical spec

| Stage | Setting | Value |
|---|---|---|
| **Image — Tadasana** | Tool | Stitch / Imagen / Flux / Midjourney |
| | Aspect ratio | 1:1 square |
| | Resolution | 1024×1024 minimum |
| | Format | PNG or high-quality JPG |
| **Image — 16 peak edits** | Tool | Nano Banana (Gemini 2.5 Flash Image) |
| | Input | Canonical Tadasana image + preserve block + pose-mechanics prompt |
| | Output | Same woman, same studio, new pose |
| **Kling** | Mode | Image-to-Video with start frame (+ end frame and mid-reference if available) |
| | Duration | **5s** for all asanas (Tadasana: 5s still hold · Sun Salutation: 5s compressed flow) |
| | Motion level | Medium (entry + hold + exit needs real motion) |
| | Camera | Static — no pan, no zoom |
| | Loop | Implicit because start frame = end frame = Tadasana |
| | Output | MP4, 720×720+, under 4 MB |

**Delivery:** `{poseKey}.mp4` → `/public/poses/` → entry in `POSE_VIDEOS` in `src/components/PoseFigure.jsx`.

---

## Shared style block — paste at the top of the Tadasana prompt only

Used once, for generating the canonical Tadasana. For the 16 peak-pose edits you'll use the Nano Banana preserve block further down instead — Nano Banana carries the style forward from the uploaded reference.

```
Photoreal cinematic still, square 1:1 composition.

Subject: One woman, early 30s, light skin, blonde hair pulled back in a low ponytail, calm neutral expression, barefoot. Athletic, toned build. No jewelry, no makeup, no smile.

Wardrobe: Charcoal grey racerback sports bra and matching high-waist full-length leggings. Plain fabric, no logos, no text, no patterns.

Setting: Bright airy yoga studio. White walls, pale wood floor. Two tall windows with sheer white curtains softly diffusing warm daylight. A low wooden bench along the back wall holds three small potted green plants. A round woven jute rug on the floor. A sage-green yoga mat running front-to-back.

Lighting: Soft natural daylight from camera-left windows. Gentle ambient fill. No harsh shadows. Warm white balance.

Style: Photoreal, calm, cinematic, slightly filmic grain. Shallow depth of field focusing on the subject. No text overlays, no captions, no watermarks, no logos.

Negative: no other people, no clutter, no jewelry, no shoes, no tattoos, no makeup, no glasses, no phones, no props besides the mat and the bench plants, no text, no watermarks, no warped anatomy, no extra limbs, no missing fingers, no misaligned joints.
```

---

## Canonical Tadasana start frame — generate once, reuse everywhere

This is the start (and, wherever possible, the end) frame for all 17 asanas. Generate it once, save it, upload it to Kling every time.

**📸 Tadasana start-frame image prompt (append to shared style block):**

```
She stands tall at the front-center of the yoga mat, facing the camera head-on. Feet together, big toes touching, heels slightly apart. Legs straight and engaged. Pelvis neutral. Spine long. Crown of the head reaching up. Shoulders relaxed, rolled down and back. Arms hang naturally by her sides, palms facing the thighs, fingers softly active. Chest open. Gaze soft and forward, calm neutral expression. Camera at eye-level, framing her full body head-to-toe — a small amount of headroom above, a small amount of mat visible below. Enough negative space around her on all sides to accommodate wide stances, overhead arm reaches, forward folds and step-backs in subsequent clips from this same framing.
```

Keep this image. Upload it to Kling as the start frame of every non-Tadasana, non-Sun-Salutation clip. Also upload it to Nano Banana as the reference for every peak-pose edit.

---

## Nano Banana preserve block — paste above every peak-pose edit prompt

Attach the canonical Tadasana image, then prompt:

```
Using the attached reference image, keep every element of the scene identical — the same woman (same face, same blonde low ponytail, same neutral expression, same athletic build, same light skin tone), the same charcoal grey racerback sports bra and matching charcoal grey full-length leggings, the same bright airy yoga studio with white walls, pale wood floor, two tall windows with sheer white curtains, the low wooden bench with three potted green plants along the back wall, the round woven jute rug, and the sage-green yoga mat. Preserve the soft natural daylight from camera-left, the shallow depth of field, the photoreal cinematic style with slight filmic grain, the warm white balance, and the square 1:1 composition framed at eye-level with her full body in frame.

Do not add or change any clothing, jewelry, props, people, text, or watermarks. Do not warp anatomy. Do not change the studio or lighting.

Change only her body pose to the following:
```

Then append the per-asana pose-mechanics block below.

---

## Per-asana prompts

For each asana:

- **📸 Peak-pose mechanics (Nano Banana edit)** — append this to the preserve block above. Describes *only* the new body position. Nano Banana returns the same woman in the same studio in this new pose. Save the output as `{poseKey}-peak.jpg` for Kling's mid-reference.
- **🎬 Kling motion prompt** — describes the 5-second entry → hold → exit sequence. Paste this as the Kling prompt alongside the uploaded images.

---

### 1. Tadasana — Mountain Pose  *(no entry needed)*
**Pose key:** `tadasana` · **Duration:** 5s

This is a special case. There's no meaningful entry to Mountain Pose — standing *is* Mountain Pose. Use the **canonical Tadasana image** as the Kling I2V input with a hold-only motion prompt.

**🎬 Kling motion prompt:**
```
The subject holds this exact position for the full 5 seconds. The only motion is slow, subtle breath — a single full breath cycle, visible as gentle rise and fall of the chest and belly. No change in body position. Static camera. Seamless loop — final frame identical to the first.
```

---

### 2. Virabhadrasana I — Warrior I
**Pose key:** `warrior1` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Warrior I — a deep forward lunge, body facing the camera head-on. Right foot at the front of the mat pointing straight forward; left foot at the back of the mat planted flat and turned out about 45 degrees, feet about 3.5 feet apart along the length of the mat. Right knee bent deeply so the right thigh is parallel to the floor, right knee stacked directly over the right ankle in a clear 90-degree angle. Left leg completely straight, back heel pressing down. Both hip points face forward, square to the front of the mat. Spine long and upright. Both arms reach straight up overhead, biceps by the ears, arms parallel, palms facing each other. Chin level, gaze forward and slightly up.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot straight back about 3.5 feet, turns the back foot out 45 degrees, squares her hips forward, bends her right knee deeply into a lunge with the right thigh parallel to the floor and knee over ankle, and sweeps both arms straight up overhead with biceps by the ears — arriving at the peak-pose around second 2 (matching the reference peak image). She holds steady for about 1 breath (seconds 2 to 3). Then she reverses: lowers the arms, straightens the right leg, steps the left foot forward to meet the right, and returns to Tadasana. Final frame matches frame 1 exactly. Smooth, breath-linked motion. Static camera.
```

---

### 3. Virabhadrasana II — Warrior II
**Pose key:** `warrior2` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Warrior II. Wide stance along the length of the mat, body turned in profile to face camera-left. Right foot at the left end of the mat pointing left; right knee bent to 90 degrees, thigh parallel to the floor, knee stacked over ankle. Left leg extends straight to the right side of the frame, left foot parallel to the back of the mat. Hips open and square to the camera. Both arms extend horizontally out to the sides at shoulder height, parallel to the floor, palms down, fingers active. Head turned to face camera-left, gaze over the front (left) middle finger. Full T-shape wingspan visible in frame.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot out to the side about 3.5 feet into a wide stance along the mat, turns the left foot parallel to the back of the mat, turns her body to face camera-left in profile, extends both arms out to the sides at shoulder height with palms down, bends her right knee to 90 degrees with the thigh parallel to the floor, and turns her head to gaze over her front (left) middle finger — arriving at the peak around second 2 (matching the reference peak image). She holds for 1 breath (seconds 2 to 3). Then she reverses: straightens the right leg, lowers the arms, steps the left foot back to the right foot, turns to face camera, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 4. Vrksasana — Tree Pose
**Pose key:** `tree` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Tree Pose, standing on the mat facing the camera head-on, balancing on her left leg (left leg straight and strong, left foot firmly planted). The right knee bends and opens out to the right side, and the sole of the right foot is placed flat against the inside of the left thigh above the knee. Hips square to the camera. Spine long and tall. Palms pressed together in prayer (anjali mudra) at the center of the chest, thumbs lightly touching the sternum. Gaze soft and steady forward.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: shifts her weight onto her LEFT leg, lifts her right foot off the floor, bends her right knee and opens it out to the right, placing the sole of her right foot flat against the inside of her left thigh above the knee, and brings her palms together in prayer at the center of her chest — arriving at the peak around second 2 (matching the reference peak image). She holds steady balancing for 1 breath (seconds 2 to 3) with tiny natural balance micro-adjustments at the standing ankle. Then she reverses: releases her hands down, slides her right foot down the inner left leg and plants it back on the mat, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 5. Sukhasana — Easy Seated Pose  *(hold-only, no entry)*
**Pose key:** `sukhasana` · **Duration:** 5s

Special case, like Tadasana. The transition from standing to seated crossed-legs involves ankle folding that Kling renders unrealistically (limbs phase through each other, legs bend the wrong way). The pose itself is calm and instructional without a transition, so we use the Sukhasana peak image as both the Kling start AND end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting cross-legged in Sukhasana (Easy Seated Pose) on the center of the mat, facing the camera. Shins comfortably crossed, each foot tucked loosely under the opposite knee. Spine tall and long. Shoulders relaxed and rolled back. Hands rest on the knees, palms facing up, thumb and index finger lightly touching in gyan mudra. Chin parallel to the floor. Eyes softly closed, face serene.
```

**🎬 Kling motion prompt:**  *(upload the Sukhasana peak image as the start frame — and end frame, if Kling supports it — instead of Tadasana)*
```
The subject holds this exact seated position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the chest and belly with a small settling of the shoulders on the exhale. No change in body position, no change in hand position, no limb movement. Eyes remain softly closed. Static camera. Seamless loop — final frame identical to the first.
```

---

### 6. Ardha Matsyendrasana — Seated Spinal Twist
**Pose key:** `seatedTwist` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on the mat in Ardha Matsyendrasana (Half Lord of the Fishes seated spinal twist), body seen from a front-three-quarter angle from her right side. Her left leg is bent and tucked in close — left heel on the mat near her right hip, outside of the left shin on the mat, left knee pointing forward. Her right leg is bent and crossed over the left — sole of the right foot flat on the mat on the OUTSIDE of the left knee, right knee pointing up toward the ceiling. Torso rotated to the right in a clear spinal twist. Left elbow hooked over the outside of the raised right knee, pressing gently against it; left forearm vertical, left hand active with fingers pointing up. Right hand planted on the mat behind her right hip, fingertips pointing away, arm straight, propping her spine upright. Spine long and tall. Head turned to look over the right shoulder. Shoulders level. If the reference camera angle needs to shift slightly to a front-three-quarter view from her right, that is acceptable — keep the studio and everything else identical.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: lowers herself to sit on the mat, tucks her left heel in close to her right hip, crosses her right foot OVER the left leg and plants the right sole flat on the mat on the outside of the left knee (right knee pointing up), plants her right hand on the mat behind her right hip to prop her spine tall, hooks her left elbow over the OUTSIDE of the raised right knee, rotates her torso to the right and turns her head to look over her right shoulder — arriving at the peak twist around second 2.5 (matching the reference peak image closely). She holds the twist for 1 breath (seconds 2.5 to 3.5). Then she reverses: unhooks the elbow, unwinds back to center, uncrosses the legs, stands up, returns to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 7. Uttanasana — Standing Forward Fold
**Pose key:** `uttanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Uttanasana (Standing Forward Fold), standing at the front of the mat with feet hip-width apart and parallel, body facing the camera. Torso folded forward and down from the hip crease, spine long rather than rounded, crown of the head pointing toward the floor. Knees softly micro-bent. Palms rest flat on the mat beside the outsides of the feet, arms straight down. Neck relaxed, head hangs heavy.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her feet hip-width apart, inhales as she sweeps both arms out and up overhead, exhales as she hinges at the hip crease and swan-dives her torso forward and down, bringing both palms to the mat beside the outsides of her feet with knees softly micro-bent, letting her neck relax and head hang heavy — arriving at the forward fold peak around second 2 (matching the reference peak image). She holds for 1 breath (seconds 2 to 3). Then she reverses: bends her knees slightly, rolls up to standing one vertebra at a time, steps her feet back together, returns to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 8. Paschimottanasana — Seated Forward Bend
**Pose key:** `paschimottanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Paschimottanasana (Seated Forward Bend) on the mat, seen in profile from her right side. She sits with both legs extended straight forward, feet flexed with toes pointing up and heels together. Torso folds forward over the legs from the hip crease with a long spine. Both hands reach forward and gently hold the outer edges of the feet; elbows softly bent. Neck long, head following the line of the spine. If the reference camera angle needs to shift slightly to a low eye-level profile from her right side to capture the full horizontal length of the fold, that is acceptable — keep the studio and everything else identical.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1) facing forward, she: lowers to sit on the mat with both legs extended straight forward, feet flexed with toes pointing up, inhales and lengthens her spine, exhales as she hinges at the hip crease and folds her torso forward over her legs, reaching both hands forward to hold the outer edges of her feet with elbows softly bending — arriving at the seated fold peak around second 2.5 (matching the reference peak image). She holds for 1 breath (seconds 2.5 to 3.5). Then she reverses: rises back up with a long spine, releases her legs, stands back up, returns to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 9. Balasana — Child's Pose
**Pose key:** `balasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Balasana (Child's Pose) on the mat. She kneels with big toes touching and knees wide apart, hips settled back on her heels. Torso folded forward and resting down between her thighs; forehead resting lightly on the mat. Both arms extend long forward on the mat, palms down, fingers softly active. Shoulders relaxed away from the ears. If the reference camera needs to tilt slightly to a front-three-quarter angle at low eye-level to show the fold cleanly, that is acceptable — keep the studio and everything else identical.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: lowers to kneeling with big toes touching behind her and knees wide apart, settles her hips back onto her heels, folds her torso forward between her thighs, extends both arms long forward on the mat with palms down, and rests her forehead gently on the mat — arriving at the peak Child's Pose around second 2 (matching the reference peak image). She holds the fold for 1 breath (seconds 2 to 3). Then she reverses: walks her hands back toward her knees, rises to kneeling, stands back up, returns to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 10. Supta Matsyendrasana — Supine Spinal Twist  *(two-frame, entry animates)*
**Pose key:** `supinetwist` · **Duration:** 5s

Unlike the other lying-down poses, the supine twist's teaching moment IS the entry — the knee dropping across the body. Kling handles this cleanly because the torso stays flat on the mat; only one leg rotates. We shoot it **top-down** (camera on the ceiling looking straight down) so both the T-shape of the arms and the diagonal of the crossing leg are visible at a glance.

Generate **two** Nano Banana images — one "start" (lying flat), one "twist" — then use both as Kling's start and end frames.

**Why the LLM keeps getting the twist wrong:** body-relative words like "right arm" and "left knee" get mirrored. Use image-frame directions instead ("RIGHT edge of the frame", "LEFT side of the image") to anchor the opposition.

**📸 Start-position image (Nano Banana edit) — save as `supinetwist-start.jpg`:**
```
Supta Matsyendrasana — starting position. Top-down bird's-eye view: camera mounted on the ceiling looking straight down at the mat. The sage-green yoga mat runs horizontally across the frame — mat's short edges at the LEFT and RIGHT edges of the image, mat's long edges at the TOP and BOTTOM of the image.

She lies flat on her back, centered on the mat. Her head points toward the LEFT edge of the image, her feet point toward the RIGHT edge. Both legs extended completely straight along the length of the mat, feet relaxed, toes pointing to the RIGHT edge. Both arms extended straight out to the sides at shoulder height, forming a clean T-shape: her right hand reaches toward the TOP edge of the image, her left hand reaches toward the BOTTOM edge. Both palms face up toward the ceiling camera. Both shoulder blades flat on the mat. Eyes softly closed. Body completely symmetrical, no twist.

Shift the reference camera to this top-down bird's-eye angle. Keep the woman, outfit, studio floor, and mat surface identical to the reference. Keep the square 1:1 composition.
```

**📸 Twist-position image (Nano Banana edit) — save as `supinetwist-peak.jpg`:**
```
Supta Matsyendrasana — peak twist. Same top-down bird's-eye framing as the start image (camera on the ceiling, mat horizontal across the frame, head at LEFT edge, feet at RIGHT edge).

She still lies on her back, head at the LEFT edge of the image, but now the right leg has lifted and crossed toward the BOTTOM of the image: the right knee is bent about 90 degrees and has dropped all the way down to rest on the mat on the BOTTOM side of her body, so the bent right leg forms a clear diagonal across her torso pointing to the bottom-left of the image. The left leg stays completely straight and extended along the mat toward the RIGHT edge.

Her right arm stays extended straight out to the TOP edge of the image at shoulder height, palm up, shoulder blade pressed flat on the mat — this is the critical opposition: right arm reaches UP in the image while right knee drops DOWN in the image. Her left hand comes in to rest lightly on top of the bent right knee, guiding it down. Her head turns to face the TOP edge of the image, gaze following the extended right arm. Eyes softly closed. Both shoulder blades must stay flat on the mat despite the twist.

Absolute rule: the right arm and the right knee must point to OPPOSITE sides of the image (arm to TOP, knee to BOTTOM). The diagonal of the bent right leg across the torso is what makes this a spinal twist — if both arm and knee are on the same side of the image, the image is wrong.

Shift the reference camera to this top-down bird's-eye angle. Keep the woman, outfit, studio floor, and mat surface identical to the reference. Keep the square 1:1 composition.
```

**🎬 Kling motion prompt:**  *(upload `supinetwist-start.jpg` as the start frame and `supinetwist-peak.jpg` as the end frame — not Tadasana)*
```
Top-down ceiling view. Over 5 seconds, the subject transitions smoothly from frame 1 (lying flat on her back with arms in a T-shape and both legs extended) to the final frame (same position but with her right knee bent and dropped across her body to the bottom side, her left hand resting on the right knee, her head turned toward her extended right arm). The motion: her right knee bends, lifts slightly, and rotates across her body to drop down onto the mat on the bottom side of the image; simultaneously her head turns to face the top edge and her left hand comes in to rest on the right knee. Both shoulder blades stay flat on the mat throughout — the shoulders do not lift or rotate. The right arm stays extended out to the top edge, palm up, the entire time. Smooth, breath-paced motion. No camera movement — the ceiling view is completely static.
```

---

### 11. Savasana — Corpse Pose  *(hold-only, no entry)*
**Pose key:** `savasana` · **Duration:** 5s

Lying-down transitions render poorly in Kling. Use the peak image as start/end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Savasana (Corpse Pose), lying flat on her back centered on the mat. Head toward the back of the mat, feet pointing toward the camera. Legs extended straight and completely relaxed, feet falling naturally outward. Arms rest on the mat alongside the body about 6 inches away from the torso, palms up, fingers softly curled. Shoulders melted down. Eyes gently closed, face at rest. Shift the reference camera to an elevated position at the foot end of the mat — about 3 feet off the floor, angled downward about 30 degrees — while keeping the studio, mat, and everything else identical.
```

**🎬 Kling motion prompt:**  *(upload the Savasana peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact Corpse Pose position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the chest and belly. No change in limb position, feet remain fallen naturally outward, arms remain palms up alongside the body, shoulders stay melted down. Eyes remain softly closed, face at rest. Static camera. Seamless loop — final frame identical to the first.
```

---

### 12. Bhujangasana — Cobra Pose  *(hold-only, no entry)*
**Pose key:** `cobra` · **Duration:** 5s

Lowering to prone renders poorly in Kling. Use the peak image as start/end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Bhujangasana (low Cobra Pose). Lying prone on the mat, body running along the length of the mat. Hips, thighs, knees and tops of the feet press down into the mat — pubic bone anchored. Hands placed on the mat directly under her shoulders, elbows bent and hugging the ribs. Chest lifted up and slightly forward off the mat in a gentle backbend from the upper back. Shoulders rolled down and back, chest broad. Neck long, head a natural extension of the spine, gaze forward and slightly up. Shift the reference camera to a low eye-level profile from her right side — while keeping the studio, mat, and everything else identical.
```

**🎬 Kling motion prompt:**  *(upload the Cobra peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact low Cobra position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as the chest broadening gently on the inhale and softening a touch on the exhale while the backbend shape is maintained. Hips, thighs, knees and tops of the feet stay anchored to the mat. No change in hand placement, no change in elbow position, no increase or decrease in the backbend. Gaze remains forward and slightly up. Static camera. Seamless loop — final frame identical to the first.
```

---

### 13. Setu Bandhasana — Bridge Pose  *(hold-only, no entry)*
**Pose key:** `bridge` · **Duration:** 5s

Lying down and lifting the hips renders poorly in Kling. Use the peak image as start/end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Setu Bandhasana (Bridge Pose). Lying on her back with body along the length of the mat. Feet planted flat, hip-width apart and parallel, heels drawn in close to her glutes. Knees bent and stacked directly over the ankles, pointing up to the ceiling. Hips lifted HIGH — a continuous straight diagonal line from knees through hips through shoulders. Shoulders pressed down into the mat. Arms straight alongside the body on the mat, palms pressing down. Chest open. Chin slightly tucked away from chest. Shift the reference camera to a low eye-level profile from her right side — while keeping the studio, mat, and everything else identical.
```

**🎬 Kling motion prompt:**  *(upload the Bridge peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact Bridge Pose position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as the chest broadening gently on the inhale while the hips stay lifted HIGH. No drop in hip height, no change in foot placement, no change in arm position, no change in knee position. Shoulders stay pressed into the mat, chin stays slightly tucked. Static camera. Seamless loop — final frame identical to the first.
```

---

### 14. Eka Pada Rajakapotasana — Pigeon Pose (resting)  *(hold-only, no entry)*
**Pose key:** `pigeon` · **Duration:** 5s · **Level:** Intermediate

The entry (all-fours → folding the front leg → sliding back leg) renders poorly in Kling. Use the peak image as start/end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Eka Pada Rajakapotasana — resting Pigeon Pose (low variation). Her head points toward the left edge of the frame, her back left leg extends toward the right edge. Right leg bent and folded in front of her body on the mat — right shin at a gentle diagonal, right foot near her left hip, right knee out toward the front-right, outer edge of the right shin and ankle on the mat. Left leg extends completely straight behind her along the mat, top of the foot, shin and thigh flat on the mat. Hips square, both hip points aiming forward. Torso folded forward over the front shin. Forearms stacked on the mat in front of her, forehead resting on the top forearm. Face calm, eyes softly closed. Shift the reference camera to a low eye-level profile from her right side — while keeping the studio, mat, and everything else identical.
```

**🎬 Kling motion prompt:**  *(upload the Pigeon peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact resting Pigeon position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the back ribs as she breathes into the fold. Forehead stays resting on the top forearm, forearms stay stacked on the mat, hips stay square, both legs stay exactly in place. Eyes remain softly closed. Static camera. Seamless loop — final frame identical to the first.
```

---

### 15. Surya Namaskar — Sun Salutation
**Pose key:** `suryaNamaskar` · **Duration:** 10s

The Sun Salutation is already an entry-hold-exit flow by nature. No separate peak image — upload the canonical Tadasana as both start and end frame.

**🎬 Kling motion prompt:**
```
Over 10 seconds, starting from Tadasana (frame 1) with palms in prayer at the heart, she performs one complete Sun Salutation A flow: inhale and sweep both arms out and up overhead into upward salute with a small backbend; exhale and swan-dive forward into a standing forward fold with palms on the mat; inhale to a half-lift with fingertips on the shins, spine long; exhale and step back to plank then lower down to a low push-up with elbows hugging the ribs; inhale, roll over the toes to upward-facing dog with chest open and thighs lifted; exhale and press back to downward-facing dog, inverted V-shape; inhale and step forward to a half-lift; exhale and fold forward; inhale and rise all the way up sweeping the arms overhead; exhale and return palms to prayer at the heart — Tadasana. Smooth, continuous, unhurried, breath-linked. No cuts, no speed ramps. Static camera. Final frame identical to frame 1.
```

---

### 16. Adho Mukha Svanasana — Downward-Facing Dog  *(hold-only, no entry)*
**Pose key:** `downwardDog` · **Duration:** 5s

Folding forward and stepping into the inverted V renders poorly in Kling. Use the peak image as start/end frame and animate only breath.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Adho Mukha Svanasana (Downward-Facing Dog), body in profile — facing camera-left so her head points toward the left edge of the frame and her feet are at the right edge. Clean inverted V-shape. Hands planted firmly at the front of the mat, shoulder-width, fingers spread wide, middle fingers pointing forward. Arms straight, inner elbows rotating to face forward, shoulders pulled away from the ears. Hips lifted HIGH up and back — the highest point of the body. Back long and flat, one straight diagonal from wrists to tailbone. Legs hip-width apart, feet parallel at the back of the mat, heels reaching down toward the mat. Head hangs softly as a natural extension of the spine, crown pointing toward the mat. Shift the reference camera to a low eye-level profile from her left side — while keeping the studio, mat, and everything else identical.
```

**🎬 Kling motion prompt:**  *(upload the Downward Dog peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact Downward-Facing Dog position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the back ribs. Hands stay planted at the front of the mat, feet stay parallel at the back, hips stay lifted HIGH, arms and legs stay straight, the inverted V-shape stays clean. Head hangs relaxed between the arms throughout. Static camera. Seamless loop — final frame identical to the first.
```

---

### 17. Viparita Karani — Legs Up the Wall  *(hold-only, no entry)*
**Pose key:** `legUpWall` · **Duration:** 5s

The sit-swing-rotate entry renders poorly in Kling. Use the peak image as start/end frame and animate only breath.

Setting variation for this clip: the mat is placed perpendicular to and pushed against the base of a plain light-colored wall; the plant bench is not in frame.

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Viparita Karani (Legs Up the Wall). SETTING VARIATION for this single pose: the mat is now placed perpendicular to and pushed against the base of a plain light-colored wall; the plant bench is out of frame. Keep the same woman, outfit, pale wood floor, soft daylight, and overall style from the reference.

Torso lies flat on the mat perpendicular to the wall; glutes within a few inches of the base of the wall. Legs extend completely straight UP the wall, vertical — backs of the legs, calves and heels against the wall. Legs together or slightly apart, feet relaxed. Upper body flat on the mat extending away from the wall. Arms rest on the mat alongside the body, palms up, fingers softly curled. Shoulders grounded. Eyes softly closed. Shift the camera to a low eye-level view from her left side — framing the L-shape of her body with the 90-degree angle at the hips as the hero.
```

**🎬 Kling motion prompt:**  *(upload the Legs-Up-the-Wall peak image as the start frame — and end frame, if supported — instead of Tadasana)*
```
The subject holds this exact Legs Up the Wall position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the chest and belly. Legs stay completely vertical against the wall, heels stay touching the wall, torso stays flat on the mat perpendicular to the wall. No change in arm position — arms stay palms up alongside the body. Shoulders stay grounded, eyes stay softly closed. Static camera. Seamless loop — final frame identical to the first.
```

---

## QA checklist before adding a clip to the app

**Image stage:**
- [ ] Canonical Tadasana generated once, saved, reused as the Nano Banana reference for every peak edit and as frame 1 (+ end frame where supported) for every Kling clip
- [ ] Each peak image was produced by Nano Banana *editing* the Tadasana — not a fresh text-to-image generation
- [ ] Face, hair, body type match the Tadasana exactly across all 16 peak images
- [ ] Outfit still charcoal grey sports bra + leggings, no shade drift, no new logos or seams introduced
- [ ] Studio still matches — pale wood floor, sage-green mat, sheer-curtained windows, plant bench (except the Legs-Up-the-Wall variant)
- [ ] Peak-pose anatomy is correct — check knee tracking, hip alignment, no warped fingers, no extra limbs
- [ ] If Nano Banana changed the outfit, face, or studio, regenerate with a stronger preserve preamble or try a smaller-change prompt

**Kling stage:**
- [ ] Clip is 5s (10s for Sun Salutation only)
- [ ] Frame 1 shows Tadasana
- [ ] Peak pose hit around seconds 2–2.5 and held for about 1 breath
- [ ] Final frame returns to Tadasana — matches frame 1 visually
- [ ] Clip loops seamlessly (play it twice in a row, no visible jump)
- [ ] Peak pose is anatomically correct — compare to the peak-pose image
- [ ] No pan, no zoom, no speed ramps, no text overlays
- [ ] File under 4 MB (compress: `ffmpeg -i in.mp4 -vcodec libx264 -crf 26 -preset slow -an out.mp4`)
- [ ] Named `{poseKey}.mp4`

**Delivery:**
- [ ] Dropped into `/public/poses/`
- [ ] Mapping present in `POSE_VIDEOS` in `src/components/PoseFigure.jsx`

---

## Integration notes

- `PoseFigure` prefers video over SVG when a mapping exists, so a new MP4 appears everywhere the pose renders as soon as it's in `POSE_VIDEOS`.
- Until a pose has a correct clip, leave it out of `POSE_VIDEOS` and the SVG fallback takes over. A calm illustrated figure is better than a wrong video that teaches the wrong mechanics.
- Keep the visual consistency — a user who learns Tadasana should feel she's learning Warrior I from the same instructor in the same room. That consistency is what makes "practice alongside the app" feel like a single coherent teacher.

---

## Status of current `/public/poses/`

The existing 9 clips were generated before this entry→hold→exit plan was finalized. Of them:

- **Working well as entry→hold→exit clips**, keep: `tadasana.mp4` (no entry needed), `warrior2.mp4`, `tree.mp4`, `uttanasana.mp4`, `paschimottanasana.mp4`, `sukhasana.mp4`.
- **Peak pose is drifting or wrong, regenerate using the new workflow:** `warrior1.mp4` (peak arms overhead but lunge drifts), `seatedTwist.mp4` (never hits the correct twist shape), `balasana.mp4` (currently works OK, regenerate only if peak isn't clean).

When regenerating, use Kling's start-frame (and end-frame if available) inputs with the canonical Tadasana image, plus the mid-reference / keyframe slot for the peak-pose image. The peak-pose image is what prevents Kling from drifting at the one moment that matters most for teaching.
