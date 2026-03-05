import { describe, expect, it, vi } from "vitest";
import {
  consumeGenerationStream,
  consumeGenerationStreamIncremental,
} from "@/features/generation/stream-consumer";

function createStream(payload: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    },
  });
}

describe("stream consumer", () => {
  it("aggregates delta events into text", async () => {
    const stream = createStream(
      `event: start\ndata: {"requestId":"abc"}\n\n` +
        `event: delta\ndata: {"text":"hello "}\n\n` +
        `event: delta\ndata: {"text":"world"}\n\n` +
        `event: done\ndata: {"finishReason":"stop"}\n\n`,
    );

    const result = await consumeGenerationStream(stream, "hello");
    expect(result.text).toBe("hello world");
  });

  it("throws when provider emits an error event", async () => {
    const stream = createStream(
      `event: start\ndata: {"requestId":"abc"}\n\n` +
        `event: error\ndata: {"message":"OpenAI request failed (404)"}\n\n` +
        `event: done\ndata: {"finishReason":"error"}\n\n`,
    );

    await expect(consumeGenerationStream(stream, "hello")).rejects.toThrow(
      "OpenAI request failed (404)",
    );
  });

  it("throws during incremental processing when provider emits an error event", async () => {
    const stream = createStream(
      `event: start\ndata: {"requestId":"abc"}\n\n` +
        `event: error\ndata: {"message":"Bad auth token"}\n\n` +
        `event: done\ndata: {"finishReason":"error"}\n\n`,
    );
    const onDelta = vi.fn();

    await expect(
      consumeGenerationStreamIncremental(stream, "hello", onDelta),
    ).rejects.toThrow("Bad auth token");
    expect(onDelta).not.toHaveBeenCalled();
  });
});
