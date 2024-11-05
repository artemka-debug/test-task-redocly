import { BitbucketAPI } from '../api/bitbucket/index.js';
import { NpmApi } from '../api/npm/index.js';
import type { UpdateOptions } from '../commands/update/index.js';

export class UpdateService {
  constructor(
    private readonly bitbucketApi: BitbucketAPI,
    private readonly npmApi: NpmApi,
  ) {}

  async update({ packageName, packageVersion }: UpdateOptions) {
    const mainBranch = await this.getMainBranch();

    const packageJson = await this.bitbucketApi.getFile(
      mainBranch,
      'package.json',
    );

    const npmPackage = await this.npmApi.getPackageInfo(packageName);

    if (!(packageVersion in npmPackage.time)) {
      throw new Error(`Version ${packageVersion} not found`);
    }

    if (
      !(packageName in packageJson.dependencies) &&
      !(packageName in packageJson.devDependencies)
    ) {
      throw new Error(
        `Package ${packageName} not found in dependencies or devDependencies`,
      );
    }

    console.log(`Updating ${packageName} in dependencies...`);
    await this.setVersion(
      packageJson.dependencies,
      packageName,
      packageVersion,
    );

    console.log(`Updating ${packageName} in devDependencies...`);
    await this.setVersion(
      packageJson.devDependencies,
      packageName,
      packageVersion,
    );

    const branch = `deps/${packageName}-${packageVersion}`;

    await this.bitbucketApi.createBranch(branch, mainBranch);

    const newPackageJson = JSON.stringify(packageJson, null, 2);
    await this.bitbucketApi.editFile(branch, 'package.json', newPackageJson);

    await this.bitbucketApi.createPullRequest(
      branch,
      mainBranch,
      `Update ${packageName} to ${packageVersion}`,
    );
  }

  private async setVersion(
    deps: Record<string, string>,
    packageName: string,
    packageVersion: string,
  ) {
    if (packageName in deps) {
      console.log(`Updating ${packageName} to ${packageVersion}...`);
      deps[packageName] = packageVersion;
    }
  }

  private async getMainBranch() {
    const repository = await this.bitbucketApi.getRepository();
    return repository.mainbranch.name;
  }
}
