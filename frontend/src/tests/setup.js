import { afterEach } from "vitest";
import "@testing-library/jest-dom"; // ← Remove '/vitest' from the import
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
