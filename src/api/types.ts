export interface UpdateDependencyService {
  updateDependencies(
    dependencies: Record<string, string>,
    packageName: string,
    packageVersion: string,
  ): Record<string, string>;
}

export type CreatePullRequestOptions = {
  package: {
    name: string;
    version: string;
  };
  mainBranch?: string;
  payload: string;
};

export interface CreatePullRequestService {
  createPullRequest(options: CreatePullRequestOptions): void;
}
