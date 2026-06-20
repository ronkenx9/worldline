import assert from "node:assert/strict";
import test from "node:test";
import { N, STOPS, WORLDS, cameraStateAt, overviewBlendAt, pageOpacity, stationStateAt } from "./journey.ts";

test("each world has a stable inside-room station at its stop", () => {
  STOPS.forEach((stop, i) => {
    const state = stationStateAt(stop);

    assert.equal(state.worldIndex, i);
    assert.equal(state.phase, "inside");
    assert.equal(state.roomOpacity, 1);
    assert.equal(pageOpacity(cameraStateAt(stop).dist), 1);
  });
});

test("between adjacent worlds is a travel state, not either flat room", () => {
  for (let i = 0; i < N - 1; i += 1) {
    const midpoint = (STOPS[i] + STOPS[i + 1]) / 2;
    const state = stationStateAt(midpoint);

    assert.equal(state.phase, "travel");
    assert.equal(state.roomOpacity, 0);
    assert.equal(state.worldIndex, i);
  }
});

test("the active room stays on the current world during exit, then switches on next approach", () => {
  const firstExit = STOPS[0] + (STOPS[1] - STOPS[0]) * 0.2;
  const nextApproach = STOPS[0] + (STOPS[1] - STOPS[0]) * 0.8;

  assert.equal(stationStateAt(firstExit).worldIndex, 0);
  assert.equal(stationStateAt(nextApproach).worldIndex, 1);
});

test("the final phase resolves into a full-map overview", () => {
  assert.equal(overviewBlendAt(STOPS[N - 1]), 0);
  assert.equal(overviewBlendAt(1), 1);
  assert.equal(stationStateAt(1).phase, "overview");
  assert.equal(stationStateAt(1).roomOpacity, 0);
});

test("each world has a distinct elemental long-scroll chapter", () => {
  const elements = new Set(WORLDS.map((world) => world.element));

  assert.deepEqual(
    WORLDS.map((world) => world.element),
    ["fire", "water", "ice", "earth"],
  );
  assert.equal(elements.size, N);
  WORLDS.forEach((world) => {
    assert.ok(world.chapter.includes("CHAPTER"));
    assert.ok(world.title.length > 0);
    assert.ok(world.lede.length > 0);
    assert.ok(world.outro.length > 0);
    assert.ok(world.scenes.length >= 4);
    world.scenes.forEach((scene) => {
      assert.ok(scene.heading.length > 0);
      assert.ok(scene.body.length > 80);
      assert.ok(scene.plain.length > 50);
    });
  });
});
