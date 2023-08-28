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
});

