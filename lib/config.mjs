import * as v from 'valibot';

export const baseConfig = {
    "linksDemo": [
        {
            "name": "google.de",
            "url": "https://google.de",
            "new-page": true,
            "priority": 100,
            "section": "test-google"
        },
        {
            "name": "google.de 2",
            "url": "https://google.de",
            "new-page": true,
            "priority": 1,
            "section": "test-google"
        },
        {
            "name": "bing.de",
            "url": "https://bing.de",
            "new-page": true,
            "priority": 100,
            "section": "test"
        }
    ]
};

const configSchema = v.object({
    links: v.array(v.object({
        name: v.string(),
        url: v.string(),
        'new-page': v.boolean(),
        section: v.optional(v.string()),
        priority: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
    })),
});

export function parseConfig(config) {
    return v.parse(config, configSchema);
}
