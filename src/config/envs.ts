import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    NODE_ENV: string;
}

const envVarsSchema = joi.object({
    NODE_ENV: joi
        .string()
        .valid('development', 'production', 'test')
        .required(),
    PORT: joi.number().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = {
    PORT: Number(value.PORT),
    NODE_ENV: value.NODE_ENV,
};

export const envs = {
    PORT: envVars.PORT,
    NODE_ENV: envVars.NODE_ENV,
};