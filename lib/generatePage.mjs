import * as fs from 'fs/promises';
import * as path from 'path';
import mustache from 'mustache';
import { logger } from './logger.mjs';
import { readContainerLabels } from './readDockerLabels.mjs';

export async function generatePage() {
    const template = await fs.readFile(path.resolve(import.meta.dirname, '..', 'template', 'index.html'), 'utf8');

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
    //console.log(containers);

    const data = { version: '1.0.0', links: [] };

    const labelPath = 'docker-labels-link-page.links.';

    if (containers.length > 0) {
        data.links = containers.flatMap(container => {
            const names = Object.keys(container.Labels)
                .filter(label => label.startsWith(labelPath))
                .reduce((acc, label) => {
                    const info = label.replace(labelPath, '');
                    const [name, value] = info.split('.');

                    acc.add(name);
                    return acc;
                }, new Set());

            const links = [...names].map(name => {
                return {
                    name: container.Labels[`${labelPath}${name}.name`] || name,
                    url: container.Labels[`${labelPath}${name}.url`],
                    newPage: container.Labels[`${labelPath}${name}.new-page`] === 'true' ? '_blank' : '',
                    priority: container.Labels[`${labelPath}${name}.priority`] ? container.Labels[`${labelPath}${name}.priority`] : 100,
                    section: container.Labels[`${labelPath}${name}.section`],
                };
            });

            return links;
        });
        data.links.sort((a, b) => a.priority - b.priority);
    }

    //console.log(data);

    const html = mustache.render(template, data);

    return html;
}
