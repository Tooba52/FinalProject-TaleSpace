import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateBook from "../pages/CreateBook";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api", () => ({ post: vi.fn() }));
vi.mock("../components/Navbar", () => ({ default: () => <div>Navbar</div> }));
vi.mock("../components/Footer", () => ({ default: () => <div>Footer</div> }));

describe("CreateBook", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <CreateBook />
      </MemoryRouter>
    );
  });

  it("renders basic elements", () => {
    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("handles title input", () => {
    const input = screen.getByLabelText("Title");
    fireEvent.change(input, { target: { value: "My Book" } });
    expect(input.value).toBe("My Book");
  });

  it("toggles genre selection", () => {
    const fantasy = screen.getByText("Fantasy");
    fireEvent.click(fantasy);
    expect(fantasy).toHaveClass("selected");
  });

  it("limits to 3 genres", () => {
    const genres = ["Fantasy", "Romance", "Sci-Fi", "Horror"].map((g) =>
      screen.getByText(g)
    );
    genres.forEach((g) => fireEvent.click(g));
    expect(genres[3]).not.toHaveClass("selected"); // 4th genre not selected
  });

  it("toggles mature rating", () => {
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});
