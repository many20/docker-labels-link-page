import * as fs from 'fs/promises';
import * as path from 'path';
import handlebars from 'handlebars';
import { logger } from './logger.mjs';
import { readContainerLabels } from './readDockerLabels.mjs';
import { baseConfig, parseConfig, readConfig } from './config.mjs';

export async function generatePage() {
    const version = JSON.parse(await fs.readFile(path.resolve(import.meta.dirname, '..', 'package.json'), 'utf8')).version;

    const data = { version, linkGroups: [] };

    const links = [...(await getLinksFromContainers()), ...(await getLinksFromConfig())];

    const groups = links.reduce((acc, link) => {
        const section = link.section || '';
        if (!acc[section]) acc[section] = [];
        acc[section].push(link);
        return acc;
    }, {});

    for (let section in groups) {
        groups[section].sort((a, b) => a.priority - b.priority);
    }

    data.linkGroups = groups;

    //if (process.env['DEBUG']) console.log('templateData:', JSON.stringify(data, null, 2));

    const template = await fs.readFile(path.resolve(import.meta.dirname, '..', 'template', 'index.html'), 'utf8');

    const view = handlebars.compile(template);
    const html = view(data);

    return html;
}

async function getLinksFromContainers() {
    let links = [];
    try {
        // const containers = [
        //     {
        //         Name: 'container1',
        //         Labels: {
        //             'docker-labels-link-page.links.test.url': 'https://www.google.com',
        //         },
        //     },
        //     {
        //         Name: 'container2',
        //         Labels: {
        //             'docker-labels-link-page.links.test.name': 'DuckDuckGo',
        //             'docker-labels-link-page.links.test.url': 'https://www.duckduckgo.com',
        //         },
        //     },
        // ];

        let containers = await readContainerLabels();
        //console.log(containers);
        containers = containers.filter(d => d.Labels['docker-labels-link-page.enabled'] === 'true');
        //if (process.env['DEBUG']) console.log('containers: ', containers);

        const labelPath = 'docker-labels-link-page.links.';

        if (containers.length > 0) {
            links = containers.flatMap(container => {
                const names = Object.keys(container.Labels)
                    .filter(label => label.startsWith(labelPath))
                    .reduce((acc, label) => {
                        const info = label.replace(labelPath, '');
                        const [name, ...kv] = info.split('.');

                        acc.add(name);
                        return acc;
                    }, new Set());

                console.log('container.Names: ', container.Names);
                console.log('container.Image: ', container.Image);
                console.log(
                    'container.Labels: ',
                    Object.fromEntries(Object.entries(container.Labels).filter(([key, value]) => key.startsWith(labelPath))),
                );

                const linkObject = [...names].map(name => {
                    return {
                        test: container.Labels[`${labelPath}${name}.test`] === 'false' ? false : true,
                        name: container.Labels[`${labelPath}${name}.name`] || name,
                        url: container.Labels[`${labelPath}${name}.url`],
                        newPage: container.Labels[`${labelPath}${name}.new-page`] === 'true' ? '_blank' : '',
                        priority: container.Labels[`${labelPath}${name}.priority`] ? container.Labels[`${labelPath}${name}.priority`] : 100,
                        section: container.Labels[`${labelPath}${name}.section`],
                    };
                });

                return linkObject;
            });
        }
    } catch (e) {
        logger.error(`Error reading container labels. message: ${e.message}`);
    }
    return links;
}

async function getLinksFromConfig() {
    const configPath = path.resolve(__dirname, '../config/config.json');
    let links = [];

    try {
        const config = await readConfig(configPath);
        if (config && config.links && Array.isArray(config.links)) links = config.links;
    } catch {}

    return links;
}
