import getAriaAttributesFromProps from "@/utils/getAriaAttributesFromProps";
import { describe, expect, it } from "vitest";

describe("getAriaAttributesFromProps", () => {
  it("should extract aria attributes and filter out standard props", () => {
    const props = {
      id: "submit-btn",
      class: "btn btn-primary",
      disabled: true,
      onClick: () => {},
      "aria-label": "Submit form",
      "aria-haspopup": "dialog",
      "data-testid": "submit-button",
    };

    const result = getAriaAttributesFromProps(props);
    expect(result).toEqual({
      "aria-label": "Submit form",
      "aria-haspopup": "dialog",
    });
  });

  it("should remove aria attributes that have undefined values", () => {
    const props = {
      "aria-label": "Close",
      "aria-describedby": undefined,
      "aria-expanded": undefined,
    };

    const result = getAriaAttributesFromProps(props);
    expect(result).toEqual({
      "aria-label": "Close",
    });
  });

  it("should preserve aria attributes with non-undefined falsy values (false, 0, empty string, null)", () => {
    const props = {
      "aria-hidden": false,
      "aria-valuenow": 0,
      "aria-label": "",
      "aria-disabled": null,
    };

    const result = getAriaAttributesFromProps(props);
    expect(result).toEqual({
      "aria-hidden": false,
      "aria-valuenow": 0,
      "aria-label": "",
      "aria-disabled": null,
    });
  });

  it("should return an empty object if no aria attributes are present", () => {
    const props = {
      id: "card",
      role: "main",
      title: "Card title",
    };

    const result = getAriaAttributesFromProps(props);
    expect(result).toEqual({});
  });

  it("should return an empty object when passed an empty object", () => {
    expect(getAriaAttributesFromProps({})).toEqual({});
  });

  it("should not mutate the original props object", () => {
    const props = {
      id: "header",
      "aria-level": 1,
      "aria-invalid": undefined,
    };

    const propsCopy = { ...props };
    const result = getAriaAttributesFromProps(props);

    expect(result).not.toBe(props);
    expect(props).toEqual(propsCopy);
  });
});
