let NODE_ENV: 'development' | 'production' | 'test';

export const setNodeEnv = (env: 'development' | 'production' | 'test') => {
    console.log("SETTING NODE ENV")
    if (!['development', 'production', 'test'].includes(env)) {
        throw new Error(`Invalid NODE_ENV: ${env}`);
    }
    NODE_ENV = env;
};

export const IS_DEVELOPMENT = () => getNodeEnv() === 'development';
export const IS_PRODUCTION = () => getNodeEnv() === 'production';

export const getNodeEnv = () => {
    console.log("GETTING NODE_ENV ", NODE_ENV)
    if (!NODE_ENV) {
        throw new Error("NODE_ENV is not set. Make sure to initialize it in VXEngineProvider.");
    }
    return NODE_ENV;
};