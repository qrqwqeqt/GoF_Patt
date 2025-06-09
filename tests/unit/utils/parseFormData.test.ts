import { parseFormData } from '../../../src/utils/parseFormData';

describe('parseFormData', () => {
  it('should parse JSON strings correctly', () => {
    const input = {
      user: '{"name": "John", "age": 30}',
      isAdmin: 'true',
    };

    const expectedOutput = {
      user: { name: 'John', age: 30 },
      isAdmin: true,
    };

    expect(parseFormData(input)).toEqual(expectedOutput);
  });

  it('should parse numbers correctly', () => {
    const input = {
      age: '25',
      height: '175',
    };

    const expectedOutput = {
      age: 25,
      height: 175,
    };

    expect(parseFormData(input)).toEqual(expectedOutput);
  });

  it('should leave strings as is when they are not JSON or numbers', () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const expectedOutput = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    expect(parseFormData(input)).toEqual(expectedOutput);
  });

  it('should return NaN for invalid number strings', () => {
    const input = {
      invalidNumber: 'abc',
    };

    const expectedOutput = {
      invalidNumber: 'abc',
    };

    expect(parseFormData(input)).toEqual(expectedOutput);
  });

  it('should handle empty input correctly', () => {
    const input = {};

    const expectedOutput = {};

    expect(parseFormData(input)).toEqual(expectedOutput);
  });
});
