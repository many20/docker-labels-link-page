import * as fs from 'node:fs/promises';
import * as v from 'valibot';

export const baseConfig = {
    linksDemo: [
        {
            name: 'google.de',
            url: 'https://google.de',
            'new-page': true,
            priority: 100,
            section: 'test-google',
        },
        {
            name: 'google.de 2',
            url: 'https://google.de',
            'new-page': true,
            priority: 1,
            section: 'test-google',
        },
        {
            name: 'bing.de',
            url: 'https://bing.de',
            'new-page': true,
            priority: 100,
            section: 'test',
        },
    ],
};

const configSchema = v.object({
    links: v.array(
        v.object({
            name: v.string(),
            url: v.string(),
            'new-page': v.boolean(),
            section: v.optional(v.string()),
            priority: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
        }),
    ),
});

export function parseConfig(config) {
    return v.parse(config, configSchema);
}

export async function readConfig(configPath) {
    let config = baseConfig;
    try {
        const configString = await fs.readFile(configPath, { encoding: 'utf8' });
        if (configString) {
            config = JSON.parse(configString);
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.warn(`file does not exist. configPath: ${configPath} Creating new config file.`);
            await fs.writeFile(configPath, JSON.stringify(baseConfig, null, 4), { encoding: 'utf8' });
        } else {
            console.error(`Error reading config file. configPath: ${configPath} message: ${e.message}`);
            throw e;
        }
    }
    return config;
}
