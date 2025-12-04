import { describe, expect, it, vi } from "vitest";
import { createTRPCReactMock } from "./trpcReactMock";

describe("createTRPCReactMock", () => {
	it("supports overriding mutateAsync and pending state", async () => {
		const mutateAsync = vi.fn().mockResolvedValue("ok");
		const mock = createTRPCReactMock({
			isPending: true,
			mutateAsync,
		});

		const { isPending, mutateAsync: returnedMutate } =
			mock.post.create.useMutation();

		expect(isPending).toBe(true);
		await returnedMutate({ foo: "bar" });
		expect(mutateAsync).toHaveBeenCalledWith({ foo: "bar" });
	});

	it("runs onSuccess and onError callbacks", async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();

		const mock = createTRPCReactMock({
			useMutation: (opts) => ({
				isPending: false,
				mutateAsync: async () => {
					opts?.onSuccess?.("data", { id: 1 }, undefined);
					opts?.onError?.(new Error("oops"), { id: 1 }, undefined);
					return "data";
				},
			}),
		});

		const mutation = mock.post.create.useMutation({ onSuccess, onError });
		await mutation.mutateAsync({ id: 1 });

		expect(onSuccess).toHaveBeenCalledWith("data", { id: 1 }, undefined);
		expect(onError).toHaveBeenCalled();
	});

	it("allows overriding invalidate util", async () => {
		const invalidate = vi.fn().mockResolvedValue(undefined);
		const mock = createTRPCReactMock({ invalidate });

		await mock.useUtils().post.invalidate();

		expect(invalidate).toHaveBeenCalled();
	});
});
