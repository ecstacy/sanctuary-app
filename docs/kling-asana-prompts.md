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
The subject holds this exact Corpse Pose position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the chest and belly. No change in limb position, feet remain fallen naturally outward, arms remain palms up alongside the body, shoulders stay melted down. Eyes remain softly CLOSED, face at rest. Static camera. Seamless loop — final frame identical to the first. Don't open the eyes.
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

### 18. Trikonasana — Triangle Pose

**Pose key:** `trikonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Utthita Trikonasana (Extended Triangle). Wide stance along the length of the mat, body turned in profile to face camera-left. Right foot at the right end of the mat pointing right (away from camera-left direction); left foot at the left end pointing camera-left. Both legs straight, no knee bend. Hips and torso turn to face camera, then lean / hinge laterally over the front (left) leg from the hip — not the waist. Left hand rests lightly on the left shin or on a yoga block placed outside the left ankle. Right arm extends straight up toward the ceiling, perpendicular to the floor, palm facing forward. Both arms form a single long line from the floor to the ceiling. Spine is long, no rounding through the side body. Head turns to gaze up toward the right (top) hand. Chest opens fully toward the camera-facing wall.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot out to the side about 3.5 feet into a wide stance along the mat, turns the left foot to point camera-left, turns her body to face camera-left in profile, inhales and extends both arms out to the sides at shoulder height. On the exhale she hinges laterally from the left hip, lowering her left hand to her left shin (or a block) while her right arm rotates up to point straight at the ceiling. She turns her head to gaze up at the top hand, arriving at the peak around second 2 (matching the reference peak image). She holds for 1 breath (seconds 2 to 3). Then she reverses: inhales to rise back up to standing, lowers the arms, steps the left foot back to the right foot, turns to face camera, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 19. Utkatasana — Chair Pose

**Pose key:** `utkatasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Utkatasana (Chair Pose), facing camera head-on, feet together (or hip-width apart) at the front of the mat. Both knees bent deeply as if sitting back into an invisible chair behind her — thighs angling toward parallel with the floor, weight clearly in the heels (you can see the toes can lift if she chose). Torso leans forward slightly so the chest stays open. Both arms reach straight up overhead, biceps near the ears, palms facing each other or palms together, fingertips reaching toward the ceiling. Spine long. Shoulders soft and away from the ears.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: inhales and sweeps both arms straight up overhead, then exhales bending both knees deeply and sitting the hips back as if into a chair, leaning the torso slightly forward to keep the chest open — arriving at the peak around second 2. She holds for 1 breath (seconds 2 to 3). Then she reverses: inhales to straighten the legs, exhales lowering the arms, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 20. Virabhadrasana III — Warrior III

**Pose key:** `warrior3` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Warrior III. Body turned in profile to face camera-left, balancing on her LEFT leg. Standing left leg straight and strong (slight micro-bend in the standing knee for stability is fine). The right leg is extended straight back behind her, lifted to be parallel to the floor — thigh, knee, ankle, foot all in one horizontal line at hip height. Both arms reach straight forward at shoulder height, parallel to the floor, palms facing each other. From fingertips to back foot the body forms one long horizontal line. Hips are level — not rotated open. Gaze a foot in front of the standing toe.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: shifts her weight onto her LEFT foot, hinges forward at the hip while extending her right leg straight back behind her parallel to the floor, and reaches both arms straight forward at shoulder height — forming one long horizontal T-line — arriving at the peak around second 2. She holds the balance steady for 1 breath (seconds 2 to 3). Then she reverses: lowers the right foot back to the mat as the torso rises, lowers the arms, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 21. Parsvakonasana — Side Angle Pose

**Pose key:** `parsvakonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Extended Side Angle Pose. Wide stance along the mat, body in profile facing camera-left. Right (front) foot at the left end of the mat pointing camera-left, right knee bent to 90 degrees with the thigh parallel to the floor. Left (back) leg straight, back foot at the right end of the mat parallel to the back edge. Right forearm rests on the right thigh just above the knee; left arm reaches up and over in line with the spine, palm facing the floor, the underside of the left arm parallel to the floor. The body forms one long diagonal line from the back heel through the fingertips of the top arm. Chest opens up toward the ceiling. Gaze up under the top arm.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot back about 3.5 feet into a wide stance, turns to face camera-left in profile, bends the right knee to 90 degrees with the thigh parallel, lowers the right forearm to rest on the right thigh, and sweeps the left arm up and over in line with the spine palm-down — arriving at the peak around second 2. She holds for 1 breath (seconds 2 to 3). Then she reverses: presses through both feet to rise back up, lowers the arms, steps feet together, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 22. Parsvottanasana — Pyramid Pose

**Pose key:** `parsvottanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Pyramid Pose. Body in profile facing camera-left, with right foot forward at the left end of the mat and left foot back at the right end, feet about 3 feet apart along the length of the mat. Right (front) foot points camera-left; left (back) foot turned out about 45 degrees, both feet flat on the floor. Hips squared toward the front (camera-left direction). Front leg straight (or micro-bent), torso folded forward over the front leg from the hip — chest reaching toward the front shin, spine long, NOT rounded. Hands rest on the front shin, on yoga blocks beside the front foot, OR are clasped behind the back in reverse prayer (mudra). Crown of the head reaches forward toward the front toes.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot back about 3 feet, turns the back foot out 45 degrees, squares her hips forward, brings her hands behind her back in reverse prayer (or to her hips), inhales tall, then exhales hinging forward over the front leg with a long spine — chest moving toward the front shin — arriving at the peak around second 2.5. She holds for 1 breath (seconds 2.5 to 3.5). Then she reverses: inhales to rise back up, releases the hands, steps the left foot forward, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 23. Prasarita Padottanasana — Wide-Legged Forward Fold

