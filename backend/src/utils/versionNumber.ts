import { Transaction } from 'sequelize';
import VersionControl from '../models/VersionControl';
import { VersionType } from '../types';

interface SemVer {
  major: number;
  minor: number;
  bugfix: number;
}

/**
 * Parses a version string into a SemVer object.
 * Strips leading 'v' if present, e.g. "v1.4.2" or "1.4.2".
 * Returns null if string cannot be parsed as valid semver.
 */
export function parseVersionNumber(versionStr: string): SemVer | null {
  if (!versionStr || typeof versionStr !== 'string') return null;
  const cleaned = versionStr.trim().replace(/^v/i, '');
  const parts = cleaned.split('.');
  if (parts.length < 3) return null;

  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);
  const bugfix = parseInt(parts[2], 10);

  if (isNaN(major) || isNaN(minor) || isNaN(bugfix)) return null;

  return { major, minor, bugfix };
}

/**
 * Calculates the next version number for a given project and versionType.
 */
export async function calculateNextVersionNumber(
  projectId: number,
  versionType: VersionType,
  transaction?: Transaction
): Promise<string> {
  const versions = await VersionControl.findAll({
    where: { projectId },
    attributes: ['versionNumber'],
    transaction,
  });

  if (!versions || versions.length === 0) {
    return '1.0.0';
  }

  let highestVer: SemVer | null = null;

  for (const v of versions) {
    const parsed = parseVersionNumber(v.versionNumber);
    if (!parsed) continue;

    if (!highestVer) {
      highestVer = parsed;
    } else {
      if (parsed.major > highestVer.major) {
        highestVer = parsed;
      } else if (parsed.major === highestVer.major && parsed.minor > highestVer.minor) {
        highestVer = parsed;
      } else if (
        parsed.major === highestVer.major &&
        parsed.minor === highestVer.minor &&
        parsed.bugfix > highestVer.bugfix
      ) {
        highestVer = parsed;
      }
    }
  }

  if (!highestVer) {
    return '1.0.0';
  }

  if (versionType === 'major') {
    return `${highestVer.major + 1}.0.0`;
  } else if (versionType === 'minor') {
    return `${highestVer.major}.${highestVer.minor + 1}.0`;
  } else if (versionType === 'bug-fix') {
    return `${highestVer.major}.${highestVer.minor}.${highestVer.bugfix + 1}`;
  }

  return '1.0.0';
}
