import {isValidDomain} from "../index";

/**
 * =========================================
 *              TEST PREPARATION
 * =========================================
 */
describe('isValidDomain', () => {
  /**
   * =========================================
   *             INDIVIDUAL TESTS
   * =========================================
   */
  it('should validate a simple domain', () => {
    expect(isValidDomain('example.com')).toBeTruthy();
  });

  it('should validate a subdomain', () => {
    expect(isValidDomain('sub.example.com')).toBeTruthy();
  });

  it('should validate a domain with a dash', () => {
    expect(isValidDomain('example-test.com')).toBeTruthy();
  });

  it('should not validate a domain starting with a dash', () => {
    expect(isValidDomain('-example.com')).toBeFalsy();
  });

  it('should not validate a domain ending with a dash', () => {
    expect(isValidDomain('example-.com')).toBeFalsy();
  });

  it('should not validate a domain with spaces', () => {
    expect(isValidDomain('example com')).toBeFalsy();
  });

  it('should not validate a domain with special characters', () => {
    expect(isValidDomain('example$.com')).toBeFalsy();
  });

  it('should validate a long TLD', () => {
    expect(isValidDomain('example.engineering')).toBeTruthy();
  });

  it('should not validate a domain with two consecutive dots', () => {
    expect(isValidDomain('example..com')).toBeFalsy();
  });

  it('should not validate a domain that ends with a dot', () => {
    expect(isValidDomain('example.com.')).toBeFalsy();
  });

  it('should validate an internationalized domain name', () => {
    expect(isValidDomain('münchen.com')).toBeFalsy();
  });

  it('should validate a domain with uppercase letters', () => {
    expect(isValidDomain('EXAMPLE.com')).toBeTruthy();
  });

  it('should validate a domain close to maximum length', () => {
    const longDomain = 'a'.repeat(63) + '.' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.com';
    expect(isValidDomain(longDomain)).toBeTruthy();
  });

  it('should not validate a domain exceeding maximum length', () => {
    const overlyLongDomain = 'a'.repeat(64) + '.com';
    expect(isValidDomain(overlyLongDomain)).toBeFalsy();
  });

  it('should not validate a domain without a valid TLD', () => {
    expect(isValidDomain('example.c')).toBeFalsy();
  });
});