**Pose key:** `prasaritaPadottanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Wide-Legged Standing Forward Fold. Body facing camera head-on, feet wide apart along the back of the mat — about a leg-length wide — both feet parallel and pointing forward toward camera. Both legs straight, thighs engaged. Torso fully folded forward at the hips, crown of the head reaching toward the floor between the feet. Hands rest flat on the floor between the feet, fingertips in line with the toes, elbows bending back if accessible. Spine long, NOT rounded. The pose looks symmetrical and grounded.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps both feet wide apart to about a leg-length, hands on hips, inhales lengthening the spine tall, then exhales hinging forward at the hips with a long spine, lowering both hands to the floor between the feet — arriving at the peak around second 2.5. She holds for 1 breath (seconds 2.5 to 3.5). Then she reverses: hands on hips, inhales to rise back up with a flat back, steps feet together, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 24. Anjaneyasana — Low Lunge

**Pose key:** `anjaneyasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Low Lunge (Anjaneyasana), body facing camera head-on. Right foot at the front of the mat with the right knee bent deeply and stacked over the right ankle. Left knee on the floor at the back of the mat, top of the left foot flat on the floor (toes untucked, foot pointing back). Hips sink down toward the floor and square forward. Both arms reach straight up overhead, biceps near the ears, palms facing each other, fingertips toward the ceiling. Spine long, slight backbend through the upper back. Heart open. Gaze forward and slightly up.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: bends her knees and steps her LEFT foot back into a long lunge, lowering the back left knee and the top of the left foot to the floor, then inhales sweeping both arms straight up overhead — arriving at the peak around second 2.5 with hips sinking toward the floor. She holds for 1 breath (seconds 2.5 to 3.5). Then she reverses: lowers the arms, steps the left foot forward to meet the right, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 25. Utthita Hasta Padangusthasana — Hand-to-Big-Toe

**Pose key:** `utthitaHastaPadangusthasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Standing Hand-to-Big-Toe Pose. Body facing camera head-on, balancing on the LEFT leg with the standing left leg straight and strong. Right leg lifted and extended straight forward in front of her at hip height (or as high as flexibility allows; thigh roughly parallel to the floor, lower leg extending forward). The right hand holds the BIG TOE of the right foot with the index and middle fingers wrapped around the toe (yogi toe-lock). Left hand rests on the left hip. Spine tall, shoulders relaxed and level, hips level. Gaze steady forward.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: shifts weight onto her LEFT foot, lifts the right knee toward the chest, hooks the right big toe with the right index and middle fingers, places the left hand on the left hip, then slowly extends the right leg straight forward at hip height — arriving at the peak around second 3. She holds the balance steady for 1 breath (seconds 3 to 4). Then she reverses: bends the right knee back in, releases the toe, lowers the right foot to the mat, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 26. Garudasana — Eagle Pose

**Pose key:** `garudasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Eagle Pose. Body facing camera head-on, sitting low into a single-leg squat on the LEFT standing leg with both knees bent. Right thigh crosses over the left thigh; right foot wraps behind the left calf, toes pointing down (or right toes lightly touching the floor as a kickstand if the wrap isn't accessible). Both arms cross in front of the chest at the elbows — left elbow under right elbow — and the forearms wrap so the palms come together (or backs of hands together if palms don't reach). Elbows lifted to shoulder height. Spine long. Gaze steady forward.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: bends both knees slightly and shifts weight onto the LEFT leg, crosses the right thigh over the left and hooks the right foot behind the left calf, extends both arms forward, then crosses the left elbow under the right and wraps the forearms so the palms touch in front of the face — arriving at the peak around second 3. She holds the balance steady for 1 breath (seconds 3 to 4). Then she reverses: unwinds the arms, releases the right foot to the floor, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 27. Natarajasana — Dancer's Pose

