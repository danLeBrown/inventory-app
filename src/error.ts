import { ValidationError } from '@nestjs/common';

// Helper function to format validation errors with array indices
export function formatValidationErrors(errors: ValidationError[]) {
  return errors.reduce((acc, error) => {
    const property = error.property;

    if (error.children && error.children.length > 0) {
      // Handle nested validation errors (like array items)
      acc[property] = formatValidationErrors(error.children);
    } else {
      // Handle direct property validation errors
      acc[property] = Object.values(error.constraints || {});
    }

    return acc;
  }, {} as object);
}
