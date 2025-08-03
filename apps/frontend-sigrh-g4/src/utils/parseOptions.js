// utils/parseOptions.js
export function parseOptionsToRelationalInput(options) {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
    }));
  }

export function parseOptionsToRelationalInputDescription(options) {
    return options.map((option) => ({
      value: option.id,
      label: option.description,
    }));
  }
  