**Pose key:** `natarajasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Dancer's Pose. Body in profile facing camera-left, balancing on the LEFT leg with the standing left leg straight (slight micro-bend acceptable). Right leg bent at the knee, lifted up and behind her so the right thigh extends back and the right foot points up toward the ceiling. The right hand grasps the inside of the right ankle from below (palm facing forward, thumb hooked around the ankle). Left arm extends straight forward at shoulder height as a counterbalance. Chest opens forward and slightly upward. Front body in a long arc from the lifted right foot through the right hip, chest, and left fingertips. Gaze forward.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: shifts weight onto the LEFT leg, bends the right knee and lifts the right foot toward the buttocks, reaches back with the right hand and grasps the inside of the right ankle, extends the left arm straight forward, then presses the right foot back into the right hand, lifting the leg up and back and opening the chest forward — arriving at the peak around second 3. She holds the balance steady for 1 breath (seconds 3 to 4). Then she reverses: lowers the right foot back to the mat, releases the arms, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 28. Parivrtta Trikonasana — Revolved Triangle

**Pose key:** `parivrttaTrikonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Revolved Triangle. Body in profile facing camera-left, feet about 3 feet apart along the mat. Right (front) foot at the left end of the mat pointing camera-left; left (back) foot at the right end, turned out about 45 degrees. Both legs straight. Hips squared forward (toward camera-left direction). Torso rotated to the right so the chest faces the BACK of the mat. The LEFT hand rests on the floor (or a yoga block) outside the right foot. Right arm reaches straight up toward the ceiling, palm facing forward, fingers active. Both arms form one long vertical line from the floor block up through the right hand. Head turns to gaze up under the top arm. Spine long, no rounding.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps her LEFT foot back 3 feet, squares her hips toward the front (camera-left), inhales lengthening the spine, then exhales rotating the torso to the right and lowering the LEFT hand to a yoga block outside the right foot while the right arm reaches up to the ceiling — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: inhales rising back up, lowers the arms, steps the left foot forward, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

## Hold-only seated, restorative, and inverted poses (peak-image loop)

