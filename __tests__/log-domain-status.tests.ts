import { logDomainStatus } from '../index';
import {
  mockAllExceptOneWithRejection,
  mockedDnsPromises,
  mockResolversWithRejection,
} from './helper';

jest.mock('dns');

/**
 * =========================================
 *              TEST PREPARATION
 * =========================================
 */

describe('logDomainStatus', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * =========================================
   *             INDIVIDUAL TESTS
   * =========================================
   */
  it('should log the domain as "taken" if it has DNS records', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    mockedDnsPromises.resolve4.mockResolvedValue(['123.456.78.90']);
    mockAllExceptOneWithRejection('resolve4', 'ENOTFOUND');

    await logDomainStatus('taken-domain.com');
    expect(console.log).toHaveBeenCalledWith('taken-domain.com is taken.');
  });

  it('should log the domain as "available" if it doesnt have DNS records', async () => {
    mockResolversWithRejection(
      [
        'resolve4',
        'resolve6',
        'resolveMx',
        'resolveCname',
        'resolveTxt',
        'resolveNs',
        'resolveSrv',
        'resolveSoa',
      ],
      'ENOTFOUND',
    );

    await logDomainStatus('available-domain.com');
    expect(console.log).toHaveBeenCalledWith(
      'available-domain.com is available.',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
