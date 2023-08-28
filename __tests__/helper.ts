import { promises as dnsPromises } from 'dns';

/**
 * Mocked version of dnsPromises for testing purposes.
 */
export const mockedDnsPromises = dnsPromises as jest.Mocked<typeof dnsPromises>;

/**
 * Types of potential DNS errors that can be mocked for testing.
 */
type DNSMockErrorType = 'ENOTFOUND' | 'ENODATA';

/**
 * Type keys for various DNS resolvers in the `dns.promises` module.
 */
type DNSResolverKey =
  | 'resolve4'
  | 'resolve6'
  | 'resolveMx'
  | 'resolveCname'
  | 'resolveTxt'
  | 'resolveNs'
  | 'resolveSrv'
  | 'resolveSoa';

/**
 * List of all DNS resolver keys for easy reference and iteration.
 */
const allResolvers: DNSResolverKey[] = [
  'resolve4',
  'resolve6',
  'resolveMx',
  'resolveCname',
  'resolveTxt',
  'resolveNs',
  'resolveSrv',
  'resolveSoa',
];

/**
 * Mocks specific DNS resolvers to reject with a specified error type.
 *
 * @param resolvers - Array of DNS resolver keys to mock.
 * @param errorType - The type of error to be mocked.
 */
export function mockResolversWithRejection(
  resolvers: DNSResolverKey[],
  errorType: DNSMockErrorType,
) {
  const error = { code: errorType };
  resolvers.forEach((resolver) => {
    mockedDnsPromises[resolver].mockRejectedValueOnce(error);
  });
}

/**
 * Mocks all DNS resolvers to reject with a specified error type, except for one.
 *
 * @param except - The resolver key which should not be mocked.
 * @param errorType - The type of error to be mocked for all other resolvers.
 */
export function mockAllExceptOneWithRejection(
  except: DNSResolverKey,
  errorType: DNSMockErrorType,
) {
  const resolversToMock = allResolvers.filter(
    (resolver) => resolver !== except,
  );
  mockResolversWithRejection(resolversToMock, errorType);
}