These poses use the same approach as Sukhasana (#5) and Savasana (#11): the peak image is uploaded as both the start AND end frame in Kling, and only breath animates over the 5 seconds.

---

### 29. Padmasana — Lotus Pose  *(hold-only, no entry)*

**Pose key:** `padmasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting in full Lotus Pose (Padmasana) on the center of the mat, facing the camera. Both legs are crossed: right foot resting on top of the left thigh, sole facing up; left foot resting on top of the right thigh, sole facing up. Both knees on the floor. Spine tall and long. Shoulders relaxed. Hands rest on the knees, palms up, thumb and index finger lightly touching in gyan mudra. Eyes softly closed, face serene.
```

**🎬 Kling motion prompt:** *(upload Padmasana peak image as both start and end frame)*
```
The subject holds this exact Lotus position for the full 5 seconds. The only motion is slow, subtle breath — one full breath cycle, visible as a gentle rise and fall of the chest and belly. No change in body or hand position. Eyes remain softly closed. Static camera. Seamless loop.
```

---

### 30. Siddhasana — Accomplished Pose  *(hold-only, no entry)*

**Pose key:** `siddhasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting in Siddhasana on the center of the mat, facing the camera. Left heel tucked in close to the perineum; right foot resting on top of the left ankle so the right heel sits just above the pubic bone area. Both knees rest on the floor. Spine tall and long. Hands rest on the knees, palms up in gyan mudra. Eyes softly closed, face serene.
```

**🎬 Kling motion prompt:** *(upload Siddhasana peak image as both start and end frame)*
```
The subject holds this exact seated position for the full 5 seconds. The only motion is slow, subtle breath. No change in body or hand position. Eyes softly closed. Static camera. Seamless loop.
```

---

### 31. Vajrasana — Thunderbolt Pose  *(hold-only, no entry)*

**Pose key:** `vajrasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Kneeling on the mat in Vajrasana, facing the camera. Knees together, big toes touching, heels apart enough to cradle the sit bones — sitting back on the heels. Tops of the feet flat on the floor, toes pointing back. Spine tall. Hands rest on the thighs, palms down. Shoulders relaxed. Eyes softly closed, face calm.
```

**🎬 Kling motion prompt:** *(upload Vajrasana peak image as both start and end frame)*
```
The subject holds this exact kneeling position for the full 5 seconds. The only motion is slow, subtle breath. No change in body or hand position. Eyes softly closed. Static camera. Seamless loop.
```

---

### 32. Ardha Padmasana — Half Lotus  *(hold-only, no entry)*

**Pose key:** `ardhaPadmasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting in Half Lotus on the center of the mat, facing the camera. Right foot rests on top of the left thigh, sole facing up; left foot tucked under the right thigh, foot resting on the floor. Right knee touches the floor (or rests close to it on a small cushion if the user can't reach the floor). Spine tall. Hands rest on the knees, palms up in gyan mudra. Eyes softly closed.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this exact seated position for the full 5 seconds. Slow subtle breath only. No change in body or hand position. Eyes softly closed. Static camera. Seamless loop.
```

---

### 33. Baddha Konasana — Bound Angle Pose  *(hold-only, no entry)*

**Pose key:** `baddhaKonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting in Baddha Konasana on a folded blanket at the center of the mat, facing the camera. Soles of the feet pressed together; knees fall apart to the sides toward the floor (a small cushion or block under each knee for support). Both hands hold the feet, fingers laced around the outer edges of the feet. Spine tall and long, NOT rounded forward. Shoulders relaxed. Eyes softly closed, face calm.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this seated bound-angle position for the full 5 seconds. Slow subtle breath only. No movement of the legs or hands. Eyes softly closed. Static camera. Seamless loop.
```

---

### 34. Upavishta Konasana — Wide-Angle Seated Forward Bend

**Pose key:** `upavishtaKonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Sitting on a folded blanket at the center of the mat, facing the camera. Both legs extended out wide to the sides as wide as comfortable — kneecaps pointing straight up, feet flexed. Torso folded forward with a long spine, hinging from the hips. Both hands rest on the floor between the legs (or on shins/feet) palms down, arms reaching forward. Crown of the head reaches forward (NOT down — spine stays long, not rounded).
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position with both legs extended forward (from Sukhasana → legs straight forward), she: opens her legs out wide to the sides, flexes both feet, places hands on the floor in front of her, inhales lengthening the spine, then exhales walking the hands forward and folding from the hips with a long spine — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: walks the hands back, rises tall, brings the legs back together. Final frame matches the seated start. Static camera.
```

---

### 35. Janu Sirsasana — Head-to-Knee Pose

**Pose key:** `januSirsasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on a folded blanket at the center of the mat, body slightly turned in profile facing camera-left. Left leg extends straight out to the side (camera-left), foot flexed, kneecap pointing up. Right knee bent and the right sole pressed against the inner left thigh, right knee opening toward the floor on the camera-right side. Torso folds forward over the LEFT (extended) leg, hinging from the hips with a long spine. Both hands hold the left shin, ankle, or foot. Crown of the head reaches forward toward the front foot.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position with both legs extended forward, she: bends her right knee and brings the right sole to the inner left thigh, inhales tall, exhales hinging forward over the extended left leg, holding the shin or foot — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: rises back up, extends the right leg forward to match. Final frame matches the seated start. Static camera.
```

---

### 36. Gomukhasana — Cow Face Pose

**Pose key:** `gomukhasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on a folded blanket on the center of the mat, facing the camera. Legs in the cow-face stack: left leg crosses under the right; left foot rests beside the right hip; right thigh stacks directly on top of the left thigh, right knee in front of the left knee in the center; right foot rests beside the left hip. The two feet flare out to opposite sides of the body. Right arm reaches up overhead, bends at the elbow, and the right hand falls down the back between the shoulder blades. Left arm comes behind the back from below, the left hand reaching up to clasp the right hand (or holding a yoga strap between the hands if they don't meet). Both elbows lift — top elbow toward the ceiling, bottom elbow toward the floor. Spine tall.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position, she: folds the legs into the cow-face stack with right thigh on top of left, reaches the right arm up overhead, bends the elbow letting the right hand fall down the back, then brings the left arm behind the back from below and clasps the hands (or a strap) between the shoulder blades — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: releases the arms, unwinds the legs back to a simple seated position. Static camera.
```

---

### 37. Marichyasana A — Marichi's Pose A

**Pose key:** `marichyasanaA` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on a folded blanket facing camera. Left leg extends straight forward, foot flexed. Right knee bent with the right foot flat on the floor close to the right sit bone, right knee pointing up at the ceiling. Right arm wraps AROUND the right shin from outside to inside; left arm reaches behind the back to clasp the right hand (or a strap) — forming a bind. Torso folds forward over the extended LEFT leg with a long spine, chest reaching toward the front shin. Crown of the head reaches forward.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position, she: extends the left leg forward, bends the right knee with the foot flat on the floor close to the right sit bone, wraps the right arm around the right shin, reaches the left arm behind the back and clasps the hands in a bind, then exhales folding forward over the extended left leg — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: rises tall, releases the bind, extends the right leg. Static camera.
```

---

### 38. Marichyasana C — Marichi's Pose C  *(seated twist)*

**Pose key:** `marichyasanaC` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on a folded blanket. Left leg extends straight forward, foot flexed. Right knee bent, right foot flat on the floor close to the right sit bone, knee pointing up. Torso ROTATES to the right. Left elbow hooks on the OUTSIDE of the right knee, pressing the elbow into the knee to deepen the rotation. Right hand rests on the floor behind the body for support, arm long and active. Spine tall, NOT rounded. Gaze over the right shoulder.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position, she: extends the left leg forward, bends the right knee with the foot flat close to the right sit bone, places the right hand behind her on the floor, then inhales tall and exhales rotating to the right, hooking the left elbow on the outside of the right knee — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: releases the twist back to center, extends the right leg. Static camera.
```

---

### 39. Bharadvajasana — Bharadvaja's Twist

**Pose key:** `bharadvajasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Seated on a folded blanket. Both legs are bent and swung to the LEFT side of the body — knees pointing to the left, right ankle resting on the left arch (legs stacked). Torso rotates to the RIGHT, AWAY from the legs. Left hand rests on the right knee or thigh; right hand rests on the floor behind her on the right side for support. Spine tall. Gaze over the right shoulder.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a seated position, she: bends both knees and swings the legs to the left side stacking the right ankle on the left arch, places the right hand on the floor behind her, then inhales tall and exhales rotating the torso to the right while bringing the left hand to the right knee — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she releases the twist back to center. Static camera.
```

---

### 40. Virasana — Hero Pose  *(hold-only, no entry)*

**Pose key:** `virasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Kneeling in Virasana on the mat, facing the camera. Knees together; feet wider than the hips with the tops of the feet flat on the floor, toes pointing back. Sit bones rest BETWEEN the heels (on a yoga block placed between the heels if needed for height — most users need this). Spine tall. Hands rest on the thighs, palms down. Eyes softly closed, face calm.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this kneeling Hero seat for the full 5 seconds. Slow subtle breath only. No movement. Eyes softly closed. Static camera. Seamless loop.
```

---

### 41. Malasana — Garland Pose / Yogic Squat

**Pose key:** `malasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Deep Yogic Squat (Malasana), facing the camera. Feet slightly wider than hip-width apart, toes turned out about 30 degrees. Hips lowered all the way down, knees bent deeply over the toes. Heels stay on the floor (a folded blanket under each heel if they don't reach). Hands together in prayer at the heart, elbows pressed lightly against the inner knees, drawing the chest forward and up between the knees. Spine long, chest open, NOT collapsed. Gaze forward and slightly up.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Tadasana (frame 1), she: steps the feet slightly wider than hip-width and turns the toes out, then bends the knees deeply lowering the hips all the way down into a deep squat, bringing the hands together in prayer at the heart and pressing the elbows against the inner knees — arriving at the peak around second 2.5. She holds for 1 breath (seconds 2.5 to 3.5). Then she reverses: places the hands on the floor and presses up to standing, returning to Tadasana. Final frame matches frame 1. Static camera.
```

---

### 42. Mandukasana — Frog Pose  *(hold-only, no entry)*

**Pose key:** `mandukasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Frog Pose. Subject is on hands and knees, then forearms-down — forearms rest parallel on the mat, body weight in the forearms. Knees out wide to the sides as wide as comfortable, with a folded blanket under each knee for cushioning. Inner edges of the feet press into the floor, feet flexed and turned out so inner ankles, inner knees, and the front of the hips form a square shape. Hips are pressed slightly back toward the heels. Forehead rests on the stacked forearms. View is from above-front, three-quarter angle.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this frog position for the full 5 seconds. Slow deep breath only — visible as a gentle rise and fall of the back rib cage. No movement of the legs. Static camera. Seamless loop.
```

---

### 43. Supta Baddha Konasana — Reclined Bound Angle  *(hold-only, no entry)*

**Pose key:** `suptaBaddhaKonasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Lying on the back on the mat, head resting on the floor (or a folded blanket under the head). Soles of the feet pressed together; knees fall apart to the sides toward the floor with a yoga block or cushion under each knee for support. Arms rest comfortably alongside the body, palms up. Eyes softly closed, face peaceful. View from directly above (top-down) or from the side at low angle.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this reclined position for the full 5 seconds. The only motion is slow, deep belly breath — visible as a gentle rise and fall of the lower belly. Eyes softly closed. Static camera. Seamless loop.
```

---

### 44. Supta Padangusthasana — Reclined Hand-to-Big-Toe

**Pose key:** `suptaPadangusthasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Lying on the back on the mat. Left leg extends long along the floor, foot flexed and pressing forward. Right leg lifted straight up toward the ceiling, leg as straight as possible. A yoga strap is looped around the ball of the right foot; both hands hold the ends of the strap, drawing the leg gently toward the head. Both shoulders rest on the floor — not lifted. View from the side.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a flat reclined position (Savasana base), she: bends the right knee toward the chest, loops a yoga strap around the ball of the right foot, then extends the right leg straight up toward the ceiling holding the strap — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: bends the knee back in, lowers the foot, returns to the reclined start. Static camera.
```

---

### 45. Apanasana — Knees-to-Chest  *(hold-only, no entry)*

**Pose key:** `apanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Lying on the back on the mat. Both knees drawn in close to the chest. Arms wrap around the shins, hands holding opposite elbows OR clasping the shins. Lower back releases gently into the floor. Head rests on the mat (or a folded blanket). Eyes softly closed, face calm. View from the side.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this knees-to-chest position for the full 5 seconds. The only motion is slow breath — gentle pressure of the thighs against the belly on the inhale. Static camera. Seamless loop.
```

---

### 46. Jathara Parivartanasana — Belly Twist  *(hold-only, no entry)*

**Pose key:** `jatharaParivartanasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Lying on the back on the mat. Both knees bent and drawn in toward the chest, then lowered to the RIGHT side together — both knees stacked, resting on the floor on the right side. Arms extended out wide to the sides at shoulder height, palms up — making a T-shape with the body. Both shoulders stay on the floor. Head turned to gaze LEFT (away from the knees). Optional: a cushion supports the moving knees if they don't reach the floor.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this supine twist for the full 5 seconds. The only motion is slow breath — soft expansion of the side ribs. Eyes softly closed. Static camera. Seamless loop.
```

---

### 47. Ardha Pigeon Forward Fold — Sleeping Pigeon  *(hold-only, no entry)*

**Pose key:** `ardhaPigeonForwardFold` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Half Pigeon with the torso folded forward over the front shin. Right knee forward toward the right wrist with the right shin angled diagonally across the mat (NOT parallel — closer to a 45-degree angle, gentler version). Left leg extended straight back, top of the left foot on the floor. A folded blanket supports the right hip if it doesn't reach the floor (essential — keeps pelvis level). Torso folds forward, forearms stacked on the floor in front of the front shin, forehead resting on the stacked forearms (or on a yoga block). Arms can also extend straight forward. Pose looks restful, surrendered. View from above-side.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this sleeping-pigeon fold for the full 5 seconds. The only motion is slow deep breath. Body completely relaxed, no muscular tension visible. Static camera. Seamless loop.
```

---

### 48. Makarasana — Crocodile Pose  *(hold-only, no entry)*

**Pose key:** `makarasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Lying face-down on the mat. Forearms stacked on top of each other in front of the face — left forearm on top of right (or vice versa) — and forehead rests on the top forearm. Legs extended back, feet slightly wider than hip-width apart, heels falling out to the sides naturally. Body completely relaxed into the floor. Pose looks like a crocodile resting. View from the side.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this prone resting position for the full 5 seconds. The only motion is slow belly breath — visible as a gentle rise and fall of the back as the belly presses into the floor on each inhale. Static camera. Seamless loop.
```

---

### 49. Supta Virasana — Reclined Hero  *(hold-only, no entry)*

**Pose key:** `suptaVirasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Reclined Hero Pose. Knees together on the mat; feet wider than the hips with the tops of the feet flat on the floor, toes pointing back. Hips rest between the heels. Body reclines back onto a long bolster (essential support) placed lengthwise along the spine, head supported by the bolster. Arms rest out to the sides, palms up, OR overhead resting on the bolster. Quads and hip flexors lengthen visibly. Eyes softly closed, face peaceful. View from the side.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this reclined hero position for the full 5 seconds. Slow deep breath only. No body movement. Eyes softly closed. Static camera. Seamless loop.
```

---

### 50. Supta Sukhasana — Reclined Easy Pose  *(hold-only, no entry)*

**Pose key:** `suptaSukhasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Reclined Easy Pose. Lying on the back with a long bolster lengthwise behind the spine — head and shoulders elevated by the bolster. Legs comfortably crossed in Sukhasana style, knees fall toward the floor naturally. Arms rest out to the sides, palms up. Eyes softly closed, face peaceful. View from the side.
```

**🎬 Kling motion prompt:** *(upload peak image as both start and end frame)*
```
The subject holds this reclined cross-legged position for the full 5 seconds. Slow deep breath only. No body movement. Eyes softly closed. Static camera. Seamless loop.
```

---

### 51. Dhanurasana — Bow Pose

**Pose key:** `dhanurasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Bow Pose, lying face-down on the mat with the body curved into a bow shape. Both knees bent so heels lift toward the buttocks; both hands reach back to grasp the OUTSIDES of the ankles. Knees stay roughly hip-width apart (not splayed wide). Inhale lifts the chest off the floor and the thighs off the floor simultaneously — body forms an arc with the arms acting as the bowstring. Head lifts forward, gaze slightly up. View from the side, showing the full bow curve.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a flat prone position face-down, she: bends both knees bringing the heels toward the buttocks, reaches back with both hands and grasps the outsides of the ankles, then inhales pressing the feet back into the hands and lifting the chest and thighs off the floor — arriving at the bow peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she reverses: lowers the chest and thighs to the floor, releases the ankles. Static camera.
```

---

### 52. Salabhasana — Locust Pose

**Pose key:** `salabhasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Locust Pose, lying face-down on the mat. Arms extended alongside the body, palms down or palms up. Both legs straight, feet hip-width apart. On the inhale, chest lifts off the floor, arms lift off the floor reaching back, and BOTH legs lift off the floor simultaneously — back of the body engaging together. Reach forward through the crown of the head and back through the toes. Gaze at the floor a foot ahead (back of the neck stays long). View from the side.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a flat prone position face-down, she: extends the arms alongside the body, then inhales lifting the chest, arms, and both legs off the floor simultaneously into Locust — arriving at the peak around second 2.5. She holds for 1 breath (seconds 2.5 to 3.5). Then she exhales lowering everything to the floor. Static camera.
```

---

### 53. Ardha Salabhasana — Half Locust

**Pose key:** `ardhaSalabhasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Half Locust. Lying face-down with arms extended alongside the body, palms down beneath the hips. Forehead rests on the mat (chin slightly tucked to lengthen the back of the neck). Right leg extended back, lifted straight up off the floor — knee straight, foot pointed. Left leg stays on the floor. Hips stay even on the floor (not tilted up on one side). View from the side or three-quarter, showing the asymmetric leg lift.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a flat prone position face-down, she: extends the arms alongside the body palms down under the hips, presses the chin gently into the mat, then inhales lifting only the right leg straight up behind her — arriving at the peak around second 2. She holds for 1 breath (seconds 2 to 3). Then she lowers the right leg. (For the left side, the same motion mirrored.) Static camera.
```

---

### 54. Halasana — Plow Pose

**Pose key:** `halasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Plow Pose. Body inverted: shoulders on a stack of folded blankets (essential — protects the cervical spine), back of the head on the mat below the blankets, neck floating in the gap. Hips are above the shoulders. Both legs are extended OVER the head, toes touching the floor behind the head (or resting on a chair seat or stack of blocks behind the head if toes don't reach). Hands support the lower back — or are interlaced behind on the floor with arms straight, pressing into the floor. Body forms an inverted curve resembling a plow. View from the side.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a flat reclined position (Savasana base), she: presses the hands into the floor and lifts both legs straight up toward the ceiling, then continues to swing the legs over the head lowering the toes toward the floor behind her, supporting the lower back with the hands — arriving at the peak around second 3. She holds for 1 breath (seconds 3 to 4). Then she rolls down slowly with the hands supporting the lower back. Static camera.
```

---

### 55. Sarvangasana — Shoulder Stand

**Pose key:** `sarvangasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Shoulder Stand. Body inverted vertically: shoulders rest on a stack of folded blankets (essential), back of the head on the floor below the blankets, neck floating in the gap. Both legs extended STRAIGHT UP toward the ceiling, body forming one long vertical line from shoulders to feet. Hands placed on the lower back, fingers pointing toward the spine — supporting the lift. Hips stack over the shoulders, ankles over the hips. Gaze at the toes. View from the side, full body in frame.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Halasana with shoulders on blankets, she: places her hands on the lower back and slowly lifts both legs up toward the ceiling, stacking the hips over the shoulders — arriving at the vertical peak around second 3. She holds the inverted line for 1 breath (seconds 3 to 4). Then she lowers the legs back into Halasana to exit. Static camera.
```

---

### 56. Sirsasana — Headstand

**Pose key:** `sirsasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Tripod-supported Headstand near a wall (the heels could touch the wall if she leaned back). Forearms on the mat, fingers interlaced; the back of the head cradles into the interlaced hands and the crown of the head presses lightly into the floor. Body forms one long vertical line: forearms-shoulders-hips-legs all stacked. Both legs extended straight up toward the ceiling, ankles together. MOST OF THE WEIGHT in the forearms (about 80-90%); only a small percentage in the head. Body inverted but stable, calm, controlled. Engaged core visible. View from the side.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from a kneeling position near a wall, she: interlaces the fingers and places the forearms on the mat, lowers the crown of the head into the cradled hands, lifts the hips up like Down Dog, walks the feet in toward the elbows, then bends the knees toward the chest and slowly extends the legs straight up overhead — arriving at the inverted peak around second 4. She holds steady for 1 breath. Then slowly lowers down with control. Static camera.
```

---

### 57. Sasangasana — Rabbit Pose

**Pose key:** `sasangasana` · **Duration:** 5s

**📸 Peak-pose mechanics (Nano Banana edit):**
```
Rabbit Pose. Subject kneeling on the mat with knees together. Heels touching the buttocks. Both hands reach back and grasp the heels with thumbs on the OUTSIDES of the feet. Crown of the head presses lightly into the mat in front of the knees. Hips lift up high, body curling forward — forehead approaches the knees, spine in deep flexion (rounded). Most of the weight in the legs and hands; only about 10-20% on the crown. View from the side.
```

**🎬 Kling motion prompt:**
```
Over 5 seconds, starting from Vajrasana (sitting on the heels), she: reaches back and grasps both heels with the hands, tucks the chin and places the crown of the head on the mat in front of the knees, then inhales lifting the hips up and rolling forward onto the crown — arriving at the peak around second 3. She holds for 1 breath. Then she lowers the hips back to the heels and rests. Static camera.
```

---

### 58. Surya Namaskar B — Sun Salutation B  *(sequence, longer clip)*

**Pose key:** `suryaNamaskarB` · **Duration:** 12s

Like the existing Surya Namaskar A entry (#15), this is a flowing sequence rather than a single pose. The Kling clip is longer (12s instead of 5s) and shows the full vinyasa one round.

**📸 Single representative still — for the app thumbnail (Nano Banana edit):**

The most iconic moment of Sun Salutation B is the peak Warrior I — the only sustained shape in the otherwise flowing vinyasa. Generate ONE still that the app uses as the asana thumbnail:

```
Sun Salutation B — captured at the peak Warrior I (Virabhadrasana I) moment, mid-flow. Standing on the mat facing the camera head-on at a slight three-quarter angle, right foot forward at the front of the mat with the right knee deeply bent (right thigh parallel to the floor, knee stacked over the ankle). Left leg extended straight back to the back of the mat, back foot planted flat and turned out about 45 degrees. Both hip points face forward, square to the front of the mat. Both arms reach straight up overhead, biceps by the ears, palms facing each other, fingertips reaching for the ceiling. Spine long and upright. Chin level, gaze forward and slightly up — a warrior's expression of focused calm. The subject's pose suggests motion just paused: the body is fully arrived in the shape but the energy still feels flowing. Studio backdrop: pale wood floor, sage-green mat, sheer-curtained windows, plant bench.
```

**📸 Reference stills for video QA only (not for the app):**

Generate three reference stills to check the Kling video against: peak Utkatasana (deep chair with arms overhead), peak Warrior I right side (deep lunge with arms up), peak Down Dog (inverted V, holding for 5 breaths). These don't need to be in the app — they're just QA references for the Kling sequence.

**🎬 Kling motion prompt:**
```
Over 12 seconds, starting from Tadasana (frame 1), she flows through Sun Salutation B in one breath-led sequence: (1) inhale bending the knees and sweeping the arms overhead into UTKATASANA / Chair, (2) exhale folding forward to UTTANASANA, (3) inhale halfway lift, (4) exhale stepping back into a CHATURANGA push-up, (5) inhale rolling over the toes into UPWARD DOG, (6) exhale pressing back into DOWN DOG, (7) inhale stepping the right foot forward into WARRIOR I right side with arms overhead, (8) exhale Chaturanga, (9) inhale Up Dog, (10) exhale Down Dog, (11) inhale stepping the left foot forward into WARRIOR I left side, (12) exhale Chaturanga, Up Dog, Down Dog (held briefly), then jump or step forward, halfway lift, fold, inhale rising to UTKATASANA, exhale to TADASANA. Final frame matches frame 1. Smooth, continuous, breath-linked. Static camera.
```

---

### 59. Chandra Namaskar — Moon Salutation  *(sequence, longer clip)*

**Pose key:** `chandraNamaskar` · **Duration:** 12s

**📸 Single representative still — for the app thumbnail (Nano Banana edit):**

Moon Salutation's centerpiece is Goddess Pose (Utkata Konasana) — the wide-stance squat with arms in cactus shape. Generate ONE still for the app thumbnail:

```
Moon Salutation — captured at the peak Goddess Pose (Utkata Konasana) moment, mid-flow. Standing on the mat facing the camera head-on, feet wide apart (about a leg-length), toes turned out 45 degrees. Both knees bend deeply, tracking over the toes, thighs angling toward parallel with the floor. Hips squared toward the camera, pelvis tucked under slightly. Both arms lifted out to the sides at shoulder height, elbows bent 90 degrees so the forearms come straight up — cactus or goalpost arms. Palms facing forward, fingers active. Spine tall, chest open. Chin level, gaze steady forward — a grounded, lunar quality. The pose is wide and stable, suggesting strength held softly. Studio backdrop: pale wood floor, sage-green mat, sheer-curtained windows, plant bench.
```

**🎬 Kling motion prompt:**
```
Over 12 seconds, starting from Tadasana (frame 1), she flows through a Moon Salutation: (1) inhale arms overhead palms touching, (2) exhale side-bend to the right, (3) inhale center, (4) exhale side-bend to the left, (5) inhale center, (6) exhale stepping the LEFT foot back into a wide low lunge, (7) inhale opening into GODDESS POSE (both knees wide, both arms cactus), (8) exhale side-bend right from Goddess, (9) inhale center, (10) exhale side-bend left from Goddess, (11) inhale center, (12) step the RIGHT foot back to mirror the lunge on the left side, then reverse the whole flow back to Tadasana. Final frame matches frame 1. Slow, meditative pace — slower than Sun Salutation. Static camera.
```

---

### 60. Cardiac Warmup — Cat-Cow Flow  *(sequence, gentle)*

**Pose key:** `cardiacWarmup` · **Duration:** 8s

**📸 Single representative still — for the app thumbnail (Nano Banana edit):**

Cat-Cow's most visually distinctive moment is the Cow position — the open, lifted shape that pairs well with a thumbnail. Generate ONE still for the app:

```
Cat-Cow Warmup — captured at the peak Cow position (Bitilasana). On all fours on the mat, viewed from the side (profile to camera-left). Wrists directly under shoulders, knees under hips, fingers spread wide and pressing into the mat. Spine in deep extension: belly drops gently toward the floor, the upper back and chest lift forward and up, tailbone tips up toward the ceiling, creating an open arching curve from tailbone to crown. Gaze lifts slightly up and forward. Shoulders draw away from the ears. Face relaxed, breath drawing in. The shape suggests warming the spine to begin practice. Studio backdrop: pale wood floor, sage-green mat, sheer-curtained windows, plant bench.
```

**📸 Per-frame reference stills (for the Kling motion clip QA only):**

**Cow (peak inhale):**
```
On all fours on the mat — wrists under shoulders, knees under hips, fingers spread wide. Spine in deep extension (arched / sway-back): belly drops toward the floor, chest lifts forward and up, tailbone tips up toward the ceiling. Gaze slightly up. View from the side.
```

**Cat (peak exhale):**
```
On all fours on the mat — wrists under shoulders, knees under hips. Spine rounds toward the ceiling in deep flexion: belly draws toward the spine, the upper back rises high, tailbone tucks under, chin draws toward the chest. Gaze toward the navel. View from the side.
```

**🎬 Kling motion prompt:**
```
Over 8 seconds, starting on all fours in a neutral spine position, she flows breath-linked between Cow and Cat: inhale into Cow (belly drops, chest lifts, tailbone up, gaze up), exhale into Cat (spine rounds, tailbone tucks, chin to chest). Repeat the cycle 3 full breath cycles total. One breath, one movement — slow and steady. Final frame returns to neutral all fours. Static camera.
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
