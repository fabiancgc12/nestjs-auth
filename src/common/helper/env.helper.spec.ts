import { getEnvPath } from './env.helper';

describe('Env Helper function', () => {
  const current = "src/common/envs";
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });
  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should return .env', function() {
    process.env.NODE_ENV = ""
    const resp = getEnvPath(current)
    expect(resp).toContain(".env")
  });

  it('should return test.env', function() {
    process.env.NODE_ENV = "test"
    const resp = getEnvPath(current)
    expect(resp).toContain("test.env")
  });

  it('should return development.env', function() {
    process.env.NODE_ENV = "development"
    const resp = getEnvPath(current)
    expect(resp).toContain("development.env")
  });

  it('should return production.env', function() {
    process.env.NODE_ENV = "production"
    const resp = getEnvPath(current)
    expect(resp).toContain("production.env")
  });

  it('should return fallback', function() {
    process.env.NODE_ENV = "production"
    const resp = getEnvPath("otherpatchsdcsdc")
    expect(resp).toContain(".env")
  });
})