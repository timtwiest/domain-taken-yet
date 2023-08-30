#!/usr/bin/env node

import {promises as dnsPromises} from 'dns';
import {program} from 'commander';

/**
 * The size of each domain chunk that will be processed concurrently.
 */
const CHUNK_SIZE = 6;

/**
 * The amount of time (in milliseconds) to wait between processing each domain chunk.
 * This delay is added to avoid overloading DNS servers.
 */
const DELAY_BETWEEN_CHUNKS = 1000;

/**
 * Represents the options that can be provided to the CLI command.
 *
 * @property verbose - A boolean indicating whether the command should output
 *                     detailed information for each DNS check.
 */
interface CommandOptions {
  verbose?: boolean;
}

/**
 * Represents specific errors that might arise when querying DNS records.
 * - 'ENOTFOUND': The domain name was not found, indicating it might be available.
 * - 'ENODATA': The domain has no records of the requested type, but it might still be registered.
 * - 'ESERVFAIL': DNS server returned a general failure.
 */
interface DNSError extends Error {
  code?: 'ENOTFOUND' | 'ENODATA' | 'ESERVFAIL';
}

/**
 * Type definition for DNS resolver functions.
 * A DNSResolver takes a domain as an argument and returns a promise which
 * resolves with DNS record information or rejects with an error.
 */
type DNSResolver = (domain: string) => Promise<any>;

/**
 * An array of DNS resolver functions to query various DNS records.
 */
const dnsResolvers: DNSResolver[] = [
  dnsPromises.resolve4,
  dnsPromises.resolve6,
  dnsPromises.resolveMx,
  dnsPromises.resolveCname,
  dnsPromises.resolveTxt,
  dnsPromises.resolveNs,
  dnsPromises.resolveSrv,
  dnsPromises.resolveSoa,
];

/**
 * Configure the CLI using the commander package.
 * This setup defines the version, usage, description, and available options for the CLI.
 */
program
  .name('domain-taken-yet')
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ domain-taken-yet example.com');
    console.log('  $ domain-taken-yet example1.com example2.com');
  })
  .command('check <domains...>')
  .alias('c')
  .description(
    'Check the availability of provided domain(s) by querying their DNS records.',
  )
  .option('-v, --verbose', 'Output detailed information for each DNS check')
  .action(async (domains: string[], options: CommandOptions) => {
    try {
      await processDomainsInChunks(domains, options.verbose);
      console.log('Finished checking all provided domains.');
    } catch (error: any) {
      console.error(
        'An error occurred while processing the domains:',
        error.message,
      );
    }
  });

/**
 * Queries the DNS records of a domain to determine its availability.
 *
 * - If the domain has any of the DNS records we're checking, it's considered 'taken'.
 * - If there are no DNS records found, the domain is considered 'available'.
 * - Unexpected DNS errors are logged if verbose mode is enabled.
 *
 * @param domain - The domain name to be checked.
 * @param verbose - Whether to output detailed information for each DNS check. Defaults to false.
 *
 * @returns A promise resolving to 'available' if the domain has no DNS records,
 *          'taken' if DNS records are found.
 */
export async function checkDomainStatus(
  domain: string,
  verbose: boolean = false,
): Promise<'available' | 'taken'> {
  const results = await Promise.allSettled(
    dnsResolvers.map((resolver) => resolver(domain)),
  );

  let allErrors = true;
  for (const [index, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      allErrors = false;
      if (verbose) {
        console.log(
          `[${domain}] Found record type: ${dnsResolvers[index].name}`,
        );
      }
      return 'taken';
    } else {
      const dnsError = result.reason as DNSError;
      if (
        dnsError.code !== 'ENOTFOUND' &&
        dnsError.code !== 'ENODATA' &&
        dnsError.code !== 'ESERVFAIL'
      ) {
        if (verbose) {
          console.error(
            `[${domain}] Encountered a DNS error with record type ${dnsResolvers[index].name}: ${dnsError.message}`,
          );
        }
      }
    }
  }

  if (allErrors && verbose) {
    console.error(`[${domain}] All DNS checks resulted in errors.`);
  }

  return 'available';
}

/**
 * Retrieves the availability status of a domain and logs it to the console.
 *
 * @param domain - The domain name to be checked.
 * @param verbose - Whether to output detailed information for each DNS check. Defaults to false.
 */
export async function logDomainStatus(
  domain: string,
  verbose: boolean = false,
): Promise<void> {
  const status = await checkDomainStatus(domain, verbose);
  console.log(`${domain} is ${status}.`);
}

/**
 * Checks if a domain name is valid using a simple regex pattern.
 *
 * @param domain - The domain name to be checked.
 *
 * @returns A boolean indicating whether the domain name is valid.
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?=.{1,253})(?=.{1,63}(?:\.|$))(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:\.[a-zA-Z0-9-]{1,63}(?<!-))*(?:\.[a-zA-Z]{2,})$/;
  return domainRegex.test(domain);
}

/**
 * Processes the domains in chunks and adds a delay between each chunk to avoid overloading DNS servers.
 *
 * @param domains - An array of domain names to be checked.
 * @param verbose - Whether to output detailed information for each DNS check.
 *
 * @remarks
 * This function slices the given list of domains into smaller chunks. Each chunk is then processed concurrently,
 * ensuring that only a certain number of domains are queried at once. This is especially useful to not overload
 * DNS servers or hit rate limits. After each chunk is processed, a delay is introduced before processing the next chunk.
 */
async function processDomainsInChunks(
  domains: string[],
  verbose: boolean = false,
): Promise<void> {
  for (let i = 0; i < domains.length; i += CHUNK_SIZE) {
    const chunk = domains.slice(i, i + CHUNK_SIZE);

    if (verbose) {
      console.log(
        `Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(
          domains.length / CHUNK_SIZE,
        )}`,
      );
    }

    await Promise.all(
      chunk.map(async (domain) => {
        if (isValidDomain(domain)) {
          await logDomainStatus(domain, verbose);
        } else {
          console.error(`"${domain}" is not a valid domain name.`);
        }
      }),
    );

    if (i + CHUNK_SIZE < domains.length) {
      if (verbose) {
        console.log(
          `Finished processing chunk. Waiting for ${
            DELAY_BETWEEN_CHUNKS / 1000
          } seconds before processing next chunk.`,
        );
      }
      await new Promise((res) => setTimeout(res, DELAY_BETWEEN_CHUNKS));
    }
  }

  if (verbose) {
    console.log('All chunks processed.');
  }
}

/**
 * Main function that handles the primary logic for the script.
 * - Parses the command-line arguments.
 * - If no arguments are provided, it displays the help message.
 */
function main() {
  program.parseAsync(process.argv).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

/**
 * Check if this script is being run directly and not being imported elsewhere.
 * If it's run directly, the main function is invoked.
 */
if (require.main === module) {
  main();
}
