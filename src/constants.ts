let NODE_ENV: 'development' | 'production' | 'test';

export const setNodeEnv = (env: 'development' | 'production' | 'test') => {
    if (!['development', 'production', 'test'].includes(env)) {
        throw new Error(`Invalid NODE_ENV: ${env}`);
    }
    NODE_ENV = env;
};

export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

export const getNodeEnv = () => {
    if (!NODE_ENV) {
        throw new Error("NODE_ENV is not set. Make sure to initialize it in VXEngineProvider.");
    }
    return NODE_ENV;
};