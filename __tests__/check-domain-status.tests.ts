import { checkDomainStatus } from '../index';
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
describe('checkDomainStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * =========================================
   *             INDIVIDUAL TESTS
   * =========================================
   */
  it('should return "taken" if only a IPv4 DNS record exists', async () => {
    mockedDnsPromises.resolve4.mockResolvedValue(['123.456.78.90']);
    mockAllExceptOneWithRejection('resolve4', 'ENOTFOUND');

    const result = await checkDomainStatus('ipv4test.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only a IPv6 DNS record exists', async () => {
    mockedDnsPromises.resolve6.mockResolvedValue([
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    ]);
    mockAllExceptOneWithRejection('resolve6', 'ENOTFOUND');

    const result = await checkDomainStatus('ipv6test.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only MX records exist', async () => {
    mockedDnsPromises.resolveMx.mockResolvedValue([
      { exchange: 'mail.example.com', priority: 10 },
    ]);
    mockAllExceptOneWithRejection('resolveMx', 'ENOTFOUND');

    const result = await checkDomainStatus('mailtest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only CNAME records exist', async () => {
    mockedDnsPromises.resolveCname.mockResolvedValue(['www.example.com']);
    mockAllExceptOneWithRejection('resolveCname', 'ENOTFOUND');

    const result = await checkDomainStatus('cnametest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only TXT records exist', async () => {
    mockedDnsPromises.resolveTxt.mockResolvedValue([
      ['v=spf1 include:example.com ~all'],
    ]);
    mockAllExceptOneWithRejection('resolveTxt', 'ENOTFOUND');

    const result = await checkDomainStatus('txttest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only NS records exist', async () => {
    mockedDnsPromises.resolveNs.mockResolvedValue([
      'ns1.example.com',
      'ns2.example.com',
    ]);
    mockAllExceptOneWithRejection('resolveNs', 'ENOTFOUND');

    const result = await checkDomainStatus('nstest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only SRV records exist', async () => {
    mockedDnsPromises.resolveSrv.mockResolvedValue([
      { name: 'sip', port: 5060, priority: 1, weight: 1 },
    ]);
    mockAllExceptOneWithRejection('resolveSrv', 'ENOTFOUND');

    const result = await checkDomainStatus('srvtest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "taken" if only SOA records exist', async () => {
    mockedDnsPromises.resolveSoa.mockResolvedValue({
      nsname: 'ns.example.com',
      hostmaster: 'hostmaster@example.com',
      serial: 20220101,
      refresh: 10000,
      retry: 2400,
      expire: 604800,
      minttl: 3600,
    });
    mockAllExceptOneWithRejection('resolveSoa', 'ENOTFOUND');

    const result = await checkDomainStatus('soatest.com', false);
    expect(result).toBe('taken');
  });

  it('should return "available" if no DNS records exist', async () => {
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

    const result = await checkDomainStatus('not-a-real-domain.xyz', false);
    expect(result).toBe('available');
  });

  it('should check all DNS record types', async () => {
    await checkDomainStatus('complete-check.com', false);

    expect(mockedDnsPromises.resolve4).toHaveBeenCalled();
    expect(mockedDnsPromises.resolve6).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveMx).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveCname).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveTxt).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveNs).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveSrv).toHaveBeenCalled();
    expect(mockedDnsPromises.resolveSoa).toHaveBeenCalled();
  });
});
